'use strict';

const body = {
  announcementsId: {
    id: { type: 'string', required: true, description: 'id' },
  },
  announcementsBodyReq: {

  },
};

module.exports = {
  ...body,
  announcementsPutBodyReq: {
    ...body.announcementsId,
    ...body.announcementsBodyReq,
  },
};
