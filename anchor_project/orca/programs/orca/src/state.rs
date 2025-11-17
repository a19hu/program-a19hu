use anchor_lang::prelude::*;

#[account]
pub struct AmmConfig {
    pub bump: u8,
    pub authority: Pubkey,
    pub default_fee_rate: u16,
    pub protocol_fee_rate: u16,
    pub protocol_fee_destination: Pubkey,
    pub create_pool_enabled: bool,
    pub swap_enabled: bool,
}

impl AmmConfig {
    pub const SEED: &'static str = "amm_config";
    pub const SIZE: usize = 8 + 1 + 32 + 2 + 2 + 32 + 1 + 1;
}

#[account]
pub struct Pool {
    pub bump: u8,
    pub amm_config: Pubkey,
    pub token_mint_0: Pubkey,
    pub token_mint_1: Pubkey,
    pub token_vault_0: Pubkey,
    pub token_vault_1: Pubkey,
    pub auth_bump: u8,
    pub liquidity: u128, // added global liquidity
    pub sqrt_price_x64: u128,
    pub tick_current: i32,
    pub tick_spacing: u16,
    pub fee_rate: u16,
    pub protocol_fees_token_0: u64,
    pub protocol_fees_token_1: u64,
    // fee growth accumulators (per unit liquidity) for later per-position accounting
    pub fee_growth_global_0_x64: u128,
    pub fee_growth_global_1_x64: u128,
    // simple split percentages (bps) for lp, protocol, impact funds
    pub fee_split_lp_bps: u16,
    pub fee_split_protocol_bps: u16,
    pub fee_split_impact_bps: u16,
}

impl Pool {
    pub const SEED: &'static str = "pool";
    pub const SIZE: usize = 8 + 1 + (32 * 6) + 1 + 16 + 16 + 16 + 4 + 2 + 2 + 8 + 8 + 16 + 16 + 2 + 2 + 2; // updated for new fields
}

#[account]
pub struct Position {
    pub bump: u8,
    pub pool: Pubkey,
    pub owner: Pubkey,
    pub liquidity: u128,
    pub fee_growth_entry_0_x64: u128,
    pub fee_growth_entry_1_x64: u128,
    pub tokens_owed_0: u64,
    pub tokens_owed_1: u64,
}

impl Position {
    pub const SEED: &'static str = "position";
    pub const SIZE: usize = 8 + 1 + 32 + 32 + 16 + 16 + 16 + 8 + 8;
}

#[account]
pub struct ObservationState {
    pub bump: u8,
    pub pool: Pubkey,
    pub index: u8,
    pub cardinality: u8,
    pub tick_cumulative: i128,
    pub last_timestamp: i64,
}

impl ObservationState {
    pub const SEED: &'static str = "observation";
    pub const SIZE: usize = 8 + 1 + 32 + 1 + 1 + 16 + 8;
}
