/**
 * 对象池管理对象
 * Created by Brave Chen on 2016/1/15.
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
