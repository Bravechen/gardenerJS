/**
 * 弹出管理对象
 * 弹出对象弹网页可弹窗口，简化操作简功能可简之处。
 * @author Brave Chan on 2016.4.26
 */
gardener.GNPopupManager = (function(window,gn,undefined){
    'use strict';

    var initialized = false;
    var popupList = null;
    var boxList = null;
    var maskBox,maskBox$;
    var stage;
    var lowEffect = false;
    /**
     * 初始化
     * @param cssOption
     */
    function initialize(cssOption){

        stage = gn.GM.stage;
        popupList = {length:0};
        boxList = [];

        lowEffect = stage.isBelowIE7 || stage.isIE8;    ///*ie8- fix*/
        maskBox = document.createElement('div');
        maskBox$ = $(maskBox);
        maskBox$.addClass('gn-popup-mask');
        maskBox$.html(getPopupCss(cssOption));
        initialized = true;
        return true;
    }

    /**
     * 弹出
     * @param element
     * @param option
     */
    function launch(element,option){
        if(!initialized){
            initialize(option && option.popupCss?option.popupCss:undefined);
        }
        if(element.element){
            element = element.element;
        }
        if(!element || element.nodeType!==1 || !stage.docInitialized){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s launch()','The param of element is error or the doc has not initialized.',element,gn.LogType.WARNING);
            }
            return false;
        }
        var popupBox = boxList.length>0?boxList[boxList.length-1]:document.createElement('div');
        popupBox.appendChild(element);
        var popupBox$ = $(popupBox);
        popupBox$.addClass('gn-popup-box');
        if(lowEffect){
            popupBox$.addClass('gn-popup-fly');
        }
        var popupId = new Date().getTime()+"-"+Math.random()*100;
        var popupObj = {
            popupId:popupId,
            popupBox:popupBox,
            popupBox$:popupBox$,
            content:element,
            className:'popupObj'
        };
        element.setAttribute('data-popupid',popupId);
        popupList[popupId] = popupObj;
        popupList.length++;
        maskBox.appendChild(popupBox);
        if(maskBox.parentNode !== document.body){
            document.body.appendChild(maskBox);
        }
        /*ie8- fix*/
        if(lowEffect){
            var element$ = $(element);
            var w = element$.width();
            var h = element$.height();
            var yP = 100*(stage.viewH-h)*0.5/stage.viewH;
            var xP = 100*(stage.viewW-w)*0.5/stage.viewW;
            popupBox$.css({width:w+'px',height:h+'px',top:yP+'%',left:xP+'%'});
            popupBox$.removeClass('gn-popup-fly');
        }
    }

    /**
     * 关闭
     * @param element
     */
    function shutUp(element){
        if(element.element){
            element = element.element;
        }
        var shutAll = element.className!=='popupObj';
        if(shutAll && (!initialized || !stage.docInitialized || !element || element.nodeType!==1)){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUp()','The param of element is error.',element,gn.LogType.WARNING);
            }
            return false;                    
        }
        var popupObj = element.className==='popupObj'?element:getPopupObj(element);
        if(!popupObj){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUp()','This element is not launching.');
            }
            return;
        }
        maskBox.removeChild(popupObj.popupBox);
        popupObj.popupBox$.removeClass('gn-popup-box');
        popupObj.popupBox.removeChild(popupObj.content);
        if(popupObj.content.getAttribute('data-popupid')){
            popupObj.content.removeAttribute('data-popupid');
        }
        /*ie8- fix*/
        if(lowEffect){
            popupObj.popupBox.removeAttribute('style');
        }
        boxList.push(popupObj.popupBox);
        popupObj.popupBox = null;
        popupObj.popupBox$ = null;
        popupObj.content = null;
        delete popupList[popupObj.popupId];
        popupList.length--;
        if(popupList.length<=0){
            document.body.removeChild(maskBox);
        }
    }
    /**
     * 关闭全部弹窗
     */
    function shutUpAll(){
        if(!initialized || !stage.docInitialized){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s shutUpAll()','The GNPopupManager has not initialized.',gn.LogType.WARNING);
            }
            return false;
        }
        for(var key in popupList){
            if(popupList.hasOwnProperty(key) && key!=='length'){
                shutUp(popupList[key]);
            }
        }      
    }

    /**
     * 是否已经被弹射出
     * @param element
     * @returns {boolean}
     */
    function isLaunching(element){
        if(!element || element.nodeType!==1){
            if(gn.LM){
                gn.LM.addLog('In GNPopupManager\'s isLaunching()','The param of element is error.',element,gn.LogType.WARNING);
            }
            return false;
        }
        return !!getPopupObj(element);
    }
    /**
     * @private
     * 输出所有弹出窗口，此方法只有在调试模式下才会起作用
     */
    function _outputPopupList(){
        return gn.debug?popupList:null;
    }
    
    //==================================================================
    /**
     * 获取popup配置对象
     * @param element
     * @returns {*}
     */
    function getPopupObj(element){
        var id = element.getAttribute('data-popupid');
        if(id){
            return popupList[id];
        }
        var popupObj;
        for(var key in popupList){
            if(popupList.hasOwnProperty(key)){
                popupObj = popupList[key];
                if(popupObj.element === element){
                    return popupObj;
                }
            }
        }
    }
    /*
        IPopupCSS{
            maskWidth:"100%/100px/10em",
            maskHeight:"100%/100px/10em",
            maskBg:"rgba(53,52,52,0.5)/#000000/url('') no-repeat...",
            maskZIndex:"99999",
        }
    */
    /**
     * 获取popup css文本
     * @param option {Object} [necessary] IPopupCSS类型的对象
     * @returns {string}
     */
    function getPopupCss(option){
        var viewW = gn.GM?gn.GM.stage.viewW:0;
        var viewH = gn.GM?gn.GM.stage.viewH:0;
        var maskWidth = option && option.maskWidth?option.maskWidth:viewW!==0?(viewW+"px"):"100%";
        var maskHeight = option && option.maskHeight?option.maskHeight:viewH!==0?(viewH+"px"):"100%";
        return ["<style>",
                    ".gn-popup-mask{",
                        "width:100%;",
                        "height:100%;",
                        "display:block;",
                        "overflow:hidden;",
                        "position:fixed;",
                        "left:0;",
                        "top:0;",
                        "background:"+(option && option.maskBg?option.maskBg:'rgba(53,52,52,0.5)') + ";",
                        "z-index:"+(option && option.maskZIndex?option.maskZIndex:'99999')+ ";",
                    "}",
                    ".gn-popup-box{",
                        "position:fixed;",
                        "left:50%;",
                        "top:50%;",
                        "-webkit-transform:translate(-50%,-50%);",
                        "-moz-transform:translate(-50%,-50%);",
                        "transform:translate(-50%,-50%);",
                    "}",
                    ".gn-popup-fly{",
                        "position:absolute;",
                        "left:-9999px;",
                        "top:-9999px;",
                        "visibility:hidden;" ,
                "</style>"].join('');
    }
    
    var PopM = {
        launch:launch,
        shutUp:shutUp,
        isLaunching:isLaunching,
        shutUpAll:shutUpAll,
        _outputPopupList:_outputPopupList
    };
    
    window.gardener.PopM = PopM;
    
    return PopM;
    
})(window,gardener);