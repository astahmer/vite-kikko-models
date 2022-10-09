// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
    env: { browser: true, jest: true, es2021: true },
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        jsx: true,
        project: ["./tsconfig.json"],
        ecmaVersion: 2022,
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: "detect", // React version. "detect" automatically picks the version you have installed.
        },
        // https://github.dev/remix-run/remix/blob/e77e2eb731551db1e70c7c3bd5f73389b97a9574/packages/remix-eslint-config/settings/import.js#L2-L13
        "import/ignore": ["node_modules", "\\.(css|md|svg|json)$"],
        "import/resolver": {
            alias: {
                map: [["@", "./src"]],
                extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            },
        },
    },
    ignorePatterns: ["*.typegen.ts", "asyncThrottle.ts", "*.test.*", "setupTests.js"],
    plugins: [
        "@typescript-eslint",
        "react",
        "react-hooks",
        "arca",
        "unused-imports",
        "simple-import-sort",
        "file-progress",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        // 'plugin:diff/diff', // à commenter si on veut lint tout le projet plutôt que juste les diffs
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:sonarjs/recommended",
        "plugin:unicorn/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:prettier/recommended",
    ],
    rules: {
        "file-progress/activate": 1,
        "react-hooks/rules-of-hooks": "off", // react-table ->  React Hook "useXXX" is called in function "cell" that is neither a React function component nor a custom React Hook function. react-hooks/rules-of-hooks
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/ban-types": [
            "error",
            {
                types: {
                    // un-ban a type that's banned by default
                    "{}": false,
                },
                extendDefaults: true,
            },
        ],
        // https://www.npmjs.com/package/eslint-plugin-react
        "react/jsx-pascal-case": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-no-leaked-render": "error",
        "react/jsx-no-constructed-context-values": "warn",
        "react/prop-types": ["error", { ignore: ["children"] }], // lots of false positive on children
        "react/no-children-prop": "off",

        // unicorn
        "unicorn/no-null": "off",
        "unicorn/filename-case": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/no-array-callback-reference": "off",
        "unicorn/no-array-reduce": "off",
        "unicorn/no-array-for-each": "off",
        "unicorn/no-object-as-default-parameter": "off",
        "unicorn/no-array-method-this-argument": "off", // returns false positive
        "unicorn/new-for-builtins": "off",
        "unicorn/consistent-function-scoping": ["error", { checkArrowFunctions: false }],
        "unicorn/prefer-spread": "off",
        "unicorn/consistent-destructuring": "off",
        "unicorn/no-await-expression-member": "off",
        "unicorn/explicit-length-check": "error",

        // sonar
        "sonarjs/cognitive-complexity": ["error", 17],
        "sonarjs/no-duplicate-string": ["warn", 10],

        // https://github.com/arcanis/eslint-plugin-arca/blob/d31cc29f89e583ab58cf365818801e1da7ae514b/README.md
        "arca/jsx-no-html-attrs": "off",

        // https://github.dev/antfu/eslint-config/blob/e9f0988b4da7ea13a86def1f6245d5e96a04f7a9/packages/typescript/index.js#L20-L24
        "@typescript-eslint/type-annotation-spacing": ["error", {}],
        "@typescript-eslint/consistent-type-imports": [
            "error",
            { prefer: "type-imports", disallowTypeAnnotations: false },
        ],
        "@typescript-eslint/prefer-ts-expect-error": "error",

        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["error", "always"],
        quotes: "off",
        "@typescript-eslint/quotes": ["error", "double"],
        "space-before-blocks": "off",
        "@typescript-eslint/space-before-blocks": ["error", "always"],
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": [
            "error",
            {
                anonymous: "always",
                named: "never",
                asyncArrow: "always",
            },
        ],
        "space-infix-ops": "off",
        "@typescript-eslint/space-infix-ops": "error",
        "keyword-spacing": "off",
        "@typescript-eslint/keyword-spacing": ["error", { before: true, after: true }],
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": ["error", { before: false, after: true }],
        "@typescript-eslint/consistent-indexed-object-style": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "jsx-quotes": ["error", "prefer-double"],
        "react/react-in-jsx-scope": "off",

        // https://github.dev/colinhacks/zod/blob/3b75ae584e31d8bd06f7298247cd3d27520cf881/.eslintrc.js#L36
        "import/order": 0, // turn off in favor of eslint-plugin-simple-import-sort
        "import/no-unresolved": 0,
        "import/no-duplicates": 1,

        // https://github.com/TanStack/query/blob/9511933f258b9f87f000938d1583e2b301e3d912/.eslintrc
        "import/no-cycle": "error",
        "import/no-unused-modules": ["error", { unusedExports: true }],

        /**
         * eslint-plugin-simple-import-sort @see https://github.com/lydell/eslint-plugin-simple-import-sort
         */
        "sort-imports": 0, // we use eslint-plugin-import instead
        "simple-import-sort/imports": 1,
        "simple-import-sort/exports": 1,

        /**
         * @typescript-eslint/eslint-plugin @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
         */
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        /**
         * ESLint core rules @see https://eslint.org/docs/rules/
         */
        "no-case-declarations": "off",
        "no-empty": "off",
        "no-useless-escape": "off",
        "no-control-regex": "off",

        // xo typescript https://github.dev/xojs/eslint-config-xo-typescript/blob/2a7e3b0b3c28b0c25866721298e67947a95767ab/index.js#L1
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array-simple",
            },
        ],
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-tslint-comment": "error",
        "@typescript-eslint/class-literal-property-style": ["error", "getters"],
        "@typescript-eslint/consistent-generic-constructors": ["error", "constructor"],
        "brace-style": "off",
        "@typescript-eslint/brace-style": [
            "error",
            "1tbs",
            {
                allowSingleLine: false,
            },
        ],
        "default-param-last": "off",
        "@typescript-eslint/default-param-last": "off",
        "dot-notation": "off",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/consistent-type-exports": [
            "error",
            {
                fixMixedExportsWithInlineTypeSpecifier: true,
            },
        ],
        "func-call-spacing": "off",
        "@typescript-eslint/func-call-spacing": ["error", "never"],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                multiline: {
                    delimiter: "semi",
                    requireLast: true,
                },
                singleline: {
                    delimiter: "semi",
                    requireLast: false,
                },
            },
        ],
        // We use `@typescript-eslint/naming-convention` in favor of `camelcase`.
        camelcase: "off",
        // Known issues:
        // - https://github.com/typescript-eslint/typescript-eslint/issues/1485
        // - https://github.com/typescript-eslint/typescript-eslint/issues/1484
        // TODO: Prevent `_` prefix on private fields when TypeScript 3.8 is out.
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: "typeLike",
                format: ["PascalCase"],
            },
            {
                selector: "variable",
                types: ["boolean"],
                format: ["PascalCase"],
                prefix: ["is", "has", "can", "should", "will", "did", "with", "went", "are", "needs"],
                filter: {
                    // you can expand this regex to add more allowed names
                    regex: "^(required)$",
                    match: false,
                },
            },
            {
                // Interface name should not be prefixed with `I`.
                selector: "interface",
                filter: /^(?!I)[A-Z]/.source,
                format: ["PascalCase"],
            },
            {
                // Type parameter name should either be `T` or a descriptive name.
                selector: "typeParameter",
                filter: /^T$|^T?[A-Z][a-zA-Z]+$/.source,
                format: ["PascalCase"],
            },
        ],
        "@typescript-eslint/no-base-to-string": "error",
        "no-dupe-class-members": "off",
        "@typescript-eslint/no-dupe-class-members": "error",
        "@typescript-eslint/no-confusing-void-expression": [
            "error",
            { ignoreVoidOperator: true, ignoreArrowShorthand: true },
        ],
        "@typescript-eslint/no-duplicate-enum-values": "error",
        "@typescript-eslint/no-dynamic-delete": "error",
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": [
            "error",
            {
                allowSingleExtends: true,
            },
        ],
        "@typescript-eslint/no-extra-non-null-assertion": "error",
        // Disabled because it's buggy. It transforms `...(personalToken ? {Authorization: `token ${personalToken}`} : {})` into `...personalToken ? {Authorization: `token ${personalToken}`} : {}` which is not valid.
        // https://github.com/typescript-eslint/typescript-eslint/search?q=%22no-extra-parens%22&state=open&type=Issues
        "no-extra-parens": "off",
        "no-extra-semi": "off",
        "@typescript-eslint/no-extra-semi": "error",
        "no-loop-func": "off",
        "@typescript-eslint/no-loop-func": "error",
        "no-loss-of-precision": "off",
        "@typescript-eslint/no-loss-of-precision": "error",
        "@typescript-eslint/no-extraneous-class": [
            "error",
            {
                allowConstructorOnly: false,
                allowEmpty: false,
                allowStaticOnly: false,
                allowWithDecorator: true,
            },
        ],
        "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-misused-promises": [
            "error",
            {
                checksConditionals: true,

                // TODO: I really want this to be `true`, but it makes it inconvenient to use
                // async functions as event handlers... I need to find a good way to handle that.
                // https://github.com/sindresorhus/refined-github/pull/2391#discussion_r318990466
                checksVoidReturn: false,
            },
        ],
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": "error",
        "no-restricted-imports": "off",
        "@typescript-eslint/no-restricted-imports": [
            "error",
            ["error", "domain", "freelist", "smalloc", "punycode", "sys", "querystring", "colors"],
        ],
        "@typescript-eslint/no-redundant-type-constituents": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-this-alias": [
            "error",
            {
                allowDestructuring: true,
            },
        ],
        "no-throw-literal": "off",
        "@typescript-eslint/no-throw-literal": [
            "error",
            {
                // This should ideally be `false`, but it makes rethrowing errors inconvenient. There should be a separate `allowRethrowingUnknown` option.
                allowThrowingUnknown: true,
                allowThrowingAny: false,
            },
        ],
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "no-constant-condition": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unnecessary-type-constraint": "error",

        "@typescript-eslint/no-useless-empty-export": "error",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "no-unused-vars": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "padding-line-between-statements": "off",
        "@typescript-eslint/padding-line-between-statements": [
            "error",
            {
                blankLine: "always",
                prev: "multiline-block-like",
                next: "*",
            },
        ],
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/non-nullable-type-assertion-style": "error",
        "@typescript-eslint/parameter-properties": [
            "error",
            {
                prefer: "parameter-property",
            },
        ],
        "@typescript-eslint/prefer-as-const": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-literal-enum-member": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-nullish-coalescing": [
            "error",
            {
                ignoreTernaryTests: true,
                ignoreConditionalTests: true,
                ignoreMixedLogicalExpressions: true,
            },
        ],
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/restrict-plus-operands": [
            "off",
            {
                checkCompoundAssignments: true,
                allowAny: true,
            },
        ],
        "@typescript-eslint/restrict-template-expressions": [
            "error",
            {
                allowNumber: true,
                allowNullish: true,
                allowAny: true,
            },
        ],
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/require-array-sort-compare": [
            "error",
            {
                ignoreStringArrays: true,
            },
        ],
        semi: "off",
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/prefer-regexp-exec": "error",
        "@typescript-eslint/unified-signatures": [
            "error",
            {
                ignoreDifferentlyNamedParameters: true,
            },
        ],

        // Disabled per typescript-eslint recommendation: https://github.com/typescript-eslint/typescript-eslint/blob/e26e43ffba96f6d46198b22f1c8dd5c814db2652/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
        "no-undef": "off",

        // TypeScript might have features not supported in a specific Node.js version.
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-unsupported-features/es-builtins": "off",

        // The rule is buggy with TS and it's not needed as TS already enforces valid imports and references at compile-time.
        "import/namespace": "off",

        // `import/no-duplicates` works better with TypeScript.
        "no-duplicate-imports": "off",
    },
    overrides: [
        {
            // or whatever matches stories specified in .storybook/main.js
            files: ["*.stories.@(ts|tsx|js|jsx|mjs|cjs)", "./src/migrations/**", "./src/migrations-kikko/**"],
            rules: {
                "arca/no-default-export": "off",
                "import/no-unused-modules": "off",
            },
        },
        // disable prop-types rule for js files
        {
            files: ["**/*.js?(x)", "**/FixtureCatalog/**"],
            rules: {
                "react/prop-types": "off",
            },
        },
        // https://github.com/remix-run/remix/blob/e77e2eb731551db1e70c7c3bd5f73389b97a9574/packages/remix-eslint-config/index.js
        {
            files: ["**/views/**/*.js?(x)", "**/views/**/*.tsx"],
            rules: {
                // Routes may use default exports without a name. At the route level
                // identifying components for debugging purposes is less of an issue, as
                // the route boundary is more easily identifiable.
                "react/display-name": "off",
            },
        },
    ],
});
