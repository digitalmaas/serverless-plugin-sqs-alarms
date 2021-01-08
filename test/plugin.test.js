const plugin = require('../lib/plugin')

describe('plugin.js', () => {
  it('should exist and be class/function', () => {
    expect(plugin).toBeDefined()
    expect(plugin).toBeInstanceOf(Function)
  })
})
