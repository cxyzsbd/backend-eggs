const jwt = require('jsonwebtoken');

module.exports = app => {
  app.jwt = {
    sign(payload, secretOrPrivateKey, options) {
      return jwt.sign(payload, secretOrPrivateKey, options);
    },

    verify(token, secretOrPublicKey, options, callback) {
      return jwt.verify(token, secretOrPublicKey, options, callback);
    },
  };
};
