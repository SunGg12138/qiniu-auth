const fs = require('fs');
const qiniu_auth = require('../../lib/');
const rp = require('node-request-slim').promise;

exports.createBucket =
async function createBucket(name, ak_sk, zone = 'z0'){
  let path = `/mkbucketv2/${qiniu_auth.encodedEntryURI(name)}/region/${zone}`;
  let auth = qiniu_auth.access_token.call(ak_sk, { path });

  let result = await rp({
    url: 'http://rs.qiniu.com' + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': auth
    }
  });
  if (result.error) return Promise.reject(result);
}

exports.delBucket =
async function delBucket(name, ak_sk){
  let path = `/drop/${name}`;
  let auth = qiniu_auth.access_token.call(ak_sk, { path });
  let result = await rp({
    url: 'http://rs.qiniu.com' + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': auth
    }
  });
  if (result.error) return Promise.reject(result);
}

exports.uploadFile = 
async function uploadFile(path, bucketName, fileName, ak_sk, private){
  let auth = qiniu_auth.upload_token.call(ak_sk, { scope: bucketName + ':' + fileName, returnBody: '{"name": $(fname) }' });
  let request_options = {
    method: 'POST',
    url: 'http://up-z0.qiniup.com',
    formData: {
      scope: bucketName + ':' + fileName, 
      key: fileName, fileName: fileName,
      token: auth, file: fs.createReadStream(path)
    }
  };
  let result = await rp(request_options);
  if (result.error) return Promise.reject(result);
}

exports.private =
async function private(bucketName, ak_sk){
  let form = {
    bucket: bucketName,
    private: 1
  };
  // 获取授权
  let auth = qiniu_auth.access_token.call(ak_sk, { path: '/private', form });
  // 设置 Bucket 访问权限
  let result = await rp({
    url: 'http://uc.qbox.me/private',
    method: 'POST',
    form: form,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': auth
    }
  });
  if (result.error) return Promise.reject(result);
}

exports.domain =
async function domain(bucketName, ak_sk){
  // 设置path和query
  let path = '/v6/domain/list';
  let query = 'tbl=' + bucketName;
  // 获取授权
  let auth = qiniu_auth.access_token.call(ak_sk, { path, query });
  // 获取储存空间域名
  let result = await rp({
    url: 'http://api.qiniu.com' + path + '?' + query,
    method: 'GET',
    headers: {
      'Authorization': auth
    }
  });
  if (result.error) return Promise.reject(result);
  return result[0];
}