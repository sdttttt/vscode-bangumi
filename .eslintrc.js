module.exports = {
    root   : true,
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser : "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules  : {
        "no-undef": "off",

        // 建议
        "multiline-comment-style": ["error", "starred-block"],
        "no-else-return"         : "error",
        "no-extra-boolean-cast"  : "error",
        "no-extra-label"         : "error",
        "no-extra-semi"          : "error",
        "no-floating-decimal"    : "error",
        "no-implicit-coercion"   : "error",
        "no-lonely-if"           : "error",
        "no-undef-init"          : "error",
        "no-unused-labels"       : "error",
        "prefer-arrow-callback"  : "error",
        "prefer-const"           : "error",
        "prefer-template"        : "error",
        curly                    : "error",
        yoda                     : ["error", "always"],
        "dot-notation"           : "error",

        // 风格
        "arrow-parens"                    : ["error", "as-needed"],
        indent                            : ["error", 4],
        "object-curly-newline"            : ["error", "always"],
        "nonblock-statement-body-position": ["error", "any"],
        "no-trailing-spaces"              : "error",
        "max-statements-per-line"         : [
            "error",
            {
                max: 2,
            },
        ],
        // 花括号单独一行，可读性更好
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
        "no-multi-spaces"        : "error",
        semi                     : "error",
        "semi-spacing"           : "error",
        "space-before-blocks"    : "error",
        "switch-colon-spacing"   : "error",
        quotes                   : ["error", "double"],
        "object-property-newline": "error",
        "linebreak-style"        : ["error", "windows"],
        "no-var"                 : "error",
    },
};
