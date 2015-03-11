combine-entry
===

Scan entry files for combine modules. A plugin for [moduleCompiler](https://github.com/ecomfe/edp/wiki/Build-Processors#modulecompiler)(come from [edp-buid](https://github.com/ecomfe/edp-build)).

## Installation

```sh
$ npm install combine-entry --save
```

## Usage

In your `edp-build-config.js`, you can use this plugin to create `moduleCompiler`

```js
exports.getProcessors = function () {
    ...
    var combineEntry = require('combine-entry');
    // 设置需要处理entry目录下的所有html文件
    var moduleCompiler = new ModuleCompiler(combineEntry('entry/*.html'))
    ...
};
```

## API

### combineEntry(patterns, options)

构建`moduleProcessor`需要的`combine`配置项

* **patterns** `{string|Array.<string>}` 入口文件的匹配模式，具体书写方式[看这里](https://github.com/isaacs/node-glob#glob-primer)
* **options** `{Object=}` 配置项
    * **moduelId** `{string=}` 公共模块ID，如果设置则后续所有的模块都不会包含公共模块以及公共模块的依赖
    * **cwd** `{string=}` 起始的入口文件扫描路径，默认为`process.cwd()`
