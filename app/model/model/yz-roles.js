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
    tableName: 'yz_roles',
    comment: '',
    indexes: [],
  };
  const YzRolesModel = sequelize.define('yz_roles_model', attributes, options);
  return YzRolesModel;
};
