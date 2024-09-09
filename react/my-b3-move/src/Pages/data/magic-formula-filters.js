import { columns } from "./columns";

const filter = [
  {
    left: "net_margin_fy",
    operation: "in_range",
    right: [10, 80],
  },
  {
    left: "dividends_yield_current",
    operation: "greater",
    right: 0,
  },
  {
    left: "type",
    operation: "equal",
    right: "stock",
  },
];

const range = [0, 1000];

const options = {
  lang: "pt",
};

const symbolset = [];
// const symbolset = ["SYML:BMFBOVESPA;IBXL"];

export const magicFormulaFiltersROIC = {
  columns,
  filter,
  options,
  range,
  sort: {
    sortBy: "return_on_invested_capital_fq",
    sortOrder: "desc",
  },
  symbols: { symbolset },
  markets: ["brazil"],
};
export const magicFormulaFiltersEVEBIT = {
  columns,
  filter,

  options,
  range,
  sort: {
    sortBy: "enterprise_value_to_ebit_ttm",
    sortOrder: "desc",
  },
  symbols: { symbolset },
  markets: ["brazil"],
};
