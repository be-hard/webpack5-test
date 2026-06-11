module.exports = {
  api: {
    input: ".openapi/openapi.json",
    output: {
      target: "src/services/generated/api.ts",
      schemas: "src/services/generated/model",
      client: "axios",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "src/services/orval-mutator.ts",
          name: "customInstance",
        },
      },
    },
  },
};
