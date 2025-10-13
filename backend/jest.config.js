export default {
    "preset": "ts-jest",
    "roots": [
        "<rootDir>",
      "<rootDir>/src"
    ],
    "modulePaths": [
        "<rootDir>",
        "<rootDir>/src"
    ],
    "moduleDirectories": [
        "node_modules",
        "src"
    ],
    "setupFilesAfterEnv": [
        "<rootDir>/src/jest.setup.ts"
    ],
    "testMatch": [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "testEnvironment": "node",
    "transform": {
      "^.+\\.(ts|tsx|js|jsx)$": "ts-jest"
    },
    // "transformIgnorePatterns": ['^.+\\.js$'],
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
}