

use soroban_sdk::{symbol_short, Address, Env};

pub fn escrow_created(
    env: &Env,
    student: &Address,
    landlord: &Address,
    amount: i128,
) {
    env.events().publish(
        (symbol_short!("created"), student, landlord),
        amount,
    );
}

pub fn escrow_funded(
    env: &Env,
    student: &Address,
) {
    env.events().publish(
        (symbol_short!("funded"), student),
        (),
    );
}

pub fn escrow_released(
    env: &Env,
    landlord: &Address,
    amount: i128,
) {
    env.events().publish(
        (symbol_short!("released"), landlord),
        amount,
    );
}