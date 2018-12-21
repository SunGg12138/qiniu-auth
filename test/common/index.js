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