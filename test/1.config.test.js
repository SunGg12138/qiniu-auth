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
const qiniu_config = require('./resource/qiniu.config');
const rp = require('node-request-slim').promise;
const qiniu_auth = require('../lib');

describe('测试环境', function(){
  it('qiniu.config.json', function(){
    expect(qiniu_config.AccessKey).to.be.a('string');
    expect(qiniu_config.SecretKey).to.be.a('string');
  });
  it('测试AccessKey、SecretKey是否正确', async function(){
    // 获取授权
    let auth = qiniu_auth.access_token.call(qiniu_config, { path: '/buckets' });
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
});