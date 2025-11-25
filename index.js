require("dotenv").config(); // Load biến môi trường từ .env

const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const COMMON_ERROR_PATH = path.join(__dirname, "common_error.json");

// Middleware
app.use(express.json());
app.use(express.text({ type: "*/*" }));
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.X_API_KEY) {
    return res.status(401).send("Wrong X-API-KEY");
  }
  next();
});

app.get("/", async (req, res) => {
  try {
    const content = await readOrCreateFile(COMMON_ERROR_PATH);
    res.type("json").send(content);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading file");
  }
});

app.post("/", async (req, res) => {
  try {
    let content = req.body;

    if (typeof content === "object") {
      content = JSON.stringify(content, null, 2);
    } else if (typeof content === "string") {
      content = content.replace(/\\n/g, "\n");
    } else {
      content = "";
    }

    await fs.writeFile(COMMON_ERROR_PATH, content, "utf8");

    res.type("text").send(`Success\n${content}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error writing file");
  }
});

async function readOrCreateFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    await fs.writeFile(filePath, "", "utf8");
    return "";
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
