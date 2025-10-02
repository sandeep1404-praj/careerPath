import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";

const {
  languageOptions: jsLanguageOptions = {},
  plugins: jsPlugins = {},
  rules: jsRules = {},
} = js.configs.recommended;

const baseLanguageOptions = {
  ...jsLanguageOptions,
  ecmaVersion: 2020,
  sourceType: "module",
  globals: {
    ...(jsLanguageOptions.globals || {}),
    ...globals.browser,
  },
  parserOptions: {
    ...(jsLanguageOptions.parserOptions || {}),
    ecmaFeatures: {
      ...((jsLanguageOptions.parserOptions && jsLanguageOptions.parserOptions.ecmaFeatures) || {}),
      jsx: true,
    },
  },
};

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: baseLanguageOptions,
    plugins: {
      ...jsPlugins,
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...jsRules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: [
      "*.config.js",
      "**/*.config.js",
      "vite.config.js",
      "tailwind.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: jsRules,
  },
];
