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

const fs = require('fs');
const expect = require('chai').expect;
const rp = require('node-request-slim').promise;
const qiniu_config = require('./resource/qiniu.config');
const qiniu_auth = require('../lib');
const debug = require('debug')('test');
const common = require('./common');

describe('5. upload_token（上传凭证）相关测试', function(){
  this.timeout(20000);
  before(async function(){
    bucketName = Date.now() + '';
    await common.createBucket(bucketName, qiniu_config);
  });

  it('使用上传凭证上传文件', async () => {
    let fileName = 'qiniu_auth.js';
    let auth = qiniu_auth.upload_token.call(qiniu_config, { scope: bucketName + ':' + fileName, returnBody: '{"name": $(fname) }' });
    let request_options = {
      method: 'POST',
      url: 'http://up-z0.qiniup.com',
      formData: {
        scope: bucketName + ':' + fileName,
        key: fileName, fileName: fileName,
        token: auth, file: fs.createReadStream(__filename)
      }
    };
    let result = await rp(request_options);
    expect(result.name).to.be.a('string');
  });

  after(async () => {
    await common.delBucket(bucketName, qiniu_config);
  });
});