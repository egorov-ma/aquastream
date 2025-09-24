module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow an extended set of types used in this repo
    'type-enum': [2, 'always', ['build','chore','ci','docs','feat','fix','perf','refactor','revert','style','test','config','infra','deps']],
    // Do not enforce subject case to allow titles with proper nouns (e.g., "CodeQL", "Docker Images CI")
    'subject-case': [0],
  },
};
