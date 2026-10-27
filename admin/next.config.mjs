import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const adminDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(adminDir, "..");
nextEnv.loadEnvConfig(projectDir, process.env.NODE_ENV !== "production");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  env: {
    NEXT_PUBLIC_ADMIN_BASE_PATH: "",
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000",
    NEXT_PUBLIC_ADMIN_LOGIN_URL: process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "http://localhost:3001/login",
    ADMIN_LOGIN_URL: process.env.ADMIN_LOGIN_URL || "http://localhost:3001/login",
  },
};

export default nextConfig;
