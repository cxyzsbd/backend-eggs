'use strict';

const body = {
  cameraPhotoId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  cameraPhotoBodyReq: {
    deviceSerial: {
      type: 'string',
      max: 30,
      required: true,
      description: '设备序列号',
    },
    url: {
      type: 'string',
      max: 128,
      required: true,
      description: '抓拍图片url,相对路径',
    },
  },
};
module.exports = {
  ...body,
};
