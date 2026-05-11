import { existsSync, readFileSync } from "node:fs";
import child_process from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const certificateName = "vite-https";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

const certFilePath = resolve(__dirname, `../${certificateName}.pem`);
const keyFilePath = resolve(__dirname, `../${certificateName}.key`);

export default function makeCertificate() {
  const devCertCheck = child_process.spawnSync("dotnet", [
    "dotnet",
    "dev-certs",
    "https",
    "--check",
  ]);
  const isDevCertNormal = devCertCheck.status === 0;

  // If the dev cert is missing/invalid or the frontend cert files don't exist, create and trust a new one.
  if (
    !isDevCertNormal ||
    !existsSync(certFilePath) ||
    !existsSync(keyFilePath)
  ) {
    const { status: createDevCertStatus } = child_process.spawnSync(
      "dotnet",
      [
        "dev-certs",
        "https",
        "--export-path",
        certFilePath,
        "--format",
        "Pem",
        "--no-password",
        "--trust",
      ],
      { stdio: "inherit" },
    );
    if (createDevCertStatus !== 0)
      throw new Error("Could not create certificate.");
  }

  return {
    key: readFileSync(keyFilePath),
    cert: readFileSync(certFilePath),
  };
}
