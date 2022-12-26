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
      field: "id"
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "资源名",
      field: "name"
    },
    mark: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "标识码",
      field: "mark"
    },
    mark_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "标识码中文名",
      field: "mark_name"
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "路径",
      field: "url"
    },
    action: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "动作",
      field: "action"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "描述",
      field: "description"
    },
    state: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: "状态.1为true,0为false",
      field: "state"
    },
    authentication: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: "是否需要认证.1为true,0为false",
      field: "authentication"
    },
    authorization: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: "是否需要授权.1为true,0为false",
      field: "authorization"
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "create_at"
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "update_at"
    }
  };
  const options = {
    tableName: "permissions",
    comment: "",
    indexes: []
  };
  const PermissionsModel = sequelize.define("permissions_model", attributes, options);
  return PermissionsModel;
};