

use soroban_sdk::{symbol_short, Address, Env};

pub fn escrow_created(
    env: &Env,
    escrow_id: u64,
    student: &Address,
    landlord: &Address,
    amount: i128,
) {
    env.events().publish(
        (symbol_short!("created"), escrow_id, student, landlord),
        amount,
    );
}

pub fn escrow_funded(
    env: &Env,
    escrow_id: u64,
    student: &Address,
) {
    env.events().publish(
        (symbol_short!("funded"), escrow_id, student),
        (),
    );
}

pub fn escrow_released(
    env: &Env,
    escrow_id: u64,
    landlord: &Address,
    amount: i128,
) {
    env.events().publish(
        (symbol_short!("released"), escrow_id, landlord),
        amount,
    );
}