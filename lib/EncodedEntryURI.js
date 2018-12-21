const urlsafe_base64_encode = require('./urlsafe_base64_encode');

/**
 * 构造encodedEntryURI
 * 官方文档：https://developer.qiniu.com/kodo/api/1276/data-format
 * @param {String} bucket 
 * @param {String} fileName 
 */
module.exports = function(bucket, fileName){
  let entry = fileName? bucket + ':' + fileName : bucket;
  let encodedEntryURI = urlsafe_base64_encode(entry);
  return encodedEntryURI;
};