const { test, expect, login } = require("./loginHelper");

test.describe('Scenario B: Successful Login by User Role', () => {
  test("TC-LOGIN-006: Login as Administrator", async ({ ui }) => {
    expect(await login(ui, "admin@system.com", "Admin@123", "Users")).toBe(true);
  });
  test("TC-LOGIN-007: Login as Academic Manager", async ({ ui }) => {
    expect(await login(ui, "Manager@system.com", "Admin@123", "Pending Courses")).toBe(true);
  });
  test("TC-LOGIN-008: Login as Course Provider", async ({ ui }) => {
    expect(await login(ui, "Provider@system.com", "Admin@123", "My Courses")).toBe(true);
  });
  test("TC-LOGIN-009: Login as Learner", async ({ ui }) => {
    expect(await login(ui, "Learner@system.com", "Admin@123", "My Learning")).toBe(true);
  });
});
