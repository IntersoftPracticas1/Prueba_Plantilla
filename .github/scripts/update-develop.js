const fs = require("fs");
const path = require("path");

async function main() {
  const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
  );

  const pr = event.pull_request;

  if (!pr.merged) {
    console.log("PR no mergeado, no se hace nada.");
    return;
  }

  const branch = pr.head.ref;
  const author = pr.user.login;
  const verifier = pr.merged_by?.login || "unknown";

  const body = pr.body || "";
  const { GITHUB_REPOSITORY } = process.env;

  const issueMatches = [...body.matchAll(/#(\d+)/g)].map((match) => match[1]);
  const uniqueIssues = [...new Set(issueMatches)];
  const issueLink = uniqueIssues.length
    ? uniqueIssues
        .map(
          (number) => `[#${number}](https://github.com/${GITHUB_REPOSITORY}/issues/${number})`
        )
        .join(", ")
    : "N/A";

  const prLink = `[#${pr.number}](https://github.com/${GITHUB_REPOSITORY}/pull/${pr.number})`;

  const filePath = path.join(
    process.cwd(),
    "docs",
    "Historial",
    "Develop.md"
  );

  let content = "";

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");

    content = content.replace(
      /\| Funcionalidad \| Autor \| Verificador \| Issue \|\r?\n\|---------------\|--------\|-------------\|--------\|\r?\n/,
      "| Funcionalidad | Autor | Verificador | Issues | PR |\n|---------------|--------|-------------|--------|----|\n"
    );
  } else {
    content =
      `# Historial de Develop\n\n` +
      `| Funcionalidad | Autor | Verificador | Issues | PR |\n` +
      `|---------------|--------|-------------|--------|----|\n`;
  }

  const newRow = `| [${branch}](Hechos/${branch}.md) | ${author} | ${verifier} | ${issueLink} | ${prLink} |`;

  if (content.includes(newRow)) {
    console.log("Entrada ya existe, no se añade.");
    return;
  }

  content += `${newRow}\n`;

  fs.writeFileSync(filePath, content);

  console.log("Develop.md actualizado correctamente");
}

main().catch(console.error);