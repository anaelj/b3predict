const axios = require("axios");

async function fetchPolygon(ticker) {
  const apiKey = process.env.POLYGON_API_KEY;
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/2023-01-01/2024-01-01?apiKey=${apiKey}`;
  const response = await axios.get(url);
  const results = response.data.results;
  return results.map((item) => ({
    time: new Date(item.t),
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c,
    real_volume: item.v,
  }));
}
fetchPolygon.name = "Polygon.io";
module.exports = fetchPolygon;
