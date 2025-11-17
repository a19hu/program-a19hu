# Project Description

**Deployed Frontend URL:** LINK

**Solana Program ID:** 9P6cZJHLnLu77ur6CdpNEgTZPnVVHweozgo4ykc9LMVZ

## Project Overview

### Description
A fully-featured decentralized AMM (Automated Market Maker) built on Solana, inspired by Orca protocol. This dApp enables users to create liquidity pools, provide liquidity, swap tokens, and manage concentrated liquidity positions. The platform implements a sophisticated price curve mechanism using sqrt pricing and tick-based liquidity distribution, allowing for efficient capital utilization and reduced slippage. Users can earn trading fees by providing liquidity, while traders benefit from deep liquidity and competitive pricing across various token pairs.

### Key Features
- **Token Swaps**: Execute instant token-to-token swaps with slippage protection and optimal pricing
- **Pool Creation**: Initialize new liquidity pools with customizable parameters (initial price, tick spacing)
- **Liquidity Management**: Add or remove liquidity from pools to earn trading fees
- **Position Management**: Open and manage concentrated liquidity positions for enhanced capital efficiency
- **Fee Collection**: Automated fee distribution to liquidity providers based on their pool share
- **Price Oracle**: Built-in observation state tracks price history for TWAP calculations
- **Multi-fee Tiers**: Support for different tick spacings to accommodate various trading pairs (1, 10, 60, 200)

### How to Use the dApp
1. **Connect Wallet** - Connect your Solana wallet (Phantom, Solflare, etc.) to the application
2. **Swap Tokens**:
   - Navigate to the "Swap" tab
   - Enter pool address and token details
   - Input amount to swap and set minimum output for slippage protection
   - Confirm transaction
3. **Create a Pool**:
   - Go to "Pools" tab → "Create Pool"
   - Enter both token mint addresses
   - Set initial price using sqrt price X64 format
   - Choose tick spacing (1, 10, 60, or 200)
   - Confirm pool creation
4. **Add Liquidity**:
   - Navigate to "Pools" → "Add Liquidity"
   - Enter pool address and token details
   - Specify amounts for both tokens
   - Confirm to start earning fees
5. **Manage Positions**:
   - Go to "Positions" tab
   - Open new position for a specific pool
   - Increase or decrease liquidity as needed
   - Collect earned fees

## Program Architecture
The Orca AMM implements a concentrated liquidity model similar to Uniswap V3, using tick-based price ranges and sqrt pricing for efficient capital allocation. The program manages multiple account types to track pools, positions, and global configuration, with sophisticated math operations for price calculations and liquidity management.

### PDA Usage
The program extensively uses Program Derived Addresses to create deterministic, ownerless accounts that can be controlled by the program logic.

**PDAs Used:**
- **AMM Config PDA**: Derived from seeds `["amm_config"]` - stores global configuration including fee rates, protocol settings, and admin authority
- **Pool PDA**: Derived from seeds `["pool", token_mint_0, token_mint_1]` - unique pool account for each token pair, contains all pool state
- **Pool Authority PDA**: Derived from seeds `["vault_authority", pool_pubkey]` - has authority over token vaults to enable secure transfers
- **Position PDA**: Derived from seeds `["position", pool_pubkey, owner_pubkey]` - tracks individual user positions within a pool
- **Observation State PDA**: Derived from seeds `["observation", pool_pubkey]` - stores historical price data for oracle functionality

### Program Instructions
**Instructions Implemented:**
- **initialize_amm**: Sets up global AMM configuration with default fee rates and protocol settings
- **create_pool**: Initializes a new liquidity pool for a token pair with specified initial price and tick spacing
- **add_liquidity**: Deposits tokens into a pool to provide liquidity and earn trading fees
- **remove_liquidity**: Withdraws tokens from a pool, reducing liquidity position
- **swap**: Exchanges one token for another using pool liquidity with slippage protection
- **open_position**: Creates a new concentrated liquidity position account for a user
- **increase_position_liquidity**: Adds more tokens to an existing position
- **decrease_position_liquidity**: Removes tokens from an existing position

