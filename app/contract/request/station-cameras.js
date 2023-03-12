'use strict';

const body = {
  stationCameraId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationCameraBodyReq: {
    name: {
      type: 'string',
      max: 60,
      required: true,
      description: '设备名称',
    },
    station_id: {
      type: 'number',
      required: true,
      description: '站点id',
    },
    deviceSerial: {
      type: 'string',
      max: 30,
      required: true,
      description: '设备序列号',
    },
    photo_interval: {
      type: 'number',
      required: false,
      description: '设备抓拍周期,单位：秒',
    },
  },

};
module.exports = {
  ...body,
  updateStationCameraBodyReq: {
    ...body.stationCameraId,
    name: {
      type: 'string',
      max: 60,
      required: false,
      description: '设备名称',
    },
    station_id: {
      type: 'number',
      required: false,
      description: '盒子访问码',
    },
    deviceSerial: {
      type: 'string',
      max: 30,
      required: false,
      description: '设备序列号',
    },
    photo_interval: {
      type: 'number',
      required: false,
      description: '设备抓拍周期,单位：秒',
    },
  },
};
