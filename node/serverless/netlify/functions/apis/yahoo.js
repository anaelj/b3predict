const yahooFinance = require("yahoo-finance2").default;

async function fetchYahoo(ticker) {
  const options = {
    period1: new Date(new Date().setDate(new Date().getDate() - 365)),
    period2: new Date(),
  };
  const data = await yahooFinance.historical(ticker, options);
  return data.map((item) => ({
    time: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    real_volume: item.volume,
  }));
}
fetchYahoo.name = "Yahoo Finance";
module.exports = fetchYahoo;
