'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'name',
    },
  };
  const options = {
    tableName: 'test_flake',
    comment: '',
    indexes: [],
  };
  const TestFlakeModel = sequelize.define('test_flake_model', attributes, options);
  return TestFlakeModel;
};
