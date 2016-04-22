// 详细请了解官方文档  https://leancloud.cn/docs/js_analytics.html

// 请将 AppId 改为你自己的 AppId
var appId = 'QvNM6AG2khJtBQoRMWqfLV-zGzoHsz';

// 请将 AppKey 改为你自己的 AppKey
var appKey = 'be2YmUduiuEnC9bLRnnV';

// 实例化分析统计功能
var analytics = AV.analytics({

    // 设置 AppId
    appId: appId,

    // 设置 AppKey
    appKey: appKey,

    // 你当前应用或者想要指定的版本号
    version: '1.8.6',

    // 你当前应用的渠道或者你想指定的渠道
    channel: 'weixin',

    // 选择服务地区（默认为国内节点）
    // region: 'cn'
});

// 发送自定义的统计事件
analytics.send({

    // 事件名称
    event: 'test-event-name',

    // 事件属性，任意数据
    attr: {
        testa: 123,
        testb: 'abc'
    },

    // 该事件持续时间（毫秒）
    duration: 6000
}, function(result) {
    if (result) {
        console.log('统计数据发送成功！');
    }
});
