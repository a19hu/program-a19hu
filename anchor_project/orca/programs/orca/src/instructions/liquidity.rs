use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use crate::{contexts::*, errors::ErrorCode as OrcaErrorCode};

pub fn add_liquidity(
    ctx: Context<ModifyLiquidity>,
    amount_token_0: u64,
    amount_token_1: u64,
) -> Result<()> {
    require!(amount_token_0 > 0 && amount_token_1 > 0, OrcaErrorCode::InvalidAmount);
    let pool = &mut ctx.accounts.pool;
    let cpi_accounts_0 = Transfer { from: ctx.accounts.user_token_account_0.to_account_info(), to: ctx.accounts.token_vault_0.to_account_info(), authority: ctx.accounts.user.to_account_info() };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new(cpi_program.clone(), cpi_accounts_0), amount_token_0)?;
    let cpi_accounts_1 = Transfer { from: ctx.accounts.user_token_account_1.to_account_info(), to: ctx.accounts.token_vault_1.to_account_info(), authority: ctx.accounts.user.to_account_info() };
    token::transfer(CpiContext::new(cpi_program, cpi_accounts_1), amount_token_1)?;
    pool.liquidity = pool.liquidity.saturating_add((amount_token_0 as u128) + (amount_token_1 as u128));
    msg!("Added liquidity: token0={}, token1={}, new_liquidity={}", amount_token_0, amount_token_1, pool.liquidity);
    Ok(())
}

pub fn remove_liquidity(
    ctx: Context<ModifyLiquidity>,
    amount_token_0: u64,
    amount_token_1: u64,
) -> Result<()> {
    require!(amount_token_0 > 0 && amount_token_1 > 0, OrcaErrorCode::InvalidAmount);
    let pool = &mut ctx.accounts.pool;
    require!(pool.liquidity > 0, OrcaErrorCode::InsufficientLiquidity);
    let delta = (amount_token_0 as u128) + (amount_token_1 as u128);
    require!(delta <= pool.liquidity, OrcaErrorCode::InsufficientLiquidity);
    pool.liquidity -= delta;
    let pool_key = pool.key();
    let seeds = [crate::constants::POOL_AUTHORITY_SEED.as_bytes(), pool_key.as_ref(), &[pool.auth_bump]];
    let signer = &[&seeds[..]];
    let cpi_accounts_0 = Transfer { from: ctx.accounts.token_vault_0.to_account_info(), to: ctx.accounts.user_token_account_0.to_account_info(), authority: ctx.accounts.pool_authority.to_account_info() };
    token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts_0, signer), amount_token_0)?;
    let cpi_accounts_1 = Transfer { from: ctx.accounts.token_vault_1.to_account_info(), to: ctx.accounts.user_token_account_1.to_account_info(), authority: ctx.accounts.pool_authority.to_account_info() };
    token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts_1, signer), amount_token_1)?;
    msg!("Removed liquidity: token0={}, token1={}, remaining_liquidity={}", amount_token_0, amount_token_1, pool.liquidity);
    Ok(())
}
