## 数据接口文档
### 1.url
```javascript
POST:http://127.0.0.1:3000/api/v1/box-data/data
```
### 2.参数
| 参数   | 是否必须 |   传递方式 | 描述 |
| :------------- | :----------: | ------------: | ------------: |
| param_type |   是   | body | 参数类型：1：int；2：string |
| param_arr       |    是     | body | 属性id或长属性名集合，array |

### 3.请求示例
```javascript
示例一:

body: 
{
    "param_type": 1,
    "param_arr": [1,2,4]
}

响应: 
[
    {
        "id": 1,
        "device_id": 1,
        "tag": "a",
        "name": "温度",
        "type": null,
        "desc": null,
        "unit": null,
        "range": null,
        "boxcode": "A/B/C",
        "tagname": "a.pv",
        "value": 95.2
    },
    {
        "id": 2,
        "device_id": 1,
        "tag": "b",
        "name": "湿度",
        "type": null,
        "desc": null,
        "unit": null,
        "range": null,
        "boxcode": "B/C/D",
        "tagname": "b.pv",
        "value": 48.47
    },
    {
        "id": 4,
        "device_id": 2,
        "tag": "b",
        "name": "湿度",
        "type": null,
        "desc": null,
        "unit": null,
        "range": null,
        "boxcode": "B/C/D",
        "tagname": "b.pv",
        "value": 73.52
    }
]
```

```javascript
示例二:

body:
{
    "param_type": 2,
    "param_arr": [
        "维璟中心/Abc/温度",
        "维璟中心/测试设备qwEr/湿度",
        "维璟中心1/测试设备qwEr/A"
    ]
}

响应:
[
    {
        "id": 1,
        "device_id": 1,
        "tag": "a",
        "name": "温度",
        "type": null,
        "desc": null,
        "unit": null,
        "range": null,
        "boxcode": "A/B/C",
        "tagname": "a.pv",
        "value": 65.9
    },
    {
        "id": 4,
        "device_id": 2,
        "tag": "b",
        "name": "湿度",
        "type": null,
        "desc": null,
        "unit": null,
        "range": null,
        "boxcode": "B/C/D",
        "tagname": "b.pv",
        "value": 39.93
    },
    {}
]
```