use soroban_sdk::{token, Address, Env};

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

    // Increment next escrow ID and use the current one
    let escrow_id = crate::storage::increment_next_escrow_id(_env);

    let escrow = Escrow {
        escrow_id,
        student,
        landlord,
        amount,
        status: EscrowStatus::Created,
        student_confirmed: false,
        landlord_confirmed: false,
    };

    crate::storage::save_escrow(_env, escrow_id, &escrow);

    crate::events::escrow_created(
        _env,
        escrow_id,
        &escrow.student,
        &escrow.landlord,
        escrow.amount,
    );

    Ok(escrow)
}

pub fn deposit(env: &Env, escrow_id: u64, caller: Address) -> Result<Escrow, ContractError> {
    let mut escrow =
        crate::storage::get_escrow(env, escrow_id).ok_or(ContractError::EscrowNotFound)?;

    // Only the student can deposit
    if caller != escrow.student {
        return Err(ContractError::Unauthorized);
    }

    caller.require_auth();

    // Deposit is only allowed once
    // Deposit is only allowed once
    if escrow.status != EscrowStatus::Created {
        return Err(ContractError::InvalidState);
    }

    // Transfer XLM from student to this contract
    let token_addr = crate::storage::get_token(env);
    let client = token::Client::new(env, &token_addr);

    client.transfer(&caller, &env.current_contract_address(), &escrow.amount);

    escrow.status = EscrowStatus::Funded;

    crate::storage::save_escrow(env, escrow_id, &escrow);

    crate::events::escrow_funded(env, escrow_id, &escrow.student);

    Ok(escrow)
}

pub fn confirm(env: &Env, escrow_id: u64, caller: Address) -> Result<Escrow, ContractError> {
    let mut escrow =
        crate::storage::get_escrow(env, escrow_id).ok_or(ContractError::EscrowNotFound)?;

    if escrow.status != EscrowStatus::Funded {
        return Err(ContractError::InvalidState);
    }

    caller.require_auth();

    if caller == escrow.student {
        if escrow.student_confirmed {
            return Err(ContractError::AlreadyConfirmed);
        }

        escrow.student_confirmed = true;
    } else if caller == escrow.landlord {
        if escrow.landlord_confirmed {
            return Err(ContractError::AlreadyConfirmed);
        }

        escrow.landlord_confirmed = true;
    } else {
        return Err(ContractError::Unauthorized);
    }

    // If both parties have confirmed, update the status
    if escrow.student_confirmed && escrow.landlord_confirmed {
        escrow.status = EscrowStatus::PendingConfirmation;
    }

    // Save the updated escrow
    crate::storage::save_escrow(env, escrow_id, &escrow);

    // Return the updated escrow
    Ok(escrow)
}

pub fn release(env: &Env, escrow_id: u64, caller: Address) -> Result<Escrow, ContractError> {
    let mut escrow =
        crate::storage::get_escrow(env, escrow_id).ok_or(ContractError::EscrowNotFound)?;

    caller.require_auth();

    if caller != escrow.landlord {
        return Err(ContractError::Unauthorized);
    }

    if escrow.status == EscrowStatus::Released {
        return Err(ContractError::AlreadyReleased);
    }

    if escrow.status != EscrowStatus::PendingConfirmation {
        return Err(ContractError::InvalidState);
    }

    // Transfer XLM from the contract to the landlord
    let token_addr = crate::storage::get_token(env);
    let client = token::Client::new(env, &token_addr);

    client.transfer(
        &env.current_contract_address(),
        &escrow.landlord,
        &escrow.amount,
    );

    escrow.status = EscrowStatus::Released;

    crate::storage::save_escrow(env, escrow_id, &escrow);

    crate::events::escrow_released(env, escrow_id, &escrow.landlord, escrow.amount);

    Ok(escrow)
}

pub fn refund(env: &Env, escrow_id: u64, caller: Address) -> Result<Escrow, ContractError> {
    let mut escrow =
        crate::storage::get_escrow(env, escrow_id).ok_or(ContractError::EscrowNotFound)?;

    caller.require_auth();

    // Only the landlord can refund
    if caller != escrow.landlord {
        return Err(ContractError::Unauthorized);
    }

    // Refund only while the contract holds funds
    match escrow.status {
        EscrowStatus::Funded | EscrowStatus::PendingConfirmation => {}
        _ => return Err(ContractError::InvalidState),
    }

    let token_addr = crate::storage::get_token(env);
    let client = token::Client::new(env, &token_addr);

    client.transfer(
        &env.current_contract_address(),
        &escrow.student,
        &escrow.amount,
    );

    escrow.status = EscrowStatus::Refunded;

    crate::storage::save_escrow(env, escrow_id, &escrow);

    crate::events::escrow_refunded(env, escrow_id, &escrow.student, escrow.amount);

    Ok(escrow)
}
