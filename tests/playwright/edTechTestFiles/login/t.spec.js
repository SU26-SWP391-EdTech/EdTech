// just for saved role login test, ignore this
const { test, expect } = require("@playwright/test");

test("debug login", async ({ page }) => {
  await page.goto("http://localhost:3001/login");

});
