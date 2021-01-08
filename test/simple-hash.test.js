const simpleHash = require('../lib/simple-hash')

describe('simple-hash.js', () => {
  it('should exist and be class/function', () => {
    expect(simpleHash).toBeDefined()
    expect(simpleHash).toBeInstanceOf(Function)
  })
  it('should create hash with correct length (min 5)', () => {
    expect(simpleHash(2)).toHaveLength(5)
    expect(simpleHash(0)).toHaveLength(5)
    expect(simpleHash(10)).toHaveLength(10)
    expect(simpleHash('a')).toHaveLength(5)
  })
  it('should create different hashes', () => {
    const a = simpleHash(5)
    const b = simpleHash(5)
    const c = simpleHash(5)
    const d = simpleHash(5)
    expect(a).not.toEqual(b)
    expect(a).not.toEqual(c)
    expect(a).not.toEqual(d)
    expect(b).not.toEqual(c)
    expect(b).not.toEqual(d)
    expect(c).not.toEqual(d)
  })
})
