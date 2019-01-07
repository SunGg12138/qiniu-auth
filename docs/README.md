# qiniu-auth 文档

- [access_token 管理凭证](#管理凭证)
- [upload_token 上传凭证](#上传凭证)
- [download_token 下载凭证](#下载凭证)
- [Pandora API签名](#Pandora-API签名)
- [qiniu_token HTTP请求鉴权](#HTTP请求鉴权)
- [EncodedEntryURI](#EncodedEntryURI)
- [HMAC-SHA1签名](#HMAC-SHA1签名)
- [URL安全的Base64编码](#URL安全的Base64编码)

## 管理凭证

qiniu_auth.access_token(options);

[官方文档](https://developer.qiniu.com/kodo/manual/1201/access-token)

options有5个参数属性：
  - path，string，必选，请求的路径
  - query，string || object，可选，请求的参数，如果object类型会进行qs.stringify
  - body，string || object，可选，HTTP Body，如果object类型会进行qs.stringify，当 Content-Type 为 application/x-www-form-urlencoded 时，签名内容必须包括请求内容
  - AccessKey，string，可选，指定的七牛云AccessKey参数，和this.AccessKey参数二选一，options.AccessKey优先级高
  - SecretKey，string，可选，指定的七牛云SecretKey参数，和this.SecretKey参数二选一，options.SecretKey优先级高

```javascript
// - 以下用获取储存空间列表举例：
// 获取管理凭证
let auth = qiniu_auth.access_token({ AccessKey: '<Your AccessKey>', SecretKey: '<Your SecretKey>', path: '/buckets' });
// 获取储存空间列表请求
await rp({
  url: 'http://rs.qbox.me/buckets',
  method: 'GET',
  headers: {
    'Authorization': auth
  }
});
```

## 上传凭证

qiniu_auth.upload_token(options);

[官方文档](https://developer.qiniu.com/kodo/manual/1208/upload-token)

options有5个参数属性：
  - scope，string，必选，储存空间名称 + ':' + 文件名称
  - deadline，string || number，可选，过期时间，Unix时间戳，默认的过期时间是1个小时
  - returnBody，string || object，可选，最后想得到 图片的名称、大小、宽高和校验值等值
  - AccessKey，string，可选，指定的七牛云AccessKey参数，和this.AccessKey参数二选一，options.AccessKey优先级高
  - SecretKey，string，可选，指定的七牛云SecretKey参数，和this.SecretKey参数二选一，options.SecretKey优先级高

```javascript
// - 以下用直传文件举例：
// 获取上传凭证
let auth = qiniu_auth.upload_token.call(qiniu_config, { scope: 'bucketName:qiniu_auth.js', returnBody: '{"name": $(fname) }' });
// 发起请求
await rp({
  method: 'POST',
  url: 'http://up-z0.qiniup.com',
  formData: {
    scope: 'bucketName:qiniu_auth.js',
    key: 'qiniu_auth.js', fileName: 'qiniu_auth.js',
    token: auth, file: fs.createReadStream('<文件路径>')
  }
});
```

## 下载凭证

qiniu_auth.download_token(options);

[官方文档](https://developer.qiniu.com/kodo/manual/1202/download-token)

options有5个参数属性：
  - url，string，必选，请求的url
  - deadline，string || number，可选，过期时间，Unix时间戳，默认的过期时间是1个小时
  - query，string || object，可选，请求的query部分，如果是object会被qs.stringify，如果指定query参数会替换掉原url的query部分
  - AccessKey，string，可选，指定的七牛云AccessKey参数，和this.AccessKey参数二选一，options.AccessKey优先级高
  - SecretKey，string，可选，指定的七牛云SecretKey参数，和this.SecretKey参数二选一，options.SecretKey优先级高

```javascript
// 使用download_token函数，返回真正的下载url
let realUrl = qiniu_auth.download_token({ AccessKey: '<Your AccessKey>', SecretKey: '<Your SecretKey>', url: 'http://xxx/test.js' });

// realUrl: http://xxx/test.js?e=1545723182&token=<Your AccessKey>:e9agnim21L6o7EUaC7sCDXtz3VA=
```

### Pandora-API签名

qiniu_auth.pandora(options); 默认使用token签名
qiniu_auth.pandora.AK_SK(options); 也可以使用AK_SK签名

[官方文档](https://developer.qiniu.com/insight/api/4814/the-api-signature)

options有7个参数属性：
  - method，string，必选，请求的方法
  - path，string，必选，请求的路径
  - query，object，可选，请求的参数
  - headers，object，可选，请求头信息
  - expires，object，可选，过期时间，默认是一个小时
  - options.AccessKey 可选，七牛云给你的密钥之一，this.AccessKey和options.AccessKey必须要选一
  - options.SecretKey 可选，七牛云给你的密钥之一，this.SecretKey和options.SecretKey必须要选一

```javascript
let path = '/v2/repos/' + Date.now() + '/data';
// 生成api签名
let auth = qiniu_auth.pandora({
  AccessKey: '<Your AccessKey>',
  SecretKey: '<Your SecretKey>'
  method: 'POST',
  path: path,
  headers: {
    'content-type': 'text/plain'
  }
});
// 也可以使用AK_SK签名
// auth = qiniu_auth.pandora.AK_SK({
//   AccessKey: '<Your AccessKey>',
//   SecretKey: '<Your SecretKey>'
//   method: 'POST',
//   path: path,
//   headers: {
//     'content-type': 'text/plain'
//   }
// });

await rp({
  url: 'https://nb-pipeline.qiniuapi.com' + path,
  method: 'POST',
  headers: {
    'content-type': 'text/plain',
    'Authorization': auth
  },
  body: 'userName=小张\tage=12\taddresses=beijing\nuserName=小王\tage=13\taddresses=hangzhou'
});
```

## HTTP请求鉴权

qiniu_auth.qiniu_token(options);

[官方文档](https://developer.qiniu.com/pili/api/2772/http-requests-authentication)

options有8个参数属性：
  - url，string，必选，请求的url
  - method，string，必选，请求的方法
  - query，string || object，可选，请求的query部分，如果是object会被qs.stringify，如果指定query参数会替换掉原url的query部分
  - headers，object，可选，请求头信息
  - body，object，可选，请求信息
  - ContentType，string，可选，请求的Content-Type
  - options.AccessKey 可选，七牛云给你的密钥之一，this.AccessKey和options.AccessKey必须要选一
  - options.SecretKey 可选，七牛云给你的密钥之一，this.SecretKey和options.SecretKey必须要选一

```javascript
// 使用图片审核举例：

// 生成HTTP请求鉴权
let auth = qiniu_auth.qiniu_token({
  AccessKey: '<Your AccessKey>',
  SecretKey: '<Your SecretKey>',
  url: 'http://argus.atlab.ai/v1/image/censor',
  method: 'POST',
  body: {
    data: { uri: 'http://xxx/test.jpg' },
    params: { type: ["pulp", "terror", "politician"], detail: false }
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// 使用HTTP请求鉴权发出请求
await rp({
  url: 'http://argus.atlab.ai/v1/image/censor',
  method: 'POST',
  body: {
    data: { uri: 'http://xxx/test.jpg' },
    params: { type: ["pulp", "terror", "politician"], detail: false }
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': auth
  }
});
```

## EncodedEntryURI

qiniu_auth.encodedEntryURI(bucket, fileName);

有两个参数：
  - bucket，string，必选，储存桶名称
  - fileName，string，必选，文件名称

## HMAC-SHA1签名

qiniu_auth.hmac_sha1(key, str);

有两个参数：
  - key，string，必选，加密的key
  - str，string，必选，加密的字符串

## URL安全的Base64编码

qiniu_auth.urlsafe_base64_encode(url);

有1个参数：
  - url，string，必选，需要编码的url字符串