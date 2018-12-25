const hmac_sha1 = require('./hmac_sha1');
const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * 获取上传凭证
 * 参考网址：https://developer.qiniu.com/kodo/manual/1208/upload-token
 * @param {object} options 必选
 * @param {string} options.scope 必选，储存空间名称 + ':' + 文件名称
 * @param {date} options.deadline 可选，过期时间，Unix时间戳，默认的过期时间是1个小时
 * @param {string} options.returnBody 可选，最后想得到 图片的名称、大小、宽高和校验值等值
 * @param {string} options.AccessKey 可选，七牛云给你的密钥之一，this.AccessKey和options.AccessKey必须要选一
 * @param {string} options.SecretKey 可选，七牛云给你的密钥之一，this.SecretKey和options.SecretKey必须要选一
 */
module.exports = function(options){
  let { AccessKey, SecretKey, scope, returnBody, deadline } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;

  // 1.构造上传策略
  // 默认的过期时间是1个小时
  if (!deadline) {
    let now = new Date();
    now.setHours(now.getHours() + 1);
    deadline = deadline || Math.round(now.getTime() / 1000);
  }

  // 2.将上传策略序列化成为JSON
  let putPolicy = JSON.stringify({scope, deadline, returnBody});

  // 3.对 JSON 编码的上传策略进行URL 安全的 Base64 编码，得到待签名字符串
  let encodedPutPolicy = new Buffer(putPolicy).toString('base64');

  // 4.使用访问密钥（AK/SK）对上一步生成的待签名字符串计算HMAC-SHA1签名
  let sign = hmac_sha1(SecretKey, encodedPutPolicy);

  // 5.对签名进行URL安全的Base64编码
  let encodedSign = urlsafe_base64_encode(sign);

  // 6.将访问密钥（AK/SK）、encodedSign 和 encodedPutPolicy 用英文符号 : 连接起来
  let uploadToken = AccessKey + ':' + encodedSign + ':' + encodedPutPolicy;

  return uploadToken;
};