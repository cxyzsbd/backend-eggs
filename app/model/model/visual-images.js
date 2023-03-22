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
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '图片url',
      field: 'url',
    },
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '类型：1：大屏；2：流程图',
      field: 'type',
    },
  };
  const options = {
    tableName: 'visual_images',
    comment: '',
    indexes: [],
  };
  const VisualImagesModel = sequelize.define('visual_images_model', attributes, options);
  return VisualImagesModel;
};
