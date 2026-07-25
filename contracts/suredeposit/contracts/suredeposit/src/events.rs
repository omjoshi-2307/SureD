use soroban_sdk::{contractevent, Address};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowCreated {
    pub escrow_id: u64,
    pub student: Address,
    pub landlord: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowFunded {
    pub escrow_id: u64,
    pub student: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowReleased {
    pub escrow_id: u64,
    pub landlord: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowRefunded {
    pub escrow_id: u64,
    pub student: Address,
    pub amount: i128,
}

pub fn escrow_created(
    env: &soroban_sdk::Env,
    escrow_id: u64,
    student: &Address,
    landlord: &Address,
    amount: i128,
) {
    EscrowCreated {
        escrow_id,
        student: student.clone(),
        landlord: landlord.clone(),
        amount,
    }
    .publish(env);
}

pub fn escrow_funded(
    env: &soroban_sdk::Env,
    escrow_id: u64,
    student: &Address,
) {
    EscrowFunded {
        escrow_id,
        student: student.clone(),
    }
    .publish(env);
}

pub fn escrow_released(
    env: &soroban_sdk::Env,
    escrow_id: u64,
    landlord: &Address,
    amount: i128,
) {
    EscrowReleased {
        escrow_id,
        landlord: landlord.clone(),
        amount,
    }
    .publish(env);
}

pub fn escrow_refunded(
    env: &soroban_sdk::Env,
    escrow_id: u64,
    student: &Address,
    amount: i128,
) {
    EscrowRefunded {
        escrow_id,
        student: student.clone(),
        amount,
    }
    .publish(env);
}