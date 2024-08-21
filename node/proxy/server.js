import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json());

app.get("/api/get", async (req, res) => {
  const targetUrl = req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  const url = new URL(targetUrl);
  Object.keys(req.query).forEach((key) => {
    if (key !== "target-url") {
      url.searchParams.append(key, req.query[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), { method: "GET" });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/api/post", async (req, res) => {
  const targetUrl = req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to post data" });
  }
});

app.put("/api/put", async (req, res) => {
  const targetUrl = req.query["target-url"];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to put data" });
  }
});

app.listen(5000, () => {
  console.log("Proxy server is running on port 5000");
});
