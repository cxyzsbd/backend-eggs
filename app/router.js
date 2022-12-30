'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.redirect('/doc', '/swagger-ui.html', 302);

  // 用户
  router.post('/api/v1/users/login', controller.v1.users.login);
  router.post('/api/v1/users/refresh-token', controller.v1.users.refreshToken);
  router.post('/api/v1/users', controller.v1.users.create);
  router.put('/api/v1/users/:id', controller.v1.users.update);
  router.post('/api/v1/users/person-info', controller.v1.users.updateInfo);
  router.post('/api/v1/users/update-psw', controller.v1.users.updatePassword);
  router.delete('/api/v1/users/:id', controller.v1.users.destroy);
  router.get('/api/v1/users/:id', controller.v1.users.findOne);
  router.get('/api/v1/users', controller.v1.users.findAll);
  router.get('/api/v1/user-info', controller.v1.users.getInfo);
  router.get('/api/v1/user-menus', controller.v1.users.getMenus);

  // 角色
  router.post('/api/v1/roles', controller.v1.roles.create);
  router.put('/api/v1/roles/:id', controller.v1.roles.update);
  router.get('/api/v1/roles', controller.v1.roles.findAll);
  router.get('/api/v1/roles/:id', controller.v1.roles.findOne);
  router.delete('/api/v1/roles/:id', controller.v1.roles.destroy);
  // router.put('/api/v1/roles/:id/is_default', controller.v1.roles.updateIsDefault);

  // 用户-角色
  router.get('/api/v1/user/:user_id/roles', controller.v1.userRoles.findAll);// 获取用户所有角色
  router.post('/api/v1/user/:user_id/roles', controller.v1.userRoles.bulkRoles);// 批量增删用户角色

  // 菜单
  router.post('/api/v1/menus', controller.v1.menus.create);
  router.put('/api/v1/menus/:id', controller.v1.menus.update);
  router.get('/api/v1/menus', controller.v1.menus.findAll);
  router.get('/api/v1/menus/:id', controller.v1.menus.findOne);
  router.delete('/api/v1/menus/:id', controller.v1.menus.destroy);
  router.get('/api/v1/users/:id/menus', controller.v1.menus.userMenus);// 没测试

  // 资源
  router.post('/api/v1/permissions', controller.v1.permissions.create);
  router.put('/api/v1/permissions/:id', controller.v1.permissions.update);
  router.get('/api/v1/permissions', controller.v1.permissions.findAll);
  router.get('/api/v1/permissions/:id', controller.v1.permissions.findOne);
  router.delete('/api/v1/permissions/:id', controller.v1.permissions.destroy);

  // 角色-菜单关系
  router.post('/api/v1/role-menus', controller.v1.roleMenus.create);
  router.put('/api/v1/role-menus/:id', controller.v1.roleMenus.update);
  router.get('/api/v1/role-menus', controller.v1.roleMenus.findAll);
  router.get('/api/v1/role-menus/:id', controller.v1.roleMenus.findOne);
  router.delete('/api/v1/role-menus/:id', controller.v1.roleMenus.destroy);
  router.post('/api/v1/role/:role_id/menus', controller.v1.roleMenus.bulkMenus);

  // 角色-资源关系
  router.post('/api/v1/role-permissions', controller.v1.rolePermissions.create);
  router.put('/api/v1/role-permissions/:id', controller.v1.rolePermissions.update);
  router.get('/api/v1/role-permissions', controller.v1.rolePermissions.findAll);
  router.get('/api/v1/role-permissions/:id', controller.v1.rolePermissions.findOne);
  router.delete('/api/v1/role-permissions/:id', controller.v1.rolePermissions.destroy);
  router.post('/api/v1/role/:role_id/permissions', controller.v1.rolePermissions.bulkPremissions);

  // 部门
  router.post('/api/v1/departments', controller.v1.departments.create);
  router.put('/api/v1/departments/:id', controller.v1.departments.update);
  router.get('/api/v1/departments', controller.v1.departments.findAll);
  router.get('/api/v1/departments/:id', controller.v1.departments.findOne);
  router.delete('/api/v1/departments/:id', controller.v1.departments.destroy);

  // 工单
  router.post('/api/v1/work-orders', controller.v1.workOrders.create);
  router.put('/api/v1/work-orders/:sn', controller.v1.workOrders.update);
  router.get('/api/v1/work-orders', controller.v1.workOrders.findAll);
  router.get('/api/v1/work-orders/:sn', controller.v1.workOrders.findOne);
  router.delete('/api/v1/work-orders/:sn', controller.v1.workOrders.destroy);

  // 巡点
  router.post('/api/v1/patrol-points', controller.v1.patrolPoints.create);
  router.put('/api/v1/patrol-points/:sn', controller.v1.patrolPoints.update);
  router.get('/api/v1/patrol-points', controller.v1.patrolPoints.findAll);
  router.get('/api/v1/patrol-points/:sn', controller.v1.patrolPoints.findOne);
  router.delete('/api/v1/patrol-points/:sn', controller.v1.patrolPoints.destroy);

  // 巡检
  router.post('/api/v1/inspections', controller.v1.inspections.create);
  router.put('/api/v1/inspections/:sn', controller.v1.inspections.update);
  router.get('/api/v1/inspections', controller.v1.inspections.findAll);
  router.get('/api/v1/inspections/:sn', controller.v1.inspections.findOne);
  router.delete('/api/v1/inspections/:sn', controller.v1.inspections.destroy);

  // 用户关注报警点位
  router.post('/api/v1/user-alarm-tags', controller.v1.userAlarmTags.bulkOperation);
  router.get('/api/v1/user-alarm-tags', controller.v1.userAlarmTags.findAll);
};
