const redis = require('redis');
class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
  }

  async willReady() {
    const { app } = this;
    const ctx = await app.createAnonymousContext();
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用
    // 1.将部门列表平铺数据缓存到redis
    app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    // 2.将所有权限数据缓存到redis
    app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
  }

  async didReady() {
    const { app } = this;
    const ctx = await app.createAnonymousContext();
    const id = await app.utils.tools.SnowFlake();
    console.log('id', id);
    console.log('id', Number(id));
    await ctx.model.TestFlake.create({ id, name: '11111' });
    // 应用启动完毕
    app.messenger.on('redis_expire_subscribe', data => {
      console.log('data', data);
      // 执行对应到期任务
      // ctx.logger.info('data========================', data);
      // 测试不同的进程通讯时发送消息逻辑
      // app.redis.clients.get('default').set(app.utils.tools.uuidv4(), 1);
    });
  }

  async serverDidReady() {
    const { app } = this;
    // http / https server 已启动，开始接受外部请求
    // 此时可以从 app.server 拿到 server 的实例
    this.app.server.on('timeout', socket => {
      // handle socket timeout
    });
  }
}

module.exports = AppBootHook;
