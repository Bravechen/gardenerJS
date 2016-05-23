/**
 * @author Brave Chen on 2015.12.10
 * @version alpha v0.0.0 开发各项功能
 * @version beta v0.0.0 开发各项功能,开始使用和测试
 * @version beta v0.1.0 增加了GNTools使用工具类
 * @version beta v0.1.1 修复GNStage中添加事件处理器作用域设计不对的的问题。
 * @version beta v0.1.2 修复在GNInteractivePart的时间处理器中domTarget可能不为HTMLElement的报错情况。
 * @version beta v0.1.3 修复在GNStage中重复获取doc$的情况
 * @version beta v0.2.0 删除GNLogManager对象中的setPrompt(),使具体的在HTML中的输出使用相关API实现。
 * @version beta v0.3.0 删除GNInteractivePart,GNContainer,GNButton,GNInteractive,GNService.
 * @version beta v0.3.1 修复事件管理对象中，添加事件但没有加入列表的问题
 * @version beta v0.4.0 为事件管理对象加入一个不公开的方法，在调试模式下可以打印出事件侦听列表
 * @version beta v0.4.1 修复GNStage中不能添加DOC_INIT事件的问题；在派发事件之前增加了对事件存在与否的验证。
 * @version beta v0.4.2 增加在GNPart中对element的参数验证，修改获取html中data-gnId为data-gnid
 * @version beta v0.4.3 修复GNObjectManager中判断是否在列表中的转换bug
 * @version beta v0.4.4 修改GNWatcher中addWatch()中subscriber参数可选，并且支持非gn类型的对象。
 * @version beta v0.4.5 修复GNWatcher中addWatch()中type参数不支持number类型的情况。
 * @version beta v0.4.6 修改GNWatcher中返回事件订阅者列表的逻辑，改为输出订阅者字符串形式的描述。
 * @version beta v0.4.7 在GNGlobalManager中增加一个gn.UIEvent用来为基于gn的组件提供事件常量便利。
 * @version beta v0.5.0 为GNObject增加了execSuper()方法，在需要调用父类原型方法时，通过此方法可以执行父类原型上同名方法。
 * @version beta v0.5.1 增加若干常量;为GNLogManager中增加日志级别，分为普通、警告和错误；修改组件库内的日志使用方式。
 * @version beta v0.6.0 为GNPart增加getState()、setState()、getBonds()、updateDisplay()和validateRendered()方法。
 * @version beta v0.6.1 修复GNObject中execSuper()方法引起的循环引用问题。
 * @version beta v0.7.0 增加了GNPopupManager对象用来管理在网页中弹出对象的功能。
 * @version beta v0.7.1 使GNPopupManager对象可以兼容ie7/ie8；在GNStage中增加了浏览器嗅探的功能。
 * @version beta v0.7.2 GNPopupManager增加shutUpAll()方法，可以关闭所有弹窗
 * @version beta v0.7.3 更新了GNFrameManager中原生api的使用，订阅时增加了处理器作用域this指向设置。
 * @version beta v0.7.4 修复GNStage中获取视口尺寸的bug。
 * @version beta v0.7.5 GNPopupManager现在可以支持GNPart对象及其继承子类。
 * @version beta v0.7.6 修复gnBase中gnid等公共常量的错误。
 * @dependence jQuery
 */
//======================base=========================================
window.gardener = (function(window,undefined){
    "use strict";
    /**版本号 */
    var version = "beta 0.7.6";
    
    /**
     * 私有类，提供不公开的工具方法
     */
    var PrivateClass = {
        /**
         * 利用寄生的方式创建对象
         * @param  {Function} original ԭ原型
         * @return {Object} 利用寄生方式创建的对象实例
         */
        createObject:function(original){
            var T = function T(){};
            T.prototype = original;
            return new T();
        }
    };
    //========================UUID=============================
    var UUID = {};
    /**
     * Returns an unsigned x-bit random integer.
     * @param {int} x A positive integer ranging from 0 to 53, inclusive.
     * @returns {int} An unsigned x-bit random integer (0 <= f(x) < 2^x).
     */
    UUID._getRandomInt = function(x) {
        if (x <0) return NaN;
        if (x <= 30) return (0 | Math.random() * (1 << x));
        if (x <= 53) return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
        return NaN;
    };
    /**
     * Returns a function that converts an integer to a zero-filled string.
     * @param {int} radix
     * @returns {Function}
     */
    UUID._getIntAligner = function(radix) {
        return function(num, length) {
            var str = num.toString(radix), i = length - str.length, z = "0";
            for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
            return str;
        };
    };
    UUID._hexAligner = UUID._getIntAligner(16);
    //============================Core================================================
    /**
     * 核心类，提供一些基础方法
     */
    var Core = {
        /**
         * 实现继承
         * @param  {Object} SuperClass 超类
         * @param  {Object} SubClass   子类
         * @return {void}
         */
        inherits:function(SuperClass,SubClass){
            if(!SuperClass || !SubClass)
                return;
            var prototype = Object.create?Object.create(SuperClass.prototype):PrivateClass.createObject(SuperClass.prototype);
            prototype.constructor = SubClass;
            prototype.superPrototype = SuperClass.prototype;
            SubClass.prototype = prototype;
        },
        /**
         * 根据全名称创建实例
         * @param  {String} className 类的全名称
         * @return {Object}
         */
        createInstance:function(className){
            var ary = className.split('.');
            var ClassItem = window[ary[0]];
            for(var i=1,len=ary.length;i<len;i++){
                ClassItem = ClassItem[ary[i]];
            }
            return new ClassItem();
        },
        /**
         * 返回 name 参数指定的类的类对象引用
         * @param name 类的名称
         * @returns {*}
         */
        getDefinitionByName:function(name){
            var ary = name.split('.');
            var ClassItem = window[ary[0]];
            for(var i=1,len=ary.length;i<len;i++){
                ClassItem = ClassItem[ary[i]];
            }
            return typeof ClassItem === "function"?ClassItem:null;
        },
        /**
         * 获得一个UUID
         * @return {String} UUID
         */
        getUUID:function(){
            var rand = UUID._getRandomInt, hex = UUID._hexAligner;
            return  hex(rand(32), 8) + "-" + hex(rand(16), 4) + "-" + hex(0x4000 | rand(12), 4) + "-" + hex(0x8000 | rand(14), 4) + "-" + hex(rand(48), 12);
        }
    };

    return {
        Core:Core,
        VERSION:version,
        CONSTRUCTOR:'constructor',
        GN_ID:'data-gnid',
        GN_NAME:'data-gnname',
        /**debug模式 */
        debug:false,
        OM:null,
        PM:null,
        EM:null,
        FM:null,
        LM:null,
        GM:null
    };
})(window);
//======================GNObjectManager==============================
/**
 * GN对象管理类
 */
