import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
  magicFormulaFiltersEVEBIT,
  magicFormulaFiltersROIC,
} from "./data/magic-formula-filters";
import styled from "styled-components";
// import { volume } from "./data/filters";
// const API_URL = "http://localhost:5000/api";

const StyledRow = styled.tr`
  &:hover {
    background-color: #f0f0f0;
    border-color: #f0f0f0;
  }
`;

function formatNumber(value) {
  try {
    return value.toLocaleString("pt-BR");
  } catch (error) {
    return value;
  }
}

// const unifyItems = (list) => {
//   const map = new Map();

//   list.forEach((item) => {
//     const symbolWithoutF = item.d[0].replace(/d+F$/, "");
//     item.d[0] = symbolWithoutF;
//     if (!map.has(symbolWithoutF)) {
//       map.set(symbolWithoutF, item);
//     }
//   });

//   return [...map.values()];
// };

async function getUnifyData(payload) {
  const url = "https://scanner.tradingview.com/brazil/scan";

  // `http://localhost:8888/.netlify/functions/post`,
  const response = await axios.post(
    "https://bestchoice-serverless.netlify.app/.netlify/functions/post",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "x-target-url": url,
      },
    }
  );

  return response.data.data;
}

async function fetchApiData(paramSelectedType) {
  // const url = "https://scanner.tradingview.com/brazil/scan";

  const payloadROIC = {
    ...magicFormulaFiltersROIC,
    filter: magicFormulaFiltersROIC.filter.map((item) =>
      item.left === "type" ? { ...item, right: paramSelectedType } : item
    ),
  };

  const payloadEVEBIT = {
    ...magicFormulaFiltersEVEBIT,
    filter: magicFormulaFiltersEVEBIT.filter.map((item) =>
      item.left === "type" ? { ...item, right: paramSelectedType } : item
    ),
  };

  const responseROIC = await getUnifyData(payloadROIC);

  const responseEVEBIT = await getUnifyData(payloadEVEBIT);

  // console.log("responseEVEBIT", responseEVEBIT);

  const indexA = responseEVEBIT.reduce((acc, item, idx) => {
    acc[item.s] = { posA: idx };
    return acc;
  }, {});

  responseROIC.reduce((acc, item, idx) => {
    if (indexA[item.s]) {
      indexA[item.s].posB = idx;
    } else {
      indexA[item.s] = { posB: idx };
    }
    return acc;
  }, {});

  // Criar uma lista de todos os itens, mesclando os dados de ambos os arrays
  const allItems = [...responseEVEBIT, ...responseROIC].reduce((acc, item) => {
    if (!acc.find((i) => i.s === item.s)) {
      acc.push(item);
    }
    return acc;
  }, []);

  // Calcular a pontuação e ordenar os itens
  const datasorted = allItems.sort((a, b) => {
    const posA = indexA[a.s] || {};
    const posB = indexA[b.s] || {};
    const scoreA = (posA.posA || Infinity) + (posA.posB || Infinity);
    const scoreB = (posB.posA || Infinity) + (posB.posB || Infinity);
    return scoreA - scoreB;
  });

  if (datasorted)
    return {
      data: datasorted.filter(
        (item) => !item.d[0].includes("3F") && !item.d[0].includes("4F") && item
      ),
    };
}

function MagicFormula() {
  const [selectedType, setSelectedType] = useState("stock");
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  // const [filters, setFilters] = useState(volume);

  useEffect(() => {
    async function getData(paramSelectedType) {
      const apiData = await fetchApiData(paramSelectedType);
      // console.log("apiData", apiData);
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
        const roundString = (value, decimalPlaces) => {
          try {
            let num =
              typeof value === "string"
                ? parseFloat(value.trim().replace(",", "."))
                : value;

            return num.toFixed(decimalPlaces).toString();
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
          return_on_invested_capital_fq: safeRound(item.d[37]),
          enterprise_value_to_ebit_ttm: safeRound(item.d[38]),
          price_target_1y: roundString(item.d[39], 2),
          RecommendMA: roundString(item.d[40], 2),
          SMA200: roundString(item.d[41], 2),
          SMA75: roundString(item.d[42], 2),
          total_debt_yoy_growth_fy: safeRound(item.d[43]),
          total_revenue_yoy_growth_ttm: safeRound(item.d[44]),
          net_income_yoy_growth_ttm: safeRound(item.d[45]),
          net_debt_to_ebitda_fq: roundString(item.d[46], 2),
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
            <th>Pos</th>
            <th>Nome</th>
            {/* <th>Descrição</th> */}
            <th>M. Reco.ção</th>
            <th>Tend.</th>
            <th>Margem Líquida FY</th>
            <th>Dividendo Atual</th>
            <th>ROIC</th>
            <th>EV/EBIT</th>
            <th>P. Alvo</th>
            <th>M. 200</th>
            <th>M. 75</th>
            <th>Cres. Dívida</th>
            <th>Cres. Receita</th>
            <th>Cres. L.Liq.</th>
            <th>Div./Ebitida</th>

            {/* <th>Rendimento do Fundo</th> */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <StyledRow key={index}>
              <td>{index}</td>
              <td>
                {" "}
                <a
                  href={`https://statusinvest.com.br/acoes/${item.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {item.name}
                </a>
              </td>
              {/* <td >{item.description}</td> */}
              <td>
                {/* {item.recommendation_mark}*/}
                {Number(item?.recommendation_mark) > 1 && (
                  <FaChevronUp size={12} color="green" />
                )}
                {Number(item.recommendation_mark) > 1.5 && (
                  <FaChevronUp size={12} color="green" />
                )}
                {Number(item.recommendation_mark) > 2 && (
                  <FaChevronUp size={12} color="green" />
                )}
              </td>
              <td style={{ minWidth: "80px" }}>
                {/* {formatNumber(item.RecommendMA)}{" "} */}
                {Number(item?.RecommendMA) < 0 && (
                  <FaChevronDown size={12} color="red" />
                )}
                {Number(item.RecommendMA) < -0.5 && (
                  <FaChevronDown size={12} color="red" />
                )}
                {Number(item?.RecommendMA) > 0 && (
                  <FaChevronUp size={12} color="green" />
                )}
                {Number(item.RecommendMA) > 0.5 && (
                  <FaChevronUp size={12} color="green" />
                )}
              </td>
              <td>{formatNumber(item.net_margin_fy)}</td>
              <td>{formatNumber(item.dividends_yield_current)}</td>
              <td>{formatNumber(item.return_on_invested_capital_fq)}</td>
              <td>{formatNumber(item.enterprise_value_to_ebit_ttm)}</td>
              <td>{formatNumber(item.price_target_1y)}</td>

              <td>{formatNumber(item.SMA200)}</td>
              <td>{formatNumber(item.SMA75)}</td>
              <td>{formatNumber(item.total_debt_yoy_growth_fy)}%</td>
              <td>{formatNumber(item.total_revenue_yoy_growth_ttm)}%</td>
              <td>{formatNumber(item.net_income_yoy_growth_ttm)}%</td>
              <td>{formatNumber(item.net_debt_to_ebitda_fq)}</td>
            </StyledRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MagicFormula;
