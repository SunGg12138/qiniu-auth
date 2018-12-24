const hmac_sha1 = require('./hmac_sha1');
const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * API 签名
 * 官方文档：https://developer.qiniu.com/insight/api/4814/the-api-signature
 * 签名是七牛服务器用来识别用户身份与权限的凭证，我们采用 AK/SK(公钥/私钥)、token 两种方式来对用户进行身份验证。
 * 默认使用token签名
 */
module.exports = function (options){
  let { AccessKey, SecretKey, expires, method, headers, path, query } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;

  // 参数校验
  if (!AccessKey || !SecretKey || !method || !path) {
    throw new Error('token签名出错：AccessKey、SecretKey、method、path4个参数都是必选');
  }
  // headers默认是空对象，expires默认是一个小时
  headers = headers || {};
  expires = expires || Math.floor(Date.now() / 1000) + 3600;

  // 1.构造tokenDescription
  let tokenDescription = JSON.stringify({
    resource: CanonicalizedResource(path, query),
    expires: expires,
    contentMD5: headers['content-md5'] || headers['Content-Md5'] || '',
    contentType: headers['content-type'] || headers['Content-Type'] || '',
    headers: CanonicalizedQiniuHeaders(headers),
    method: method
  });

  // 2. 将tokenDescription进行URL安全的Base64编码，得到encodedTokenDescription
  let encodedTokenDescription = urlsafe_base64_encode(tokenDescription);

  // 3. 使用SecretKey对encodedTokenDescription计算HMAC-SHA1签名
  let sign = hmac_sha1(SecretKey, encodedTokenDescription);
  
  // 4.对sign进行URL安全的Base64编码
  let encodedSign = urlsafe_base64_encode(sign);

  let auth = AccessKey + ':' + encodedSign + ':' + encodedTokenDescription;

  return 'Pandora ' + auth;
}

// AK/SK 签名
module.exports.AK_SK = function (options){
  let { AccessKey, SecretKey, method, headers, path, query } = options;

  // 优先options参数中的AccessKey和SecretKey
  AccessKey = AccessKey || this.AccessKey;
  SecretKey = SecretKey || this.SecretKey;
  if (!AccessKey || !SecretKey || !method || !path) {
    throw new Error('AK/SK 签名出错：AccessKey、SecretKey、method、path4个参数都是必选');
  }
  // headers默认是空对象，expires默认是一个小时
  headers = headers || {};
  headers['date'] = new Date().toGMTString();

  // - 制作 AK/SK 签名
  // 注意1：签名字符串中的 content-md5 和 content-type 为空那么相应的位置用空字符串来占位。
  // 注意2： Date 参数与服务器时间的偏差不得超过 15 分钟，用户需要同步校准自己的时钟。
  // 注意3：频繁返回 401 状态码时请先检查 Date 相关的代码逻辑。
  // 1. 生成待签名的原始字符串
  let strToSign = method + '\n'
                  + (headers['content-md5'] || headers['Content-Md5'] || '') + '\n'
                  + (headers['content-type'] || headers['Content-Type'] || '') + '\n'
                  + headers['date'] + '\n'
                  + CanonicalizedQiniuHeaders(headers)
                  + CanonicalizedResource(path, query);

  // 2. 使用 SecretKey 对上一步生成的 strTosign 计算 HMAC-SHA1 签名
  let sign = hmac_sha1(SecretKey, strToSign);

  // 3. 对 sign 进行 URL 安全的 Base64 编码
  let encodedSign = urlsafe_base64_encode(sign);

  // 4. 将 AccessKey 和 encodedSign 用英文符号:连接起来
  let auth = AccessKey + ':' + encodedSign;

  return 'Pandora ' + auth;
}

/**
 * CanonicalizedQiniuHeaders计算
 * 官方文档：https://developer.qiniu.com/insight/api/4814/the-api-signature#canonicalizedqiniuheaders-
 * 以X-Qiniu-开头的header是七牛的服务自定义的头部，有其特殊意义，因此签名中也需要加进去所有的自定义头部，CanonicalizedQiniuHeaders的计算步骤如下：
 * 1.将所有以X-Qiniu-为前缀的HTTP请求头的名字转换成小写字母，例如X-Qiniu-pipeline-timeout: 20转换成x-qiniu-pipeline-timeout:20；
 * 2.将上一步得到的所有的HTTP请求头按照名字的字典序进行升序排列；
 * 3.删除请求头和内容之间分隔符两端出现的空格；
 * 4.将每一个头和内容用\n分隔符分隔拼成最后的CanonicalizedQiniuHeaders。
 * 注意：当不存在Qiniu headers的时候无需添加最后的换行符。
 */
function CanonicalizedQiniuHeaders(headers){
  let result = [];
  for (let key in headers) {
    if (/^X-Qiniu-(.+)$/.test(key)) {
      result.push(key.toLowerCase() + ':' + headers[key]);
    }
  }

  // 如果没有X-Qiniu-自定义参数直接返回
  if (result.length === 0) return '';

  // 当不存在Qiniu headers的时候无需添加最后的换行符
  return result.sort().join('\n') + '\n';
}
/**
 * CanonicalizedResource计算
 * 官方文档：https://developer.qiniu.com/insight/api/4814/the-api-signature#canonicalizedresource-
 * 1.将CanonicalizedResource置为空字符串（""）；
 * 2.将请求的pipeline资源的uri放入CanonicalizedResource，例如/v2/repos/repox/exports/exportx；
 * 3.如果请求的资源包含了子资源，那么将子资源按照字典序升序排列并以&为分隔符生成子资源，以?为分割符追加在CanonicalizedResource字符串的后面，例如/v2/repos/repos/repox?q1=v1&q2=v2；
 */
function CanonicalizedResource(path, query){

  if (!query) return path;

  // 构建query
  let query_arr = [];
  for (let key in query) {
    query_arr.push(key + '=' + query[key]);
  }
  // query_arr没有值，直接返回
  if (query_arr.length === 0) return path;

  // query_arr排序后拼接
  return path + '?' + query_arr.sort().join('&');
}