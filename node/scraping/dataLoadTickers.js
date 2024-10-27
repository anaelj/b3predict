const fetchAndUpdateDocumentByName = require("./firebaseUtils");
const getTickers = require("./tickers");

async function fetchAndSaveTickers() {
  try {
    const tickersData = await getTickers();

    for (const ticker of tickersData) {
      await fetchAndUpdateDocumentByName({
        collectionName: "tickers",
        data: ticker,
      });
    }

    console.log("Processo de sincronização concluído!");
  } catch (error) {
    console.error("Erro ao buscar ou salvar os dados:", error);
  }
}

fetchAndSaveTickers();