gardener.GNObjectManager = (function(window,undefined){
    "use strict";
    /**
     * 私有对象类
     */
    var PrivateClass = {
        gnObjList:{length:0}
    };
    /**
     * 添加GNObject
     * @param gnObject
     * @returns {boolean}
     */
    function addGNObject(gnObject){
        if(!gnObject || inGNList(gnObject.gnId)) {
            return false;
        }
        PrivateClass.gnObjList[gnObject.gnId] = gnObject;
        PrivateClass.gnObjList.length++;
        return true;
    }
    /**
     * 删除GNObject
     * @param gnId {String} GNObject的gnId
     * @returns {boolean}
     */
    function removeGNObject(gnId){
        if(!gnId || !inGNList(gnId)){
            return false;
        }
        delete PrivateClass.gnObjList[gnId];
        PrivateClass.gnObjList.length--;
        return true;
    }
    /**
     * 获取一个GNObject
     * @param gnId
     * @returns {*}
     */
    function getGNObject(gnId){
        return PrivateClass.gnObjList[gnId];
    }
    /**
     * 修改对象的gnId
     * @param newId
     * @param oldId
     * @returns {boolean}
     */
    function changeGNId(newId,oldId){
        if(!newId || !oldId || !inGNList(oldId)){
            return false;
        }
        var tempGN = PrivateClass.gnObjList[oldId];
        tempGN.gnId = newId;
        delete PrivateClass.gnObjList[oldId];
        PrivateClass.gnObjList[newId] = tempGN;
        return true;
    }
    /**
     * 是否在列表中
     * @param gnId
     * @returns {boolean}
     */
    function inGNList(gnId){
        return !!PrivateClass.gnObjList[gnId];
    }

    function length(){
        return PrivateClass.gnObjList.length;
    }

    //==================================================

    window.gardener.OM = {
        addGNObject:addGNObject,
        removeGNObject:removeGNObject,
        getGNObject:getGNObject,
        changeGNId:changeGNId,
        inGNList:inGNList,
        length:length
    };

    return window.gardener.OM;

})(window);
//=======================GNEventManager===============================
/**
 * 事件管理对象
 */
gardener.GNEventManager = (function (window,undefined) {
    "use strict";

    var PrivateClass = {
        eventFromList: {length:0}
    };
    /**
     * 接口：事件源对象
     * IFrom{
     *  type,           //事件类型
     *  gnId,           //gn对象的id
     *  handlerList,    //事件处理器队列
     *  dataList        //自定义对象队列，会随着参数发送至事件处理器。
     * }
     */

    /**
     * 添加一个事件源对象
     * @param type {String}
     * @param gnId {String}
     * @param handler {Function}
     * @param data {Object}
     */
    function addEventFrom(type, gnId, handler, data) {
        var id = gnId + "_" + type;
        var list = PrivateClass.eventFromList;
        var item = list[id] || { has: false };  //如果IFrom对象不存在，则创建一个新的
        var handlers,datas,index;
        
        if(!item.has){
            item.type = type;
            item.gnId = gnId;
            item.handlers = [];
            item.handlers.push(handler);
            item.datas = [];
            item.datas.push(!data?false:data);
            item.has = true;
            PrivateClass.eventFromList[id] = item;    //add in list
            PrivateClass.eventFromList.length++;
        }else{
            handlers = item.handlers;
            datas = item.datas;
            index = handlers.indexOf(handler);
            if(index>-1){
                if(data){
                    datas[index] = data;
                }
            }else{
                handlers.push(handler);
                datas.push(!data?false:data);
            }           
        }
    }
    /**
     * 移除一个事件源对象
     * @param type
     * @param gnId
     * @param handler
     * @returns {boolean}
     */
    function removeEventFrom(type, gnId, handler) {
        var id = gnId + "_" + type;
        var list = PrivateClass.eventFromList;
        var from = list[id];
        if (!from) {
            return false;
        }
        list = from.handlers;
        if(list.length>0){
            var dataList = from.datas;
            var index = list.indexOf(handler);
            if(index>-1){
                list.splice(index,1);
                dataList.splice(index,1);
            }
        }
        //如果处理器列表已为空，移除该事件源对象
        if(!list || list.length<=0){
            from.type = null;
            from.gnId = null;
            from.handlers = null;
            from.datas = null;
            from.has = null;
            delete PrivateClass.eventFromList[id];
            PrivateClass.length--;
            if(PrivateClass.length<0){
                PrivateClass.length=0;
            }
        }
        return true;
    }
    /**
     * 获取一个事件源对象
     * @param type
     * @param gnId
     * @returns {*}
     */
    function getEventFrom(type, gnId) {
        return PrivateClass.eventFromList[gnId + "_" + type];
    }

    /**
     * 是否已经注册了一个事件源
     * @param type
     * @param gnId
     * @returns {boolean}
     */
    function hasEventFrom(type,gnId){
        return !!PrivateClass.eventFromList[gnId+"_"+type];
    }
    /**
     * @private
     * 输出事件列表
     */
    function _outputEventList(){
        return gardener.debug?PrivateClass.eventFromList:null;
    }
    
    //=========================================================================
    window.gardener.EM = {
        addEventFrom: addEventFrom,
        removeEventFrom: removeEventFrom,
        getEventFrom: getEventFrom,
        hasEventFrom:hasEventFrom,
        _outputEventList:_outputEventList
    };

    return window.gardener.EM;
})(window);
//=======================GNFrameManager================================
/**
 * 帧渲染对象
 */
