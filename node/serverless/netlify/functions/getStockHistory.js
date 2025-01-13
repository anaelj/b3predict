require("dotenv").config();
const yahoo = require("./apis/yahoo");
const polygon = require("./apis/polygon");

module.exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, Authorization",
    "Access-Control-Allow-Credentials": "true",
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
      event.queryStringParameters && event.queryStringParameters.symbol;

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
