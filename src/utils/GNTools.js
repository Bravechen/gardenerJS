/**
 * Created by admin on 2016/3/17.
 */
gardener.GNTools = (function(window,undefined){
    "use strict";
    /**url操作工具**/
    var url = {
        /**
         * 获取url参数
         * @returns {{}}
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