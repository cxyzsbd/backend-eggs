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
      comment: 'id',
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备模型名称',
      field: 'name',
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备类型',
      field: 'type',
    },
    brand: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备厂家/品牌',
      field: 'brand',
    },
    model: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '型号',
      field: 'model',
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '描述',
      field: 'desc',
    },
    img: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '照片url',
      field: 'img',
    },
    department_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '部门id',
      field: 'department_id',
    },
    company_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
    creator: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '创建人',
      field: 'creator',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'create_at',
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'update_at',
    },
  };
  const options = {
    tableName: 'device_models',
    comment: '',
    indexes: [],
  };
  const DeviceModelsModel = sequelize.define('device_models_model', attributes, options);
  DeviceModelsModel.associate = () => {
    DeviceModelsModel.hasMany(app.model.DeviceModelTags, { foreignKey: 'model_id', sourceKey: 'id', as: 'attrs' });
  };
  return DeviceModelsModel;
};
