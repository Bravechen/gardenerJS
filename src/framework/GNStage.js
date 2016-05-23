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
