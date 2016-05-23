
/**
 * 帧渲染对象
 * Created by Brave Chen on 2016/1/15.
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