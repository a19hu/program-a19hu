use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use crate::{contexts::*, errors::ErrorCode as OrcaErrorCode};
use crate::constants::POOL_AUTHORITY_SEED;

pub fn handler(
    ctx: Context<Swap>,
    amount_in: u64,
    minimum_amount_out: u64,
    zero_for_one: bool,
) -> Result<()> {
    require!(amount_in > 0, OrcaErrorCode::InvalidAmount);
    let pool = &mut ctx.accounts.pool;
    let fee_amount = (amount_in as u128 * pool.fee_rate as u128 / 1_000_000u128) as u64;
    let amount_in_after_fee = amount_in.saturating_sub(fee_amount);
    let amount_out = amount_in_after_fee / 2;
    require!(amount_out >= minimum_amount_out, OrcaErrorCode::AmountOutTooLow);
    if zero_for_one { pool.protocol_fees_token_0 = pool.protocol_fees_token_0.saturating_add(fee_amount); } else { pool.protocol_fees_token_1 = pool.protocol_fees_token_1.saturating_add(fee_amount); }
    if pool.liquidity > 0 { let fee_growth_increment = ((fee_amount as u128) << 64) / pool.liquidity; if zero_for_one { pool.fee_growth_global_0_x64 = pool.fee_growth_global_0_x64.saturating_add(fee_growth_increment); } else { pool.fee_growth_global_1_x64 = pool.fee_growth_global_1_x64.saturating_add(fee_growth_increment); } }
    let cpi_accounts_in = Transfer { from: ctx.accounts.user_token_account_in.to_account_info(), to: ctx.accounts.token_vault_in.to_account_info(), authority: ctx.accounts.user.to_account_info() };
    let cpi_program_in = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new(cpi_program_in, cpi_accounts_in), amount_in)?;
    let pool_key = pool.key();
    let pool_seeds = &[POOL_AUTHORITY_SEED.as_bytes(), pool_key.as_ref(), &[pool.auth_bump]];
    let signer_seeds = &[&pool_seeds[..]];
    let cpi_accounts_out = Transfer { from: ctx.accounts.token_vault_out.to_account_info(), to: ctx.accounts.user_token_account_out.to_account_info(), authority: ctx.accounts.pool_authority.to_account_info() };
    let cpi_program_out = ctx.accounts.token_program.to_account_info();
    token::transfer(CpiContext::new_with_signer(cpi_program_out, cpi_accounts_out, signer_seeds), amount_out)?;
    let clock_now = Clock::get()?;
    let obs = &mut ctx.accounts.observation_state;
    let elapsed = clock_now.unix_timestamp - obs.last_timestamp;
    if elapsed > 0 { obs.tick_cumulative = obs.tick_cumulative.saturating_add((pool.tick_current as i128) * (elapsed as i128)); obs.last_timestamp = clock_now.unix_timestamp; }
    msg!("Swap completed: {} in, {} out", amount_in, amount_out);
    Ok(())
}
