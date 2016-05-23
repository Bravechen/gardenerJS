# gnBase.js

gnBase.js是gardener.js组件库的基础功能模块。它主要提供：

1. 组件库内部使用的基本方法。
2. 继承实现机制。
3. 基础属性配置。
4. 全局命名空间。

## 全局命名空间
组件库使用`window.gardener`为全局命名空间，简写为：`gn`

## 属性

### gardener.VERSION

组件库的版本号，采用语义化版本号形式。
在内部开发自测阶段，使用 **alpha** 前缀;
在公测阶段，使用 **beta** 前缀。

### gardener.Core

gardener的核心对象，包括各种供内部实现的工具方法和继承实现。

#### `gardener.Core.inherits()`
    
该方法为实现继承的入口方法。gardenerJs组件库的继承以组合寄生式的方式实现。

#### `gardener.Core.createInstance(className)`

通过一个className所建立的映射创建一个类的实例。

#### `gardener.Core.getDefinitionByName(className)`

通过一个className所建立的映射返回该className所对应的类的构造函数。

#### `gardener.Core.getUUID()`

获取一个UUID字符串。

### gardener.OM

GNObjectManager的简写形式。

### gardener.PM

GNPoolManager的简写形式。

### gardener.EM

GNEventManager的简写形式。

### gardener.FM

GNFrameManager的简写形式。

### gardener.LM

GNLogManager的简写形式。

### gardener.GM

GNGlobalManager的简写形式。

### gardener.debug

组件库的debug模式。true为打开调试模式，会有各种日志输出。默认false，关闭debug模式。
