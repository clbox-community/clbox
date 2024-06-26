/* eslint-disable */
export default {
    preset: '../../jest.preset.js',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
        '^.+\\.[tj]sx?$': [
            'babel-jest',
            { cwd: __dirname, configFile: './babel-jest.config.json' },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
    coverageDirectory: '../../coverage/apps/web-app',
    displayName: 'web-app',
};
