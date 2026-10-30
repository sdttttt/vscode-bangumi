import js from "@eslint/js";
import json from "eslint-plugin-json";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "out/**",
            "resources/**",
            "public/**",
            "**/*.md",
            "**/*.png",
            "**/*.jpg",
            "**/*.gif",
            "**/*.css",
        ],
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-undef": "off",

            /* 建议 */
            "no-else-return"       : "error",
            "no-extra-boolean-cast": "error",
            "no-extra-label"       : "error",
            "no-extra-semi"        : "error",
            "no-floating-decimal"  : "error",
            "no-implicit-coercion" : "error",
            "no-lonely-if"         : "error",
            "no-undef-init"        : "error",
            "no-unused-labels"     : "error",
            "prefer-arrow-callback": "error",
            "prefer-const"         : "error",
            "prefer-template"      : "error",
            curly                  : "error",
            yoda                   : ["error", "always"],
            "dot-notation"         : "error",

            /* 风格 */
            indent                            : ["error", 4],
            "multiline-comment-style"         : ["error", "starred-block"],
            "object-curly-newline"            : ["error", "always"],
            "nonblock-statement-body-position": ["error", "any"],
            "no-trailing-spaces"              : "error",
            "linebreak-style"                 : ["warn", "unix"],
            "max-statements-per-line"         : [
                "error",
                {
                    max: 2,
                },
            ],
            /* 花括号单独一行，可读性更好 */
            "brace-style": [
                "error",
                "allman",
                {
                    allowSingleLine: true,
                },
            ],

            "key-spacing": [
                "error",
                {
                    align: "colon",
                },
            ],
            "arrow-parens"           : ["error", "as-needed"],
            "no-multi-spaces"        : "error",
            semi                     : "error",
            "semi-spacing"           : "error",
            "space-before-blocks"    : "error",
            "switch-colon-spacing"   : "error",
            quotes                   : ["error", "double"],
            "object-property-newline": "error",
            "no-var"                 : "error",
        },
    },
    {
        /* chai 风格的断言（`expect(x).to.be.true`）本身就是表达式语句 */
        files: ["src/test/**/*.ts"],
        rules: {
            "no-unused-expressions"                   : "off",
            "@typescript-eslint/no-unused-expressions": "off",
        },
    },
    {
        files: ["**/*.json"],
        ...json.configs["recommended-with-comments"],
    }
);
