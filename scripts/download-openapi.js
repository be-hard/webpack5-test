const fs = require("node:fs/promises");
const path = require("node:path");
const dotenv = require("dotenv");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

// Support both "--mode=development" and "--mode development".
function getArgValue(name) {
  const equalArg = args.find((arg) => arg.startsWith(`${name}=`));

  if (equalArg) {
    return equalArg.split("=").slice(1).join("=");
  }

  const argIndex = args.indexOf(name);
  const nextArg = args[argIndex + 1];

  if (argIndex >= 0 && nextArg && !nextArg.startsWith("--")) {
    return nextArg;
  }

  return undefined;
}

const mode = getArgValue("--mode") || process.env.APP_MODE || "development";
const envPath = path.resolve(root, "config/env", `.env.${mode}`);

// Load APP_SWAGGER_URL and APP_FEATURE_TAG from config/env/.env.{mode}.
// dotenv injects those values into process.env for this Node process.
// Existing shell env values win, so CI can override APP_FEATURE_TAG per branch.
dotenv.config({ path: envPath });

const swaggerUrl = process.env.APP_SWAGGER_URL;
const featureTag = process.env.APP_FEATURE_TAG;
const outputPath = path.resolve(root, ".openapi/openapi.json");

async function downloadOpenApi() {
  if (!swaggerUrl) {
    throw new Error(`APP_SWAGGER_URL is required. Checked shell env and ${envPath}`);
  }

  const response = await fetch(swaggerUrl, {
    // Keep Swagger generation aligned with runtime requests:
    // both use APP_FEATURE_TAG as the feature-tag header source.
    headers: featureTag
      ? {
          "feature-tag": featureTag,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to download OpenAPI: ${response.status} ${response.statusText}`);
  }

  const spec = await response.text();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, spec);

  console.log(
    [
      `OpenAPI saved to ${path.relative(root, outputPath)}`,
      `mode=${mode}`,
      featureTag ? `feature-tag=${featureTag}` : "feature-tag=<empty>",
    ].join("\n"),
  );
}

downloadOpenApi().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
