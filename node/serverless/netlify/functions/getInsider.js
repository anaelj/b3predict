const axios = require("axios");
const cheerio = require("cheerio");

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

  const symbol =
    event.queryStringParameters && event.queryStringParameters.symbol;

  if (!symbol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O parâmetro "symbol" é obrigatório.' }),
    };
  }

  const targetUrl = `https://www.fundamentus.com.br/insiders.php?papel=${symbol}&tipo=1`;

  try {
    const response = await axios.get(targetUrl, {});
    const html = response.data;
    const $ = cheerio.load(html);

    const valores = [];
    $("#resultado tbody tr").each((index, element) => {
      if (index < 3) {
        const valorText = $(element).find("td").eq(2).text().trim();
        const valorNumerico = parseFloat(
          valorText.replace(/\./g, "").replace(",", ".")
        );
        if (!isNaN(valorNumerico)) {
          valores.push(valorNumerico);
        }
      }
    });

    const soma = valores.reduce((acc, curr) => acc + curr, 0);

    return {
      statusCode: 200,
      body: JSON.stringify({ soma }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Falha ao buscar os dados",
        detalhes: error,
      }),
    };
  }
};
