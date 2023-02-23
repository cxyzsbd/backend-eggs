'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async notice() {
    const { ctx, app } = this;
    await ctx.socket.emit('notice', {
      code: 0,
      message: '成功',
      data: 1,
    });
  }
}

module.exports = DefaultController;
