module.exports = {
    root: true, // So parent files don't get applied
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    extends: [
        'airbnb',
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['prettier', '@typescript-eslint'],
    overrides: [
        {
            files: ['**/*d.ts'],
            rules: {
                'import/export': 0,
                'import/named': 0,
            },
        },
        {
            files: ['test/**/*.ts'],
            env: { jest: true, node: true },
        },
        {
            files: ['**/*.ts'],
            rules: {
                'no-shadow': 'off',
                '@typescript-eslint/no-shadow': 'error',
            },
        },
    ],
    settings: {
        'import/ignore': ['node_modules'],
        'import/resolver': {
            node: {
                extensions: ['.ts', '.tsx'],
            },
            typescript: {},
        },
    },
};
