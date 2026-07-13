const { test, expect, login } = require("./loginHelper");

test.describe('Scenario C: Email Format Validation', () => {
  test("TC-LOGIN-EMAIL-001: Verify login rejects invalid email format", async ({ ui }) => {
    expect(await login(ui, "userexample.com", "ValidPass123", "Invalid email")).toBe(true);
  });
  test("TC-LOGIN-EMAIL-002: Verify login rejects email without domain", async ({ ui }) => {
    expect(await login(ui, "user@", "ValidPass123", "Invalid email")).toBe(true);
  });
  test("TC-LOGIN-EMAIL-003: Verify login rejects email without username", async ({ ui }) => {
    expect(await login(ui, "@example.com", "ValidPass123", "Invalid email")).toBe(true);
  });
});
