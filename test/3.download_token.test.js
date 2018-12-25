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
const common = require('./common');
const qiniu_auth = require('../');

describe('3. download_token（下载凭证）相关测试', function(){
  this.timeout(20000);
  before(async () => {
    bucketName = Date.now() + '';
    await common.createBucket(bucketName, qiniu_config);
    await common.uploadFile(__filename, bucketName, 'test.js', qiniu_config);
    await common.private(bucketName, qiniu_config);
    domain = await common.domain(bucketName, qiniu_config);
  });
  it('使用下载凭证下载私有文件', async function(){
    let url = 'http://' + domain + '/test.js';
    let writeStrem = fs.createWriteStream(__dirname + '/resource/download.test.js');
    // 不使用下载凭证下载时
    let result_1 = await rp({ url });
    expect(result_1.error === 'download token not specified').to.be.ok;

    // 使用下载凭证下载时
    let realUrl = qiniu_auth.download_token.call(qiniu_config, { url });
    await rp({ url: realUrl, pipe: writeStrem });
    let before = fs.readFileSync(__filename).toString();
    let after = fs.readFileSync(__dirname + '/resource/download.test.js').toString();
    expect(before === after).to.be.ok;
  });
  after(async () => {
    await common.delBucket(bucketName, qiniu_config);
  });
});