/**
 * 日志管理对象
 * Created by Brave Chen on 2016/1/15.
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