# qiniu-auth

此模块专门为七牛云提供授权加密服务，包含以下授权：

- [管理凭证 官方文档](https://developer.qiniu.com/kodo/manual/1201/access-token)
- [上传凭证 官方文档](https://developer.qiniu.com/kodo/manual/1208/upload-token)
- [下载凭证 官方文档](https://developer.qiniu.com/kodo/manual/1202/download-token)
- [Pandora API签名 官方文档](https://developer.qiniu.com/insight/api/4814/the-api-signature)
- [HTTP请求鉴权 官方文档](https://developer.qiniu.com/pili/api/2772/http-requests-authentication)

还有以下工具：

- [EncodedEntryURI](https://developer.qiniu.com/kodo/api/1276/data-format)
- [HMAC-SHA1签名](https://developer.qiniu.com/linking/glossary/5287/linking-hmac-sha1)
- [URL安全的Base64编码](https://developer.qiniu.com/kodo/manual/1231/appendix#urlsafe-base64)

## 相关文档

[文档](./docs)

## 测试

```bash
# 先配置你的/test/resource/qiniu.config.json文件再测试
# qiniu.config.json是放置AccessKey和SecretKey的配置文件
# 格式与qiniu.config.default.json相同，你需要配置你的qiniu.config.json
$ mocha

# 如果想看返回的数据信息可以加上DEBUG=test
$ DEBUG=test mocha
```

## LICENSE

MIT License

Copyright (c) 2018 Grand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.