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
    station_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '站点id',
      field: 'station_id',
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
  };
  const options = {
    tableName: 'station_attrs',
    comment: '',
    indexes: [],
  };
  const StationAttrsModel = sequelize.define('station_attrs_model', attributes, options);
  StationAttrsModel.associate = () => {
    StationAttrsModel.hasOne(app.model.DeviceTags, { foreignKey: 'id', sourceKey: 'attr_id', as: 'attr' });
  };
  return StationAttrsModel;
};
