const alpha = require("alphavantage")({ key: process.env.ALPHA_API_KEY });

async function fetchAlpha(ticker) {
  const response = await alpha.data.daily_adjusted(ticker, "compact");
  console.log(response);
  const data = response["Time Series (Daily)"];
  return Object.keys(data).map((date) => ({
    date,
    open: parseFloat(data[date]["1. open"]),
    high: parseFloat(data[date]["2. high"]),
    low: parseFloat(data[date]["3. low"]),
    close: parseFloat(data[date]["4. close"]),
    volume: parseInt(data[date]["6. volume"], 10),
  }));
}
fetchAlpha.name = "Alpha Vantage";
module.exports = fetchAlpha;
