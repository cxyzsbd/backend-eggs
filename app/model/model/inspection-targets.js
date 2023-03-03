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
    inspection_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡检编号',
      field: 'inspection_id',
    },
    patrol_point_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡点编号',
      field: 'patrol_point_id',
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡检项，用逗号分隔',
      field: 'items',
      get() {
        const rawValue = this.getDataValue('items');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('items', JSON.stringify(value));
      },
    },
  };
  const options = {
    tableName: 'inspection_targets',
    comment: '',
    indexes: [],
  };
  const InspectionTargetsModel = sequelize.define('inspection_targets_model', attributes, options);
  return InspectionTargetsModel;
};
