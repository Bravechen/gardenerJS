
//===========================================
var DialogBox = (function(window,gn,$){
    'use strict';

    var watcher = gn.GM.watcher;

    function DialogBox(){
        this.execSuper(gn.CONSTRUCTOR);
        this.className = "DialogBox";
        this.closeBtn$ = null;
        this.certainBtn$ = null;
        this.cancelBtn$ = null;
    }

    gn.Core.inherits(gn.GNPart,DialogBox);

    var dp = DialogBox.prototype;

    dp.initialize = function(element){
        this.execSuper('initialize',element);

        createChildren.call(this);
        childrenCreated.call(this);
    };

    function createChildren(){
        this.closeBtn$ = this.element$.find('a[data-gnname=closeBtn]');
        this.certainBtn$ = this.element$.find('a[data-gnname=certainBtn]');
        this.cancelBtn$ = this.element$.find('a[data-gnname=cancelBtn]');
        console.log(this.closeBtn$,this.certainBtn$,this.cancelBtn$);
    }

    function childrenCreated(){
        this.element$.on(gn.MouseEvent.CLICK,{scope:this},onDialogClickHandler);
    }

    function onDialogClickHandler(e){
        var that = e.data.scope;
        switch(e.target){
            case that.closeBtn$[0]:
                console.log('closeBtn$ click');
                watcher.dispatchEvent('closePopup');
                break;
            case that.certainBtn$[0]:
                console.log('certainBtn$ click');
                watcher.dispatchEvent('closePopup');
                break;
            case that.cancelBtn$[0]:
                console.log('cancelBtn$ click');
                watcher.dispatchEvent('closePopup');
                break;
            default:
                console.warn(e.target);
                break;
        }
    }

    return DialogBox;

})(window,gardener);
//===============================================
(function(window,$,gn,undefined){
    'use strict';
    gn.debug = true;
    var dialogBox;
    var watcher = gn.GM.watcher;
    console.log(gardener);
    function initialize(){
        dialogBox = new DialogBox();
        dialogBox.initialize(document.getElementById('dialogBox'));
        watcher.addWatch('closePopup',onClosePopupHandler);
        gn.GNPopupManager.launch(dialogBox.element);
    }

    function onClosePopupHandler(e){
        gn.PopM.shutUp(dialogBox.element);
    }
    
    
    $(initialize);
    
})(window,jQuery,gardener);