### Account Structure
```rust
#[account]
pub struct AmmConfig {
    pub bump: u8,                           // PDA bump seed
    pub authority: Pubkey,                  // Admin authority for config updates
    pub default_fee_rate: u16,              // Default trading fee in basis points
    pub protocol_fee_rate: u16,             // Protocol fee rate in basis points
    pub protocol_fee_destination: Pubkey,   // Where protocol fees are sent
    pub create_pool_enabled: bool,          // Global toggle for pool creation
    pub swap_enabled: bool,                 // Global toggle for swapping
}

#[account]
pub struct Pool {
    pub bump: u8,                           // PDA bump seed
    pub amm_config: Pubkey,                 // Reference to AMM config
    pub token_mint_0: Pubkey,               // First token mint address
    pub token_mint_1: Pubkey,               // Second token mint address
    pub token_vault_0: Pubkey,              // Vault holding token 0
    pub token_vault_1: Pubkey,              // Vault holding token 1
    pub auth_bump: u8,                      // Authority PDA bump
    pub liquidity: u128,                    // Total liquidity in pool
    pub sqrt_price_x64: u128,               // Current price (sqrt(price) * 2^64)
    pub tick_current: i32,                  // Current tick index
    pub tick_spacing: u16,                  // Tick spacing (1, 10, 60, 200)
    pub fee_rate: u16,                      // Pool-specific fee rate
    pub protocol_fees_token_0: u64,         // Accumulated protocol fees for token 0
    pub protocol_fees_token_1: u64,         // Accumulated protocol fees for token 1
    pub fee_growth_global_0_x64: u128,      // Fee accumulator for token 0
    pub fee_growth_global_1_x64: u128,      // Fee accumulator for token 1
    pub fee_split_lp_bps: u16,              // LP fee share in basis points
    pub fee_split_protocol_bps: u16,        // Protocol fee share in basis points
    pub fee_split_impact_bps: u16,          // Impact fund fee share in basis points
}

#[account]
pub struct Position {
    pub bump: u8,                           // PDA bump seed
    pub pool: Pubkey,                       // Pool this position belongs to
    pub owner: Pubkey,                      // Owner of the position
    pub liquidity: u128,                    // Liquidity amount in position
    pub fee_growth_entry_0_x64: u128,       // Fee growth snapshot for token 0
    pub fee_growth_entry_1_x64: u128,       // Fee growth snapshot for token 1
    pub tokens_owed_0: u64,                 // Uncollected fees for token 0
    pub tokens_owed_1: u64,                 // Uncollected fees for token 1
}

#[account]
pub struct ObservationState {
    pub bump: u8,                           // PDA bump seed
    pub pool: Pubkey,                       // Pool being observed
    pub index: u8,                          // Current observation index
    pub cardinality: u8,                    // Number of observations
    pub tick_cumulative: i128,              // Cumulative tick for TWAP
    pub last_timestamp: i64,                // Last update timestamp
}
```

## Testing

### Test Coverage
Comprehensive test suite covering all core functionality with both successful operations and error scenarios to ensure program security, mathematical correctness, and proper access control.

**Happy Path Tests:**
- **Initialize AMM**: Successfully creates AMM config with correct fee rates and authority
- **Create Pool**: Properly initializes pool with two token mints, vaults, and initial price
- **Add Liquidity**: Correctly deposits tokens and updates pool liquidity state
- **Remove Liquidity**: Withdraws tokens proportionally and updates pool state
- **Swap Token 0 for Token 1**: Executes swap with correct amounts and fee deduction
- **Swap Token 1 for Token 0**: Executes reverse swap with proper calculations
- **Open Position**: Creates position account linked to pool and owner
- **Increase Position Liquidity**: Adds tokens to position and updates fee tracking
- **Decrease Position Liquidity**: Removes tokens from position and distributes fees

**Unhappy Path Tests:**
- **Invalid Sqrt Price**: Fails when creating pool with invalid price value
- **Invalid Tick Spacing**: Rejects pool creation with unsupported tick spacing
- **Insufficient Liquidity**: Fails when trying to remove more liquidity than available
- **Slippage Exceeded**: Rejects swap when output is below minimum amount
- **Unauthorized Pool Creation**: Fails when pool creation is disabled globally
- **Unauthorized Swap**: Fails when swapping is disabled globally
- **Invalid Token Order**: Rejects pool with token mints in wrong order
- **Zero Amount Swap**: Fails when attempting swap with zero input
- **Position Overflow**: Prevents liquidity amounts that would cause overflow
- **Invalid Fee Rate**: Rejects fee rates outside acceptable ranges

### Running Tests
```bash
cd anchor_project/orca
yarn install          # Install dependencies
anchor build         # Build the program
anchor test          # Run full test suite
anchor test --skip-build  # Run tests without rebuilding
```

### Additional Notes for Evaluators

This project implements a production-grade concentrated liquidity AMM with several advanced features. The biggest challenges were:

1. **Mathematical Precision**: Implementing sqrt price calculations and tick math required careful handling of fixed-point arithmetic to prevent rounding errors and maintain price accuracy across large ranges.

2. **Fee Distribution**: Designing the fee growth accumulator system to fairly distribute fees to positions based on their liquidity contribution and time in pool was complex but essential for accurate accounting.

3. **PDA Architecture**: Managing multiple interdependent PDAs (pool, position, observation state, vault authority) while ensuring proper authority checks and preventing unauthorized access required careful planning.

4. **Gas Optimization**: Balancing feature completeness with transaction costs, especially for swap operations that involve multiple calculations and account updates.

The frontend provides a clean interface for all operations without hardcoded addresses, making it flexible for any deployed instance. All account addresses are user-provided inputs, ensuring the dApp can work with any pool or position created through the program.