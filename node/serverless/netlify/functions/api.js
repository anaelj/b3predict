const axios = require("axios");

const createUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  return url;
};

export async function handler(event) {
  const targetUrl =
    event.headers["x-target-url"] || event.queryStringParameters["target-url"];

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-target-url, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Tratamento de preflight request (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({}),
    };
  }

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
}
