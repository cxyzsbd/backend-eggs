const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  static get schedule() {
    return {
      interval: '2h',
      type: 'worker',
      immediate: true,
    };
  }

  async subscribe() {
    const { ctx, app } = this;
    console.log('定时任务执行......');
    app.utils.tools.setAttrsRedisCache();
  }
}

module.exports = UpdateCache;
