import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { expect } from "chai";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

// Covers: initialize_amm, create_pool, add_liquidity, remove_liquidity, swap,
// open_position, increase_position_liquidity, decrease_position_liquidity

describe("orca instructions", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Orca as anchor.Program<any>;

  // PDAs
  let ammConfig: PublicKey;
  let pool: PublicKey;
  let poolAuthority: PublicKey;
  let observationState: PublicKey;

  // Token mints and user balances
  let mint0: PublicKey;
  let mint1: PublicKey;
  let userAta0: PublicKey;
  let userAta1: PublicKey;

  // Vault accounts to be created by program (as init accounts)
  const tokenVault0 = Keypair.generate();
  const tokenVault1 = Keypair.generate();

  // Params
  const FEE_RATE = 3000; // 0.3%
  const PROTOCOL_FEE_RATE = 2000; // 20% of trading fees
  const TICK_SPACING = 60;
  // Pick a sqrt price within bounds (between MIN_SQRT_PRICE and MAX_SQRT_PRICE)
  const INITIAL_SQRT_PRICE_X64 = new BN("5000000000");

  before("setup mints and accounts", async () => {
    // Derive config PDA
    ammConfig = PublicKey.findProgramAddressSync([Buffer.from("amm_config")], program.programId)[0];

    // Create two token mints (9 decimals) and ensure ordering mint0 < mint1
    const kp0 = Keypair.generate();
    const kp1 = Keypair.generate();
    await createMint(connection, wallet.payer, wallet.publicKey, null, 9, kp0);
    await createMint(connection, wallet.payer, wallet.publicKey, null, 9, kp1);
    if (kp0.publicKey.toBuffer().compare(kp1.publicKey.toBuffer()) < 0) {
      mint0 = kp0.publicKey;
      mint1 = kp1.publicKey;
    } else {
      mint0 = kp1.publicKey;
      mint1 = kp0.publicKey;
    }

    // Create ATAs for the wallet and mint balances
    userAta0 = (
      await getOrCreateAssociatedTokenAccount(connection, wallet.payer, mint0, wallet.publicKey)
    ).address;
    userAta1 = (
      await getOrCreateAssociatedTokenAccount(connection, wallet.payer, mint1, wallet.publicKey)
    ).address;

    await mintTo(connection, wallet.payer, mint0, userAta0, wallet.payer, 1_000_000_000_000n);
    await mintTo(connection, wallet.payer, mint1, userAta1, wallet.payer, 1_000_000_000_000n);
  });

  it("initialize_amm happy", async () => {
    const tx = await program.methods
      .initializeAmm(FEE_RATE, PROTOCOL_FEE_RATE)
      .accounts({
        ammConfig,
        authority: wallet.publicKey,
        protocolFeeDestination: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("initialize_amm unhappy: invalid fee rate", async () => {
    const badConfig = PublicKey.findProgramAddressSync(
      [Buffer.from("amm_config"), Buffer.from("bad")],
      program.programId
    )[0];
    let failed = false;
    try {
      await program.methods
        .initializeAmm(10001, PROTOCOL_FEE_RATE)
        .accounts({
          ammConfig: badConfig,
          authority: wallet.publicKey,
          protocolFeeDestination: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("create_pool happy", async () => {
    pool = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), ammConfig.toBuffer(), mint0.toBuffer(), mint1.toBuffer()],
      program.programId
    )[0];
    poolAuthority = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_authority"), pool.toBuffer()],
      program.programId
    )[0];
    observationState = PublicKey.findProgramAddressSync(
      [Buffer.from("observation"), pool.toBuffer()],
      program.programId
    )[0];

    const tx = await program.methods
      .createPool(INITIAL_SQRT_PRICE_X64, TICK_SPACING)
      .accounts({
        ammConfig,
        pool,
        tokenMint0: mint0,
        tokenMint1: mint1,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        poolAuthority,
        observationState,
        creator: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([tokenVault0, tokenVault1])
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("create_pool unhappy: invalid token order", async () => {
    const badPool = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), ammConfig.toBuffer(), mint1.toBuffer(), mint0.toBuffer()],
      program.programId
    )[0];
    const badObs = PublicKey.findProgramAddressSync(
      [Buffer.from("observation"), badPool.toBuffer()],
      program.programId
    )[0];
    const badVault0 = Keypair.generate();
    const badVault1 = Keypair.generate();
    let failed = false;
    try {
      await program.methods
        .createPool(INITIAL_SQRT_PRICE_X64, TICK_SPACING)
        .accounts({
          ammConfig,
          pool: badPool,
          tokenMint0: mint1, // reversed
          tokenMint1: mint0,
          tokenVault0: badVault0.publicKey,
          tokenVault1: badVault1.publicKey,
          poolAuthority,
          observationState: badObs,
          creator: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([badVault0, badVault1])
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("add_liquidity happy", async () => {
    const tx = await program.methods
      .addLiquidity(new BN(1000), new BN(1000))
      .accounts({
        pool,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        userTokenAccount0: userAta0,
        userTokenAccount1: userAta1,
        poolAuthority,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("add_liquidity unhappy: zero amount", async () => {
    let failed = false;
    try {
      await program.methods
        .addLiquidity(new BN(0), new BN(100))
        .accounts({
          pool,
          tokenVault0: tokenVault0.publicKey,
          tokenVault1: tokenVault1.publicKey,
          userTokenAccount0: userAta0,
          userTokenAccount1: userAta1,
          poolAuthority,
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("remove_liquidity happy", async () => {
    const tx = await program.methods
      .removeLiquidity(new BN(10), new BN(10))
      .accounts({
        pool,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        userTokenAccount0: userAta0,
        userTokenAccount1: userAta1,
        poolAuthority,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("remove_liquidity unhappy: too much", async () => {
    let failed = false;
    try {
      await program.methods
        .removeLiquidity(new BN(9_999_999_999), new BN(9_999_999_999))
        .accounts({
          pool,
          tokenVault0: tokenVault0.publicKey,
          tokenVault1: tokenVault1.publicKey,
          userTokenAccount0: userAta0,
          userTokenAccount1: userAta1,
          poolAuthority,
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("swap happy", async () => {
    const tx = await program.methods
      .swap(new BN(500), new BN(1), true)
      .accounts({
        pool,
        ammConfig,
        userTokenAccountIn: userAta0,
        userTokenAccountOut: userAta1,
        tokenVaultIn: tokenVault0.publicKey,
        tokenVaultOut: tokenVault1.publicKey,
        poolAuthority,
        observationState,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("swap unhappy: min out too high", async () => {
    let failed = false;
    try {
      await program.methods
        .swap(new BN(100), new BN(10_000), true)
        .accounts({
          pool,
          ammConfig,
          userTokenAccountIn: userAta0,
          userTokenAccountOut: userAta1,
          tokenVaultIn: tokenVault0.publicKey,
          tokenVaultOut: tokenVault1.publicKey,
          poolAuthority,
          observationState,
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  // Position flow
  let position: PublicKey;

  it("open_position happy", async () => {
    position = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), pool.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    )[0];

    const tx = await program.methods
      .openPosition()
      .accounts({
        pool,
        owner: wallet.publicKey,
        position,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("open_position unhappy: already exists", async () => {
    let failed = false;
    try {
      await program.methods
        .openPosition()
        .accounts({
          pool,
          owner: wallet.publicKey,
          position, // same PDA
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("increase_position_liquidity happy", async () => {
    const tx = await program.methods
      .increasePositionLiquidity(new BN(200), new BN(200))
      .accounts({
        pool,
        position,
        owner: wallet.publicKey,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        userTokenAccount0: userAta0,
        userTokenAccount1: userAta1,
        poolAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });

  it("increase_position_liquidity unhappy: zero amount", async () => {
    let failed = false;
    try {
      await program.methods
        .increasePositionLiquidity(new BN(0), new BN(1))
        .accounts({
          pool,
          position,
          owner: wallet.publicKey,
          tokenVault0: tokenVault0.publicKey,
          tokenVault1: tokenVault1.publicKey,
          userTokenAccount0: userAta0,
          userTokenAccount1: userAta1,
          poolAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("decrease_position_liquidity unhappy: more than position", async () => {
    let failed = false;
    try {
      await program.methods
        .decreasePositionLiquidity(new BN(10_000_000), new BN(10_000_000))
        .accounts({
          pool,
          position,
          owner: wallet.publicKey,
          tokenVault0: tokenVault0.publicKey,
          tokenVault1: tokenVault1.publicKey,
          userTokenAccount0: userAta0,
          userTokenAccount1: userAta1,
          poolAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("decrease_position_liquidity happy", async () => {
    const tx = await program.methods
      .decreasePositionLiquidity(new BN(50), new BN(50))
      .accounts({
        pool,
        position,
        owner: wallet.publicKey,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        userTokenAccount0: userAta0,
        userTokenAccount1: userAta1,
        poolAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    expect(tx).to.be.a("string");
  });
});
