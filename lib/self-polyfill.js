// Polyfill for 'self' global in Node.js environment
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof self === 'undefined') {
    // eslint-disable-next-line no-global-assign
    self = global;
  }
}