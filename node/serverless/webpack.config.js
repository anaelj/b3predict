import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: path.resolve(__dirname, "src", "index.js"),
  target: "node", // Para garantir que o Webpack trate isso como uma aplicação Node.js
  externals: [nodeExternals()], // Excluir módulos do bundle
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development", // ou 'production'
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
