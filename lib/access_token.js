const qs = require('querystring');
const hmac_sha1 = require('./hmac_sha1');
const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * 生成管理凭证
 * 参考网址：https://developer.qiniu.com/kodo/manual/1201/access-token
 * @param {object} options 必选
 * @param {string} options.path 必选，请求的路径
 * @param {string || object} options.query 可选，请求的query部分，如果是object会被qs.stringify
 * @param {string || object} options.form 可选，当 Content-Type 为 application/x-www-form-urlencoded 时的请求内容，如果是object会被qs.stringify
 * @param {string} options.AccessKey 可选，七牛云给你的密钥之一，this.AccessKey和options.AccessKey必须要选一
 * @param {string} options.SecretKey 可选，七牛云给你的密钥之一，this.SecretKey和options.SecretKey必须要选一
 */
module.exports = function(options){
  let { AccessKey, SecretKey, path, query, form } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;

  // 参数校验
  if (!AccessKey || !SecretKey || !path) {
    throw new Error('生成管理凭证出错：AccessKey、SecretKey、path3个参数都是必选');
  }
  // query或form如果是object会被qs.stringify
  if (typeof query === 'object') query = qs.stringify(query);
  if (typeof form === 'object') form = qs.stringify(form);

  // 1.生成待签名的原始字符串
  // 抽取请求 URL 中 \ 或 \?\ 的部分与请求内容部分即 HTTP Body，用 \n 连接起来。如无请求内容，该部分必须为空字符串。
  // 注意：当 Content-Type 为 application/x-www-form-urlencoded 时，签名内容必须包括请求内容。
  let signingStr = path;
  if (query) {
    signingStr += '?' + query + '\n';
  } else {
    signingStr += '\n';
  }
  // form就是当 Content-Type 为 application/x-www-form-urlencoded 时的请求内容
  if (typeof form === 'string') signingStr += form;

  // 2.使用SecertKey对上一步生成的原始字符串计算HMAC-SHA1签名
  let sign = hmac_sha1(SecretKey, signingStr);

  // 3.对签名进行URL 安全的 Base64 编码
  let encodedSign = urlsafe_base64_encode(sign);

  // 4.将 AccessKey 和 encodedSign 用英文符号 : 连接起来
 let  accessToken = AccessKey+ ':' + encodedSign;

 return 'QBox ' + accessToken;
};