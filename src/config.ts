import fs from "fs";
import path from "path";
import os from "os";

export function setUser(userName: string): void {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}
export function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  const JSONString = JSON.stringify(rawConfig, null, 2);
  fs.writeFileSync(filePath, JSONString, "utf-8");
}
export function readConfig() {
  const filePath = getConfigFilePath();
  const data = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(data);
  return validateConfig(parsedData);
}
export function getConfigFilePath(): string {
  const filePath = path.join(os.homedir(), ".gatorconfig.json");
  return filePath;
}
function validateConfig(data: any) {
  if (!data.db_url || typeof data.db_url !== "string") {
    throw new Error("Invalid config: db_url is a required string");
  }
  if (!data.current_user_name || typeof data.current_user_name !== "string") {
    throw new Error("Invalid config: current_user_name is a required string");
  }

  const config: Config = {
    dbUrl: data.db_url,
    currentUserName: data.current_user_name,
  };
  return config;
}

export type Config = {
  dbUrl: string;
  currentUserName: string;
};
