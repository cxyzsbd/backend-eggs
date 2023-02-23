module.exports = agent => {
  const ioRedis = agent.redis.clients.get('io');
  const ioRedisEventKey = `__keyevent@${ioRedis.options.db}__:expired`;
  ioRedis.subscribe(ioRedisEventKey, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result, 'redis订阅事件');
  });
  ioRedis.on('message', (channel, message) => {
    // console.log(channel, message);
    switch (channel) {
      case ioRedisEventKey:
        // 过期订阅,发送到master进程，再分发给任意worker进程处理
        // 采用随机发送到单个worker进程的方式，让过期回调事件只执行一次
        agent.messenger.sendRandom('redis_expire_subscribe', message);
        // 测试发送到所有进程的通讯方式
        // agent.messenger.sendToApp('redis_expire_subscribe', message);
        break;
      default:
        console.info('未处理的订阅事件：channel-【' + channel + '】,message-【' + message + '】');
    }
  });
};
