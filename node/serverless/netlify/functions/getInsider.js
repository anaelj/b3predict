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

  const headers2 = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9,pt;q=0.8",
    "Cache-Control": "no-cache",
    Cookie:
      "_ga=GA1.1.1963607766.1735269636; _qn=1; _uac=1735269648; PHPSESSID=1hnchc92nlo43si6jnva2hd703; cf_clearance=zicdAQmNhbnt_R9qRJY5jwOroPlCMF4_KBekPLF1q8g-1735304279-1.2.1.1-BzjURpuvF.1di7d47KNfldaWhSkq6kBeQVvE4Kr_4NYRTDkDtWTnALpdF5YI.Qb9lOhosFWmJ5fMB4bNW4SvW2bMFap1KG6dw05WHVwzIPtO.L6Bt.pY4rshiG838OZw9xWhpwgKER.MApTuLaJuDLnoMM3Tlq4eRPyDggSyeYdW2zL0aAsxk6QAXB8k.NuzruAsPzPumZsJ5zjpKkw1J3g9uJ1QxC.rNevAx5JZ_yGSyqJvQS4MqnJLEk7DMvmgF0AkUN5atVhglZOAMQdfNiwI1113AHqLePxPDwSInQmAib1Xh15BjuoZ9jHaMeGqeeHq6F5xVANBMixf0Q0rfbrdAFDlYMc4aR1FVjKutIBRnt3rbOh4eKHmmupqGhq96gR9s0FBcU65JBRSTtMUaw; _ga_MBRGJ9JF74=GS1.1.1735304279.3.1.1735304291.0.0.0",
    Pragma: "no-cache",
    "Sec-CH-UA":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"macOS"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  const targetUrl = `https://www.fundamentus.com.br/insiders.php?papel=${symbol}&tipo=1`;

  try {
    const response = await axios.get(targetUrl, { headers: headers2 });
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
