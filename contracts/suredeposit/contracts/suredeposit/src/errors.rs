use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    InvalidAmount = 2,
    SameAddress = 3,
    EscrowNotFound = 4,
    AlreadyConfirmed = 5,
    AlreadyReleased = 6,
    Unauthorized = 7,
}