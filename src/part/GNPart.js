/**
 * 零件类，所有的显示层对象均继承此对象
 * Created by Brave on 16/1/2.
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
