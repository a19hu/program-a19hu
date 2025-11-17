use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid tick range")]
    InvalidTickRange,
    
    #[msg("Invalid tick spacing")]
    InvalidTickSpacing,
    
    #[msg("Invalid sqrt price")]
    InvalidSqrtPrice,
    
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    
    #[msg("Slippage tolerance exceeded")]
    SlippageToleranceExceeded,
    
    #[msg("Invalid fee rate")]
    InvalidFeeRate,
    
    #[msg("Pool not enabled")]
    PoolNotEnabled,
    
    #[msg("Swap not enabled")]
    SwapNotEnabled,
    
    #[msg("Invalid authority")]
    InvalidAuthority,
    
    #[msg("Position not found")]
    PositionNotFound,
    
    #[msg("Tick not initialized")]
    TickNotInitialized,
    
    #[msg("Invalid tick array")]
    InvalidTickArray,
    
    #[msg("Tick out of bounds")]
    TickOutOfBounds,
    
    #[msg("Price out of bounds")]
    PriceOutOfBounds,
    
    #[msg("Liquidity overflow")]
    LiquidityOverflow,
    
    #[msg("Liquidity underflow")]
    LiquidityUnderflow,
    
    #[msg("Math overflow")]
    MathOverflow,
    
    #[msg("Math underflow")]
    MathUnderflow,
    
    #[msg("Division by zero")]
    DivisionByZero,
    
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    
    #[msg("Invalid mint")]
    InvalidMint,
    
    #[msg("Invalid pool configuration")]
    InvalidPoolConfig,
    
    #[msg("Pool already exists")]
    PoolAlreadyExists,
    
    #[msg("Position already exists")]
    PositionAlreadyExists,
    
    #[msg("Reward not initialized")]
    RewardNotInitialized,
    
    #[msg("Reward already initialized")]
    RewardAlreadyInitialized,
    
    #[msg("Invalid reward period")]
    InvalidRewardPeriod,
    
    #[msg("Insufficient rewards")]
    InsufficientRewards,
    
    #[msg("Invalid observation")]
    InvalidObservation,
    
    #[msg("Oracle not initialized")]
    OracleNotInitialized,
    
    #[msg("Invalid time window")]
    InvalidTimeWindow,
    
    #[msg("Insufficient observation data")]
    InsufficientObservationData,
    
    #[msg("Invalid protocol fee rate")]
    InvalidProtocolFeeRate,
    
    #[msg("Protocol fee collection failed")]
    ProtocolFeeCollectionFailed,
    
    #[msg("Invalid tick array bitmap")]
    InvalidTickArrayBitmap,
    
    #[msg("Tick array already initialized")]
    TickArrayAlreadyInitialized,
    
    #[msg("Invalid position range")]
    InvalidPositionRange,
    
    #[msg("Position is empty")]
    PositionIsEmpty,
    
    #[msg("Cannot decrease liquidity below minimum")]
    CannotDecreaseLiquidityBelowMinimum,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Amount out below minimum")]
    AmountOutBelowMinimum,
    
    #[msg("Amount in above maximum")]
    AmountInAboveMaximum,
    
    #[msg("Invalid sqrt price limit")]
    InvalidSqrtPriceLimit,
    
    #[msg("Swap failed")]
    SwapFailed,
    
    #[msg("Invalid fee collection")]
    InvalidFeeCollection,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Account not writable")]
    AccountNotWritable,
    
    #[msg("Account not signer")]
    AccountNotSigner,
    
    #[msg("Invalid program data")]
    InvalidProgramData,
    
    #[msg("Numerical overflow")]
    NumericalOverflow,
    
    #[msg("Create pool disabled")]
    CreatePoolDisabled,
    
    #[msg("Swap disabled")]
    SwapDisabled,
    
    #[msg("Invalid token order")]
    InvalidTokenOrder,
    
    #[msg("Tick not aligned")]
    TickNotAligned,
    
    #[msg("Amount out too low")]
    AmountOutTooLow,
}