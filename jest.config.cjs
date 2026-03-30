/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.steps.tsx"],
};
