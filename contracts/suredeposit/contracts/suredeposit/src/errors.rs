use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    InvalidAmount = 2,
    SameAddress = 3,

    EscrowNotFound = 4,
    InvalidState = 5,

    AlreadyConfirmed = 6,
    AlreadyReleased = 7,
    Unauthorized = 8,
}