const axios = require("axios");

const createUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  return url;
};

module.exports.handler = async function (event) {
  // console.log("Event:", event);

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
    const requestBody = JSON.parse(event.body);
    console.log("requestBody", requestBody);
    const response = await axios.post(url.toString(), { ...requestBody });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch data",
        details: error.message,
      }),
    };
  }
};
