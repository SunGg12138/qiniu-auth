const { URL } = require('url');
const qs = require('querystring');
const hmac_sha1 = require('./hmac_sha1');
const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * HTTP 请求鉴权
 * 官方文档：https://developer.qiniu.com/pili/api/2772/http-requests-authentication
 * @param {string} url 必选，请求的url
 * @param {string} method 必选，请求的方法
 * @param {string || object} query 可选，请求的query部分，如果是object会被qs.stringify，如果指定query参数会替换掉原url的query部分
 * @param {object} headers 可选，请求头信息
 * @param {object} body 可选，请求信息
 * @param {string} ContentType 可选，请求的Content-Type
 */
module.exports = function(options){
  let { AccessKey, SecretKey, url, method, query, headers, body, 'Content-Type': ContentType } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;
  if (!AccessKey || !SecretKey || !url || !method) {
    throw new Error('token签名出错：AccessKey、SecretKey、method、url4个参数都是必选');
  }
  // 转换成URL对象
  url = new URL(url);

  // headers默认是空对象
  headers = headers || {};
  // 默认使用指定的query，否则按url的query参数
  query = query || url.search.substr(1);
  // 获取Content-Type
  ContentType = ContentType? ContentType : (headers? headers['Content-Type'] : '');

  // 构造待签名的 Data

  //  1. 添加 Path
  let data = method + ' ' + url.pathname;

  // 2. 添加 Query，前提: Query 存在且不为空
  if (query) data += '?' + (typeof query === 'object'? qs.stringify(query) : query);

  // 3. 添加 Host
  data += "\nHost: " + url.host;

  // 4. 添加 Content-Type，前提: Content-Type 存在且不为空
  if (ContentType) data += "\nContent-Type: " + ContentType;

  // 5. 添加回车
  data += "\n\n";

  // 6. 添加 Body，前提: Content-Length 存在且 Body 不为空，同时 Content-Type 存在且不为空或 "application/octet-stream"
  let bodyOK = ContentType && body;
  let contentTypeOK = ContentType && ContentType !== "application/octet-stream";
  if (bodyOK && contentTypeOK) {
    data += JSON.stringify(body);
  }

  // 计算 HMAC-SHA1 签名，并对签名结果做 URL 安全的 Base64 编码
  let sign = hmac_sha1(SecretKey, data);
  let encodedSign = urlsafe_base64_encode(sign);

  // 将 Qiniu 标识与 AccessKey、encodedSign 拼接得到管理凭证
  let QiniuToken = "Qiniu " + AccessKey + ":" + encodedSign;

  return QiniuToken;
};