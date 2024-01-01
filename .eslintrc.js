module.exports = {
  root: true,
  extends: ["airbnb-base",'react-app', 
            'plugin:prettier/recommended'],
  plugins: [
    '@stylistic/js'
  ],
  rules: {
    // TODO: Add typescript types to decomposerize-website
    "react/prop-types": "off",
    "import/no-anonymous-default-export":"off",
    "no-param-reassign":"off",
    '@stylistic/js/indent': ['error', 4],
    'import/prefer-default-export':'off',
	'import/no-import-module-exports':'off',
  },
 "parser": "@babel/eslint-parser",
};
