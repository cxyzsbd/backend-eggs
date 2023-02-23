module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger } = ctx;
    const { socketOnlineUserRoomName, socketDepartmentRoomNamePrefix } = app.config;
    const nsp = app.io.of('/');
    console.log('start connection!');
    // console.log(socket.rooms);
    // console.log(app.io.of('/').name);
    // console.log(app.io.of('/').connected);
    // console.log(app.io.of('/').rooms);
    try {
      // console.log('socket.handshake.query',socket.handshake.query);
      const { accessToken, userId } = socket.handshake.query;
      const decoded = await app.jwt.verify(accessToken, app.config.jwt.secret) || false;
      if (!decoded || decoded.type !== 'access_token') {
        // 用户token无效，断开连接
        socket.disconnect();
      }
      // 获取用户信息
      const user = await ctx.service.users.findOne({ id: userId });
      if (user.state !== 1 || !user.department_id) {
        // 用户被停用或者用户没有被加入部门，则断开连接
        socket.disconnect();
      }
      // 根据用户部门加入在线用户room
      await socket.join(socketOnlineUserRoomName);
      // 加入部门room（按照部门id作为房间号）
      console.log(12321312312, `${socketDepartmentRoomNamePrefix}${user.department_id}`);
      await socket.join(`${socketDepartmentRoomNamePrefix}${user.department_id}`);
      // 将用户id和socketId关系存入redis
      await ctx.service.cache.set(`USER_SOCKET_${userId}`, socket.id);
      nsp.adapter.clients([ socketOnlineUserRoomName ], (err, clients) => {
        console.log(111, JSON.stringify(clients));
      });
      nsp.adapter.clients([ `${socketDepartmentRoomNamePrefix}${user.department_id}` ], (err, clients) => {
        console.log(222, JSON.stringify(clients));
      });
    } catch (error) {
      socket.disconnect();
    }
    await next();
  };
};
