'use strict';

(function(ns){

  Pard.Widgets.Bus = function(){
    var callbacks = {}

    return {
      on: function(eventName, callback){
        //console.log('on', eventName);
        callbacks[eventName] = callbacks[eventName] || [];
        callbacks[eventName].push(callback);
      },
      trigger: function(eventName, data){
        //console.log('trigger', eventName, data);
        if (!callbacks[eventName])
          return;
        callbacks[eventName].forEach(function(callback){
          callback(data);
        });
      },
      callbacks: function(){
        return callbacks;
      },
      off: function(eventName){
        delete callbacks[eventName]
      }
    }
  }

  Pard.Bus = Pard.Widgets.Bus();

}(Pard || {}));
