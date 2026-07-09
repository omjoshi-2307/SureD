#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env};
use crate::{
    errors::ContractError,
    types::Escrow,
};


mod errors;
mod escrow;
mod events;
mod storage;
mod test;
mod types;

#[contract]
pub struct SureDepositContract;


#[contractimpl]
impl SureDepositContract {

    pub fn get_escrow(env: Env, escrow_id: u64) -> Option<Escrow> {
        storage::get_escrow(&env, escrow_id)
    }

    pub fn deposit(
        env: Env,
        escrow_id: u64,
        caller: Address,
    ) -> Result<Escrow, ContractError> {
        escrow::deposit(&env, escrow_id, caller)
    }

    pub fn confirm(
        env: Env,
        escrow_id: u64,
        caller: Address,
    ) -> Result<Escrow, ContractError> {
        escrow::confirm(&env, escrow_id, caller)
    }

    pub fn initialize(
        env: Env,
        student: Address,
        landlord: Address,
        amount: i128,
    ) -> Result<Escrow, ContractError> {
        escrow::initialize(&env, student, landlord, amount)
    }

    pub fn release(
    env: Env,
    escrow_id: u64,
    caller: Address,
) -> Result<Escrow, ContractError> {
    escrow::release(&env, escrow_id, caller)
}

}