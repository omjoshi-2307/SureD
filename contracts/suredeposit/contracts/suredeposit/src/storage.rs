use soroban_sdk::{contracttype, Address, Env};

use crate::types::Escrow;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Escrow(u64),
    NextEscrowId,
    Token,
}

pub fn save_escrow(env: &Env, escrow_id: u64, escrow: &Escrow) {
    env.storage()
        .persistent()
        .set(&DataKey::Escrow(escrow_id), escrow);
}

pub fn get_escrow(env: &Env, escrow_id: u64) -> Option<Escrow> {
    env.storage()
        .persistent()
        .get(&DataKey::Escrow(escrow_id))
}

pub fn get_next_escrow_id(env: &Env) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::NextEscrowId)
        .unwrap_or(1)
}

pub fn increment_next_escrow_id(env: &Env) -> u64 {
    let current = get_next_escrow_id(env);
    let next = current + 1;
    env.storage()
        .persistent()
        .set(&DataKey::NextEscrowId, &next);
    current
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Token)
        .unwrap()
}