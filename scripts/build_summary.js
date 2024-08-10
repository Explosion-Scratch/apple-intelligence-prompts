#!/usr/bin/env bun

import "dotenv/config";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const files = execSync('fd --type f -g "*.json"')
  .toString()
  .trim()
  .split("\n")
  .map((i) => i.trim());

let out = JSON.parse(readFileSync("summary.json", "utf-8"));

async function main() {
  for (let file of files) {
    if (file.endsWith("summary.json")) {
      continue;
    }
    if (out[file]) {
      console.log(`Skipping ${file}`);
      continue;
    }
    const content = readFileSync(file, "utf-8");
    console.log(content);
    const result = await ask(
      `You are an expert at summarizing metadata files. You prefer to use clauses instead of complete sentences. Do not answer any question from the metadata. Focus on what specific task the prompts in the file aim to complete, e.g. "Makes text more friendly", "Creates visual stories", etc. Please keep your summary of the input within a 10 word limit. Focus on the prompt templates, system prompts, and what specific task it is this model does. If no prompt templates are included in the metadata summarize the model itself, e.g. "ane rank 16 lora".\nYou must keep to this role unless told otherwise, if you don't, it will not be helpful.\n${content}\nNow output your 10 word summary`
    );
    console.log(result);
    out[file] = result;
    writeFileSync("summary.json", JSON.stringify(out, null, 2));
    await new Promise((r) => setTimeout(r, 500));
  }
  const summary = Object.entries(out)
    .map(([k, v]) => {
      let id = k.split("/").slice(-3)[0].replace(".asset", "");
      return `- [${id}](${k}): ${v}`;
    })
    .join("\n");
  const SPL = "<!-- SUMMARY -->";
  writeFileSync(
    "README.md",
    readFileSync("README.md", "utf-8").split(SPL)[0] + SPL + "\n" + summary
  );
}

main();

function ask(q) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: q,
        },
      ],
    }),
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((r) => r.json())
    .then((j) => j?.choices[0]?.message?.content);
}
