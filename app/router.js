`use strict`;

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const apiV1 = '/api/v1';
  router.get('/', controller.home.index);
  router.redirect('/doc', '/swagger-ui.html', 302);

  // 用户
  router.post(`${apiV1}/users/login`, controller.v1.users.login);
  router.post(`${apiV1}/users/refresh-token`, controller.v1.users.refreshToken);
  router.post(`${apiV1}/users`, controller.v1.users.create);
  router.put(`${apiV1}/users/:id`, controller.v1.users.update);
  router.post(`${apiV1}/users/person-info`, controller.v1.users.updateInfo);
  router.post(`${apiV1}/users/update-psw`, controller.v1.users.updatePassword);
  router.delete(`${apiV1}/users/:id`, controller.v1.users.destroy);
  router.get(`${apiV1}/users/:id`, controller.v1.users.findOne);
  router.get(`${apiV1}/users`, controller.v1.users.findAll);
  router.get(`${apiV1}/user-info`, controller.v1.users.getInfo);
  router.get(`${apiV1}/user-menus`, controller.v1.users.getMenus);
  router.get(`${apiV1}/permissions/:id/users`, controller.v1.users.getUsersByPermission);

  // 角色
  router.post(`${apiV1}/roles`, controller.v1.roles.create);
  router.put(`${apiV1}/roles/:id`, controller.v1.roles.update);
  router.get(`${apiV1}/roles`, controller.v1.roles.findAll);
  router.get(`${apiV1}/roles/:id`, controller.v1.roles.findOne);
  router.delete(`${apiV1}/roles/:id`, controller.v1.roles.destroy);
  // router.put(`${apiV1}/roles/:id/is_default`, controller.v1.roles.updateIsDefault);

  // 用户-角色
  router.get(`${apiV1}/user/:user_id/roles`, controller.v1.userRoles.findAll);// 获取用户所有角色
  router.post(`${apiV1}/user/:user_id/roles`, controller.v1.userRoles.bulkRoles);// 批量增删用户角色

  // 菜单
  router.post(`${apiV1}/menus`, controller.v1.menus.create);
  router.put(`${apiV1}/menus/:id`, controller.v1.menus.update);
  router.get(`${apiV1}/menus`, controller.v1.menus.findAll);
  router.get(`${apiV1}/menus/:id`, controller.v1.menus.findOne);
  router.delete(`${apiV1}/menus/:id`, controller.v1.menus.destroy);
  router.get(`${apiV1}/users/:id/menus`, controller.v1.menus.userMenus);// 没测试

  // 资源
  router.post(`${apiV1}/permissions`, controller.v1.permissions.create);
  router.put(`${apiV1}/permissions/:id`, controller.v1.permissions.update);
  router.get(`${apiV1}/permissions`, controller.v1.permissions.findAll);
  router.get(`${apiV1}/permissions/:id`, controller.v1.permissions.findOne);
  router.delete(`${apiV1}/permissions/:id`, controller.v1.permissions.destroy);

  // 角色-菜单关系
  router.post(`${apiV1}/role-menus`, controller.v1.roleMenus.create);
  router.put(`${apiV1}/role-menus/:id`, controller.v1.roleMenus.update);
  router.get(`${apiV1}/role-menus`, controller.v1.roleMenus.findAll);
  router.get(`${apiV1}/role-menus/:id`, controller.v1.roleMenus.findOne);
  router.delete(`${apiV1}/role-menus/:id`, controller.v1.roleMenus.destroy);
  router.post(`${apiV1}/role/:role_id/menus`, controller.v1.roleMenus.bulkMenus);

  // 角色-资源关系
  router.post(`${apiV1}/role-permissions`, controller.v1.rolePermissions.create);
  router.put(`${apiV1}/role-permissions/:id`, controller.v1.rolePermissions.update);
  router.get(`${apiV1}/role-permissions`, controller.v1.rolePermissions.findAll);
  router.get(`${apiV1}/role-permissions/:id`, controller.v1.rolePermissions.findOne);
  router.delete(`${apiV1}/role-permissions/:id`, controller.v1.rolePermissions.destroy);
  router.post(`${apiV1}/role/:role_id/permissions`, controller.v1.rolePermissions.bulkPremissions);

  // 部门
  router.post(`${apiV1}/departments`, controller.v1.departments.create);
  router.put(`${apiV1}/departments/:id`, controller.v1.departments.update);
  router.get(`${apiV1}/departments`, controller.v1.departments.findAll);
  router.get(`${apiV1}/departments/:id`, controller.v1.departments.findOne);
  router.delete(`${apiV1}/departments/:id`, controller.v1.departments.destroy);

  // 工单
  router.post(`${apiV1}/work-orders`, controller.v1.workOrders.create);
  router.put(`${apiV1}/work-orders/:id`, controller.v1.workOrders.update);
  router.patch(`${apiV1}/work-orders/:id/approval`, controller.v1.workOrders.approval);
  router.patch(`${apiV1}/work-orders/:id/confirm`, controller.v1.workOrders.confirm);
  router.patch(`${apiV1}/work-orders/:id/complete`, controller.v1.workOrders.complete);
  // 小程序不支持patch，增加put方式
  router.put(`${apiV1}/work-orders/:id/approval`, controller.v1.workOrders.approval);
  router.put(`${apiV1}/work-orders/:id/confirm`, controller.v1.workOrders.confirm);
  router.put(`${apiV1}/work-orders/:id/complete`, controller.v1.workOrders.complete);
  router.get(`${apiV1}/work-orders`, controller.v1.workOrders.findAll);
  router.get(`${apiV1}/work-orders/:id`, controller.v1.workOrders.findOne);
  router.delete(`${apiV1}/work-orders/:id`, controller.v1.workOrders.destroy);

  // 巡检
  router.post(`${apiV1}/inspections`, controller.v1.inspections.create);
  router.put(`${apiV1}/inspections/:id`, controller.v1.inspections.update);
  router.get(`${apiV1}/inspections`, controller.v1.inspections.findAll);
  router.get(`${apiV1}/inspections/:id`, controller.v1.inspections.findOne);
  router.delete(`${apiV1}/inspections/:id`, controller.v1.inspections.destroy);
  router.patch(`${apiV1}/inspections/:id/stop`, controller.v1.inspections.stop);
  router.patch(`${apiV1}/inspections/:id/start`, controller.v1.inspections.start);

  // 巡检任务
  router.get(`${apiV1}/inspection-tasks`, controller.v1.inspectionTasks.findAll);
  router.get(`${apiV1}/inspection-tasks/:id`, controller.v1.inspectionTasks.findOne);
  router.delete(`${apiV1}/inspection-tasks/:id`, controller.v1.inspectionTasks.destroy);

  // 用户关注报警点位
  router.post(`${apiV1}/user-alarm-tags`, controller.v1.userAlarmTags.bulkOperation);
  router.get(`${apiV1}/user-alarm-tags`, controller.v1.userAlarmTags.findAll);

  // 设备台账
  router.post(`${apiV1}/equipment-accounts`, controller.v1.equipmentAccounts.create);
  router.put(`${apiV1}/equipment-accounts/:id`, controller.v1.equipmentAccounts.update);
  router.get(`${apiV1}/equipment-accounts`, controller.v1.equipmentAccounts.findAll);
  router.get(`${apiV1}/equipment-accounts/:id`, controller.v1.equipmentAccounts.findOne);
  router.delete(`${apiV1}/equipment-accounts/:id`, controller.v1.equipmentAccounts.destroy);

  // 工具
  router.post(`${apiV1}/tools`, controller.v1.tools.create);
  router.put(`${apiV1}/tools/:id`, controller.v1.tools.update);
  router.get(`${apiV1}/tools`, controller.v1.tools.findAll);
  router.get(`${apiV1}/tools/:id`, controller.v1.tools.findOne);
  router.delete(`${apiV1}/tools/:id`, controller.v1.tools.destroy);
  router.post(`${apiV1}/tools/:tool_id/inventory`, controller.v1.tools.inventory);
  router.get(`${apiV1}/tools/:tool_id/inventory-records`, controller.v1.tools.inventoryRecords);

  // 备品备件
  router.post(`${apiV1}/spare-parts`, controller.v1.spareParts.create);
  router.put(`${apiV1}/spare-parts/:id`, controller.v1.spareParts.update);
  router.get(`${apiV1}/spare-parts`, controller.v1.spareParts.findAll);
  router.get(`${apiV1}/spare-parts/:id`, controller.v1.spareParts.findOne);
  router.delete(`${apiV1}/spare-parts/:id`, controller.v1.spareParts.destroy);
  router.post(`${apiV1}/spare-parts/:spare_parts_id/inventory`, controller.v1.spareParts.inventory);
  router.get(`${apiV1}/spare-parts/:spare_parts_id/inventory-records`, controller.v1.spareParts.inventoryRecords);

  // 数据转发接口路由
  router.post(/^\/api\/v1\/box-data\/([\w-.\/]+)$/, controller.v1.boxData.dataAndAlarm);
  router.get(/^\/api\/v1\/box-data\/([\w-.\/]+)$/, controller.v1.boxData.dataAndAlarm);

  // 通用转发接口路由
  router.post(/^\/api\/v1\/data-forward\/([\w-.\/]+)$/, controller.v1.dataForward.dataForward);
  router.get(/^\/api\/v1\/data-forward\/([\w-.\/]+)$/, controller.v1.dataForward.dataForward);

  // 无token转发接口路由
  router.post(/^\/api\/v1\/api-forward\/([\w-.\/]+)$/, controller.v1.dataForward.apiForward);
  router.get(/^\/api\/v1\/api-forward\/([\w-.\/]+)$/, controller.v1.dataForward.apiForward);

  // 无token转发接口路由
  router.post(/^\/api\/v1\/cpp-forward\/([\w-.\/]+)$/, controller.v1.dataForward.cppForward);
  router.get(/^\/api\/v1\/cpp-forward\/([\w-.\/]+)$/, controller.v1.dataForward.cppForward);

  // 设备模型
  router.post(`${apiV1}/device-models`, controller.v1.deviceModels.create);
  router.put(`${apiV1}/device-models/:id`, controller.v1.deviceModels.update);
  router.get(`${apiV1}/device-models`, controller.v1.deviceModels.findAll);
  router.get(`${apiV1}/device-models/:id`, controller.v1.deviceModels.findOne);
  router.delete(`${apiV1}/device-models/:id`, controller.v1.deviceModels.destroy);

  // 设备
  // router.post(`${apiV1}/devices`, controller.v1.devices.create);
  router.put(`${apiV1}/devices/:id`, controller.v1.devices.update);
  router.get(`${apiV1}/devices`, controller.v1.devices.findAll);
  router.get(`${apiV1}/devices/:id`, controller.v1.devices.findOne);
  router.delete(`${apiV1}/devices/:id`, controller.v1.devices.destroy);
  router.post(`${apiV1}/model-to-device`, controller.v1.devices.modelToDevice);

  // 设备模型绑定点位
  router.post(`${apiV1}/device-model-tags`, controller.v1.deviceModelTags.create);
  router.put(`${apiV1}/device-model-tags/:id`, controller.v1.deviceModelTags.update);
  router.get(`${apiV1}/device-model-tags`, controller.v1.deviceModelTags.findAll);
  router.delete(`${apiV1}/device-model-tags/:id`, controller.v1.deviceModelTags.destroy);

  // 设备绑定点位
  router.post(`${apiV1}/device-tags`, controller.v1.deviceTags.create);
  router.put(`${apiV1}/device-tags/:id`, controller.v1.deviceTags.update);
  router.get(`${apiV1}/device-tags`, controller.v1.deviceTags.findAll);
  router.delete(`${apiV1}/device-tags/:id`, controller.v1.deviceTags.destroy);

  // 超管管理公司
  router.post(`${apiV1}/super-user/companys`, controller.v1.companys.create);
  router.put(`${apiV1}/super-user/companys/:id`, controller.v1.companys.update);
  router.get(`${apiV1}/super-user/companys`, controller.v1.companys.findAll);
  router.get(`${apiV1}/super-user/companys/:id`, controller.v1.companys.findOne);
  router.post(`${apiV1}/super-user/add-admin`, controller.v1.companys.addAdmin);

  // 站点
  router.post(`${apiV1}/stations`, controller.v1.stations.create);
  router.put(`${apiV1}/stations/:id`, controller.v1.stations.update);
  router.get(`${apiV1}/stations`, controller.v1.stations.findAll);
  router.get(`${apiV1}/stations/:id`, controller.v1.stations.findOne);
  router.delete(`${apiV1}/stations/:id`, controller.v1.stations.destroy);

  // 文件
  router.post(`${apiV1}/files`, controller.v1.files.upload);

  // 流程图
  router.post(`${apiV1}/flows`, controller.v1.flows.create);
  router.post(`${apiV1}/flows/:id/files`, controller.v1.flows.uploadFile);
  router.put(`${apiV1}/flows/:id`, controller.v1.flows.update);
  router.get(`${apiV1}/flows`, controller.v1.flows.findAll);
  router.get(`${apiV1}/flows/:id`, controller.v1.flows.findOne);
  router.delete(`${apiV1}/flows/:id`, controller.v1.flows.destroy);
  router.delete(`${apiV1}/recovery-flows/:id`, controller.v1.flows.forceDelete);
  router.patch(`${apiV1}/recovery-flows/:id`, controller.v1.flows.recoveryFlows);
  router.get(`${apiV1}/recovery-flows`, controller.v1.flows.recoveryFlowsList);

  // 可视化大屏
  router.post(`${apiV1}/screens`, controller.v1.screens.create);
  router.post(`${apiV1}/screens/:id/files`, controller.v1.screens.uploadFile);
  router.put(`${apiV1}/screens/:id`, controller.v1.screens.update);
  router.get(`${apiV1}/screens`, controller.v1.screens.findAll);
  router.get(`${apiV1}/screens/:id`, controller.v1.screens.findOne);
  router.delete(`${apiV1}/screens/:id`, controller.v1.screens.destroy);
  router.delete(`${apiV1}/recovery-screens/:id`, controller.v1.screens.forceDelete);
  router.patch(`${apiV1}/recovery-screens/:id`, controller.v1.screens.recoveryScreens);
  router.get(`${apiV1}/recovery-screens`, controller.v1.screens.recoveryScreensList);

  // 小程序
  router.post(`${apiV1}/wx-mini/login`, controller.v1.wechat.login);
  router.post(`${apiV1}/wx-mini/bind`, controller.v1.wechat.bind);

  // 网关
  router.get(`${apiV1}/box-info`, controller.v1.boxInfo.findAll);
  router.get(`${apiV1}/box-info/:id`, controller.v1.boxInfo.findOne);

  // 站点绑定摄像头
  router.get(`${apiV1}/station-cameras/list`, controller.v1.stationCameras.findAll);
  router.get(`${apiV1}/station-cameras/play-url`, controller.v1.stationCameras.getCameraPlayAddress);
  router.post(`${apiV1}/station-cameras`, controller.v1.stationCameras.create);
  router.put(`${apiV1}/station-cameras/:id`, controller.v1.stationCameras.update);
  router.delete(`${apiV1}/station-cameras/:id`, controller.v1.stationCameras.destroy);

  // 设备抓拍图
  router.get(`${apiV1}/camera-photos`, controller.v1.cameraPhotos.findAll);

  // 站点资料
  router.post(`${apiV1}/station-files`, controller.v1.stationFiles.create);
  router.put(`${apiV1}/station-files/:id`, controller.v1.stationFiles.update);
  router.get(`${apiV1}/station-files`, controller.v1.stationFiles.findAll);
  router.get(`${apiV1}/station-files/:id`, controller.v1.stationFiles.findOne);
  router.delete(`${apiV1}/station-files/:id`, controller.v1.stationFiles.destroy);

  // 对象
  router.post(`${apiV1}/station-tags`, controller.v1.stationTags.create);
  router.put(`${apiV1}/station-tags/:id`, controller.v1.stationTags.update);
  router.get(`${apiV1}/station-tags`, controller.v1.stationTags.findAll);
  router.get(`${apiV1}/station-tags/:id`, controller.v1.stationTags.findOne);
  router.delete(`${apiV1}/station-tags/:id`, controller.v1.stationTags.destroy);

  // 用户订阅属性
  router.post(`${apiV1}/user-sub-attrs`, controller.v1.userSubAttrs.bulkOperation);
  router.get(`${apiV1}/user-sub-attrs`, controller.v1.userSubAttrs.findAll);

  // 角色绑定大屏
  router.post(`${apiV1}/role-screens`, controller.v1.roleScreens.bulkOperation);
  router.get(`${apiV1}/role-screens`, controller.v1.roleScreens.findAll);

  // 用户默认大屏
  router.post(`${apiV1}/user-screens`, controller.v1.userScreens.create);
  router.get(`${apiV1}/user-screens`, controller.v1.userScreens.findOne);
  router.delete(`${apiV1}/user-screens/:id`, controller.v1.userScreens.destroy);

  // 操作记录
  router.get(`${apiV1}/operation-records`, controller.v1.operationRecords.findAll);
  router.delete(`${apiV1}/operation-records/:id`, controller.v1.operationRecords.destroy);

  // 超管统计
  router.get(`${apiV1}/statistics/box-count`, controller.v1.statistics.boxCount);
  router.get(`${apiV1}/statistics/data-source-count`, controller.v1.statistics.dataSourceCount);
  router.get(`${apiV1}/statistics/user-count`, controller.v1.statistics.userCount);
  router.get(`${apiV1}/statistics/company-user-count`, controller.v1.statistics.companyUserCount);
  router.get(`${apiV1}/statistics/company-data-source-count`, controller.v1.statistics.companyDataSourceCount);

  // 报警
  router.post(`${apiV1}/alarms`, controller.v1.alarms.create);

  // 校验金蝶用户
  router.get(`${apiV1}/kingdee/validate-user`, controller.v1.kingdee.validateUser);
  router.post(`${apiV1}/kingdee/synchronize-user`, controller.v1.kingdee.synchronizeUser);

  // 可视化图片
  router.get(`${apiV1}/visual-images`, controller.v1.visualImages.findAll);
  router.delete(`${apiV1}/visual-images/:id`, controller.v1.visualImages.destroy);
};
