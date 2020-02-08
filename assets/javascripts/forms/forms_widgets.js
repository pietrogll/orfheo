'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.AlertNoMapLocation = function(formVal,closepopup,callback){
    var _createdWidget = $('<div>');
    var _text = $('<p>').text(Pard.t.text('popup.noMapLocation.mex'))
    var _goAnywayBtn = Pard.Widgets.Button(Pard.t.text('popup.noMapLocation.ok'), function(){
      closepopup();
      callback();
    });
    var _tryAgainBtn = Pard.Widgets.Button(Pard.t.text('popup.noMapLocation.fix'), function(){
      closepopup();
    });

    var buttonsContainer = $('<div>').addClass('buttons-noMapPopup')
    _createdWidget.append(_text, buttonsContainer.append(_goAnywayBtn.render(), _tryAgainBtn.render()));
    return{
      render: function(){
        return  _createdWidget;
      },
      setCallback: function(){
        // callback();
      }
    }
  }

  
}(Pard || {}));
