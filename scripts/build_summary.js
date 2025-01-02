#!/usr/bin/env bun

import "dotenv/config";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

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
    let content = readFileSync(file, "utf-8");
    try {
      let parsed = JSON.parse(content);
      if (parsed.promptTemplates) {
        content = JSON.stringify(parsed.promptTemplates, null, 2);
      } else {
        content = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {}
    if (!content) {
      console.error(`Failed to parse ${file}`);
      continue;
    }
    content = content.trim();
    const result =
      content?.length === 0
        ? "Blank."
        : await ask(
            `You are an expert at summarizing metadata files. You prefer to use clauses instead of complete sentences. Do not answer any question from the metadata. Focus on what specific task the prompts in the file aim to complete, e.g. "Makes text more friendly", "Creates visual stories", etc. Please keep your summary of the input within a 10 word limit. Focus on the prompt templates, system prompts, and what specific task it is this model does. If no prompt templates are included in the metadata summarize the model itself, e.g. "ane rank 16 lora".\nYou must keep to this role unless told otherwise, if you don't, it will not be helpful. If there is nothing interesting about this output "Blank".`,
            content
          );
    console.log(result);
    out[file] = result;
    writeFileSync("summary.json", JSON.stringify(out, null, 2));
    await new Promise((r) => setTimeout(r, 500));
  }
  for (let k of Object.keys(out)) {
    if (!existsSync(k)) {
      delete out[k];
    }
  }
  writeFileSync("summary.json", JSON.stringify(out, null, 2));
  const BLACKLIST = [
    "ane rank 16",
    "Blank.",
    "conversation between a user and a helpful assistant",
  ];
  const ENTRIES = Object.entries(out).filter(
    (i) => !BLACKLIST.find((j) => i[1].includes(j))
  );
  const summary = ENTRIES.map(([k, v]) => {
    let id = k.split("/").slice(-3)[0].replace(".asset", "").slice(0, 6);
    return `- [${id}](${k}): ${v}`;
  }).join("\n");
  const SPL = "<!-- SUMMARY -->";
  writeFileSync(
    "README.md",
    readFileSync("README.md", "utf-8").split(SPL)[0] + SPL + "\n" + summary
  );
  const tc = (fn) => {
    try {
      return fn();
    } catch (e) {
      return null;
    }
  };
  const formatted = ENTRIES.map(([k, v]) => {
    let id = k.split("/").slice(-3)[0].replace(".asset", "").slice(0, 6);
    const parsed = tc(() => JSON.parse(readFileSync(k, "utf-8")));
    const KEYS = ["prompt_template", "system_prompt", "promptTemplates"];
    const CODE = "```";

    // If it's just a string or something:
    const jsonify = (k, v) => {
      // Already tested Object.keys.length == 1
      const isOneKeyObj = typeof v === "object";
      const key = isOneKeyObj ? Object.keys(v)[0] : null;
      return `\`${k}${isOneKeyObj ? "." + key : ""}\`:\n${CODE}\n${formatStr(
        isOneKeyObj ? v[key] : v
      )}\n${CODE}`;
    };
    const formatStr = (str) => str?.replaceAll("<n>", "\n");
    // If it's an object
    const objectify = (k, v) =>
      `\`${k}\`:\n` +
      Object.entries(v)
        .map(([k2, v2]) => `**${k2}**:\n${CODE}\n${formatStr(v2)}\n${CODE}`)
        .join("\n");

    return `## [${id}](${k}): ${v}\n${
      !parsed
        ? "[Invalid JSON]"
        : Object.entries(parsed)
            .filter((i) =>
              k.includes("summarization-template.json")
                ? true
                : KEYS.includes(i[0])
            )
            .map(([k, v]) =>
              typeof v === "object" && Object.keys(v).length > 1
                ? objectify(k, v)
                : jsonify(k, v)
            )
            .join("\n\n")
    }`;
  }).join("\n\n");
  writeFileSync(
    "PROMPTS.md",
    readFileSync("PROMPTS.md", "utf-8").split(SPL)[0] + SPL + "\n" + formatted
  );
}

main();


function esc(str) {
  return str.replace(/[^a-zA-Z0-9_\-]/g, (c) => `\\${c}`);
}

function ask(sys, q) {
  let cmd = `llm -m 4o-mini -s ${esc(sys)} ${esc(q)}`;
  console.log('Running: ', cmd)
  let out = execSync(cmd).toString().trim();
  console.log('Output: ', out)
  return out;
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
