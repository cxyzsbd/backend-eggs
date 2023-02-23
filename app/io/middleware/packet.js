'use strict';

module.exports = app => {
  return async (ctx, next) => {
    const { packet, app: { redis } } = ctx;
    console.log(121212121212);
    await next();
  };
};
