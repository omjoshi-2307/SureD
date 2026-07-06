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

pub fn get_escrow(env: Env) -> Option<Escrow> {
    storage::get_escrow(&env)
}

pub fn deposit(
    env: Env,
    caller: Address,
) -> Result<Escrow, ContractError> {
    escrow::deposit(&env, caller)
}

pub fn confirm(
    env: Env,
    caller: Address,
) -> Result<Escrow, ContractError> {
    escrow::confirm(&env, caller)
}

    pub fn initialize(
    env: Env,
    student: Address,
    landlord: Address,
    amount: i128,
) -> Result<Escrow, ContractError> {
    escrow::initialize(&env, student, landlord, amount)
} }