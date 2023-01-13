module.exports = options => {
  return async function validateSuperUser(ctx, next) {
    const { header: { request_user } } = ctx.request;
    if (request_user !== 1) {
      ctx.status = 403;
      ctx.body = {
        message: '无超管权限',
      };
      return false;
    }
    await next();
  };
};
