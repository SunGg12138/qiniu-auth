try {
  require('./resource/qiniu.config');
} catch (error) {
  throw new Error(`
  先配置你的/test/resource/qiniu.config.json文件再测试
  qiniu.config.json是放置AccessKey和SecretKey的配置文件
  1. 配置你的AccessKey和SecretKey到/test/resource/qiniu.config.default.json 
  2. qiniu.config.default.json 改名为qiniu.config.json
  `);
}

const expect = require('chai').expect;
const rp = require('node-request-slim').promise;
const qiniu_config = require('./resource/qiniu.config');
const qiniu_auth = require('../lib');
const debug = require('debug')('test');
const common = require('./common');

describe('5. qiniu_token（HTTP 请求鉴权）相关测试', function(){
  this.timeout(20000);
  before(async function(){
    bucketName = Date.now() + '';
    await common.createBucket(bucketName, qiniu_config);
    await common.uploadFile(__dirname + '/resource/file.image.test.jpg', bucketName, 'file.image.test.jpg', qiniu_config);
    domain = await common.domain(bucketName, qiniu_config);
  });

  it('使用HTTP 请求鉴权发送请求', async () => {
    // 图片审核
    let request_options = {
      url: 'http://argus.atlab.ai/v1/image/censor',
      method: 'POST',
      body: {
        data: { uri: 'http://' + domain + '/file.image.test.jpg' },
        params: { type: ["pulp", "terror", "politician"], detail: false }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null
      }
    };
    // 设置Authorization
    request_options.headers.Authorization = qiniu_auth.qiniu_token.call(qiniu_config, request_options);

    let result = await rp(request_options);

    expect(result.code === 0).to.be.ok;
    expect(result.result).to.be.an('object');
  });

  after(async () => {
    await common.delBucket(bucketName, qiniu_config);
  });
});