import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Your main entry point
  format: ["cjs", "esm"], // Build for both CJS and ESM
  dts: true, // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true, // Clean up the 'dist' folder
  // This is the magic part:
  // It ensures .js is ESM and .cjs is CJS
  // based on the "type": "module" in package.json
});
