require("dotenv").config();
const yahoo = require("./apis/yahoo");
const polygon = require("./apis/polygon");

module.exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({}),
    };
  }

  try {
    const symbol =
      event.queryStringParameters && event.queryStringParameters.symbol + ".SA";

    const apis = [yahoo, polygon];
    for (const api of apis) {
      try {
        const data = await api(symbol).catch((err) => {
          console.log(err);
        });
        if (data) {
          console.log(`Data fetched from: ${api.name}`);

          return {
            statusCode: 200,
            body: JSON.stringify({ data }),
          };
        }
      } catch (error) {
        console.error(`Error fetching data from ${api.name}:`, error.message);
      }
    }
    throw new Error("Failed to fetch stock data from all APIs.");
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch data",
        details: error.message,
      }),
    };
  }
};
