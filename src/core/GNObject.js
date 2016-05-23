/**
 * @author Brave Chen on 2015.12.10
 * @version alpha v0.0.0 开发各项功能
 * @dependence jQuery
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

