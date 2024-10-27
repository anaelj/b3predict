const scrapeParticipation = require("./scrapingParticipation");
const { getShark, updateShark } = require("./sharkService");
const getTickers = require("./tickers");

const tickersShorted = [];

const lastPoint = "puth here the lasta ticker";
let canPlay = true;

async function run() {
  const data = await getTickers();

  const loopTickers = async (idx) => {
    const tickerItem = data[idx];
    if (!tickerItem) return;

    const tickerShortName = tickerItem?.tickerName?.slice(0, 4);
    if (tickerItem?.tickerName === lastPoint) canPlay = true;

    if (canPlay && !tickersShorted.includes(tickerShortName)) {
      tickersShorted.push(tickerShortName);
      console.log("scraping sharks", tickerItem.tickerName);

      const sharkData = await scrapeParticipation(tickerItem.tickerName);

      const loopSharks = async (idxSharks) => {
        const sharkItem = sharkData[idxSharks];
        if (!sharkItem) return;
        const { sharkName, participation } = sharkItem;

        if (sharkName && participation) {
          const sharkNameSanitized = sharkName
            .replaceAll(",", "")
            .replaceAll(".", "")
            .trim();
          console.log("scraped shark", sharkName);
          const sharkData = await getShark({
            sharkName: sharkNameSanitized,
          });
          const tickers =
            sharkData?.tickers?.filter(
              (ticker) => ticker?.tickerName !== tickerItem.tickerName
            ) || [];
          tickers.push({ tickerName: tickerItem.tickerName, participation });

          console.log("updating shark", sharkNameSanitized);
          await updateShark({
            sharkName: sharkNameSanitized,
            data: { ...sharkData, tickers },
          });
        }
        await loopSharks(idxSharks + 1);
      };

      await loopSharks(0);
    }
    await loopTickers(idx + 1);
  };

  await loopTickers(0);
}

run();
