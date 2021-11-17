module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleDirectories: ['node_modules', 'src'],
    // testMatch: ['<rootDir>/test/**/*.test.[jt]s?(x)'],
    testMatch: ['<rootDir>/test/**/race.test.[jt]s?(x)'],
    transform: {
        '^.+\\.[jt]s(x)?$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.[jt]s?(x)',
        '!coverage/**',
        '!node_modules/**',
    ],
    coverageReporters: ['json-summary'],
    coveragePathIgnorePatterns: ['test/', 'node_modules/'],
    moduleNameMapper: {
        '^@Lib/(.*)$': '<rootDir>/src/$1',
    },
    coverageDirectory: '<rootDir>/coverage/',
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.json',
        },
    },
};
