'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'name',
    },
    component: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '0:图纸；1：组件',
      field: 'component',
    },
    station_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '站点id',
      field: 'station_id',
    },
    creator: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'creator',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'create_at',
    },
    department_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '部门id',
      field: 'department_id',
    },
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
  };
  const options = {
    tableName: 'flow_folders',
    comment: '',
    indexes: [],
  };
  const FlowFoldersModel = sequelize.define('flow_folders_model', attributes, options);
  FlowFoldersModel.associate = function() {
    FlowFoldersModel.belongsToMany(app.model.Flows, {
      through: app.model.FlowFolderFlows,
      foreignKey: 'flow_folder_id',
      otherKey: 'flow_id',
      as: 'flows',
    });
  };
  return FlowFoldersModel;
};
