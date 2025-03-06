const {composePlugins, withNx} = require('@nx/webpack');
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin");
const {join} = require("path");
const mainPackageJson = require("../../package.json");

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
                        'tslib': mainPackageJson.devDependencies['tslib'],
                        "firebase-admin": mainPackageJson.dependencies['firebase-admin'],
                        "firebase-functions": mainPackageJson.dependencies['firebase-functions'],
                        'node-fetch': mainPackageJson.dependencies['node-fetch'],
                    },
                    'engines': {
                        'node': mainPackageJson.engines.node
                    }
                },
                join(__dirname, '../../dist/apps/backend/package.json')
            )
        )
        return config;
    }
);
