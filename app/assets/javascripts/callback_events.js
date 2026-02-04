'use strict';
(function(ns){
 
  ns.Events = ns.Events || {};

  ns.Events.Register = function(data){
    if (data['status'] == 'success'){
      Pard.Widgets.Alert('', Pard.t.text('signUp.success'));
    }
    else {
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy()
        },500);
        });
        _popup.open();
      }
      else{
        console.log(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  };

  ns.Events.Login = function(data){
    console.log(data)
    if (data['status'] == 'success'){
      Pard.Options.setLanguage(data.lang);
    }
    else {
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof  _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        $('body').off('click.zf.dropdown');
        _dataReason.setCallback(function(){
          _popup.close();
          $('#loginDropDown').foundation('close');
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          $('#loginDropDown').foundation('close');
          setTimeout(function(){
            $('#loginDropDown').foundation('open');
          },2);
          setTimeout(function(){
          _popup.destroy();
        },500);
        });
        _popup.open();
      }
      else{
        console.log(data.reason);
        $('#loginDropDown').foundation('close');
        Pard.Widgets.Alert('', _dataReason);
      }
    };
  };

  ns.Events.Logout = function(data){
    if (data['status'] == 'success'){
      if (window.location.href.match('event_manager')) document.location = '/'
      else {
        var n_url = Pard.addQueryLang();
        location.href = n_url;
        location.reload()
      };
    }
    else {
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy()
        },500);
        });
        _popup.open();
      }
      else{
        console.log(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  };

  ns.Events.CreateProfile = function(data){
    console.log(data);
    if (data['status'] == 'success'){
      if (data.profile) document.location = '/profile?id=' + data['profile']['id'];
      else if (data.id) document.location = '/profile?id=' + data['id'];
    }
    else{
      $('.spinner').remove();
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy()
        },500);
        });
        _popup.open();
      }
      else{ 
        console.log(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  };

  
  ns.Events.DeleteProfile = function(data){
    if (data['status'] == 'success'){
      location.href = '/users/';
    }
    else{
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy()
        },500);
        });
        _popup.open();
      }
      else{
        console.log(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  }

  ns.Events.DeleteUser = function(data){
    if (data['status'] == 'success'){
      location.href = '/';
    }
    else{
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy()
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy()
        },500);
        });
        _popup.open();
      }
      else{
        console.log(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  }



}(Pard || {}));
  