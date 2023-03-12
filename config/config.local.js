/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  config.security = {
    csrf: {
      enable: false,
      ignore: ctx => ctx.app.config.security.domainWhiteList.includes(ctx.ip),
    },
    domainWhiteList: [ '127.0.0.1' ],
  };

  return {
    ...config,
  };
};
