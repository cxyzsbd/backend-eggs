module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger } = ctx;
    const {
      socketOnlineUserRoomName,
      socketDepartmentRoomNamePrefix,
      socketCompanyRoomNamePrefix,
      IORedisUserKeyPrefix,
      socketUserPrefix,
      socketCompanyAdminPrefix,
    } = app.config;
    const nsp = app.io.of('/');
    const IORedis = app.redis.clients.get('io');
    let userinfo = null;
    // console.log('start connection!');
    // console.log(socket.rooms);
    // console.log(app.io.of('/').name);
    // console.log(app.io.of('/').connected);
    // console.log(app.io.of('/').rooms);
    try {
      const { accessToken } = socket.handshake.query;
      const { user_id, type, is_super_user } = await app.jwt.verify(accessToken, app.config.jwt.secret) || false;
      // console.log('user_id====================', user_id);
      if (type !== 'access_token') {
        // 用户token无效，断开连接
        socket.disconnect();
      }
      // 1.获取用户信息
      userinfo = await ctx.service.cache.get(`userinfo_${user_id}`, 'default');
      console.log('userinfo', userinfo);
      // 2.加入在线用户room
      await socket.join(socketOnlineUserRoomName);
      // 同一个用户加入一个room
      await socket.join(`${socketUserPrefix}${user_id}`);
      if (userinfo.company_id) {
        // 3.加入公司统一room
        await socket.join(`${socketCompanyRoomNamePrefix}${userinfo.company_id}`);
        // 4.加入部门room（无部门则认为是管理员，加入管理员room）
        if (userinfo.department_id) {
          // 有部门,加入部门room
          await socket.join(`${socketDepartmentRoomNamePrefix}${userinfo.department_id}`);
        } else {
          // 无部门，认为是管理员,加入公司管理员room
          await socket.join(`${socketCompanyAdminPrefix}${userinfo.company_id}`);
        }
      }
      // 测试推送
      // setTimeout(() => {
      //   nsp.to(`${socketCompanyRoomNamePrefix}${userinfo.company_id}`).emit('baordcast', { aaa: 123123123 });
      //   nsp.to(`${socketCompanyAdminPrefix}${userinfo.company_id}`).emit('baordcast', { bbb: 22222 });
      // }, 3000);
      // 5.更新redis中用户socketid Set

      // await IORedis.sadd(`${IORedisUserKeyPrefix}${user_id}`, socket.id);
      // const list = await IORedis.smembers(`${IORedisUserKeyPrefix}${user_id}`);
      // console.log('list==============', list);
      // const res = await app.redis.clients.get('io').sadd('testList', 14);
      // const res = await app.redis.clients.get('io').srem('testList', 13);
    } catch (error) {
      socket.disconnect();
    }
    await next();
    // 离线之后更新用户在redis中存储的socketID list
    // console.log('退出');
    // if (userinfo) {
    //   console.log('删除socketID');
    //   await IORedis.srem(`${IORedisUserKeyPrefix}${userinfo.id}`, socket.id);
    //   const newList = await IORedis.smembers(`${IORedisUserKeyPrefix}${userinfo.id}`);
    //   console.log('newList==================', newList);
    // }
  };
};
