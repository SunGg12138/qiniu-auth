const { URL } = require('url');
const qs = require('querystring');
const hmac_sha1 = require('./hmac_sha1');
const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * 获取下载凭证，返回的是最后的下载 URL
 * 参考网址：https://developer.qiniu.com/kodo/manual/1202/download-token
 * @param {object} options 必选
 * @param {string} options.url 必选，请求的url
 * @param {date} options.deadline 可选，过期时间，Unix时间戳，默认的过期时间是1个小时
 * @param {string || object} options.query 可选，请求的query部分，如果是object会被qs.stringify，如果指定query参数会替换掉原url的query部分
 * @param {string} options.AccessKey 可选，七牛云给你的密钥之一，this.AccessKey和options.AccessKey必须要选一
 * @param {string} options.SecretKey 可选，七牛云给你的密钥之一，this.SecretKey和options.SecretKey必须要选一
 */
module.exports = function(options){
  let { AccessKey, SecretKey, url, deadline, query } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;

  // 参数校验
  if (!AccessKey || !SecretKey || !url) {
    throw new Error('生成下载凭证出错：AccessKey、SecretKey、url3个参数都是必选');
  }
  // url转化成URL对象
  url = new URL(url);
  // 如果指定query，会替换掉原url的query部分
  query = query || url.search.substr(1);
  // query如果是object会被qs.stringify
  if (typeof query === 'object') query = qs.stringify(query);
  
  // 1.构造下载 URL
  let DownloadUrl = url.origin + url.pathname;

  // 2.为下载 URL 加上过期时间 e 参数，Unix时间戳
  if (!deadline) {
    // 默认的过期时间是1个小时
    let now = new Date();
    now.setHours(now.getHours() + 1);
    deadline = Math.round(now.getTime() / 1000);
  }
  // 拼接过期时间
  DownloadUrl += '?e=' + deadline;

  // 带有参数的情况下,需要将query一起进行签名
  if (options.query) DownloadUrl += '&' + query;

  // 3.对上一步得到的 URL 字符串计算HMAC-SHA1签名（假设访问密钥（AK/SK）是 MY_SECRET_KEY），并对结果做URL 安全的 Base64 编码：
  let sign = hmac_sha1(SecretKey, DownloadUrl);
  let encodedSign = urlsafe_base64_encode(sign);

  // 4.将访问密钥（AK/SK）（假设是 MY_ACCESS_KEY）与上一步计算得到的结果用英文符号 : 连接起来
  let download_token = AccessKey + ':' + encodedSign;

  // 5.将上述 Token 拼接到含过期时间参数 e 的 DownloadUrl 之后，作为最后的下载 URL
  let RealDownloadUrl = DownloadUrl + '&token=' + download_token;

  return RealDownloadUrl;
};