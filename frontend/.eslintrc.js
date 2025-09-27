module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  overrides: [
    {
      files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector:
              "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/#/]",
            message:
              "Запрещены raw-классы с hex-цветами. Используйте дизайн-токены или переменные (например, var(--color)).",
          },
        ],
      },
    },
  ],
};
