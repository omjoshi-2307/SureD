#![cfg(test)]

use super::*;

use soroban_sdk::{testutils::Address as _, token, Address, Env};

fn setup() -> (Env, SureDepositContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Create a Stellar Asset Contract (test token)
    let token_admin = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(token_admin.clone());

    let token_id = sac.address();

    // Deploy your contract with the constructor argument
    let contract_id = env.register(SureDepositContract, (token_id.clone(),));

    let client = SureDepositContractClient::new(&env, &contract_id);

    (env, client, token_id)
}

#[test]
fn test_initialize_and_get_escrow() {
    let (env, client, _) = setup();

    let student = Address::generate(&env);
    let landlord = Address::generate(&env);

    client.initialize(&student, &landlord, &1000);

    let escrow = client.get_escrow(&1).unwrap();

    assert_eq!(escrow.escrow_id, 1);
    assert_eq!(escrow.student, student);
    assert_eq!(escrow.landlord, landlord);
    assert_eq!(escrow.amount, 1000);

    assert!(matches!(escrow.status, crate::types::EscrowStatus::Created));

    assert!(!escrow.student_confirmed);
    assert!(!escrow.landlord_confirmed);
}

#[test]
fn test_multiple_escrows() {
    let (env, client, token_id) = setup();

    let student1 = Address::generate(&env);
    let landlord1 = Address::generate(&env);

    let student2 = Address::generate(&env);
    let landlord2 = Address::generate(&env);

    // Initialize first escrow
    let escrow1 = client.initialize(&student1, &landlord1, &1000);
    assert_eq!(escrow1.escrow_id, 1);

    // Initialize second escrow
    let escrow2 = client.initialize(&student2, &landlord2, &2000);
    assert_eq!(escrow2.escrow_id, 2);

    // Get escrow 1
    let fetched1 = client.get_escrow(&1).unwrap();
    assert_eq!(fetched1.student, student1);
    assert_eq!(fetched1.amount, 1000);

    // Get escrow 2
    let fetched2 = client.get_escrow(&2).unwrap();
    assert_eq!(fetched2.student, student2);
    assert_eq!(fetched2.amount, 2000);

    // Mint test tokens
    let token_admin = token::StellarAssetClient::new(&env, &token_id);
    token_admin.mint(&student1, &10_000_0000000);
    token_admin.mint(&student2, &10_000_0000000);

    // Deposit into escrow 1
    let funded1 = client.deposit(&1, &student1);
    assert!(matches!(funded1.status, crate::types::EscrowStatus::Funded));

    // Deposit into escrow 2
    let funded2 = client.deposit(&2, &student2);
    assert!(matches!(funded2.status, crate::types::EscrowStatus::Funded));

    // Student confirms escrow 1
    let confirmed1 = client.confirm(&1, &student1);
    assert!(confirmed1.student_confirmed);
    assert!(!confirmed1.landlord_confirmed);
}

#[test]
fn test_release_escrow() {
    let (env, client, token_id) = setup();

    let student = Address::generate(&env);
    let landlord = Address::generate(&env);

    // Create escrow
    client.initialize(&student, &landlord, &1000);

    // Mint test tokens
    let token_admin = token::StellarAssetClient::new(&env, &token_id);
    token_admin.mint(&student, &10_000_0000000);

    // Deposit
    client.deposit(&1, &student);

    // Student confirms
    client.confirm(&1, &student);

    // Landlord confirms
    client.confirm(&1, &landlord);

    // Release escrow
    let released = client.release(&1, &landlord);

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
