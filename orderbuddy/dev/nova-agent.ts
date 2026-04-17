import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const TASK_INDEX_FILE = "./docs/tasks.md";
const TASK_DIR = "./docs/tasks";
const OUTPUT_DIR = "./src/order/src/pages/";

const {
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION,
} = process.env;

if (
  !AZURE_OPENAI_ENDPOINT ||
  !AZURE_OPENAI_API_KEY ||
  !AZURE_OPENAI_DEPLOYMENT_NAME ||
  !AZURE_OPENAI_API_VERSION
) {
  console.error("❌ Missing Azure OpenAI credentials in .env.local");
  process.exit(1);
}

// Read the first open task ID from the index file
const taskLines = fs.readFileSync(TASK_INDEX_FILE, "utf-8").split("\n");
const nextTaskLine = taskLines.find((line) => line.startsWith("- [ ] "));
if (!nextTaskLine) {
  console.log("✅ No open tasks found in", TASK_INDEX_FILE);
  process.exit(0);
}

// Extract task ID before the comma
const [taskId] = nextTaskLine.replace("- [ ] ", "").split(",");
const trimmedTaskId = taskId.trim();
console.log("🧠 Nova picked task:", trimmedTaskId);

const taskFilePath = path.join(TASK_DIR, trimmedTaskId + ".md");
if (!fs.existsSync(taskFilePath)) {
  console.error("❌ Task file not found:", taskFilePath);
  process.exit(1);
}

const taskPrompt = fs.readFileSync(taskFilePath, "utf-8");

async function callAzureOpenAI(prompt: string): Promise<string> {
  const url =
    AZURE_OPENAI_ENDPOINT +
    "/openai/deployments/" +
    AZURE_OPENAI_DEPLOYMENT_NAME +
    "/chat/completions?api-version=" +
    AZURE_OPENAI_API_VERSION;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": AZURE_OPENAI_API_KEY,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are Nova, a dev agent working inside the OrderBuddy monorepo. Read the following task and generate the requested code exactly as described.",
        },
        { role: "user", content: taskPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("OpenAI API Error: " + error);
  }

  const json = await res.json();
  return json.choices[0].message.content.trim();
}

function inferFilename(taskPrompt: string): string {
  const match = taskPrompt.match(/## Filename\n(.+\.tsx)/);
  return match ? match[1].trim() : "GeneratedPage.tsx";
}

async function runNova() {
  const filename = inferFilename(taskPrompt);
  const fullPath = path.join(OUTPUT_DIR, filename);

  const code = await callAzureOpenAI(taskPrompt);
  fs.writeFileSync(fullPath, code, "utf-8");

  console.log("✅ File written:", fullPath);
}

runNova().catch((err) => {
  console.error("❌ Nova failed:", err.message);
  process.exit(1);
});
