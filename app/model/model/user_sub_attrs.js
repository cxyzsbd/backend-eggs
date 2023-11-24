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
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    user_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户id',
      field: 'user_id',
    },
    attr_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '属性id',
      field: 'attr_id',
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '1:报表；2：曲线；3：曲线对比',
      field: 'type',
    },
  };
  const options = {
    tableName: 'user_sub_attrs',
    comment: '',
    indexes: [],
  };
  const UserSubAttrsModel = sequelize.define('user_sub_attrs_model', attributes, options);
  UserSubAttrsModel.associate = () => {
    UserSubAttrsModel.hasOne(app.model.DeviceTags, { foreignKey: 'id', sourceKey: 'attr_id' });
  };
  return UserSubAttrsModel;
};