gardener.GNFrameManager = (function(window,undefined){
    "use strict";

    var PrivateClass = {
        handlerList:{length:0}
    };
    /**
     * IFrameFrom{
     *  id:String,
     *  handler:Function,
     *  data:Object,
     *  isPlaying:Boolean
     * }
     *
     **/

    var initialized = false,frameRate = 60,animateRequest;
    var isPlay = false;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    /**
     * @private
     * 初始化
     */
    function initialize(){
        
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if(!window.requestAnimationFrame){
            window.requestAnimationFrame = function (callBack) {
                return setTimeout(callBack, 1000 / frameRate);
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
        FM.removeFrameListener = removeFrameListener;
        FM.pauseFrameListener = pauseFrameListener;
        FM.continueFrameListener = continueFrameListener;
        
        initialized = true;
    }
    //============================public=======================================
    /**
     * 添加帧更新监听
     * @param handler {Function} [necessary] 处理器回调
     * @param scope {Object} [optional] 处理器的this指向
     * @param data {Object} [optional] 需要发送到针处理器中的数据集合
     */
    function addFrameListener(handler,scope,data){
        if (!handler || typeof handler !== "function") {
            if(gn.LM){
                gn.LM.addLog("In GNFrameManager's addFrameListener","The params are error.",handler);
            }
            return;
        }
        if(!initialized){
            initialize();
        }
        var id,frameFrom;
        if(!handlerInList(handler)){
            frameFrom = {};
            frameFrom.id = (new Date().getTime())+Math.toFixed(Math.random()*1000,2);
            frameFrom.handler = handler;
            frameFrom.scope = scope;
            frameFrom.data = data;
            PrivateClass.handlerList[frameFrom.id] = frameFrom;
            PrivateClass.handlerList.length++;
            frameFrom.isPlaying = true;
        }else{
            return;
        }

        if(!animateRequest){
            animateRequest = window.requestAnimationFrame(drawFrame);
            isPlay = true;
        }

        return frameFrom.id;
    }
    /**
     * 移除帧更新监听
     * @param handler {Function} [necessary] 被注册过的处理器
     */
    function removeFrameListener(handler){
        var list = PrivateClass.handlerList;
        var key = handlerInList(handler);
        if(!!key){
            var frameFrom = list[key];
            frameFrom.id = null;
            frameFrom.handler = null;
            frameFrom.data = null;
            frameFrom.isPlaying = null;
            delete PrivateClass.handlerList[key];
            PrivateClass.handlerList.length--;
        }
        if(list.length<=0 && !!animateRequest){
            window.cancelAnimationFrame(animateRequest);
            animateRequest = null;
            isPlay = false;
        }
    }

    /**
     * 暂停对一个处理器的帧监听
     * @param handlerId {String} [optional] 处理器id。
     * 如果不传入任何参数，会暂停所有订阅者的响应
     */
    function pauseFrameListener(handlerId){
        if(arguments.length===0){
            isPlay = false;
            return;
        }

        if(inListById(handlerId)){
            var frameFrom = PrivateClass.handlerList[handlerId];
            frameFrom.isPlaying = false;
        }
    }

    /**
     * 继续对一个处理器的帧监听
     * @param handlerId {String} [optional] 处理器id。
     * 如果不传入任何参数，会恢复所有订阅者的响应。但是那些单独设置了暂停的处理除外。
     */
    function continueFrameListener(handlerId){
        if(arguments.length===0){
            isPlay = true;
            return;
        }
        var frameFrom;
        if(inListById(handlerId) && !(frameFrom=PrivateClass.handlerList[handlerId]).isPlaying){
            frameFrom.isPlaying = true;
        }
    }

    //============================================================
    /**
     * @private
     * 帧更新
     * @param timestamp
     * **/
    function drawFrame(timestamp) {
        if(!isPlay){
            return;
        }
        animateRequest = window.requestAnimationFrame(drawFrame);

        var list = PrivateClass.handlerList;
        var item,scope;
        for(var key in list){
            if(list.hasOwnProperty(key) && (item=PrivateClass.handlerList[key]).isPlaying){
                scope = item.scope;
                if(scope){
                    item.handler.call(scope,timestamp,item.data?item.data:null);
                }else{
                    item.handler(timestamp,item.data?item.data:null);
                }
            }
        }
    }

    /**
     * 处理器是否已被注册在列表中
     * @param handler
     * @returns {boolean}
     */
    function handlerInList(handler){
        var list = PrivateClass.handlerList;
        for(var key in list){
            if(list.hasOwnProperty(key) && list[key].handler === handler){
                return key;
            }
        }
        return false;
    }

    /**
     * 以id的方式查询处理器是否在列表中
     * @param handlerId
     * @returns {boolean}
     */
    function inListById(handlerId){
        return !!PrivateClass.handlerList[handlerId];
    }

    //=========================================
    var FM = {
        frameRate:frameRate,
        addFrameListener:addFrameListener
    };
    window.gardener.FM = FM;

    return FM;
})(window);
//=======================GNLogManager==================================
/**
 * 日志管理对象
 */
gardener.GNLogManager = (function(window,$,gn,undefined){
    "use strict";

    var PrivateClass = {
        sysLogList:[]
    };
    
    var LogType = {
        WARNING:0x505050,
        ERROR:0xe0e0e0
    };

    gn.LogType = LogType;

    /**
     * 添加一条日志
     */
    function addLog(){
        var ary = Array.prototype.slice.call(arguments,0);
        var text= "log add--"+new Date()+":";
        for(var i= 0,len=ary.length;i<len;i++){
            text+="<==|==>"+ary[i];
        }
        text+="\n";
        PrivateClass.sysLogList.push(text);
        if(gn.debug && window.console){
            var type = ary[ary.length-1];
            var methodName = type===LogType.WARNING?'warn':type===LogType.ERROR?'error':'log';
            console[methodName](text);
        }
    }

    /**
     * 显示全部日志
     */
    function showAllLog(){
        return PrivateClass.sysLogList.join("");
    }

    /**
     * 显示最新的一条日志
     */
    function showLastLog(){
        return PrivateClass.sysLogList[-1];
    }

    /**
     * 清除所有日志
     */
    function clearAllLog(){
        if(!PrivateClass.sysLogList || PrivateClass.sysLogList.length>0){
            PrivateClass.sysLogList = [];
            if(gn.debug && window.console){
                console.log("has log?:",PrivateClass.sysLogList);
            }
        }
    }

    window.gardener.LM = {
        addLog:addLog,
        showAllLog:showAllLog,
        showLastLog:showLastLog,
        clearAllLog:clearAllLog
    };

    return window.gardener.LM;
})(window,jQuery,gardener);
//=======================GNPoolManager==================================
/**
 * 对象池管理对象
 */
gardener.GNPoolManager = (function(window,undefined){
    "use strict";

    var PrivateClass = {
        poolList:{}
    };

    /**
     * 是否在对象池列表中
     * @param classItemName {String}
     */
    function inPoolList(classItemName){
        return PrivateClass.poolList.hasOwnProperty(classItemName);
    }

    /**
     * 获得列表中的一个对象池
     * @param classItemName
     * @returns {gardener.GNObjectPool}
     */
    function getPool(classItemName){
        return PrivateClass.poolList[classItemName];
    }

    /**
     * 从列表中移除一个对象池对象
     * @param classItemName {String}
     */
    function removePool(classItemName){
        if(inPoolList(classItemName)){
            delete PrivateClass.poolList[classItemName];
        }
    }

    //========================================

    window.gardener.PM = {
        getPool:getPool,
        removePool:removePool,
        inPoolList:inPoolList
    };

    return window.gardener.PM;
})(window);
//====================================================================
/**
 * 根级舞台事件
 */
gardener.StageEvent = {
    DOC_INIT:"docInit",     //文档初始化
    WIN_COMPLETE:"load",    //window的onload事件
    RESIZE:"resize",        //文档宽高改变事件
    SCROLL:"scroll"         //文档的滚动事件
};
/**
 * 鼠标事件类型
 */
gardener.MouseEvent = {
    CLICK:"click",
    DOUBLE_CLICK:"dblclick",
    MOUSE_DOWN:"mousedown",
    MOUSE_UP:"mouseup",
    MOUSE_ENTER:"mouseenter",
    MOUSE_LEAVE:"mouseleave",
    MOUSE_OVER:"mouseover",
    MOUSE_OUT:"mouseout",
    MOUSE_MOVE:"mousemove",
    FOCUS_IN:"focusin",
    FOCUS_OUT:"focusout",
    CONTEXT_MENU:"contextmenu"
};
/**
 * 键盘事件类型
 */
gardener.KeyboardEvent = {
    KEY_DOWN:'keydown',
    KEY_UP:'keyup',
    KEY_PRESS:'keypress'
};
//==============================GNObject==============================
/**
 * 根级类
 */
gardener.GNObject = (function(window,gn,undefined){
    "use strict";
    /**
     * 顶级类
     * @constructor
     */
    function GNObject(){
        this.className = "gardener.GNObject";
        this.gnId = gn.Core.getUUID();
        this._gnId = this.gnId;
        this.initialized = false;
        gn.OM.addGNObject(this);
    }
    /**
     * 输出对象字符串表示
     * @returns {string}
     */
    GNObject.prototype.output = function(){
        return this.className;
    };
    /**
     * 访问父类原型上的方法
     * @param functionName {String} [necessary]
     * @return 如果父类原型方法有返回值，则返回
     */
    GNObject.prototype.execSuper = function(){
        var ary = Array.prototype.slice.call(arguments,0);
        var fnName = ary.shift();
        fnName = fnName && typeof fnName === 'string' || typeof fnName==='function'?fnName:false;
        var returnValue,fn;
        try{
            if(!this.currentSuper){
                if(this.superPrototype){
                    this.currentSuper = this.superPrototype;
                    this.callSum = 1;
                }
            }else{
                if(this.currentSuper.superPrototype){
                    this.currentSuper = this.currentSuper.superPrototype;
                }
            }
            fn = fnName===gn.CONSTRUCTOR?this.currentSuper.constructor:this.currentSuper[fnName];
            if(this.callSum>4){
                if(gn.LM){
                    gn.LM.addLog("In GNObject's execSuper","你的继承层级已经超过4层，达到"+this.callSum+"层，请考虑继承结构，不要层级太多以免增加负担。",gn.LogType.WARNING);
                }
            }
            this.callSum++;
            if(!this.currentSuper.superPrototype || !this.currentSuper.superPrototype[fnName]){
                delete this.currentSuper;
                delete this.callSum;
            }
        }catch(error){
            if(gn.LM){
                gn.LM.addLog("In GNObject's execSuper()","The gnObj's superPrototype is error.",error,gn.LogType.ERROR);
            }
            return;
        }

        if(fnName && fn){
            returnValue = fn.apply(this,ary);
        }else{
            if(gn.LM){
                gn.LM.addLog("In GNObject's execSuper()","The first param must be a value that type is string and not equal undefined.",gn.LogType.WARNING);
            }
            return;
        }
        return returnValue;
    };
    /**
     * 最终清理。会将对象清理至可回收状态。可根据需要重写覆盖。
     * @param usePool {Boolean} [optional] 对象是否使用了对象池，使用对象池的对象，会进行属性重置，然后返回对象池。
     * 在对象池清理时间到来时，对象会被最终清空。默认为false.
     * @return {void}
     */
    GNObject.prototype.terminalClear = function(usePool){
        //如果使用了对象池，则重置后返回对象池。
        if(!!usePool){
            this.initialized = false;
            gn.OM.changeGNId(this._gnId,this.gnId);
            var pool = !gn.PM?null:gn.PM.getPool(this.className);
            if(!pool){
                if(gn.LM){
                    gn.LM.addLog("In GNObject's terminalClear()","don't go back to pool.",gn.LogType.WARNING);
                }
            }
            pool.goBackToPool(this);
            return;
        }
        //从对象列表中清除改对象。首先使用gnId清除，不成功则使用_gnId清除
        var success = gn.OM.removeGNObject(this.gnId);
        if(!success){
            success = gn.OM.removeGNObject(this._gnId);
            if(!success){
                if(gn.LM){
                    gn.LM.addLog("In GNObject's terminalClear()","don't go back to pool.","This GNObject is cleaned or not in GNObjectManager's list.",this.gnId,this._gnId,gn.LogType.ERROR);
                }
            }
        }
        this.className = null;
        this.gnId = null;
        this._gnId = null;
        this.initialized = null;
    };

    return GNObject;
})(window,gardener);
//==============================GNWatcher===============================
/**
 * 观察者对象
 */
gardener.GNWatcher = (function(window,gn){
    "use strict";

    function GNWatcher(){
        this.execSuper(gn.CONSTRUCTOR);
        this.className = "gardener.GNWatcher";
    }

    gn.Core.inherits(gn.GNObject,GNWatcher);
    /**
     * 添加一个事件类型的侦听
     * @param type [necessary] 事件类型
     * @param handler [necessary] 处理器
     * @param subscriberId [optional] 订阅者的引用
     * @param data  [optional] 附加对象，会被传递到处理器当中
     * @param listenerDescribe [optional] 订阅者描述，这是一个可选的，用于测试和优化的参数。内容应当为订阅者的字符串描述形式。
     * 如果设置了该参数，在dispatchEvent()中选择返回订阅者信息时，dispatchEvent()返回的列表中会包含该订阅者描述，用来定位事件将要发往何方。默认为undefined。
     */
    GNWatcher.prototype.addWatch = function(type,handler,subscriber,data,listenerDescribe){
        if(typeof type !== 'number' && typeof type !== "string" || typeof handler !== "function"){
            if(gn.LM){
                gn.LM.addLog("In GNWatcher's addWatch()","At watcher's addEventListener(),the params are error.",gn.LogType.WARNING);
            }
            return;
        }
        var eventData = {};
        eventData.scope = subscriber;
        eventData.data = data;
        if(listenerDescribe && typeof listenerDescribe === 'string'){
            eventData.listenerDescribe = listenerDescribe;
        }
        gn.EM.addEventFrom(type,this.gnId,handler,eventData); //加入事件管理对象
    };
    /**
     * 移除一个事件类型的侦听
     * Remove a listener for an event listener.
     * @param type [necessary]
     * @param handler [necessary]
     */
    GNWatcher.prototype.removeWatch = function(type,handler){
        if(typeof type !== "string" && typeof type !== 'number' || typeof handler !== "function"){
            if(gn.LM){
                gn.LM.addLog("In GNWatcher's removeWatch()","At GNWatcher's removeWatch,the params are error.",gn.LogType.WARNING);
            }
            return;
        }
        gn.EM.removeEventFrom(type,this.gnId,handler);
    };
    /**
     * 是否在侦听一个事件类型
     * Whether in listening for an event type.
     * @param type [necessary] 事件类型
     */
    GNWatcher.prototype.hasWatch = function(type){
        if(typeof type !== "string" && typeof type !== 'number'){
            if(gn.LM){
                gn.LM.addLog("In GNWatcher's hasWatch()","At GNWatcher's hasEvent,the params are error.",gn.LogType.ERROR);
            }
            return;
        }
        return !!gn.EM.getEventFrom(type,this.gnId);
    };
    /**
     * 派发一个会被监视的事件
     * @param type {String} [necessary] 事件类型
     * @param data {Object} [optional] 事件中包含的数据
     * @param outputListeners {Array} [optional] 输出订阅者的id 默认false，不输出.
     * 当需要知道派发的此次事件将会被传播到那些订阅者的时候，可以使用此返回的列表。
     */
    GNWatcher.prototype.dispatchEvent = function(type,data,outputListeners){
        if(!this.hasWatch(type)){
            return false;
        }
        var from = gn.EM.getEventFrom(type,this.gnId);
        var list = from.handlers;
        var dataList = from.datas;
        var scopeList;
        if(outputListeners){
            scopeList = [];
        }

        var itemData,sendEvent,gnEvent;
        for(var i= 0,item;!!(item=list[i]);i++){
            gnEvent = {};
            if(data && data.isDOMEvent){
                gnEvent.srcEvent = data;
            }else{
                gnEvent.data = data;
            }
            gnEvent.type = type;
            //处理订阅时附加的对象
            itemData = dataList[i];
            if(itemData.data){
                gnEvent.gnData = itemData.data;
            }
            //处理是否输出订阅者
            if(outputListeners && itemData.listenerDescribe){
                scopeList.push(itemData.listenerDescribe);
            }
            //使用作用域对象，如果有的话
            if(itemData.scope){
                gnEvent.subscriber = itemData.scope;
                gnEvent.target = itemData.scope;
                item.call(itemData.scope,gnEvent);   //调整事件处理器中的this指向订阅时指向的scope
                continue;
            }
            item(gnEvent);
        }
        item = null;
        itemData = null;
        if(outputListeners){
            return scopeList;
        }
    };

    return GNWatcher;

})(window,gardener);
//===============================GNStage=================================
/**
 * stage对象
 * Created by Brave Chen on 2016/1/15.
 */
gardener.GNStage = (function(window,$,gn,undefined){
    "use strict";

    var PrivateClass = {
        useKey:"gnStageCanUse"
    };

    var StageEvent = gn.StageEvent;

    function GNStage(useKey){
        if(useKey!==PrivateClass.useKey){
            return;
        }
        this.execSuper(gn.CONSTRUCTOR);
        this.className = "gardener.GNStage";
        /**window的jquery对象**/
        this.win$ = null;
        /**document的jquery对象**/
        this.doc$ = null;
        /**document的body对象**/
        this.bodyElement = null;
        /**视口宽度**/
        this.viewW = 0;
        /**视口高度**/
        this.viewH = 0;
        /**视口X轴距离，对应scrollLeft**/
        this.viewX = 0;
        /**视口Y轴距离，对应scrollTop**/
        this.viewY = 0;
        /**ie7以下**/
        this.isBelowIE7 = false;
        /**ie8**/
        this.isIE8 = false;
        /**ie9+**/
        this.isAboveIE9 = false;
        /**或者其他现代浏览器**/
        this.isOtherModern = false;


        this.docInitialized = false;
        this.winCompleted = false;

        /*@private use key*/
        this._useKey = useKey;
        /*@private executeList*/
        this._executeList = null;
    }

    gn.Core.inherits(gn.GNObject,GNStage);

    /**
     * 初始化
     */
    GNStage.prototype.initialize = function(){
        if(this.initialized)
            return;
        
        this._addExecuteHandler(gn.StageEvent.DOC_INIT,addInitEvent,PrivateClass.useKey);
        this._addExecuteHandler(gn.StageEvent.WIN_COMPLETE,addWinLoadEvent,PrivateClass.useKey);
        this._addExecuteHandler(gn.StageEvent.RESIZE,addResizeEvent,PrivateClass.useKey);
        this._addExecuteHandler(gn.StageEvent.SCROLL,addScrollEvent,PrivateClass.useKey);

        this.win$ = $(window);
        this.doc$ = $(document);
        this.doc$.ready(docInitialize);
        this.win$.on(StageEvent.WIN_COMPLETE,winComplete);
        this.initialized = true;
    };
    /**
     * 添加事件侦听
     * @param type {String} [necessary] 事件类型
     * @param handler {Function} [necessary] 处理函数
     * @param scope {Object} [optional] 处理函数作用域绑定的this指向的对象,默认是GNStage的实例
     * @param data {Object} [optional] 希望会发送至处理函数中的对象
     */
    GNStage.prototype.addEventListener = function(type,handler,scope,data){
        if(typeof type !== "string" || handler === null || typeof handler !== "function"){
            if(gn.LM){
                gn.LM.addLog("At GNStage's addEventListener()","The params are error.",gn.LogType.WARNING);
            }
            return;
        }
        
        //事件是否可以被添加。在页面win onload事件之后。DOC_INIT和WIN_COMPLETE是不可以再接受订阅的。
        var canAddEvent = this._executeList[type].call(this,type);
        if(canAddEvent){
            gn.EM.addEventFrom(type,this.gnId,handler,{scope:!scope?this:scope,data:data});
        }else{
            if(gn.LM){
                gn.LM.addLog("In GNStage's addEventListener()","The event '"+type+"can not add.",gn.LogType.WARNING);
            }
            return;
        }
    };
    /**
     * 移除事件侦听
     * @param type {String} [necessary] 事件类型
     * @param handler {Function} [necessary] 处理函数
     */
    GNStage.prototype.removeEventListener = function(type,handler){
        if(gn.EM.hasEventFrom(type,this.gnId)){
            gn.EM.removeEventFrom(type,this.gnId,handler);
        }
        if(!gn.EM.hasEventFrom(type,this.gnId)){
            if(type === StageEvent.SCROLL){
                this.win$.off(StageEvent.SCROLL);
            }
            if(type === StageEvent.RESIZE){
                this.win$.off(StageEvent.RESIZE);
            }
        }
    };

    //==================private====================

    /**
     * 添加执行方法
     * @param type {String} [necessary] 事件类型
     * @param handler {Function} [necessary] 处理函数
     * @param useKey {String} [necessary] 内部使用验证标识
     * @private
     */
    GNStage.prototype._addExecuteHandler = function(type,handler,useKey){
        this._executeList = this._executeList || {};
        if(useKey!==PrivateClass.useKey){
            return;
        }
        this._executeList[type] = handler;
    };

    /**
     * 处理添加滚动事件
     * @param type {String} [necessary] 事件类型
     */
    function addScrollEvent(type){
        if(!gn.EM.hasEventFrom(type,stage.gnId)){
            stage.win$.on(StageEvent.SCROLL,onWinScroll);
        }
        return true;
    }

    /**
     * 处理添加初始化事件
     * @param type {String} [necessary] 事件类型
     * @returns {boolean}
     */
    function addInitEvent(type){
        return !stage.docInitialized;
    }

    /**
     * 处理添加win加载完毕事件
     * @param type {String} [necessary] 事件类型
     * @returns {boolean}
     */
    function addWinLoadEvent(type){
        return !stage.winCompleted;
    }

    /**
     * 处理添加改变尺寸事件
     * @param type {String} [necessary] 事件类型
     * @returns {boolean}
     */
    function addResizeEvent(type){
        if(!gn.EM.hasEventFrom(type,stage.gnId)){
            stage.win$.on(StageEvent.RESIZE,onWinResize);
        }
        return true;
    }

    //======================================
    /**
     * 文档初始化事件
     */
    function docInitialize(){
        stage.bodyElement = window.document.body || window.document.bodyElement;
        stage.docInitialized = true;
        stage.viewW = stage.win$.width();
        stage.viewH = stage.win$.height();
        checkBrowser();

        doDispatchEvent(StageEvent.DOC_INIT,stage.gnId,true);
        gn.EM.removeEventFrom(StageEvent.DOC_INIT,stage.gnId);
    }

    /**
     * 检查浏览器兼容性
     */
    function checkBrowser(){
        var CHECK_STYLES = [
            "<style>",
                ".check-browser{",
                    "position:absolute;",
                    "top:-9999px;",
                    "left:-9999px;",
                    "width: 100px;",
                    "height: 100px;",
                    "visibility:hidden;" ,
                    "background-color: rgb(0,255,255);",
                    "*background-color:rgb(255,0,0);" ,
                    "background-color:#ffff00\\0;",
                "}",
            "</style>"].join('');
        var div = document.createElement('div');
        div.innerHTML = CHECK_STYLES;
        div.setAttribute('class','check-browser');
        stage.bodyElement.appendChild(div);

        var div$ = $('.check-browser');
        var cssResult = div$.css('background-color');
        var _style = div.style;
        var styleResult = 'transform' in _style || 'msTransform' in _style || 'mozTransform' in _style || 'webkitTransform' in _style;
        var log;
        switch (cssResult){
            case undefined:
                stage.isBelowIE7 = true;
                log = "maybe ie7-";
                break;
            case "transparent":
                if(!styleResult){
                    stage.isIE8 = true;
                    log = 'maybe ie8';
                }
                break;
            case "rgb(0, 255, 255)":
                if(styleResult){
                    stage.isOtherModern = true;
                    log  = 'is other browser';
                }
                break;
            default:
                if(styleResult) {
                    stage.isAboveIE9 = true;
                    log = 'maybe ie9+';
                }
                break;
        }
        stage.bodyElement.removeChild(div);
        if(gn.LM){
            gn.LM.addLog('In GNStage\'s checkBrowser','The browser check result: '+log);
        }
    }

    /**
     * 资源加载完成事件
     * @param e
     */
    function winComplete(e){
        stage.winCompleted = true;
        doDispatchEvent(StageEvent.WIN_COMPLETE,stage.gnId,true,e);
        stage.win$.off(StageEvent.WIN_COMPLETE);
        gn.EM.removeEventFrom(StageEvent.WIN_COMPLETE,stage.gnId);        
    }

    /**
     * 屏幕滚动事件
     * @param e
     */
    function onWinScroll(e){
        stage.viewX = document.body.scrollLeft;
        stage.viewY = document.body.scrollTop;
        doDispatchEvent(StageEvent.SCROLL,stage.gnId,false,e);
    }

    /**
     * 尺寸改变事件
     * @param e
     */
    function onWinResize(e){
        stage.viewW = stage.win$.width();
        stage.viewH = stage.win$.height();
        doDispatchEvent(StageEvent.SCROLL,stage.gnId,false,e);
    }

    /**
     * 执行分派事件
     * @param type {String} [necessary] 事件类型
     * @param gnId {String} [necessary] 注册事件的gn对象id
     * @param isOnce {Boolean} [optional] 是否只触发一次
     * @param srcEvent {Object} [optional] dom事件
     */
    function doDispatchEvent(type,gnId,isOnce,srcEvent){
        if(!gn.EM.hasEventFrom(type,gnId)){
            return;
        }
        var from = gn.EM.getEventFrom(type,gnId);
        if(!from){
            if(gn.LM){
                gn.LM.addLog("In GNStage's doDispatchEvent()","The event '"+ type +" can not dispatch.",gn.LogType.WARNING);
            }
            return;
        }
        isOnce = !!isOnce;
        var len = from.handlers.length;
        var item,itemData,event;
        while(len>0){
            itemData = isOnce?from.datas.pop():from.datas[len-1];
            item = isOnce?from.handlers.pop():from.handlers[len-1];
            len--;
            event = {};
            event.srcEvent = srcEvent;
            event.type = type;
            event.target = itemData.scope;
            event.data = itemData.data;
            if(event.target){
                item.call(event.target,event);
            }else{
                item(event);
            }
        }
    }

    //======================================

    var stage;

    return {
        /**
         * 获取GNStage对象的单例
         * @returns {*}
         */
        getInstance:function(){
            if(!stage){
                stage = new GNStage(PrivateClass.useKey);
            }
            return stage;
        }
    };

})(window,jQuery,gardener);
//===============================GNObjectPool==============================
/**
 * 适用于GNObject体系的对象池
 */
gardener.GNObjectPool = (function(window,gn,undefined){
    "use strict";
    /**
     * 适用于GNObject体系的对象池
     * @param ClassName {String} 类名全名称，来自于对象的className属性或者其它
     * @param option {Object} 配置信息
     * @return {Object}
     */
    function GNObjectPool(ClassName,option){
        this.execSuper(gn.CONSTRUCTOR);
        this.className  = "gardener.GNObjectPool";
        if(!ClassName || typeof ClassName !== "string"){
            if(gn.LM){
                gn.LM.addLog("In GNObjectPool's GNObjectPool()","init objectPool is error.",gn.LogType.ERROR);
            }
            return null;
        }
        this.classItemName = ClassName;
        this.ClassItem = gn.Core.getDefinitionByName(this.classItemName);
        this.objectList = [];
        this.initialize = true;
    }

    gn.Core.inherits(gn.GNObject,GNObjectPool);

    var opp = GNObjectPool.prototype;
    /**
     * 输出信息
     * @returns {*}
     */
    opp.output = function(){
        return "[ObjectPool:"+!!this.classItemName?this.classItemName:"undefined"+"]";
    };
    /**
     * 最终清理
     */
    opp.terminalClear = function(){
        this.execSuper('terminalClear',false);
    };

    /**
     * 从对象池中获取一个对象
     * @returns {*}
     */
    opp.gainFromPool = function(){
        if(!this.initialize)
            return false;
        if(this.hasObjectIn()){
            return this.objectList.pop();
        }
        return new this.ClassItem();
    };
    /**
     * 把一个对象返还回池子中
     * @param gnObject
     * @returns {boolean}
     */
    opp.goBackToPool = function(gnObject){
        if(!this.initialized)
            return false;
        if(gnObject.className === this.classItemName){
            this.objectList.push(gnObject);
        }else{
            if(gn.LM){
                gn.LM.addLog("In GNObjectPool's goBackToPool()","The param is not belong in this pool.",gn.LogType.WARNING);
            }
        }
    };
    /**
     * 创建指定个数的对象
     * @param sum
     */
    opp.createInstance = function(sum){
        if(sum<=0)
            return;
        var item;
        while(sum--){
            item = new this.ClassItem();
            this.objectList.push(item);
        }
    };
    /**
     * 池子中是否还有对象
     * @returns {boolean}
     */
    opp.hasObjectIn = function(){
        return this.objectList.length>0;
    };
    /**
     * 当前池子中对象总数
     * @returns {*}
     */
    opp.sumOfObject = function(){
        return this.objectList.length;
    };
    /**
     * 清空对象池，并决定是否要销毁对象。
     * 当选择销毁对象时，不仅会主动调用对象的终极清理方法terminalClear()，还会从全局对象管理池中删除对象。
     * 即希望尽可能的去除对池中对象的所有引用。
     * @param isDelete {boolean} 是否需要销毁对象.
     * @returns {boolean}
     */
    opp.clearPool = function(isDelete){
        if(this.objectList.length<=0){
            return false;
        }
        var len = this.objectList.length;
        while(len--){
            var obj = this.objectList.pop();
            if(isDelete){
                if(obj.hasOwnProperty("initialized") && obj.initialized === true){
                    obj.terminalClear();
                }
                gn.OM.removeGNObject(obj);
            }
        }
    };
    return GNObjectPool;

})(window,gardener);
//===============================GNPart===================================
/**
 * 零件类，所有的显示层对象均继承此对象
 */
gardener.GNPart = (function(window,$,gn,undefined){
    "use strict";

    function GNPart(){
        this.execSuper(gn.CONSTRUCTOR);
        this.className = "gardener.GNPart";
        this.element = null;            //HTMLElement
        this.element$ = null;           //jQuery
        this.stage = null;              //本域的全局GNStage对象
        this.state = null;
    }
    gn.Core.inherits(gn.GNObject,GNPart); //实现继承
    /**
     * 输出对象字符串表示
     * @returns {String}
     */
    GNPart.prototype.output = function(){
        return "["+this.className+","+((!!this.gnId)?this.gnId:"not initialized")+"]";
    };

    /**
     * 最终清理
     * @param usePool {Boolean} [optional] 如果使用了对象池，对象将会被重置，并返回对象池。
     */
    GNPart.prototype.terminalClear = function(usePool){
        this.element = null;
        this.element$ = null;
        this.execSuper('terminalClear',usePool);
    };
    /**
     * 初始化
     * @param element {HTMLElement} DOM对象
     */
    GNPart.prototype.initialize = function(element){
        if(this.initialized)
            return false;
        if(element && element.nodeType === 1){
            var id = element.getAttribute(gn.GN_ID);
            if(!!id){
                gn.OM.changeGNId(id,this.gnId);
            }
            this.element = element;         //HTMLElement
            this.element$ = $(element);     //jQuery
            this.stage = gn.GM?gn.GM.stage:null;
        }else{
            if(gn.LM){
                gn.LM.addLog("In GNPart's initialize()","The param of element is null.",gn.LogType.ERROR);
            }
            return false;
        }
        return true;
    };
    /**
     * 设置状态
     */
    GNPart.prototype.setState = function(type){

    };
    /**
     * 获取状态
     */
    GNPart.prototype.getState = function(){
        return this.state;
    };
    /**
     * 更新显示层
     * 如果订阅了window onload事件，在事件触发时，可以设计在全部组件中逐级调用此方法。
     */
    GNPart.prototype.updateDisplay = function(){

    };
    /**
     * 延迟，以及使渲染生效
     */
    GNPart.prototype.validateRendered = function(){

    };
    /**
     * 获取组件的element在全局文档中的尺寸和位置。
     * 如果组件隐藏(display:hidden)，则不会有值返回。
     * @return rect{
     *  width:Number,
     *  height:Number,
     *  x:Number,//===>left
     *  y:Number,//===>top
     * }
     */
    GNPart.prototype.getBounds = function(){
        var rect = {};
        rect.width = this.element$.width();
        rect.height = this.element$.height();
        var position = this.element$.offset();
        rect.x = position.left;
        rect.y = position.top;
        return rect;
    };

    return GNPart;
    
})(window,jQuery,gardener);
//=======================GNGlobalManager===============================
/**
 * 全局管理对象。<br />
 * 使用全局管理对象可以作为框架的根级入口文件。并且集成了有关Window和document等对象信息。
 */
gardener.GNGlobalManager = (function(window,$,gn,undefined){
    "use strict";

    gn.GM = {};
    var gm = gn.GM;

    gm.stage = gn.GNStage.getInstance();
    gm.stage.initialize();
    gm.watcher = new gn.GNWatcher();
    
    gn.UIEvent = {};

    return gn.GM;

})(window,jQuery,gardener);
//=====================================================================
/**
 * 弹出管理对象
 */
gardener.GNPopupManager = (function(window,gn,undefined){
    'use strict';

    var initialized = false;
    var popupList = null;
    var boxList = null;
    var maskBox,maskBox$;
    var stage;
    var lowEffect = false;
    /**
     * 初始化
     * @param cssOption
     */
    function initialize(cssOption){

        stage = gn.GM.stage;
        popupList = {length:0};
        boxList = [];

        lowEffect = stage.isBelowIE7 || stage.isIE8;    ///*ie8- fix*/
        maskBox = document.createElement('div');
        maskBox$ = $(maskBox);
        maskBox$.addClass('gn-popup-mask');
        maskBox$.html(getPopupCss(cssOption));
        initialized = true;
        return true;
    }

    /**
     * 弹出
     * @param element
     * @param option
     */
    function launch(element,option){
        if(!initialized){
            initialize(option && option.popupCss?option.popupCss:undefined);
        }
        if(element.element){
            element = element.element;
        }
        if(!element || element.nodeType!==1 || !stage.docInitialized){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s launch()','The param of element is error or the doc has not initialized.',element,gn.LogType.WARNING);
            }
            return false;
        }
        var popupBox = boxList.length>0?boxList[boxList.length-1]:document.createElement('div');
        popupBox.appendChild(element);
        var popupBox$ = $(popupBox);
        popupBox$.addClass('gn-popup-box');
        if(lowEffect){
            popupBox$.addClass('gn-popup-fly');
        }
        var popupId = new Date().getTime()+"-"+Math.random()*100;
        var popupObj = {
            popupId:popupId,
            popupBox:popupBox,
            popupBox$:popupBox$,
            content:element,
            className:'popupObj'
        };
        element.setAttribute('data-popupid',popupId);
        popupList[popupId] = popupObj;
        popupList.length++;
        maskBox.appendChild(popupBox);
        if(maskBox.parentNode !== document.body){
            document.body.appendChild(maskBox);
        }
        /*ie8- fix*/
        if(lowEffect){
            var element$ = $(element);
            var w = element$.width();
            var h = element$.height();
            var yP = 100*(stage.viewH-h)*0.5/stage.viewH;
            var xP = 100*(stage.viewW-w)*0.5/stage.viewW;
            popupBox$.css({width:w+'px',height:h+'px',top:yP+'%',left:xP+'%'});
            popupBox$.removeClass('gn-popup-fly');
        }
    }

    /**
     * 关闭
     * @param element
     */
    function shutUp(element){
        if(element.element){
            element = element.element;
        }
        var shutAll = element.className!=='popupObj';
        if(shutAll && (!initialized || !stage.docInitialized || !element || element.nodeType!==1)){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUp()','The param of element is error.',element,gn.LogType.WARNING);
            }
            return false;                    
        }
        var popupObj = element.className==='popupObj'?element:getPopupObj(element);
        if(!popupObj){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUp()','This element is not launching.');
            }
            return;
        }
        maskBox.removeChild(popupObj.popupBox);
        popupObj.popupBox$.removeClass('gn-popup-box');
        popupObj.popupBox.removeChild(popupObj.content);
        if(popupObj.content.getAttribute('data-popupid')){
            popupObj.content.removeAttribute('data-popupid');
        }
        /*ie8- fix*/
        if(lowEffect){
            popupObj.popupBox.removeAttribute('style');
        }
        boxList.push(popupObj.popupBox);
        popupObj.popupBox = null;
        popupObj.popupBox$ = null;
        popupObj.content = null;
        delete popupList[popupObj.popupId];
        popupList.length--;
        if(popupList.length<=0){
            document.body.removeChild(maskBox);
        }
    }
    /**
     * 关闭全部弹窗
     */
    function shutUpAll(){
        if(!initialized || !stage.docInitialized){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUpAll()','The GNPopupManager has not initialized.',gn.LogType.WARNING);
            }
            return false;
        }
        for(var key in popupList){
            if(popupList.hasOwnProperty(key) && key!=='length'){
                shutUp(popupList[key]);
            }
        }      
    }

    /**
     * 是否已经被弹射出
     * @param element
     * @returns {boolean}
     */
    function isLaunching(element){
        if(!element || element.nodeType!==1){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s isLaunching()','The param of element is error.',element,gn.LogType.WARNING);
            }
            return false;
        }
        return !!getPopupObj(element);
    }
    /**
     * @private
     * 输出所有弹出窗口，此方法只有在调试模式下才会起作用
     */
    function _outputPopupList(){
        return gn.debug?popupList:null;
    }
    
    //==================================================================
    /**
     * 获取popup配置对象
     * @param element
     * @returns {*}
     */
    function getPopupObj(element){
        var id = element.getAttribute('data-popupid');
        if(id){
            return popupList[id];
        }
        var popupObj;
        for(var key in popupList){
            if(popupList.hasOwnProperty(key)){
                popupObj = popupList[key];
                if(popupObj.element === element){
                    return popupObj;
                }
            }
        }
    }
    /*
        IPopupCSS{
            maskWidth:"100%/100px/10em",
            maskHeight:"100%/100px/10em",
            maskBg:"rgba(53,52,52,0.5)/#000000/url('') no-repeat...",
            maskZIndex:"99999",
        }
    */
    /**
     * 获取popup css文本
     * @param option {Object} [necessary] IPopupCSS类型的对象
     * @returns {string}
     */
    function getPopupCss(option){
        var viewW = gn.GM?gn.GM.stage.viewW:0;
        var viewH = gn.GM?gn.GM.stage.viewH:0;
        var maskWidth = option && option.maskWidth?option.maskWidth:viewW!==0?(viewW+"px"):"100%";
        var maskHeight = option && option.maskHeight?option.maskHeight:viewH!==0?(viewH+"px"):"100%";
        return ["<style>",
                    ".gn-popup-mask{",
                        "width:100%;",
                        "height:100%;",
                        "display:block;",
                        "overflow:hidden;",
                        "position:fixed;",
                        "left:0;",
                        "top:0;",
                        "background:"+(option && option.maskBg?option.maskBg:'rgba(53,52,52,0.5)') + ";",
                        "z-index:"+(option && option.maskZIndex?option.maskZIndex:'99999')+ ";",
                    "}",
                    ".gn-popup-box{",
                        "position:fixed;",
                        "left:50%;",
                        "top:50%;",
                        "-webkit-transform:translate(-50%,-50%);",
                        "-moz-transform:translate(-50%,-50%);",
                        "transform:translate(-50%,-50%);",
                    "}",
                    ".gn-popup-fly{",
                        "position:absolute;",
                        "left:-9999px;",
                        "top:-9999px;",
                        "visibility:hidden;" ,
                "</style>"].join('');
    }
    
    var PopM = {
        launch:launch,
        shutUp:shutUp,
        isLaunching:isLaunching,
        shutUpAll:shutUpAll,
        _outputPopupList:_outputPopupList
    };
    
    window.gardener.PopM = PopM;
    
    return PopM;
    
})(window,gardener);
//=======================GNTools========================================
/**
 * 实用工具集合
 * @type {{url}}
 */
gardener.GNTools = (function(window,undefined){
    "use strict";
    /**url操作工具**/
    var url = {
        /**
         * 获取url参数
         * @returns {Object}
         */
        getParams:function(){
            var args={};
            var query=window.location.search.substring(1);//获取查询串
            var pairs=query.split("&");//在逗号处断开
            for(var i= 0,item;(item=pairs[i])!==null;i++){
                var pos=item.indexOf('=');//查找name=value
                if(pos===-1) continue;//如果没有找到就跳过
                var key=item.substring(0,pos);//提取key
                var value=item.substring(pos+1);//提取value
                args[key]=decodeURI(value);//存为属性
            }
            return args;
        }
    };

    return {
        url:url
    };
})(window);