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
    role_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '角色id',
      field: 'role_id',
    },
    screen_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '大屏id',
      field: 'screen_id',
    },
    company_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'company_id',
    },
  };
  const options = {
    tableName: 'role_screens',
    comment: '',
    indexes: [],
  };
  const RoleScreensModel = sequelize.define('role_screens_model', attributes, options);
  RoleScreensModel.associate = () => {
    RoleScreensModel.hasOne(app.model.Screens, { foreignKey: 'id', sourceKey: 'screen_id' });
  };
  return RoleScreensModel;
};
