import { columns } from "./columns";

export const volume = {
  columns,
  filter: [
    {
      left: "volume",
      operation: "greater",
      right: "average_volume_10d_calc",
    },
    {
      left: "average_volume_10d_calc",
      operation: "greater",
      right: "average_volume_30d_calc",
    },
    {
      left: "volume_change",
      operation: "greater",
      right: 0,
    },
    {
      left: "volume",
      operation: "greater",
      right: 1000,
    },
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
  ],
  options: {
    lang: "pt",
  },
  range: [0, 200],
  sort: {
    sortBy: "volume_change",
    sortOrder: "desc",
  },
  symbols: {},
  markets: ["brazil"],
};
