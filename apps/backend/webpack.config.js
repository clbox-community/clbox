const {composePlugins, withNx} = require('@nx/webpack');
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin");
const {join} = require("path");

// Nx plugins for webpack.
module.exports = composePlugins(
    withNx({
        target: 'node',
    }),
    (config) => {
        config.plugins.push(
            new GeneratePackageJsonPlugin(
                {
                    'name': 'clbox.backend',
                    'version': '1.0.0',
                    'main': './main.js',
                    'license': 'AGPL 3.0',
                    'private': true,
                    'dependencies': {
                        'tslib': '',
                        'firebase-admin': '11.8.0',
                        'firebase-functions': '^4.6.0',
                        'tsscmp': '',
                        'node-fetch': ''
                    },
                    'engines': {
                        'node': '18'
                    }
                },
                join(__dirname, '../../dist/apps/backend/package.json') // __dirname + '/../../package.json'
            )
        )
        return config;
    }
);
