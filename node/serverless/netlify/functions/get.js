const axios = require("axios");

const createUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  return url;
};

module.exports.handler = async (event) => {
  const targetUrl =
    event.headers["x-target-url"] || event.queryStringParameters["target-url"];

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Target URL is required" }),
    };
  }

  const url = createUrlWithParams(targetUrl, event.queryStringParameters);

  try {
    const response = await axios.get(url.toString());
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
      // },
    };
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
