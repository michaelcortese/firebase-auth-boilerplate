module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
    "quote-props": ["error", "as-needed"],
    "max-len": ["error", { code: 120 }],
    indent: ["error", 2],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": 0,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
};
