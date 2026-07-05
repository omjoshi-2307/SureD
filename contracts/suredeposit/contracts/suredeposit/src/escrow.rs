use soroban_sdk::{Address, Env};

use crate::{
    errors::ContractError,
    types::{Escrow, EscrowStatus},
};

pub fn initialize(
    _env: &Env,
    student: Address,
    landlord: Address,
    amount: i128,
) -> Result<Escrow, ContractError> {

    // Validation 1
    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    // Validation 2
    if student == landlord {
        return Err(ContractError::SameAddress);
    }

    if crate::storage::get_escrow(_env).is_some() {
    return Err(ContractError::AlreadyInitialized);
}
    // Authentication
    student.require_auth();

    let escrow = Escrow {
        student,
        landlord,
        amount,
        status: EscrowStatus::Created,
        student_confirmed: false,
        landlord_confirmed: false,
    };

crate::storage::save_escrow(_env, &escrow);

    crate::events::escrow_created(
    _env,
    &escrow.student,
    &escrow.landlord,
    escrow.amount,
);


Ok(escrow)
}

pub fn deposit(
    env: &Env,
    caller: Address,
) -> Result<Escrow, ContractError> {

    let mut escrow = crate::storage::get_escrow(env)
        .ok_or(ContractError::EscrowNotFound)?;

    // Only the student can deposit
    if caller != escrow.student {
        return Err(ContractError::Unauthorized);
    }

    caller.require_auth();

    // Deposit is only allowed once
    if escrow.status != EscrowStatus::Created {
        return Err(ContractError::InvalidState);
    }

    escrow.status = EscrowStatus::Funded;

    crate::storage::save_escrow(env, &escrow);

    crate::events::escrow_funded(
        env,
        &escrow.student,
    );

    Ok(escrow)
}