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
const common = require('./common');
const qiniu_auth = require('../');

describe('2. access_token（管理凭证）相关测试', function(){
  before(async () => {
    bucketName = Date.now() + '';
    await common.createBucket(bucketName, qiniu_config);
  });
  it('只有path参数时，获取管理凭证', async function(){
    // 获取授权
    let auth = qiniu_auth.access_token.call(qiniu_config, { path: '/buckets' });
    // 获取储存空间列表请求
    let result = await rp({
      url: 'http://rs.qbox.me/buckets',
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    });
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
  it('有path和query参数时，获取管理凭证', async function(){
    // 设置path和query
    let path = '/v6/domain/list';
    let query = 'tbl=' + bucketName;
    // 获取授权
    let auth = qiniu_auth.access_token.call(qiniu_config, { path, query });
    // 获取储存空间域名
    let result = await rp({
      url: 'http://api.qiniu.com' + path + '?' + query,
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    });
    expect(result.error).to.be.undefined;
    expect(result).to.be.an('array');
  });
  it('有path和body参数时，获取管理凭证', async function(){
    // 设置path和query
    let path = '/private';
    let body = {
      bucket: bucketName,
      private: 1
    };
    // 获取授权
    let auth = qiniu_auth.access_token.call(qiniu_config, { path, body });
    // 设置 Bucket 访问权限
    let result = await rp({
      url: 'http://uc.qbox.me' + path,
      method: 'POST',
      form: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': auth
      }
    });
    expect(result.error).to.be.undefined;
  });
  after(async () => {
    await common.delBucket(bucketName, qiniu_config);
  });
});