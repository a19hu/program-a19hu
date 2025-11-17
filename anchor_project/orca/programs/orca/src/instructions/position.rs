use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use crate::{contexts::*, errors::ErrorCode as OrcaErrorCode};

pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    position.bump = ctx.bumps.position;
    position.pool = pool.key();
    position.owner = ctx.accounts.owner.key();
    position.liquidity = 0;
    position.fee_growth_entry_0_x64 = pool.fee_growth_global_0_x64;
    position.fee_growth_entry_1_x64 = pool.fee_growth_global_1_x64;
    position.tokens_owed_0 = 0;
    position.tokens_owed_1 = 0;
    msg!("Position opened for owner {} on pool {}", position.owner, position.pool);
    Ok(())
}

pub fn increase_position_liquidity(
    ctx: Context<ModifyPositionLiquidity>,
    amount_token_0: u64,
    amount_token_1: u64,
) -> Result<()> {
    require!(amount_token_0 > 0 && amount_token_1 > 0, OrcaErrorCode::InvalidAmount);
    let pool = &mut ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new(cpi_program.clone(), Transfer { from: ctx.accounts.user_token_account_0.to_account_info(), to: ctx.accounts.token_vault_0.to_account_info(), authority: ctx.accounts.owner.to_account_info() }), amount_token_0)?;
    token::transfer(CpiContext::new(cpi_program, Transfer { from: ctx.accounts.user_token_account_1.to_account_info(), to: ctx.accounts.token_vault_1.to_account_info(), authority: ctx.accounts.owner.to_account_info() }), amount_token_1)?;
    let delta_liquidity = (amount_token_0 as u128) + (amount_token_1 as u128);
    position.liquidity = position.liquidity.saturating_add(delta_liquidity);
    pool.liquidity = pool.liquidity.saturating_add(delta_liquidity);
    position.fee_growth_entry_0_x64 = pool.fee_growth_global_0_x64;
    position.fee_growth_entry_1_x64 = pool.fee_growth_global_1_x64;
    msg!("Increased position liquidity by {} (tokens0+1)", delta_liquidity);
    Ok(())
}

pub fn decrease_position_liquidity(
    ctx: Context<ModifyPositionLiquidity>,
    amount_token_0: u64,
    amount_token_1: u64,
) -> Result<()> {
    require!(amount_token_0 > 0 && amount_token_1 > 0, OrcaErrorCode::InvalidAmount);
    let pool = &mut ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    require!(position.liquidity > 0, OrcaErrorCode::PositionIsEmpty);
    let delta_liquidity = (amount_token_0 as u128) + (amount_token_1 as u128);
    require!(delta_liquidity <= position.liquidity, OrcaErrorCode::InsufficientLiquidity);
    position.liquidity -= delta_liquidity;
    pool.liquidity = pool.liquidity.saturating_sub(delta_liquidity);
    let pool_key = pool.key();
    let seeds = [crate::constants::POOL_AUTHORITY_SEED.as_bytes(), pool_key.as_ref(), &[pool.auth_bump]];
    let signer = &[&seeds[..]];
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new_with_signer(cpi_program.clone(), Transfer { from: ctx.accounts.token_vault_0.to_account_info(), to: ctx.accounts.user_token_account_0.to_account_info(), authority: ctx.accounts.pool_authority.to_account_info() }, signer), amount_token_0)?;
    token::transfer(CpiContext::new_with_signer(cpi_program, Transfer { from: ctx.accounts.token_vault_1.to_account_info(), to: ctx.accounts.user_token_account_1.to_account_info(), authority: ctx.accounts.pool_authority.to_account_info() }, signer), amount_token_1)?;
    msg!("Decreased position liquidity by {} (tokens0+1)", delta_liquidity);
    Ok(())
}
