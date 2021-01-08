const alarm = require('../lib/alarm')

describe('alarm.js', () => {
  it('should exist and be class/function', () => {
    expect(alarm).toBeDefined()
    expect(alarm).toBeInstanceOf(Function)
  })
})
