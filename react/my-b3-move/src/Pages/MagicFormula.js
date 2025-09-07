import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const StyledRow = styled.tr`
  &:hover {
    background-color: #f0f0f0;
    border-color: #f0f0f0;
  }
`;

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function MagicFormula() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://n8n.semalo.com.br/webhook/magic"
        );
        setData(response.data);
      } catch (error) {
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Ranking Magic Formula</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <p>Total de Resultados: {data.length}</p>
          <table>
            <thead>
              <tr>
                <th>Posição</th>
                <th>Símbolo</th>
                <th>Empresa</th>
                <th>Preço Atual</th>
                <th>Valor Mercado (Bi)</th>
                <th>ROIC (%)</th>
                <th>EV/EBIT</th>
                <th>P/L</th>
                <th>Dividend Yield (%)</th>
                <th>Score</th>
                <th>Classificação</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <StyledRow key={item.simbolo || idx}>
                  <td>{item.posicao_ranking}</td>
                  <td>
                    <a
                      href={`https://statusinvest.com.br/acoes/${item.simbolo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {item.simbolo}
                    </a>
                  </td>
                  <td>{item.nome_empresa}</td>
                  <td>{formatNumber(item.preco_atual)}</td>
                  <td>{formatNumber(item.valor_mercado_bilhoes)}</td>
                  <td>{formatNumber(item.roic_percentual)}</td>
                  <td>{formatNumber(item.ev_ebit_ratio)}</td>
                  <td>{formatNumber(item.pe_ratio)}</td>
                  <td>{formatNumber(item.dividend_yield_percentual)}</td>
                  <td>{item.score_magic_formula}</td>
                  <td>{item.classificacao}</td>
                </StyledRow>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default MagicFormula;
