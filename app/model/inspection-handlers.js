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
    handler: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "处理人",
      field: "handler"
    },
    sn: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "巡检编号",
      field: "sn"
    }
  };
  const options = {
    tableName: "inspection_handlers",
    comment: "",
    indexes: []
  };
  const InspectionHandlersModel = sequelize.define("inspection_handlers_model", attributes, options);
  return InspectionHandlersModel;
};