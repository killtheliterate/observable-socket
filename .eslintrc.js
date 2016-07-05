module.exports = {
    extends: [
        'eslint:recommended',
        // 'standard',
    ],

    parserOptions: {
        sourceType: 'module',

        ecmaFeatures: {
            modules: true,
        }
    },

    env: {
        browser: true,
        es6: true,
        mocha: true,
        node: true,
    },
}
