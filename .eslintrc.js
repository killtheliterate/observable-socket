module.exports = {
    extends: [
        'eslint:recommended',
    ],

    parserOptions: {
        sourceType: 'module',

        ecmaFeatures: {
        }
    },

    env: {
        browser: true,
        es6: true,
        mocha: true,
        node: true,
    },
}
