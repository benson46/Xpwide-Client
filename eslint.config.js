import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add globals for Node.js to recognize `module.exports`
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
]; 
