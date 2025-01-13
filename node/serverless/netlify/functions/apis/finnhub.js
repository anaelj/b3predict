
const axios = require('axios');

async function fetchFinnhub(ticker) {
    const apiKey = process.env.FINNHUB_API_KEY;
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&count=300&token=${apiKey}`;
    const response = await axios.get(url);
    const { c, h, l, o, t, v } = response.data;
    return t.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        open: o[index],
        high: h[index],
        low: l[index],
        close: c[index],
        volume: v[index],
    }));
}
fetchFinnhub.name = "Finnhub";
module.exports = fetchFinnhub;
