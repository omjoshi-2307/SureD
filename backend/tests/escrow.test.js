const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("SureD 1.0 Escrow State Machine & Lifecycle Tests", () => {
  // Helper simulating the contract & backend state machine rules
  function validateStateTransition(currentStatus, action, role, studentConfirmed = false, landlordConfirmed = false) {
    switch (action) {
      case "FUND":
        if (role !== "student") return { ok: false, error: "Only student can fund" };
        if (currentStatus !== "CREATED") return { ok: false, error: "Can only fund CREATED escrow" };
        return { ok: true, newStatus: "FUNDED" };

      case "STUDENT_CONFIRM":
        if (role !== "student") return { ok: false, error: "Only student can student_confirm" };
        if (currentStatus !== "FUNDED") return { ok: false, error: "Escrow must be FUNDED" };
        if (studentConfirmed) return { ok: false, error: "Student already confirmed" };
        const bothNowConfirmed1 = landlordConfirmed;
        return {
          ok: true,
          studentConfirmed: true,
          landlordConfirmed,
          newStatus: bothNowConfirmed1 ? "PENDING_CONFIRMATION" : "FUNDED",
        };

      case "LANDLORD_CONFIRM":
        if (role !== "landlord") return { ok: false, error: "Only landlord can landlord_confirm" };
        if (currentStatus !== "FUNDED") return { ok: false, error: "Escrow must be FUNDED" };
        if (landlordConfirmed) return { ok: false, error: "Landlord already confirmed" };
        const bothNowConfirmed2 = studentConfirmed;
        return {
          ok: true,
          studentConfirmed,
          landlordConfirmed: true,
          newStatus: bothNowConfirmed2 ? "PENDING_CONFIRMATION" : "FUNDED",
        };

      case "RELEASE":
        if (role !== "landlord") return { ok: false, error: "Only landlord can release" };
        if (currentStatus !== "PENDING_CONFIRMATION") return { ok: false, error: "Escrow not ready for release" };
        return { ok: true, newStatus: "RELEASED" };

      case "REFUND":
        if (role !== "landlord") return { ok: false, error: "Only landlord can refund" };
        if (currentStatus !== "FUNDED" && currentStatus !== "PENDING_CONFIRMATION") {
          return { ok: false, error: "Escrow cannot be refunded in current state" };
        }
        return { ok: true, newStatus: "REFUNDED" };

      case "CANCEL":
        if (currentStatus === "RELEASED" || currentStatus === "REFUNDED" || currentStatus === "CANCELLED") {
          return { ok: false, error: "Cannot cancel finalized escrow" };
        }
        return { ok: true, newStatus: "CANCELLED" };

      default:
        return { ok: false, error: "Unknown action" };
    }
  }

  test("Full Release Lifecycle: CREATE -> FUND -> STUDENT_CONFIRM -> LANDLORD_CONFIRM -> RELEASE", () => {
    let state = {
      status: "CREATED",
      studentConfirmed: false,
      landlordConfirmed: false,
    };

    // 1. Fund escrow by student
    const fundRes = validateStateTransition(state.status, "FUND", "student");
    assert.equal(fundRes.ok, true);
    state.status = fundRes.newStatus;
    assert.equal(state.status, "FUNDED");

    // 2. Student confirms move-in
    const scRes = validateStateTransition(state.status, "STUDENT_CONFIRM", "student", state.studentConfirmed, state.landlordConfirmed);
    assert.equal(scRes.ok, true);
    state.studentConfirmed = scRes.studentConfirmed;
    state.status = scRes.newStatus;
    assert.equal(state.studentConfirmed, true);
    assert.equal(state.status, "FUNDED"); // Still FUNDED because landlord hasn't confirmed yet

    // 3. Landlord confirms move-in
    const lcRes = validateStateTransition(state.status, "LANDLORD_CONFIRM", "landlord", state.studentConfirmed, state.landlordConfirmed);
    assert.equal(lcRes.ok, true);
    state.landlordConfirmed = lcRes.landlordConfirmed;
    state.status = lcRes.newStatus;
    assert.equal(state.landlordConfirmed, true);
    assert.equal(state.status, "PENDING_CONFIRMATION"); // Both confirmed -> PENDING_CONFIRMATION

    // 4. Landlord releases funds
    const relRes = validateStateTransition(state.status, "RELEASE", "landlord");
    assert.equal(relRes.ok, true);
    state.status = relRes.newStatus;
    assert.equal(state.status, "RELEASED");
  });

  test("Full Refund Lifecycle: CREATE -> FUND -> REFUND by Landlord", () => {
    let state = { status: "CREATED", studentConfirmed: false, landlordConfirmed: false };

    // Fund
    const fundRes = validateStateTransition(state.status, "FUND", "student");
    assert.equal(fundRes.ok, true);
    state.status = fundRes.newStatus;

    // Landlord issues refund directly
    const refundRes = validateStateTransition(state.status, "REFUND", "landlord");
    assert.equal(refundRes.ok, true);
    state.status = refundRes.newStatus;
    assert.equal(state.status, "REFUNDED");
  });

  test("Refund after dual confirmation: CREATE -> FUND -> CONFIRMS -> REFUND by Landlord", () => {
    let state = { status: "PENDING_CONFIRMATION", studentConfirmed: true, landlordConfirmed: true };

    const refundRes = validateStateTransition(state.status, "REFUND", "landlord");
    assert.equal(refundRes.ok, true);
    assert.equal(refundRes.newStatus, "REFUNDED");
  });

  test("Security & Authorization checks: Student cannot release or refund", () => {
    const relRes = validateStateTransition("PENDING_CONFIRMATION", "RELEASE", "student");
    assert.equal(relRes.ok, false);
    assert.match(relRes.error, /Only landlord/i);

    const refRes = validateStateTransition("FUNDED", "REFUND", "student");
    assert.equal(refRes.ok, false);
    assert.match(refRes.error, /Only landlord/i);
  });

  test("Security & Authorization checks: Landlord cannot fund", () => {
    const fundRes = validateStateTransition("CREATED", "FUND", "landlord");
    assert.equal(fundRes.ok, false);
    assert.match(fundRes.error, /Only student/i);
  });

  test("Invalid release before confirmation is blocked", () => {
    const relRes = validateStateTransition("FUNDED", "RELEASE", "landlord");
    assert.equal(relRes.ok, false);
    assert.match(relRes.error, /not ready/i);
  });

  test("Finalized escrows (RELEASED / REFUNDED) cannot be cancelled", () => {
    const cancelReleased = validateStateTransition("RELEASED", "CANCEL", "student");
    assert.equal(cancelReleased.ok, false);

    const cancelRefunded = validateStateTransition("REFUNDED", "CANCEL", "landlord");
    assert.equal(cancelRefunded.ok, false);
  });
});
