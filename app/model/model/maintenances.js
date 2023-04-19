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
      comment: '计划编号',
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '计划名称',
      field: 'name',
    },
    cycle: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '周期类型（1:单次；2:日；3:周；4:月；5:季度；6:半年；7年度）',
      field: 'cycle',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '开始时间，首次执行时间',
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
    next_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '下次任务时间',
      field: 'next_time',
    },
    duration: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '单次保养持续时间，配合单位，默认1天',
      field: 'duration',
    },
    duration_unit: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '持续时间单位，1:天；2:小时',
      field: 'duration_unit',
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '描述',
      field: 'desc',
    },
    creator: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '创建人',
      field: 'creator',
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
      comment: '状态：1:进行中；2：已停止；3:已完成',
      field: 'status',
    },
    remind_time: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '任务开始前多久提醒，单位秒',
      field: 'remind_time',
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
    update_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'update_at',
    },
    delete_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'delete_at',
    },
  };
  const options = {
    tableName: 'maintenances',
    paranoid: true,
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'delete_at',
    comment: '',
    indexes: [],
  };
  const MaintenancesModel = sequelize.define('maintenances_model', attributes, options);
  MaintenancesModel.associate = function() {
    MaintenancesModel.hasMany(app.model.MaintenanceTasks, { foreignKey: 'maintenance_id', sourceKey: 'id' });
    MaintenancesModel.hasMany(app.model.MaintenanceTargets, { foreignKey: 'maintenance_id', sourceKey: 'id' });
    MaintenancesModel.belongsToMany(app.model.Users, {
      as: 'handlers',
      through: app.model.MaintenanceHandlers,
      foreignKey: 'maintenance_id',
      otherKey: 'handler',
    });
    MaintenancesModel.hasOne(app.model.Users, { foreignKey: 'id', sourceKey: 'creator', as: 'creator_info' });
  };
  return MaintenancesModel;
};
