const { test, expect, login } = require("./loginHelper");

test.describe('Scenario A: Login Validation', () => {

  test("TC-LOGIN-001: Login with empty email and password", async ({ ui }) => {
    expect(await login(ui, "", "", "Please fill in all fields.")).toBe(true);
  });
  test("TC-LOGIN-002: Login with empty email", async ({ ui }) => {
    expect(await login(ui, "", "ValidPassword123", "Please fill in all fields.")).toBe(true);
  });
  test("TC-LOGIN-003: Login with empty password", async ({ ui }) => {
    expect(await login(ui, "valid@email.com", "", "Please fill in all fields.")).toBe(true);
  });
  test("TC-LOGIN-004: Login with invalid credentials", async ({ ui }) => {
    expect(await login(ui, "wrong@email.com", "WrongPass123", "Email or password is not true")).toBe(true);
  });
  test("TC-LOGIN-005: Login with invalid email format", async ({ ui }) => {
    expect(await login(ui, "invalid-email", "ValidPassword123", "Invalid email")).toBe(true);
  });

});
