const { getShark, updateShark } = require("./sharkService");

async function teste1() {
  const testeData = await getTicker({ tickerName: "B3SA3" });
  console.log(testeData);

  await updateTicker({
    tickerName: "B3SA3",
    data: { ...testeData, sharks: [{ sharkName: "aaa" }] },
  });

  const testeData2 = await getTicker({ tickerName: "B3SA3" });
  console.log(testeData2);
}
async function teste2() {
  const tickerName = "B3SA3";
  const sharkName = "União Federal 2";

  const sharkData = await getShark({ sharkName });
  console.log(sharkData);

  const tickers =
    sharkData?.tickers?.filter((ticker) => ticker !== tickerName) || [];
  tickers.push({ tickerName, participation: 0 });

  await updateShark({
    sharkName,
    data: { ...sharkData, tickers },
  });

  const sharkData2 = await getShark({ sharkName });
  console.log(sharkData2);
}

teste2();
