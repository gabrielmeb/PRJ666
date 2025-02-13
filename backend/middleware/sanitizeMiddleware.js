const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const sanitize = (req, res, next) => {
  mongoSanitize()(req, res, () => {
    xss()(req, res, next);
  });
};

module.exports = { sanitize };
