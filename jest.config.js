module.exports = {
  verbose: false,
  roots: ['<rootDir>/test/'],
  moduleFileExtensions: ['js'],
  collectCoverage: false,
  reporters: ['jest-spec-reporter'],
  transform: { '\\.[jt]sx?$': 'babel-jest' }
}
