module.exports = class SMS {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
  }

  async send({ mobile, others2, others1, other_number1, other_number2 }) {
    const { ctx, app } = this;
    const { md5 } = app.utils.tools;
    const tKey = parseInt(new Date().getTime() / 1000);
    let res = await ctx.curl('https://api.mix2.zthysms.com/v2/sendSmsTp', {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
      },
      dataType: 'json',
      data: {
        username: 'lkyshy',
        password: md5(`f9f156a6646347ca972bf17c262ab255${tKey}`),
        tKey,
        tpId: '102988',
        signature: '【赢众智慧运维平台】',
        ext: '',
        extend: '',
        records: [
          {
            mobile,
            tpContent: {
              others2,
              others1,
              other_number1,
              other_number2,
            },
          },
        ],
      },
    }).catch(err => false);
    return res;
  }

  async generateCode() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
};
