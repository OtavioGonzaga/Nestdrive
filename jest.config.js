module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
		'^test/(.*)$': '<rootDir>/test/$1',
		'^@files/(.*)$': '<rootDir>/files/$1',
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@typeorm/(.*)$': '<rootDir>/src/typeorm/$1',
		'^@common/(.*)$': '<rootDir>/src/common/$1',
	},
	moduleDirectories: ['node_modules', 'src'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	rootDir: '.',
};
