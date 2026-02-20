'use strict';


(function(ns){
  ns.Widgets = ns.Widgets || {};

  ns.Widgets.SettingsPopup = function(){
   
    var _popup = Pard.Widgets.Popup();

    var _notificationsWidget = Pard.Widgets.NotificationsWidget();

    var _modifyPassWidget = Pard.Widgets.ModifyPasswordWidget();

    var _langWidget = Pard.Widgets.LangWidget();

    var _popupContent = $('<div>').append(
      _langWidget.render().addClass('settings-widgets'),
      _notificationsWidget.render().addClass('settings-widgets'),
      _modifyPassWidget.render().addClass('settings-widgets')
    )
    _popup.setContent(Pard.t.text('popup.settings.title'), _popupContent);
    _popup.setCallback(function(){
       setTimeout(function(){
        _popup.destroy();
      },500);
      var hash = window.location.hash.replace('&settings','');
      history.replaceState({}, 'no_settings',  hash);
    })

    return {
      render: function(){
        return _popup;
      },
      setVal: function(values){
        _notificationsWidget.setVal(values);
      }
    }
  }

  ns.Widgets.LangWidget = function(){
    
    var _createdWidget = $('<div>');

    var _title = $('<h5>')
      .text(Pard.t.text('popup.settings.langWidget.title'));

    var _availableLang = Pard.Options.availableLangs().reduce(function(obj, lang){
      obj[lang] = Pard.t.text('footer.languages')[lang]
      return obj;
    }, {});
    var _langSelector  = Pard.Widgets.Selector(
      _availableLang,
      function(){
        _enableSubmitBtn();
      }
      );
    _langSelector.setVal(Pard.Options.language());
    
    var _submitButton = $('<button>')
      .attr({type: 'button'})
      .append(
        Pard.Widgets.IconManager('save').render(),
        $('<span>').text('OK')
      )
      .click(function(){
        Pard.Options.setLanguage(_langSelector.getVal());
      });

    var _enableSubmitBtn = function(){
      _submitButton
        .attr({
          disabled: false
        })
        .removeClass('disabled')
    }

    var _disableSubmitBtn = function(){
      _submitButton
        .addClass('disabled')
        .attr({
          disabled: true
        })
    }

    _disableSubmitBtn();

    var _submitButtonContainer = $('<div>')
      .append(_submitButton)
      .addClass('save-settings-btn')
      .css({
        'margin-top': '1rem'
      });

    var _form = $('<form>')
      .addClass('popup-form')
      .append(_langSelector.render());

    _createdWidget.append(
      _title,
      _form, 
      _submitButtonContainer
    );

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }


  ns.Widgets.NotificationsWidget = function(){

    var _createdWidget = $('<div>');
    var _submittedForm = {
      event_call: {}
    };

    var _title = $('<h5>')
      .text(Pard.t.text('popup.settings.notificationsWidget.title'));
    var _text = $('<p>')
      .html(Pard.t.text('popup.settings.notificationsWidget.event_call'));

    var _notifTxt = Pard.t.text('popup.settings.notificationsWidget.notifTxt');
    var _noNotif = Pard.t.text('popup.settings.notificationsWidget.noNotif');

    var _ftext = $('<p>')
      .css({
        'font-size': '14px',
        'margin': '1rem 0 .5rem 0'
      })
      .text(_noNotif);

    var _catSelector = Pard.Widgets.MultipleSelector(
      Pard.OrfheoCategories,
      function(){
        if(_catSelector.getVal()){
          // _notifTxt += _catSelector.getVal().join(', ') + '.'
          _ftext.text(_notifTxt)
        }
        else _ftext.text(_noNotif);
        _enableSubmitBtn();
      },
      Pard.t.text('categories'),
      {
        placeholder: Pard.t.text('popup.settings.notificationsWidget.selectorPlaceholder')
      }
    );

    var _form = $('<form>').addClass('popup-form');

    var _confirm = $('<div>')
      .append(
        Pard.Widgets.IconManager('done').render().addClass('done-icon-user-settings'),
        $('<span>').text(Pard.t.text('popup.settings.notificationsWidget.successText')).css({'font-size':'14px'})
        )
        .hide();

    var _enableSubmitBtn = function(){
      _submitButton
        .attr({
          disabled: false
        })
        .removeClass('disabled')
    }

    var _disableSubmitBtn = function(){
      _submitButton
        .addClass('disabled')
        .attr({
          disabled: true
        })
    }

    var _savedCallback = function(){
      setTimeout(function(){
        _submitButton
          .show();
        _disableSubmitBtn();
        _confirm.hide();
      }, 2500);
    } 

    var _submitButton = $('<button>')
      .addClass('save-settings-btn')
      .attr({type: 'button'})
      .append(
        Pard.Widgets.IconManager('save').render(),
        $('<span>').text('OK')
      )
      .click(function(){
        if (_catSelector.getVal()) _submittedForm['event_call']['categories'] = _catSelector.getVal();
        else _submittedForm['event_call']['categories'] = '';
        Pard.Backend.saveInterests(_submittedForm, function(data){
          _confirm.show();
          _submitButton.hide();
          if (data['status'] == 'success'){
            Pard.UserInfo['interests'] = _submittedForm;
            _savedCallback();
          }
          else {
            _invalidInput.text(data.reason);
          }
        })
      });

    _disableSubmitBtn();

    var _submitButtonContainer = $('<div>')
      .append(_submitButton, _confirm)
      .addClass('save-settings-btn');


    _form.append(
      _catSelector.render()    
    )

    _createdWidget.append(
      _title,
      _text,
      _form,
      _ftext,
      _submitButtonContainer
    );

    return {
      render: function(){
        return _createdWidget;
      },
      setVal: function(values){
        if(values && values.event_call && values.event_call.categories){
          _catSelector.setVal(values.event_call.categories);
          // _notifTxt += _catSelector.getVal().join(', ') + '.';
          _ftext.text(_notifTxt);
        }
      }
    };


  }


  ns.Widgets.ModifyPasswordWidget = function(){
   
    var _createdWidget = $('<div>');
    var _invalidInput = $('<div>').addClass('error-text');

    var _title = $('<h5>')
      .text(Pard.t.text('popup.settings.modifyPasswordWidget.title'));

    var _fields = {};

    var _labels = [Pard.t.text('popup.modifypasswd.password'),Pard.t.text('popup.modifypasswd.passwordConf')];
    var _types = ['password', 'passwordConf'];

    var _checkEqual = function(){
      if (_fields['passwordConf'].getVal()){
        if(_fields['password'].getVal() != _fields['passwordConf'].getVal()){
          _fields['passwordConf'].addWarning();
          _invalidInput.text(Pard.t.text('popup.modifypasswd.notequal'));
        }
        else{
          _fields['passwordConf'].removeWarning();
          _invalidInput.empty();
          return true;
        }
      }  
    }

    var _checkInput = function(){
      if(_fields['password'].getVal().length < 8){
        _fields['password'].addWarning();
        _invalidInput.text(Pard.t.text('popup.modifypasswd.tooshort'));
      }
      else{
        _fields['password'].removeWarning();
        _invalidInput.empty();
        return _checkEqual();
      }
    }

    var _enableSubmitBtn = function(){
      _submitButton
        .attr({
          disabled: false
        })
        .removeClass('disabled')
    }

    var _disableSubmitBtn = function(){
      _submitButton
        .addClass('disabled')
        .attr({
          disabled: true
        })
    } 

    var _savedCallback = function(){
      setTimeout(function(){
        _submitButton
          .show();
        _disableSubmitBtn();
        _confirm.hide();
      }, 2500);
    }

    _types.forEach(function(id, index){
      _fields[id] = Pard.Widgets.Input(
        _labels[index], 
        'password', 
        function(){
          if(_fields['password'].getVal().length >= 8 && _fields['password'].getVal() == _fields['passwordConf'].getVal()) _enableSubmitBtn();
          else _disableSubmitBtn();
        }, 
        function(){
          _checkInput();
      });
    });

    var _confirm = $('<div>')
      .append(
        Pard.Widgets.IconManager('done').render().addClass('done-icon-user-settings'),
        $('<span>').text(Pard.t.text('popup.settings.modifyPasswordWidget.successText')).css({'font-size':'14px'})
        )
        .hide();

    _submitButton = $('<button>')
      .attr({
        type: 'button'
      })
      .append(
        Pard.Widgets.IconManager('save').render(),
        $('<span>').text('OK')
      )
      .click(function(){
        if((_fields['password'].getVal() == _fields['passwordConf'].getVal()) && _fields['password'].getVal().length >= 8){
          Pard.Backend.modifyPassword(_fields['password'].getVal(), function(data){
            _confirm.show();
            _submitButton.hide();
            if (data['status'] == 'success'){
              _savedCallback();
              // Pard.Widgets.TimeOutAlert('', Pard.t.text('popup.modifypasswd.success'));
            }
            else {
              _invalidInput.text(data.reason);
            }
          });
        }
        else{
          _invalidInput.text(Pard.t.text('popup.modifypasswd.check'));
        }
      });

    _disableSubmitBtn();
    
    var _submitButtonContainer = $('<div>')
      .append(_submitButton, _confirm)
      .addClass('save-settings-btn')
      .css({
        'margin-top': '-.5rem'
      });



    var _form = $('<form>').addClass('popup-form');

    _types.forEach(function(field){
      _form.append(_fields[field].render().css('margin-bottom','.2rem'));
    });

    _createdWidget.append(
      _title, 
      _form, 
      _invalidInput, 
      _submitButtonContainer
    );

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }


  ns.Widgets.Logout = function(){

    var _logout = $('<a>').text(Pard.t.text('header.insideDropdown.logout')).click(function(){
      Pard.Backend.logout(
        Pard.Events.Logout
      );
    });

    var _createdWidget =_logout;

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }


  
  
}(Pard || {}));