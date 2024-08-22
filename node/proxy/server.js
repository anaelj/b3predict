import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors()); // Permite CORS para todas as origens
app.use(express.json());

const createUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  return url;
};

app.get("/api/get", async (req, res) => {
  const targetUrl = req.headers["x-target-url"] || req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  const url = createUrlWithParams(targetUrl, req.query);

  try {
    const response = await axios.get(url.toString());
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

app.post("/api/post", async (req, res) => {
  const targetUrl = req.headers["x-target-url"] || req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    const response = await axios.post(targetUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to post data", details: error.message });
  }
});

app.put("/api/put", async (req, res) => {
  const targetUrl = req.headers["x-target-url"] || req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    const response = await axios.put(targetUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to put data", details: error.message });
  }
});

app.listen(5000, () => {
  console.log("Proxy server is running on port 5000");
});
