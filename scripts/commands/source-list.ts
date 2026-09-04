import { readdirSync } from "node:fs";
import { join } from "node:path";

const manifestsDir = join(process.cwd(), "sources", "manifests");
const files = readdirSync(manifestsDir).filter((name) => name.endsWith(".yaml"));

for (const file of files) {
  console.log(file);
}
