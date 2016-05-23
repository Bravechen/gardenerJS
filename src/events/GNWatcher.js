/**
 * 观察者对象
 * Created by Brave Chen on 2016/1/15.
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
