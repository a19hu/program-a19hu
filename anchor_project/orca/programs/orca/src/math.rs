use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::ErrorCode;

/// Simple placeholder tick math for demonstration.
/// Linear mapping between tick range and sqrt price bounds.
pub fn tick_to_sqrt_price(tick: i32) -> Result<u128> {
    require!(tick >= MIN_TICK && tick <= MAX_TICK, ErrorCode::TickOutOfBounds);
    let span_ticks = (MAX_TICK - MIN_TICK) as u128;
    let span_price = MAX_SQRT_PRICE - MIN_SQRT_PRICE;
    let offset = (tick - MIN_TICK) as u128;
    let price = MIN_SQRT_PRICE + (offset * span_price) / span_ticks;
    Ok(price)
}

pub fn sqrt_price_to_tick(sqrt_price_x64: u128) -> Result<i32> {
    require!(sqrt_price_x64 >= MIN_SQRT_PRICE && sqrt_price_x64 <= MAX_SQRT_PRICE, ErrorCode::PriceOutOfBounds);
    let span_ticks = (MAX_TICK - MIN_TICK) as u128;
    let span_price = MAX_SQRT_PRICE - MIN_SQRT_PRICE;
    let offset_price = sqrt_price_x64 - MIN_SQRT_PRICE;
    // Avoid division by zero (span_price > 0 given constants)
    let tick_offset = (offset_price * span_ticks) / span_price;
    let tick = MIN_TICK as i128 + tick_offset as i128;
    Ok(tick as i32)
}
