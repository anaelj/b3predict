const puppeteer = require("puppeteer");

async function scrapeParticipation(ticker) {
  try {
    const url = `https://www.fundamentus.com.br/principais_acionistas.php?papel=${ticker}&tipo=1`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector("div.conteudo table");

    const acionistas = await page.evaluate(() => {
      const rows = document.querySelectorAll("div.conteudo table tbody tr");
      const data = [];

      rows.forEach((row) => {
        const columns = row.querySelectorAll("td");
        const sharkName = columns[0]?.innerText.trim();
        let participation = columns[1]?.innerText.trim();

        if (participation) {
          participation = parseFloat(
            participation.replace(",", ".").replace("%", "")
          );
        }

        data.push({ sharkName, participation });
      });

      return data;
    });

    await browser.close();
    return acionistas;
  } catch (error) {
    return [];
  }
}
module.exports = scrapeParticipation;

// scrapeParticipation("FRAS3")
//   .then((data) => console.log(data))
//   .catch(console.error);
