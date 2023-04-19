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
      comment: '任务编号',
      field: 'id',
    },
    inspection_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡检编号',
      field: 'inspection_id',
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
    tableName: 'inspection_tasks',
    comment: '',
    indexes: [],
  };
  const InspectionTasksModel = sequelize.define('inspection_tasks_model', attributes, options);
  InspectionTasksModel.associate = function() {
    InspectionTasksModel.hasOne(app.model.Inspections, { foreignKey: 'id', sourceKey: 'inspection_id', as: 'inspection_info' });
    InspectionTasksModel.belongsToMany(app.model.Users, {
      as: 'handlers',
      through: app.model.InspectionTaskHandlers,
      foreignKey: 'task_id',
      otherKey: 'handler',
    });
    InspectionTasksModel.hasMany(app.model.InspectionResults, { foreignKey: 'task_id', sourceKey: 'id', as: 'inspection_results' });
  };
  return InspectionTasksModel;
};
