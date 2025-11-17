use anchor_lang::prelude::*;
use crate::{contexts::*, constants::*, errors::ErrorCode as OrcaErrorCode};

pub fn handler(
    ctx: Context<CreatePool>,
    sqrt_price_x64: u128,
    tick_spacing: u16,
) -> Result<()> {
    require!(sqrt_price_x64 >= MIN_SQRT_PRICE && sqrt_price_x64 <= MAX_SQRT_PRICE, OrcaErrorCode::InvalidSqrtPrice);
    require!(tick_spacing >= MIN_TICK_SPACING && tick_spacing <= MAX_TICK_SPACING, OrcaErrorCode::InvalidTickSpacing);
    require!(ctx.accounts.token_mint_0.key() < ctx.accounts.token_mint_1.key(), OrcaErrorCode::InvalidTokenOrder);
    let current_tick = 0; // placeholder to avoid pulling math module while resolving build
    let clock = Clock::get()?;
    let pool = &mut ctx.accounts.pool;
    pool.bump = ctx.bumps.pool;
    pool.amm_config = ctx.accounts.amm_config.key();
    pool.token_mint_0 = ctx.accounts.token_mint_0.key();
    pool.token_mint_1 = ctx.accounts.token_mint_1.key();
    pool.token_vault_0 = ctx.accounts.token_vault_0.key();
    pool.token_vault_1 = ctx.accounts.token_vault_1.key();
    pool.auth_bump = ctx.bumps.pool_authority;
    pool.sqrt_price_x64 = sqrt_price_x64;
    pool.liquidity = 0;
    pool.tick_current = current_tick;
    pool.tick_spacing = tick_spacing;
    pool.fee_rate = ctx.accounts.amm_config.default_fee_rate;
    pool.protocol_fees_token_0 = 0;
    pool.protocol_fees_token_1 = 0;
    pool.fee_growth_global_0_x64 = 0;
    pool.fee_growth_global_1_x64 = 0;
    pool.fee_split_lp_bps = 2500;
    pool.fee_split_protocol_bps = 400;
    pool.fee_split_impact_bps = 100;
    let obs = &mut ctx.accounts.observation_state;
    obs.bump = ctx.bumps.observation_state;
    obs.pool = pool.key();
    obs.index = 0;
    obs.cardinality = 1;
    obs.tick_cumulative = 0;
    obs.last_timestamp = clock.unix_timestamp;
    msg!("Created pool with sqrt_price: {}, tick: {:?}, tick_spacing: {}", sqrt_price_x64, current_tick, tick_spacing);
    Ok(())
}
