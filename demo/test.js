// 详细请了解官方文档  https://leancloud.cn/docs/js_analyze.html

// 请将 AppId 改为你自己的 AppId
var appId = 'u5rykzag4wz0y3h2qnbaicbcjrlft8euv27ppvvlebry9ccz';

// 请将 AppKey 改为你自己的 AppKey
var appKey = 'dl9vmrtcc5z1kj8rmj4n3wq1t9u76me49hzf7aa04lxbt7i3';

// 实例化分析统计功能
var analyze = AV.analyze({

    // 设置 AppId
    appId: appId,

    // 设置 AppKey
    appKey: appKey,

    // 你当前应用或者想要指定的版本号
    version: '1.8.6',

    // 你当前应用的渠道或者你想指定的渠道
    channel: 'weixin'
});

// 发送自定义的统计事件
analyze.send({

    // 事件名称 
    event: 'test-event-name',

    // 事件属性，任意数据
    attr: {
        a: 123,
        b: 'abc'
    },

    // 该事件持续时间（毫秒）
    duration: 6000
}, function(result) {
    if (result) {
        console.log('统计数据发送成功！');
    }
});
