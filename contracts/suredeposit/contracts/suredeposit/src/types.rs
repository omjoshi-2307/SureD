use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Created,

    Funded,

    PendingConfirmation,

    Released,

    Disputed,

    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub student: Address,
    pub landlord: Address,
    pub amount: i128,
    pub status: EscrowStatus,
    pub student_confirmed: bool,
    pub landlord_confirmed: bool,
}