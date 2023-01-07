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
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "sn"
    }
  };
  const options = {
    tableName: "inspection_task_handlers",
    comment: "",
    indexes: []
  };
  const InspectionTaskHandlersModel = sequelize.define("inspection_task_handlers_model", attributes, options);
  return InspectionTaskHandlersModel;
};