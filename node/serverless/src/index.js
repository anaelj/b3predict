const express = require("express");
const axios = require("axios");
const serverless = require("serverless-http"); // Adicione esta dependência

const app = express();
const router = express.Router();

app.use(express.json());

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/fetch-data", async (req, res) => {
  try {
    const response = await axios.get("https://api.example.com/data");
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.use("/.netlify/functions/api", router); // Monta o router

module.exports.handler = serverless(app);
