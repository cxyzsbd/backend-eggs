'use strict';

const body = {
  smsBodyReq: {
    others2: {
      type: 'string',
      required: true,
    },
    others1: {
      type: 'string',
      required: true,
    },
    other_number1: {
      type: 'string',
      required: true,
    },
  },
};

module.exports = {
  ...body,
};
