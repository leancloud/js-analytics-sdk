/**
 * @author wangxiao
 * @date 2015-06-11
 * @homepage http://github.com/leancloud/js-analytics-sdk
 *
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 */

void function(win) {

    // 当前版本
    var VERSION = '0.0.1';

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

    var newAnalytics = function(options) {
        var appId = options.appId;
        var appKey = options.appKey;

        // 应用版本
        var appVersion = options.version || null;

        // 推广渠道
        var appChannel = options.channel || null;

        return {

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
                        duration: options.duration,

                        // 内部使用
                        tag: options.tag
                    };
                    eventsList.push(eventObj);
                }

                // 处理下数据
                for (var i = 0, l = eventsList.length; i < l; i ++) {
                    eventsList[i].attributes = eventsList[i].attr;

                    // 清理掉多余字段
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

    // 主函数
    AV.analytics = function(options) {
        if (typeof options !== 'object') {
            throw('AV.analytics need a argument at least.');
        }
        else if (!options.appId) {
            throw('Options must have appId.');
        }
        else if (!options.appKey) {
            throw('Options must have appKey.');
        }

        // 创建一个新的实例
        var analyticsObj = newAnalytics(options);

        // 启动自动页面时长统计
        engine.pageView(analyticsObj);

        // 启动自动 session 时长统计
        engine.sessionView(analyticsObj);

        return analyticsObj;
    };

    // 赋值版本号
    AV.analytics.version = VERSION;

    // 挂载私有方法
    AV.analytics._tool = tool;
    AV.analytics._engine = engine;

    engine.getId = function() {
        var key = 'leancloud-analytics-id';
        var id = win.localStorage.getItem(key);
        if (!id) {
            id = tool.getId();
            win.localStorage.setItem(key, id);
        }
        return id;
    };

    // 自动统计页面相关
    engine.pageView = function(analyticsObj) {
        var startTime;
        var endTime;
        var page;

        function start() {
            startTime = tool.now();
            page = win.location.href;
        }

        function end() {
            endTime = tool.now();
            analyticsObj.send({

                // 必须为 _page 表示一次页面访问
                event: '_page',

                // 页面停留时间，单位毫秒
                duration: endTime - startTime,

                // 页面名称
                tag: page
            });
        }

        // 默认自动启动
        start();

        // 监听 url 变化（包括 hash 变化）
        win.addEventListener('hashchange', function(e) {
            // 页面发生变化，发送一次页面统计
            end();
            // 再次启动新的统计
            start();
        });

        // 当页面关闭的时候
        win.addEventListener('beforeunload', function() {
            // 发送一次
            end();
        });
    };

    // 自动统计一次 session 周期的时间
    engine.sessionView = function(analyticsObj) {
        var startTime = tool.now();
        win.addEventListener('beforeunload', function() {
            var endTime = tool.now();
            analyticsObj.send({

                //必须为 _session.close 表示一次使用结束
                event: '_session.close',

                // 使用时长，单位毫秒
                duration: endTime - startTime
            });
        });
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
            }
            else {
                callback(null, JSON.parse(xhr.responseText));
            }
        };
        xhr.onerror = function(data) {
            callback(null, data);
            throw('Network error.');
        };
        xhr.send(JSON.stringify(options.data));
    };

    // 获取当前时间的时间戳
    tool.now = function() {
        return new Date().getTime();
    };

} (window);
