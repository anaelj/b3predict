const { default: axios } = require("axios");

async function getTickers() {
  const url =
    "https://scanner.tradingview.com/brazil/scan?label-product=screener-stock";
  const payload = {
    columns: ["name", "description", "close", "sector"],
    ignore_unknown_fields: false,
    options: { lang: "pt" },
    range: [0, 10000],
    sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
    symbols: {},
    markets: ["brazil"],
  };

  const response = await axios.post(url, payload);

  const tickersData = response.data.data;

  return tickersData
    .filter(
      (ticker) =>
        !ticker.d[0].endsWith("34") &&
        !ticker.d[0].endsWith("31") &&
        !ticker.d[0].endsWith("33") &&
        !ticker.d[0].endsWith("39") &&
        !ticker.d[0].endsWith("32") &&
        !ticker.d[0].endsWith("11") &&
        !ticker.d[0].endsWith("F") &&
        !ticker.d[0].endsWith("Q") &&
        !ticker.d[0].endsWith("B") &&
        !ticker.d[0].endsWith("35")
    )
    .map((ticker) => {
      const [tickerName, tickerDescription, price, sector] = ticker.d;
      const tickerShortName = tickerName.slice(0, 4);
      return { tickerName, tickerShortName, tickerDescription, price, sector };
    });
}

module.exports = getTickers;
