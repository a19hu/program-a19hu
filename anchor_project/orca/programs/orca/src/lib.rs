use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;
// pub mod math; // removed to avoid conflict with math directory
pub mod contexts;
pub mod instructions;

use contexts::*;
use instructions::{initialize_amm, create_pool, liquidity, swap, position};

declare_id!("9P6cZJHLnLu77ur6CdpNEgTZPnVVHweozgo4ykc9LMVZ");

#[program]
pub mod orca {
    use super::*;

    pub fn initialize_amm(
        ctx: Context<InitializeAmm>,
        fee_rate: u16,
        protocol_fee_rate: u16,
    ) -> Result<()> {
        initialize_amm::handler(ctx, fee_rate, protocol_fee_rate)
    }

    pub fn create_pool(
        ctx: Context<CreatePool>,
        sqrt_price_x64: u128,
        tick_spacing: u16,
    ) -> Result<()> {
        create_pool::handler(ctx, sqrt_price_x64, tick_spacing)
    }

    pub fn add_liquidity(
        ctx: Context<ModifyLiquidity>,
        amount_token_0: u64,
        amount_token_1: u64,
    ) -> Result<()> {
        liquidity::add_liquidity(ctx, amount_token_0, amount_token_1)
    }

    pub fn remove_liquidity(
        ctx: Context<ModifyLiquidity>,
        amount_token_0: u64,
        amount_token_1: u64,
    ) -> Result<()> {
        liquidity::remove_liquidity(ctx, amount_token_0, amount_token_1)
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
        zero_for_one: bool,
    ) -> Result<()> {
        swap::handler(ctx, amount_in, minimum_amount_out, zero_for_one)
    }

    pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
        position::open_position(ctx)
    }

    pub fn increase_position_liquidity(
        ctx: Context<ModifyPositionLiquidity>,
        amount_token_0: u64,
        amount_token_1: u64,
    ) -> Result<()> {
        position::increase_position_liquidity(ctx, amount_token_0, amount_token_1)
    }

    pub fn decrease_position_liquidity(
        ctx: Context<ModifyPositionLiquidity>,
        amount_token_0: u64,
        amount_token_1: u64,
    ) -> Result<()> {
        position::decrease_position_liquidity(ctx, amount_token_0, amount_token_1)
    }
}
