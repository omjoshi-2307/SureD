#![cfg(test)]

use super::*;

use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    Address, Env,
};

#[test]
fn test_initialize_and_get_escrow() {
    let env = Env::default();

    let contract_id = env.register(SureDepositContract, ());
    let client = SureDepositContractClient::new(&env, &contract_id);

    let student = Address::generate(&env);
    let landlord = Address::generate(&env);

    client.initialize(&student, &landlord, &1000);

    let escrow = client.get_escrow().unwrap();

    assert_eq!(escrow.student, student);
    assert_eq!(escrow.landlord, landlord);
    assert_eq!(escrow.amount, 1000);

    assert!(matches!(
        escrow.status,
        crate::types::EscrowStatus::Created
    ));

    assert!(!escrow.student_confirmed);
    assert!(!escrow.landlord_confirmed);
}