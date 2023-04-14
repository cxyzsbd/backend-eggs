'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: '任务id',
      field: 'id',
    },
    maintenance_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '保养id',
      field: 'maintenance_id',
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '任务名称',
      field: 'name',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '开始时间',
      field: 'start_time',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '结束时间',
      field: 'end_time',
    },
    company_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '状态（1:待确认；2:已确认，执行中；3:已完成；）',
      field: 'status',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'create_at',
    },
  };
  const options = {
    tableName: 'maintenance_tasks',
    comment: '',
    indexes: [],
  };
  const MaintenanceTasksModel = sequelize.define('maintenance_tasks_model', attributes, options);
  MaintenanceTasksModel.associate = function() {
    MaintenanceTasksModel.hasOne(app.model.Maintenances, { foreignKey: 'id', sourceKey: 'maintenance_id' });
    MaintenanceTasksModel.belongsToMany(app.model.Users, {
      as: 'handlers',
      through: app.model.MaintenanceTaskHandlers,
      foreignKey: 'task_id',
      otherKey: 'handler',
    });
  };
  return MaintenanceTasksModel;
};
