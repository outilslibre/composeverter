module.exports = {
  extends: ["airbnb-base",'react-app','prettier'],
  plugins: ["prettier"],
  rules: {
      'no-param-reassign': ["error", { "props": false }]
  }
};