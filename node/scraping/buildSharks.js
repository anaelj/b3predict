const scrapeParticipation = require("./scrapingParticipation");
const { getShark, updateShark } = require("./sharkService");
const getTickers = require("./tickers");

const tickersShorted = [];

const lastPoint = "VIVR3";
let canPlay = false;

async function run() {
  const data = await getTickers();

  for (const tickerItem of data) {
    const tickerShortName = tickerItem?.tickerName?.slice(0, 4);
    if (tickerItem?.tickerName === lastPoint) canPlay = true;

    if (canPlay && !tickersShorted.includes(tickerShortName)) {
      tickersShorted.push(tickerShortName);
      console.log("scraping sharks", tickerItem.tickerName);

      const sharkData = await scrapeParticipation(tickerItem.tickerName);

      for (const sharkItem of sharkData) {
        const { sharkName, participation } = sharkItem;

        if (sharkName && participation) {
          console.log("scraped shark", sharkName);
          const sharkData = await getShark({ sharkName });
          const tickers =
            sharkData?.tickers?.filter(
              (ticker) => ticker !== tickerItem.tickerName
            ) || [];
          tickers.push({ tickerName: tickerItem.tickerName, participation });

          console.log("updating shark", sharkName);
          await updateShark({
            sharkName,
            data: { ...sharkData, tickers },
          });

          break;
        }
      }
    }
  }

  // console.log(data);
}

run();
