const puppeteer = require("puppeteer");
const { Parser } = require('json2csv');
const fs = require("fs/promises");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      userDataDir: "./temp",
    });
    // Create a page
    const page = await browser.newPage();
    // Go to your site
    await page.goto(
      "http://www.theplantlist.org/1.1/browse/"
    );
   const majorGroups = await page.$$('#nametree > li > a');
   majorGroups[0].click();
   await page.waitForNavigation();

   const h1Tags = await page.$$eval('h1', h1s => h1s.map(h1 => h1.innerText));
   const plantType = h1Tags[1];
   const familyNames = await page.$$eval('#nametree > li > a > i', family => family.map(f => ({ "Family Name": f.innerText })));

   const parser = new Parser();
   const csv = parser.parse(familyNames);
   await fs.writeFile(`./downloads/${plantType}.csv`, csv);
   debugger;

    // await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
