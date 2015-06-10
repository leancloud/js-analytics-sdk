/**
 * @author wangxiao
 * @date 2015-06-11
 * @homepage http://github.com/leancloud/js-analyze-sdk
 *
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 */

void function(win) {

    // 当前版本
    var VERSION = '0.0.0';

    // 获取命名空间
    var AV = win.AV || {};
    win.AV = AV;

    // AMD 加载支持
    if (typeof define === 'function' && define.amd) {
        define('AV', [], function() {
            return AV;
        });
    }

    // 命名空间，挂载一些工具方法
    var tool = {};

    // 命名空间，挂载私有方法
    var engine = {};

    // 主函数
    AV.analyze = function(options) {
        if (typeof options !== 'object') {
            throw('AV.analyze need a argument at least.');
        }
        else if (!options.appId) {
            throw('Options must have appId.');
        }
        else if (!options.appKey) {
            throw('Options must have appKey.');
        }

        var appId = options.appId;
        var appKey = options.appKey;

        // 应用版本
        var appVersion = options.version || null;

        // 推广渠道
        var appChannel = options.channel || null;

        return {

            // 查询统计数据
            // search: function() {},

            // 发送统计数据
            send: function(options, callback) {
                var eventsList = [];

                // 判断是否传入的是有值的数组
                if (options && options.length) {
                    eventsList = options;
                }

                // 如果不是数组，那就是对象
                else {

                    // 判断参数是否正确
                    if (!options || !options.event) {
                        throw('EventObject must have a event value.');
                    }

                    // 单个事件对象
                    var eventObj = {

                        // 事件名称
                        event: options.event,

                        // 事件属性，完全自定义
                        attr: options.attr,

                        // 持续时长
                        duration: options.duration
                    };

                    eventsList.push(eventObj);
                }

                // 处理下数据
                for (var i = 0, l = eventsList.length; i < l; i ++) {
                    eventsList[i].attributes = eventsList[i].attr;
                    delete eventsList[i].attr;
                }

                // 分析统计接口
                var url = 'https://api.leancloud.cn/1.1/stats/open/collect';
                var data = {
                    client: {
                        id: engine.getId(),

                        // 服务器端会统一按照小写字母校验
                        platform: 'web',
                        app_version: appVersion,
                        app_channel: appChannel
                    },
                    session: {
                        id: tool.getId()
                    },
                    events: eventsList
                };

                tool.ajax({
                    url: url,
                    method: 'post',
                    data: data,
                    appId: appId,
                    appKey: appKey
                }, function(result, error) {
                    if (callback) {
                        if (result) {
                            callback(result);
                        }
                        else {
                            callback(error);
                        }
                    }
                });
            }
        };
    };

    // 赋值版本号
    AV.analyze.version = VERSION;

    // 挂载私有方法
    AV.analyze._tool = tool;
    AV.analyze._engine = engine;

    engine.getId = function() {
        var key = 'leancloud-analyze-id';
        var id = win.localStorage.getItem(key);
        if (!id) {
            id = tool.getId();
            win.localStorage.setItem(key, id);
        }
        return id;
    };

    // 获取一个唯一 id
    tool.getId = function() {

        // 与时间相关的随机因子
        var getIdItem = function() {
            return new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 3);
        };
        return 'AV' + getIdItem() + getIdItem() + getIdItem();
    };

    // Ajax 请求
    tool.ajax = function(options, callback) {
        var url = options.url;
        var method = options.method || 'get';
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        if (method === 'post' || method === 'put') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        if (options.appId) {
            xhr.setRequestHeader('X-AVOSCloud-Application-Id', options.appId);
        }
        if (options.appKey) {
            xhr.setRequestHeader('X-AVOSCloud-Application-Key', options.appKey);
        }
        xhr.onload = function(data) {
            // 检测认为 2xx 的返回都是成功
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(JSON.parse(xhr.responseText));
            } else {
                callback(null, JSON.parse(xhr.responseText));
            }
        };
        xhr.onerror = function(data) {
            callback(null, data);
            throw('Network error.');
        };
        xhr.send(JSON.stringify(options.data));
    };

} (window);
