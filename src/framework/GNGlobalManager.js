/**
 * 全局管理对象。<br />
 * 使用全局管理对象可以作为框架的根级入口文件。并且集成了有关Window和document等对象信息。
 * Created by Brave Chen on 2016/1/15.
 */
gardener.GNGlobalManager = (function(window,$,gn,undefined){
    "use strict";

    gn.GM = {};
    var gm = gn.GM;

    gm.stage = gn.GNStage.getInstance();
    gm.stage.initialize();
    gm.watcher = new gn.GNWatcher();
    
    gn.UIEvent = {};
    
    return gn.GM;

})(window,jQuery,gardener);
