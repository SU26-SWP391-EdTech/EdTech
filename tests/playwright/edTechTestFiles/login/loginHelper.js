/*require("dotenv").config({
  path: require("path").resolve(__dirname, ".env")
});
*/

const path = require('path');
require("dotenv").config({
  path: path.resolve(process.cwd(), '.env')
});


const { test, expect } = require("playwright-visible-mouse")({
  url: process.env.BASE_FE_TEST_URL + "/login",
  interactionMode: "HUMAN",
  notify: true,
  launch: {
    mode: "split2",
    autoTile: true,
    headless: false,
    screenWidth: 1920,
    screenHeight: 1080,
    traceSafe: true
  },
});

test.describe.configure({ mode: "parallel" });

async function login(ui, email, password, expectResult) {
  const { btn, page, field, text, notifyWait, setInteractionMode } = ui;
  setInteractionMode(process.env.INTERACTION_MODE_TEST);

  await field("you@example.com").type(email);
  await field("Enter your password").type(password);
  await btn("Sign In").click();

  console.log("TEST:", ui.testInfo.title);
  await page.waitForTimeout(1000);

  console.log("Checking text...");
  let result = await text(expectResult).exists(6000);
  console.log("text exists =", result);

  if (!result) {
    console.log("Checking button...");
    result = await btn(expectResult).exists(3000);
    console.log("button exists =", result);
  }
  await notifyWait(`${result} ~ (〃￣︶￣)人(￣︶￣〃)`);
  return result;
}

module.exports = { test, expect, login };
