#![cfg(test)]

use super::*;

use soroban_sdk::{
    testutils::Address as _,
    Address, Env,
};

#[test]
fn test_initialize_and_get_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SureDepositContract, ());
    let client = SureDepositContractClient::new(&env, &contract_id);

    let student = Address::generate(&env);
    let landlord = Address::generate(&env);

    client.initialize(&student, &landlord, &1000).unwrap();

    let escrow = client.get_escrow(&1).unwrap();

    assert_eq!(escrow.escrow_id, 1);
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

#[test]
fn test_multiple_escrows() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SureDepositContract, ());
    let client = SureDepositContractClient::new(&env, &contract_id);

    let student1 = Address::generate(&env);
    let landlord1 = Address::generate(&env);

    let student2 = Address::generate(&env);
    let landlord2 = Address::generate(&env);

    // Initialize first escrow
    let escrow1 = client.initialize(&student1, &landlord1, &1000).unwrap();
    assert_eq!(escrow1.escrow_id, 1);

    // Initialize second escrow
    let escrow2 = client.initialize(&student2, &landlord2, &2000).unwrap();
    assert_eq!(escrow2.escrow_id, 2);

    // Get escrow 1
    let fetched1 = client.get_escrow(&1).unwrap();
    assert_eq!(fetched1.student, student1);
    assert_eq!(fetched1.amount, 1000);

    // Get escrow 2
    let fetched2 = client.get_escrow(&2).unwrap();
    assert_eq!(fetched2.student, student2);
    assert_eq!(fetched2.amount, 2000);

    // Student 1 deposits into escrow 1
    let funded1 = client.deposit(&1, &student1).unwrap();
    assert!(matches!(funded1.status, crate::types::EscrowStatus::Funded));

    // Student 2 deposits into escrow 2
    let funded2 = client.deposit(&2, &student2).unwrap();
    assert!(matches!(funded2.status, crate::types::EscrowStatus::Funded));

    // Student 1 confirms escrow 1
    let confirmed1 = client.confirm(&1, &student1).unwrap();
    assert!(confirmed1.student_confirmed);
    assert!(!confirmed1.landlord_confirmed);
}

#[test]
fn test_release_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SureDepositContract, ());
    let client = SureDepositContractClient::new(&env, &contract_id);

    let student = Address::generate(&env);
    let landlord = Address::generate(&env);

    // Create escrow
    client.initialize(&student, &landlord, &1000).unwrap();

    // Deposit
    client.deposit(&1, &student).unwrap();

    // Student confirms
    client.confirm(&1, &student).unwrap();

    // Landlord confirms
    client.confirm(&1, &landlord).unwrap();

    // Release escrow
    let released = client.release(&1, &landlord).unwrap();

    assert!(matches!(
        released.status,
        crate::types::EscrowStatus::Released
    ));

    // Verify stored escrow
    let escrow = client.get_escrow(&1).unwrap();

    assert!(matches!(
        escrow.status,
        crate::types::EscrowStatus::Released
    ));
}