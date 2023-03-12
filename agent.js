module.exports = agent => {
  // redis订阅运维过期时间
  const iomRedis = agent.redis.clients.get('iom');
  const iomRedisEventKey = `__keyevent@${iomRedis.options.db}__:expired`;
  iomRedis.subscribe(iomRedisEventKey, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result, 'redis订阅运维过期时间');
  });
  iomRedis.on('message', (channel, message) => {
    // console.log(channel, message);
    switch (channel) {
      case iomRedisEventKey:
        // 过期订阅,发送到master进程，再分发给任意worker进程处理
        // 采用随机发送到单个worker进程的方式，让过期回调事件只执行一次
        agent.messenger.sendRandom('iom_expire_subscribe', message);
        break;
      default:
        console.info('未处理的订阅事件：channel-【' + channel + '】,message-【' + message + '】');
    }
  });

  // redis订阅摄像头定时抓拍事件
  const cameraPhotosRedis = agent.redis.clients.get('camera_photos');
  const cameraPhotosRedisEventKey = `__keyevent@${cameraPhotosRedis.options.db}__:expired`;
  cameraPhotosRedis.subscribe(cameraPhotosRedisEventKey, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result, 'redis订阅摄像头定时抓拍事件');
  });
  cameraPhotosRedis.on('message', (channel, message) => {
    // console.log(channel, message);
    switch (channel) {
      case cameraPhotosRedisEventKey:
        // 过期订阅,发送到master进程，再分发给任意worker进程处理
        // 采用随机发送到单个worker进程的方式，让过期回调事件只执行一次
        agent.messenger.sendRandom('camera_photos_redis_expire_subscribe', message);
        break;
      default:
        console.info('未处理的订阅事件：channel-【' + channel + '】,message-【' + message + '】');
    }
  });

  // redis订阅在线活跃用户事件
  const IORedis = agent.redis.clients.get('io');
  const IORedisEventKey = `__keyevent@${IORedis.options.db}__:expired`;
  IORedis.subscribe(IORedisEventKey, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result, 'redis订阅在线活跃用户事件');
    console.log('key', IORedisEventKey);
  });
  IORedis.on('message', (channel, message) => {
    console.log(channel, message);
    switch (channel) {
      case IORedisEventKey:
        // 过期订阅,发送到master进程，再分发给任意worker进程处理
        // 采用随机发送到单个worker进程的方式，让过期回调事件只执行一次
        agent.messenger.sendRandom('io_redis_expire_subscribe', message);
        break;
      default:
        console.info('未处理的订阅事件：channel-【' + channel + '】,message-【' + message + '】');
    }
  });
};
