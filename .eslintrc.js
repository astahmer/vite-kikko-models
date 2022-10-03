// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
    extends: ["./.eslintrc.build.js"],
    rules: {
        "import/no-unused-modules": "off",
        "unused-imports/no-unused-imports": "off",
        // "@typescript-eslint/no-unused-expressions": "error", TODO ?
    },
});
