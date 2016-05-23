/**
 * Created by admin on 2016/2/24.
 */
this.test = this.test || {};

test.Box = (function(window,$,gn){
    "use strict";

    function Box(){
        this.execSuper('constructor');
        this.className = "test.Box";
    }

    gn.Core.inherits(gn.GNObject,Box);

    Box.prototype.output = function(){
        var superOutput = this.execSuper('output');
        console.log("super:",superOutput);
        return "输出super()，并覆盖。"+this.className+":"+this.gnId;
    };

    return Box;

})(window,jQuery,gardener);

(function(window,$,gn,test){
    "use strict";

    var boxList,sum=10;

    $(document).ready(initialize);

    /**
     * init
     */
    function initialize(){
        boxList = [];
        var box;

        while(sum--){
            box = new test.Box();
            boxList.push(box);
            console.log("gnId:",box.gnId,"output:",box.output());
        }
        console.log("****************");
        box = gn.OM.getGNObject(boxList[1].gnId);
        console.log("Get a box in gn.OM==>",box,box.gnId,box.className);
        console.log("Change a gnId before:",boxList[2].gnId);
        gn.OM.changeGNId("box02",boxList[2].gnId);
        console.log("Change a gnId after:",boxList[2].gnId);
        console.log("Does a box in gn.OM?==>",gn.OM.inGNList(boxList[3].gnId));
        console.log("How many does gn.OM have?===>",gn.OM.length());
        console.log("Let's destroy all boxes.");
        for(var i= 0;(box=boxList[i])!=null;i++){
            box.terminalClear(false); //The param of 'false' is optional.
        }
        console.log('Look,gn.OM has any GNObject in it.===>',gn.OM.length());
        /*==== Let's test the create a instance by a gnObject's className =====*/
        //we can do this:
        var ClassItem = gn.Core.getDefinitionByName('test.Box');
        box = new ClassItem();
        console.log(box.gnId,gn.OM.length());

        box.terminalClear();
        //we also can use this:
        box = gn.Core.createInstance('test.Box');
        console.log(box.gnId,gn.OM.length());
    }

})(window,jQuery,gardener,test);
