// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
    extends: "@astahmer/eslint-config-react",
    overrides: [
        {
            // or whatever matches stories specified in .storybook/main.js
            files: ["*.stories.@(ts|tsx|js|jsx|mjs|cjs)", "./src/migrations/**", "./src/migrations-kikko/**"],
            rules: {
                "arca/no-default-export": "off",
                "import/no-unused-modules": "off",
            },
        },
    ],
});
