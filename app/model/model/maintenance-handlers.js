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
    handler: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '处理人',
      field: 'handler',
    },
    maintenance_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '保养编号',
      field: 'maintenance_id',
    },
  };
  const options = {
    tableName: 'maintenance_handlers',
    comment: '',
    indexes: [],
  };
  const MaintenanceHandlersModel = sequelize.define('maintenance_handlers_model', attributes, options);
  return MaintenanceHandlersModel;
};
