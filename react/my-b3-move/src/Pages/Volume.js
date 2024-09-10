import React, { useState, useEffect } from "react";
import axios from "axios";
import { volumeFilters } from "./data/volume-filters";

function formatNumber(value) {
  try {
    return value.toLocaleString("pt-BR");
  } catch (error) {
    return value;
  }
}

async function fetchApiData(paramSelectedType) {
  const url = "https://scanner.tradingview.com/brazil/scan";

  const payload = {
    ...volumeFilters,
    filter: volumeFilters.filter.map((item) =>
      item.left === "type" ? { ...item, right: paramSelectedType } : item
    ),
  };
  // console.log("payload", payload);

  const response = await axios.post(
    `https://bestchoice-serverless.netlify.app/.netlify/functions/post`,
    // `http://localhost:8888/.netlify/functions/post`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "x-target-url": url,
      },
    }
  );

  // console.log(response.data);

  if (response) return response.data;
}

function Volume() {
  const [selectedType, setSelectedType] = useState("stock");
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  // const [filters, setFilters] = useState(volume);

  useEffect(() => {
    async function getData(paramSelectedType) {
      const apiData = await fetchApiData(paramSelectedType);
      const total = apiData.totalCount || 0;
      const data = apiData.data || [];

      // Processa os dados para a tela
      const processedData = data.map((item) => {
        const safeRound = (value) => {
          try {
            return Math.round(value);
          } catch (error) {
            return value;
          }
        };

        return {
          name: item.d[0],
          description: item.d[1],
          recommendation_mark: item.d[23],
          volume_change: safeRound(item.d[24]),
          volume: item.d[25],
          average_volume_30d_calc: safeRound(item.d[26]),
          average_volume_10d_calc: safeRound(item.d[27]),
          net_margin_fy: safeRound(item.d[28]),
          dividends_yield_current: safeRound(item.d[19]),
          fund_performance_yeld: safeRound(item.d[36]),
        };
      });

      setTotalCount(total);
      setData(processedData);
    }

    getData(selectedType);
  }, [selectedType]);

  return (
    <div>
      <h1>Dados de Mercado</h1>
      <div>
        <label>Tipo:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="stock">Ação</option>
          <option value="dr">BDR</option>
          {/* Adicione outras opções conforme necessário */}
        </select>
      </div>
      <p>Total de Resultados: {totalCount}</p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Marca de Recomendação</th>
            <th>Mudança no Volume</th>
            <th>Volume</th>
            <th>Média Volume 30d</th>
            <th>Média Volume 10d</th>
            <th>Margem Líquida FY</th>
            <th>Dividendo Atual</th>
            <th>Rendimento do Fundo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.recommendation_mark}</td>
              <td>{formatNumber(item.volume_change)}</td>
              <td>{formatNumber(item.volume)}</td>
              <td>{formatNumber(item.average_volume_30d_calc)}</td>
              <td>{formatNumber(item.average_volume_10d_calc)}</td>
              <td>{formatNumber(item.net_margin_fy)}</td>
              <td>{formatNumber(item.dividends_yield_current)}</td>
              <td>{formatNumber(item.fund_performance_yeld)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Volume;
