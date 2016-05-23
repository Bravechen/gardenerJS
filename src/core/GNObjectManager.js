/**
 * GN对象管理类
 * Created by Brave Chen on 2016/1/15.
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