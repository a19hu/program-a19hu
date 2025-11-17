/// Tick constants
pub const MIN_TICK: i32 = -887272;
pub const MAX_TICK: i32 = 887272;
pub const MIN_SQRT_PRICE: u128 = 4295128739;
pub const MAX_SQRT_PRICE: u128 = u64::MAX as u128;

/// Fee constants
pub const MAX_FEE_RATE: u16 = 10000; // 1%
pub const MAX_PROTOCOL_FEE_RATE: u16 = 10000; // 100% of trading fees

/// Position constants
pub const MAX_TICK_SPACING: u16 = 16384;
pub const MIN_TICK_SPACING: u16 = 1;

/// Seed constants for PDAs
pub const AMM_CONFIG_SEED: &str = "amm_config";
pub const POOL_SEED: &str = "pool";
pub const OBSERVATION_SEED: &str = "observation";

/// Vault authority seed
pub const POOL_AUTHORITY_SEED: &str = "pool_authority";

pub const Q64: u128 = 1u128 << 64; // added for fee growth scaling