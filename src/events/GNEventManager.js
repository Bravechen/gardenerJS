/**
 * 事件管理对象
 * Created by Brave Chen on 2016/1/15.
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
