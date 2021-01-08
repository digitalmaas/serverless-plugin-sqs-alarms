'use strict'

const HASH_DICT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

module.exports = function (length) {
  length = !length || !Number.isInteger(length) || length < 5 ? 5 : length
  const output = new Array(length)
  for (let i = 0; i < length; i++) {
    output[i] = HASH_DICT.charAt(Math.floor(Math.random() * HASH_DICT.length))
  }
  return output.join('')
}
