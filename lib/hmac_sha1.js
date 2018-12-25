const crypto = require('crypto');

/**
 * HMAC-SHA1签名
 * 官方文档：https://developer.qiniu.com/linking/glossary/5287/linking-hmac-sha1
 */
module.exports = function(key, str){
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(str);
  let sign = hmac.digest();
  return sign;
};