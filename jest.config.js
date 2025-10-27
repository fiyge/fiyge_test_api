module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.test.ts'], // Looks for .test.ts files in src/
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testTimeout: 10000,
    reporters: [
        "default",
        ['jest-junit', {
            suiteName: 'jest tests',
            outputDirectory: 'reports',
            outputName: 'junit.xml',
            usePathForSuiteName: false,
            suiteNameTemplate: '{title}',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            addFileAttribute: true
        }],
        ['github-actions', {silent: true}],
        // 'summary',
        "jest-html-reporters",
    ],
    setupFilesAfterEnv: ['jest-expect-message'],
};