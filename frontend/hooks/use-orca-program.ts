import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Keypair, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import orcaIdl from '@/idl/orca.json';
import { useMemo } from 'react';

const PROGRAM_ID = new PublicKey('9P6cZJHLnLu77ur6CdpNEgTZPnVVHweozgo4ykc9LMVZ');

export function useOrcaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(orcaIdl as any, provider);
  }, [provider]);

  const findAmmConfigPDA = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('amm_config')],
      PROGRAM_ID
    );
  };

  const findPoolPDA = (tokenMint0: PublicKey, tokenMint1: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('pool'),
        tokenMint0.toBuffer(),
        tokenMint1.toBuffer(),
      ],
      PROGRAM_ID
    );
  };

  const findPoolAuthority = (poolPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault_authority'), poolPubkey.toBuffer()],
      PROGRAM_ID
    );
  };

  const findPositionPDA = (pool: PublicKey, owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('position'),
        pool.toBuffer(),
        owner.toBuffer(),
      ],
      PROGRAM_ID
    );
  };

  const findObservationPDA = (pool: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('observation'), pool.toBuffer()],
      PROGRAM_ID
    );
  };

  const initializeAmm = async (
    feeRate: number,
    protocolFeeRate: number,
    protocolFeeDestination: PublicKey
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [ammConfig] = findAmmConfigPDA();

    const tx = await program.methods
      .initializeAmm(feeRate, protocolFeeRate)
      .accounts({
        ammConfig,
        authority: wallet.publicKey,
        protocolFeeDestination,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  };

  const createPool = async (
    tokenMint0: PublicKey,
    tokenMint1: PublicKey,
    sqrtPriceX64: string,
    tickSpacing: number
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [ammConfig] = findAmmConfigPDA();
    const [pool] = findPoolPDA(tokenMint0, tokenMint1);
    const [poolAuthority] = findPoolAuthority(pool);
    const [observationState] = findObservationPDA(pool);

    const tokenVault0 = Keypair.generate();
    const tokenVault1 = Keypair.generate();

    const tx = await program.methods
      .createPool(new BN(sqrtPriceX64), tickSpacing)
      .accounts({
        ammConfig,
        pool,
        tokenMint0,
        tokenMint1,
        tokenVault0: tokenVault0.publicKey,
        tokenVault1: tokenVault1.publicKey,
        poolAuthority,
        observationState,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([tokenVault0, tokenVault1])
      .rpc();

    return { tx, pool, tokenVault0: tokenVault0.publicKey, tokenVault1: tokenVault1.publicKey };
  };

  const addLiquidity = async (
    pool: PublicKey,
    tokenVault0: PublicKey,
    tokenVault1: PublicKey,
    amountToken0: number,
    amountToken1: number,
    tokenMint0: PublicKey,
    tokenMint1: PublicKey
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [poolAuthority] = findPoolAuthority(pool);
    
    const userTokenAccount0 = await getAssociatedTokenAddress(tokenMint0, wallet.publicKey);
    const userTokenAccount1 = await getAssociatedTokenAddress(tokenMint1, wallet.publicKey);

    const tx = await program.methods
      .addLiquidity(new BN(amountToken0), new BN(amountToken1))
      .accounts({
        pool,
        tokenVault0,
        tokenVault1,
        userTokenAccount0,
        userTokenAccount1,
        poolAuthority,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const removeLiquidity = async (
    pool: PublicKey,
    tokenVault0: PublicKey,
    tokenVault1: PublicKey,
    amountToken0: number,
    amountToken1: number,
    tokenMint0: PublicKey,
    tokenMint1: PublicKey
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [poolAuthority] = findPoolAuthority(pool);
    
    const userTokenAccount0 = await getAssociatedTokenAddress(tokenMint0, wallet.publicKey);
    const userTokenAccount1 = await getAssociatedTokenAddress(tokenMint1, wallet.publicKey);

    const tx = await program.methods
      .removeLiquidity(new BN(amountToken0), new BN(amountToken1))
      .accounts({
        pool,
        tokenVault0,
        tokenVault1,
        userTokenAccount0,
        userTokenAccount1,
        poolAuthority,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const swap = async (
    pool: PublicKey,
    tokenMintIn: PublicKey,
    tokenMintOut: PublicKey,
    tokenVaultIn: PublicKey,
    tokenVaultOut: PublicKey,
    amountIn: number,
    minimumAmountOut: number,
    zeroForOne: boolean
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [ammConfig] = findAmmConfigPDA();
    const [poolAuthority] = findPoolAuthority(pool);
    const [observationState] = findObservationPDA(pool);

    const userTokenAccountIn = await getAssociatedTokenAddress(tokenMintIn, wallet.publicKey);
    const userTokenAccountOut = await getAssociatedTokenAddress(tokenMintOut, wallet.publicKey);

    const tx = await program.methods
      .swap(new BN(amountIn), new BN(minimumAmountOut), zeroForOne)
      .accounts({
        pool,
        ammConfig,
        userTokenAccountIn,
        userTokenAccountOut,
        tokenVaultIn,
        tokenVaultOut,
        poolAuthority,
        observationState,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const openPosition = async (pool: PublicKey) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [position] = findPositionPDA(pool, wallet.publicKey);

    const tx = await program.methods
      .openPosition()
      .accounts({
        pool,
        owner: wallet.publicKey,
        position,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { tx, position };
  };

  const increasePositionLiquidity = async (
    pool: PublicKey,
    position: PublicKey,
    tokenVault0: PublicKey,
    tokenVault1: PublicKey,
    tokenMint0: PublicKey,
    tokenMint1: PublicKey,
    amountToken0: number,
    amountToken1: number
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [poolAuthority] = findPoolAuthority(pool);
    const userTokenAccount0 = await getAssociatedTokenAddress(tokenMint0, wallet.publicKey);
    const userTokenAccount1 = await getAssociatedTokenAddress(tokenMint1, wallet.publicKey);

    const tx = await program.methods
      .increasePositionLiquidity(new BN(amountToken0), new BN(amountToken1))
      .accounts({
        pool,
        position,
        owner: wallet.publicKey,
        tokenVault0,
        tokenVault1,
        userTokenAccount0,
        userTokenAccount1,
        poolAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const decreasePositionLiquidity = async (
    pool: PublicKey,
    position: PublicKey,
    tokenVault0: PublicKey,
    tokenVault1: PublicKey,
    tokenMint0: PublicKey,
    tokenMint1: PublicKey,
    amountToken0: number,
    amountToken1: number
  ) => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

    const [poolAuthority] = findPoolAuthority(pool);
    const userTokenAccount0 = await getAssociatedTokenAddress(tokenMint0, wallet.publicKey);
    const userTokenAccount1 = await getAssociatedTokenAddress(tokenMint1, wallet.publicKey);

    const tx = await program.methods
      .decreasePositionLiquidity(new BN(amountToken0), new BN(amountToken1))
      .accounts({
        pool,
        position,
        owner: wallet.publicKey,
        tokenVault0,
        tokenVault1,
        userTokenAccount0,
        userTokenAccount1,
        poolAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const getPool = async (poolAddress: PublicKey) => {
    if (!program) throw new Error('Program not initialized');
    return await (program.account as any).pool.fetch(poolAddress);
  };

  const getPosition = async (positionAddress: PublicKey) => {
    if (!program) throw new Error('Program not initialized');
    return await (program.account as any).position.fetch(positionAddress);
  };

  const getAmmConfig = async () => {
    if (!program) throw new Error('Program not initialized');
    const [ammConfig] = findAmmConfigPDA();
    return await (program.account as any).ammConfig.fetch(ammConfig);
  };

  return {
    program,
    initializeAmm,
    createPool,
    addLiquidity,
    removeLiquidity,
    swap,
    openPosition,
    increasePositionLiquidity,
    decreasePositionLiquidity,
    getPool,
    getPosition,
    getAmmConfig,
    findPoolPDA,
    findPositionPDA,
  };
}
