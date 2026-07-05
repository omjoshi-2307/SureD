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
Ok(escrow)
}