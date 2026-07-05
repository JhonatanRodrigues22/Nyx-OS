import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "jest.config.js",
      "public/sw.js",
      "public/workbox-*.js",
      "public/worker-*.js",
      "public/fallback-*.js"
    ]
  },
  ...nextVitals,
  ...nextTypescript
];

export default eslintConfig;
