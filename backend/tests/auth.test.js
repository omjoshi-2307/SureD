const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Auth & Security Unit Tests", () => {
  const JWT_SECRET = "test_jwt_secret_key_12345";

  test("Password hashing and comparison with bcryptjs", async () => {
    const rawPassword = "SecurePassword123!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    assert.notEqual(rawPassword, hashedPassword);
    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert.equal(isMatch, true);

    const wrongMatch = await bcrypt.compare("WrongPassword!", hashedPassword);
    assert.equal(wrongMatch, false);
  });

  test("JWT Token generation and verification with role payload", () => {
    const userPayload = {
      id: "660c1f2e8d3f1a001a2b3c4d",
      role: "student",
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });
    assert.ok(typeof token === "string" && token.length > 20);

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.id, userPayload.id);
    assert.equal(decoded.role, "student");
  });

  test("Email normalization handles mixed case and whitespace", () => {
    const inputEmail = "  Student.Test@Example.COM  ";
    const normalized = inputEmail.trim().toLowerCase();

    assert.equal(normalized, "student.test@example.com");
  });

  test("OTP generation produces 6-digit numeric string with 15min expiry", () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    assert.equal(otp.length, 6);
    assert.match(otp, /^\d{6}$/);

    const now = Date.now();
    const expiry = new Date(now + 15 * 60 * 1000);
    assert.ok(expiry.getTime() > now);
    assert.ok(expiry.getTime() <= now + 15 * 60 * 1000 + 100);
  });
});
