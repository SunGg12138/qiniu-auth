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
const qiniu_auth = require('../');
const debug = require('debug')('test');

describe('4. pandora（API 签名）相关测试', function(){
  it('使用token签名发送请求', async function(){
    // 构建数据内容
    let body = '';
    [{ userName: '小张', age: 12, addresses: "beijing"},
      { userName: '小王', age: 13, addresses: "hangzhou"}
    ].forEach(item => {
      for (let key in item) {
        body += key + '=' + item[key] + '\t';
      }
      body += '\n';
    });
    // 构建请求参数，设置api签名
    let request_options = {
      method: 'POST',
      path: '/v2/repos/' + Date.now() + '/data',
      headers: {
        'content-type': 'text/plain'
      },
      body: body
    };
    request_options.url = 'https://nb-pipeline.qiniuapi.com' + request_options.path;
    // 生成api签名
    request_options.headers['Authorization'] = qiniu_auth.pandora.call(qiniu_config, request_options);

    let result = await rp(request_options);

    debug('使用token签名发送请求并返回：%s', JSON.stringify(result));
    // 因为repoName是不存在的statusCode为404，会报错的，所以这里catch了
    // E18102这个错误只是提示没有repo，但是操作是正确的没有问题的
    expect(/E18102: The specified repo ".+" does not exist/.test(result.error)).to.be.ok;
  });
  it('使用AK/SK签名发送请求', async function(){
    // 构建数据内容
    let body = '';
    [{ userName: '小张', age: 12, addresses: "beijing"},
      { userName: '小王', age: 13, addresses: "hangzhou"}
    ].forEach(item => {
      for (let key in item) {
        body += key + '=' + item[key] + '\t';
      }
      body += '\n';
    });
    // 构建请求参数，设置api签名
    let request_options = {
      method: 'POST',
      path: '/v2/repos/' + Date.now() + '/data',
      headers: {
        'content-type': 'text/plain'
      },
      body: body
    };
    request_options.url = 'https://nb-pipeline.qiniuapi.com' + request_options.path;
    // 生成api签名
    request_options.headers['Authorization'] = qiniu_auth.pandora.AK_SK.call(qiniu_config, request_options);

    let result = await rp(request_options);

    debug('使用AK/SK签名发送请求并返回：%s', JSON.stringify(result));
    // 因为repoName是不存在的statusCode为404，会报错的，所以这里catch了
    // E18102这个错误只是提示没有repo，但是操作是正确的没有问题的
    expect(/E18102: The specified repo ".+" does not exist/.test(result.error)).to.be.ok;
  });
});