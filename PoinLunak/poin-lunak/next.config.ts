import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Required for Docker deployment
  // Note: outputFileTracingRoot removed for Docker compatibility
  // If running locally with monorepo, you may need to add it back:
  // outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
