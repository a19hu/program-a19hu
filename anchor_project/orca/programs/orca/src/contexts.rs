use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::{AmmConfig, Pool, Position, ObservationState};
use crate::constants::*;
use crate::errors::ErrorCode as OrcaErrorCode;

#[derive(Accounts)]
pub struct InitializeAmm<'info> {
    #[account(
        init,
        payer = authority,
        space = AmmConfig::SIZE,
        seeds = [AMM_CONFIG_SEED.as_bytes()],
        bump
    )]
    pub amm_config: Account<'info, AmmConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: destination key only
    pub protocol_fee_destination: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(sqrt_price_x64: u128, tick_spacing: u16)]
pub struct CreatePool<'info> {
    #[account(
        seeds = [AMM_CONFIG_SEED.as_bytes()],
        bump = amm_config.bump,
        constraint = amm_config.create_pool_enabled @ OrcaErrorCode::CreatePoolDisabled
    )]
    pub amm_config: Account<'info, AmmConfig>,
    #[account(
        init,
        payer = creator,
        space = Pool::SIZE,
        seeds = [
            POOL_SEED.as_bytes(),
            amm_config.key().as_ref(),
            token_mint_0.key().as_ref(),
            token_mint_1.key().as_ref()
        ],
        bump
    )]
    pub pool: Account<'info, Pool>,
    pub token_mint_0: Account<'info, Mint>,
    pub token_mint_1: Account<'info, Mint>,
    #[account(
        init,
        payer = creator,
        token::mint = token_mint_0,
        token::authority = pool_authority
    )]
    pub token_vault_0: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = creator,
        token::mint = token_mint_1,
        token::authority = pool_authority
    )]
    pub token_vault_1: Account<'info, TokenAccount>,
    /// CHECK: PDA for pool authority
    #[account(
        seeds = [POOL_AUTHORITY_SEED.as_bytes(), pool.key().as_ref()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = creator,
        space = ObservationState::SIZE,
        seeds = [OBSERVATION_SEED.as_bytes(), pool.key().as_ref()],
        bump
    )]
    pub observation_state: Account<'info, ObservationState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ModifyLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub token_vault_0: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_vault_1: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account_0: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account_1: Account<'info, TokenAccount>,
    /// CHECK: PDA
    #[account(seeds = [POOL_AUTHORITY_SEED.as_bytes(), pool.key().as_ref()], bump = pool.auth_bump)]
    pub pool_authority: UncheckedAccount<'info>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(constraint = amm_config.swap_enabled @ OrcaErrorCode::SwapDisabled)]
    pub amm_config: Account<'info, AmmConfig>,
    #[account(mut)]
    pub user_token_account_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account_out: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_vault_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_vault_out: Account<'info, TokenAccount>,
    /// CHECK: PDA
    #[account(seeds = [POOL_AUTHORITY_SEED.as_bytes(), pool.key().as_ref()], bump = pool.auth_bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [OBSERVATION_SEED.as_bytes(), pool.key().as_ref()], bump = observation_state.bump)]
    pub observation_state: Account<'info, ObservationState>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = Position::SIZE,
        seeds = [b"position", pool.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyPositionLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = pool, has_one = owner)]
    pub position: Account<'info, Position>,
    pub owner: Signer<'info>,
    #[account(mut)]
    pub token_vault_0: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_vault_1: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account_0: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account_1: Account<'info, TokenAccount>,
    /// CHECK: PDA
    #[account(seeds = [POOL_AUTHORITY_SEED.as_bytes(), pool.key().as_ref()], bump = pool.auth_bump)]
    pub pool_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}
