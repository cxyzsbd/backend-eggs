### 响应错误码
#### 200 OK：普通接口成功
#### 201 Created：创建成功
#### 204 No Content：删除成功
#### 400 Bad Request：服务器不理解客户端的请求，未做任何处理。
#### 401 Unauthorized：用户未提供身份验证凭据，或者没有通过身份验证。
#### 403 Forbidden：用户通过了身份验证，但是不具有访问资源所需的权限。
#### 404 Not Found：所请求的资源不存在，或不可用。
#### 405 Method Not Allowed：用户已经通过身份验证，但是所用的 HTTP 方法不在他的权限之内。
#### 415 Unsupported Media Type：客户端要求的返回格式不支持。比如，API 只能返回 JSON 格式，但是客户端要求返回 XML 格式。
#### 422 Unprocessable Entity ：参数格式校验错误。
#### 429 Too Many Requests：客户端的请求次数超过限额。