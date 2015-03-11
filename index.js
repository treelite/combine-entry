/**
 * @file Combine entry
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 从Javascript代码中寻找入口模块
 *
 * @inner
 * @param {string} code 源码
 * @return {Array.<string>}
 */
function findModules(code) {
    // 不再使用JS语法分析改用正则寻找
    // 因为在入口页面的JS环境下可能有模板语法进行的数据组装操作
    // 此情况下JS语法检查都过不了...
    // 还可以考虑先进行模板解析再进行JS语法分析，但相应模拟数据的选择是个问题...
    var res = [];
    code.replace(/(^|\s+|\t+)require\(([^()]+)/g, function ($0, $1, $2) {
        $2 = $2.split(/\s*,\s*/);
        if ($2.length >= 2) {
            $2.pop();
            $2 = $2.join(',');
        }
        else {
            $2 = $2[0];
        }

        var moduleList;
        // 先按数组解析
        // 不成功再按字符串解析
        try {
            // 将'替换成"，便于JSON解析
            // PS: 将'作为moduleId算你狠...
            moduleList = JSON.parse($2.replace(/'/g, '"'));
        }
        catch (e) {
            // 去掉开头、结尾的空格和引号
            $2 = $2.replace(/(^\s+["']|["']\s+$)/g, '');
            moduleList = [$2];
        }

        res = res.concat(moduleList);
    });

    return res;
}

/**
 * html片段中查询script标签的innerText
 *
 * @inner
 * @param {string} content html片段内容
 * @return {Array.<string>} 每个标签一个数组项
 */
function findScriptInHTML(content) {
    var segs = content.split(/<script[^>]*>/);
    var texts = [];
    for (var i = 1; i < segs.length; i++) {
        texts.push(segs[i].split(/<\/script>/)[0]);
    }

    return texts;
}

/**
 * 从文件中获取入口模块
 *
 * @inner
 * @param {string} file 文件路径
 * @return {Array.<string>}
 */
function getModules(file) {
    var fs = require('fs');
    var path = require('path');
    var content = fs.readFileSync(file, 'utf8');

    if (path.extname(file) !== '.js') {
        content = findScriptInHTML(content).join('\n');
    }

    return findModules(content);
}

/**
 * 获取所有的入口模块
 *
 * @inner
 * @param {string|Array.<string>} patterns 文件匹配模式
 * @param {Object=} options 配置参数
 * @return {Array.<string>}
 */
function getEntryModules(patterns, options) {
    var modules = [];
    var glob = require('glob');

    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    patterns.forEach(function (pattern) {
        var files = glob.sync(pattern, options);

        files.forEach(function (file) {
            modules = modules.concat(getModules(file));
        });
    });


    return modules;
}

/**
 * 对象扩展
 *
 * @inner
 * @param {Object} target 目标对象
 * @return {Object}
 */
function extend(target) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (item) {
        if (!item) {
            return;
        }

        Object.keys(item).forEach(function (key) {
            target[key] = item[key];
        });
    });

    return target;
}

/**
 * 生成moduleCompiler的combine配置项
 *
 * @public
 * @param {string|Array.<string>} entrypatterns 入口文件的匹配模式
 * @param {Object=} options 配置参数
 * @param {string=} options.moduleId 公共模块id
 * @param {string=} options.cwd 搜索文件的起始目录，默认为process.cwd()
 * @return {Object}
 */
module.exports = function (entryPatterns, options) {
    options = options || {};
    // 扫描所有的入口文件获取入口模块id
    var modules = getEntryModules(entryPatterns, options);
    var commonModuleId = options.moduleId;

    return {
        getCombineConfig: function (config) {
            var commonModule = config[commonModuleId];

            // 如果设置了公共模块
            // 需将将其从待处理的模块列表中删除
            if (commonModule) {
                modules = modules.filter(function (id) {
                    return id !== commonModuleId;
                });
            }

            // 排除公共模块及其依赖
            function excludeCommon(modules) {
                var excludes = (commonModule || {}).modules || [];
                if (excludes.length <= 0) {
                    return modules;
                }
                else {
                    // 首先排除公共模块
                    modules.push('!~' + commmonModuleId);
                }

                // 其次排除公共模块的依赖
                excludes.forEach(function (item) {
                    if (item.charAt(0) === '~') {
                        modules.push('!' + item);
                    }
                });

                return modules;
            }

            modules.forEach(function (id) {
                var item = extend({}, config[id]);
                item.modules = excludeCommon(item.modules || []);

                config[id] = item;
            });

            return config;
        }
    };
};
