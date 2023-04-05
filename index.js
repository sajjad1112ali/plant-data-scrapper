const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs/promises");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      userDataDir: "./temp",
    });
    const mainPage = await browser.newPage();
    await mainPage.goto("http://www.theplantlist.org/1.1/browse/");
    const majorGroups = await mainPage.$$eval("#nametree > li > a", (group) =>
      group.map((g) => ({ name: g.innerText, url: g.href }))
    );
    for (let g of majorGroups) {
      const page = await browser.newPage();
      page.goto(g.url);
      await page.waitForNavigation();
      const h1Tags = await page.$$eval("h1", (h1s) =>
        h1s.map((h1) => h1.innerText)
      );
      const plantType = h1Tags[1];
      const familyNames = await page.$$eval(
        "#nametree > li > a > i",
        (family) => family.map((f) => ({ "Family Name": f.innerText }))
      );
      const parser = new Parser();
      const csv = parser.parse(familyNames);
      await fs.writeFile(`./downloads/${plantType}.csv`, csv);
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
