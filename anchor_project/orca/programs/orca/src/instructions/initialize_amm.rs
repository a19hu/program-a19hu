use anchor_lang::prelude::*;
use crate::{contexts::*, constants::*, errors::ErrorCode as OrcaErrorCode};

pub fn handler(
    ctx: Context<InitializeAmm>,
    fee_rate: u16,
    protocol_fee_rate: u16,
) -> Result<()> {
    require!(fee_rate <= MAX_FEE_RATE, OrcaErrorCode::InvalidFeeRate);
    require!(protocol_fee_rate <= MAX_PROTOCOL_FEE_RATE, OrcaErrorCode::InvalidProtocolFeeRate);
    let amm_config = &mut ctx.accounts.amm_config;
    amm_config.bump = ctx.bumps.amm_config;
    amm_config.authority = ctx.accounts.authority.key();
    amm_config.default_fee_rate = fee_rate;
    amm_config.protocol_fee_rate = protocol_fee_rate;
    amm_config.protocol_fee_destination = ctx.accounts.protocol_fee_destination.key();
    amm_config.create_pool_enabled = true;
    amm_config.swap_enabled = true;
    msg!("Initialized AMM with fee rate: {} bps, protocol fee rate: {} bps", fee_rate, protocol_fee_rate);
    Ok(())
}
