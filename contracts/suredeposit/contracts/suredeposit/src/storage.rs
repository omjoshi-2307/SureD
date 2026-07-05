use soroban_sdk::{contracttype, Env};

use crate::types::Escrow;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Escrow,
}

pub fn save_escrow(env: &Env, escrow: &Escrow) {
    env.storage()
        .persistent()
        .set(&DataKey::Escrow, escrow);
}

pub fn get_escrow(env: &Env) -> Option<Escrow> {
    env.storage()
        .persistent()
        .get(&DataKey::Escrow)
}