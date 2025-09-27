module.exports = {
  extends: ["next"],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/^#[0-9A-Fa-f]{3,6}$/]",
        message: 'Use semantic tokens instead of hard-coded hex colors.',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'className',
        property: 'match',
        message: 'Avoid property access on className directly.',
      },
    ],
  },
}

