module.exports = app => {
  return async (ctx, next) => {
    const { socket } = ctx;
    const {
      socketOnlineUserRoomName,
      socketDepartmentRoomNamePrefix,
      socketCompanyRoomNamePrefix,
      socketUserPrefix,
      socketCompanyAdminPrefix,
    } = app.config;
    const nsp = app.io.of('/');
    let userinfo = null;
    // console.log('start connection!');
    // console.log(socket.rooms);
    // console.log(app.io.of('/').name);
    // console.log(app.io.of('/').connected);
    // console.log(app.io.of('/').rooms);
    try {
      // console.log('socket', socket);
      const { accessToken } = socket.handshake.query;
      // console.log('accessToken', accessToken);
      const { user_id, type, is_super_user } = await app.jwt.verify(accessToken, app.config.jwt.secret) || false;
      // console.log('user_id====================', user_id);
      if (type !== 'access_token' || !accessToken || !user_id) {
      // 用户token无效，断开连接
        socket.disconnect();
        // return false;
      }
      // 1.获取用户信息
      userinfo = await ctx.service.cache.get(`userinfo_${user_id}`, 'default');
      // console.log('userinfo', userinfo);
      const companyPrefix = userinfo && userinfo.company_id ? userinfo.company_id : '';
      // 2.加入在线用户room
      await socket.join(socketOnlineUserRoomName);
      // 同一个用户加入一个room
      await socket.join(`${socketUserPrefix}_${companyPrefix}_${user_id}`);
      if (userinfo && userinfo.company_id) {
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
      // setTimeout(() => {
      //   nsp.to(socketOnlineUserRoomName).emit('message', { aaa: 222 });
      // }, 3000);
    } catch (error) {
      console.log('error', error);
      socket.disconnect();
    }
    await next();
    // 离线之后踢出房间
    // 离开在线用户room
    socket.leave(socketOnlineUserRoomName);
    // 退出个人room
    const companyPrefix = userinfo && userinfo.company_id ? userinfo.company_id : '';
    socket.leave(`${socketUserPrefix}_${companyPrefix}_${userinfo.id}`);
    if (userinfo && userinfo.company_id) {
      // 3.离开公司统一room
      socket.leave(`${socketCompanyRoomNamePrefix}${userinfo.company_id}`);
      // 4.离开部门room（无部门则认为是管理员，加入管理员room）
      if (userinfo.department_id) {
        // 有部门,离开部门room
        socket.leave(`${socketDepartmentRoomNamePrefix}${userinfo.department_id}`);
      } else {
        // 无部门，认为是管理员,离开公司管理员room
        socket.leave(`${socketCompanyAdminPrefix}${userinfo.company_id}`);
      }
    }
  };
};
