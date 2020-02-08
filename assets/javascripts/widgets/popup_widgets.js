'use strict';


(function(ns){
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.Popup = function(options, dontCloseOnBackClick){
    var _createdWidget = $('<div>').addClass('very-fast reveal full');
    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>');
    _popupContent.addClass('popup-container-full'); 
    var _sectionContainer = $('<section>').addClass('popup-content');
    var _header = $('<div>').addClass('row popup-header');
    var _title = $('<h4>').addClass('small-11 popup-title');
    var _closeBtn = $('<button>').addClass('close-button small-1 ').attr({'data-close': '', type: 'button', 'aria-label': 'Close alert'});
    var _callback;
    var _options = {
      closeOnClick: true, 
      animationIn: 'fade-in', 
      animationOut: 'fade-out',
      multipleOpened:true
    }
    if(options) for (var opt in options){
      _options[opt] = options[opt]
    };

    var _popup = new Foundation.Reveal(_createdWidget, _options);
    _closeBtn.append($('<span>').attr('aria-hidden', true).html('&times;'))
      .click(function(){
        _popup.close();
        if (_callback) _callback();
        else _destroy();
      });

   
    if (dontCloseOnBackClick) {
      _createdWidget
        .append(
          $('<div>')
            .addClass('background-close-popup')
            .append(
              $('<div>')
                .css('position','relative')
                .append(
                  $('<div>')
                    .append(
                      Pard.Widgets.IconManager('close').render()
                    )
                  .click(function(){
                    _popup.close();
                    if (_callback) _callback();
                    else _destroy();
                  })
                )
            )
        )
    }
    else {
      _createdWidget.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _popup.close();
          if (_callback) _callback();
          else _destroy();
        }
      });
    }

    var _destroy = function(){
      setTimeout(function(){
        _popup.destroy();
        _createdWidget.remove();
      },500);
    }
    
    _header.append(_title, _closeBtn);
    _popupContent.append(_header, _sectionContainer);
    _outerContainer.append(_container.append(_popupContent));
    _createdWidget.append(_outerContainer);
    $('body').append(_createdWidget);

    return{
      open: function(dont_scroll){
        if(!dont_scroll) setTimeout(function(){_createdWidget.scrollTop(0)},10);
        _popup.open();
      },
      close: function(){
        _popup.close();
        if (_callback) _callback();
      },
      destroy: function(){
        if (_popup) {
          _popup.destroy();
          _createdWidget.remove();
          _popup = null;
        }
      },
      setContent: function(title, cont){
        _title.html(title);
        _sectionContainer.empty().append(cont);
      },
      setContentClass: function(contentClass){
        _popupContent.removeClass('popup-container-full');
        _popupContent.addClass(contentClass);
      },
      setCallback: function(callback){
        _callback = callback;
      },
      setZindex: function(zindex){
        _createdWidget.css('z-index',zindex)
      },
      prependToHeader: function(element){
        _header.prepend(element);
      }
    }
  }

  ns.Widgets.BigAlert = function(title, content, contentClass, callback, parentElement){
    var _createdWidget = $('<div>').addClass('very-fast reveal full');
    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>');
    _popupContent.addClass('popup-container-full'); 
    if (contentClass){_popupContent.addClass(contentClass);}
    var _sectionContainer = $('<section>').addClass('popup-content');
    var _header = $('<div>').addClass('row popup-header');
    var _title = $('<h4>').addClass('small-11 popup-title').text(title);
    var _closeBtn = $('<button>').addClass('close-button small-1 ').attr({'data-close': '', type: 'button', 'aria-label': 'Close alert'});
    var _popup = new Foundation.Reveal(_createdWidget, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out',multipleOpened:true});
    _closeBtn.append($('<span>').attr('aria-hidden', true).html('&times;'))
      .click(function(){
        if (callback) callback();
        _popup.close();
        setTimeout(function(){
          _popup.destroy();
          _createdWidget.remove();
        }, 500);
      });

    _createdWidget.click(function(e){
      if ($(e.target).hasClass('vcenter-inner')) {
         if (callback) callback();
        _popup.close();
        setTimeout(function(){
          _popup.destroy();
          _createdWidget.remove();
        }, 500);
      }
    });
   
    _header.append(_title, _closeBtn);
    _sectionContainer.append(content);
    _popupContent.append(_header, _sectionContainer);
    _outerContainer.append(_container.append(_popupContent));
    _createdWidget.append(_outerContainer);
    if (parentElement) parentElement.append(_createdWidget);
    else $('body').append(_createdWidget);
    _popup.open();

  }


  ns.Widgets.Alert = function(title, content, callback){

    var _createdWidget = $('<div>').addClass('very-fast reveal full');    
    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _innerContainer = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>').addClass('alert-container-full');
    var _sectionContainer = $('<section>').addClass('popup-content').css('font-size','18px');
    var _header = $('<div>').addClass('row popup-header');
    var _title = $('<h4>').addClass('small-11 popup-title').text(title);
    var _popup = new Foundation.Reveal(_createdWidget, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});

    var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'})
      .append($('<span>').html('&times;'))
      .click(function(){
        if (callback) callback();
        _popup.close();
        setTimeout(function(){
          _popup.destroy();
          _createdWidget.remove();
        }, 500);
      });

    _createdWidget.click(function(e){
      if ($(e.target).hasClass('vcenter-inner')) {
        if (callback) callback();
        _popup.close();
        setTimeout(function(){
          _popup.destroy();
          _createdWidget.remove();
        }, 500);
      }
    });
 
    _header.append(_title, _closeBtn);
    _sectionContainer.append(content);
    _popupContent.append(_header, _sectionContainer);
    _innerContainer.append(_popupContent);
    _createdWidget.append(_outerContainer.append(_innerContainer));

    $('body').append(_createdWidget);

    _popup.open();

  };


  ns.Widgets.TimeOutAlert = function(title, content, timeout, callback){

    var _createdWidget = $('<div>')
      .addClass('very-fast reveal full')
      .css({'background':'transparent'});    
    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _innerContainer = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>')
      .addClass('alert-container-full')
      .css({
        'border':'1px solid',
        'padding':'1.5rem',
        'text-align':'center',
        'box-shadow': '3px 3px 8px rgba(0, 0, 0, 0.3)'
      });
    var _sectionContainer = $('<section>')
      .addClass('popup-content')
      .css({
        'font-size':'18px',
        'margin':'0'
      });
    var _ok = $('<div>').append(
      Pard.Widgets.IconManager('done').render(), 
      $('<span>').text('OK')
    ).addClass('OKalertTimeout');
    var _header = $('<div>').addClass('row');
    var _title = $('<h4>').addClass('small-11 popup-title')
    if (title) _title.append(title);
    else _title.append(_ok);
    var _popup = new Foundation.Reveal(_createdWidget, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});

    _popupContent.append(_header.append(_title));
    _sectionContainer.append(content);
    _popupContent.append(_sectionContainer);
    _innerContainer.append(_popupContent);
    _createdWidget.append(_outerContainer.append(_innerContainer));

    $('body').append(_createdWidget);

    _popup.open();


    var _timeout = timeout || 2500;
    var _check = true;

    setTimeout(function(){
      if (_check) {
        if(_popup) _popup.close();
        if (callback) callback();
        setTimeout(function(){
          if (_popup){
            _popup.destroy();
            _createdWidget.remove();
          }
        }, 500);
      }
    },_timeout);

    _createdWidget.click(
      function(){
        _popup.close();
        _check = false;
        if (callback) callback();
        setTimeout(function(){
          _popup.destroy();
          _createdWidget.remove();
      }, 500);
    })

  }

 
  ns.Widgets.PopupContent = function(title, content, contentClass){
    var _createdWidget = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>');
    if (contentClass){_popupContent.addClass(contentClass);}
    else{_popupContent.addClass('popup-container-full');}
    var _sectionContainer = $('<section>').addClass('popup-content');
    var _header = $('<div>').addClass('row popup-header');
    var _title = $('<h4>').addClass('small-11 popup-title').append(title);
    var _callback = function(){};
    var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'})
      .append($('<span>').html('&times;'))
      .click(function(){
        _callback();
      });

    _header.append(_title, _closeBtn);

    _sectionContainer.append(content.render());

    _popupContent.append(_header, _sectionContainer);
    _createdWidget.append(_container.append(_popupContent));

        
    
    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        content.setCallback(callback);
        _callback = callback;
      },
      appendToContent: function(_additionalContent){
        _sectionContainer.append(_additionalContent);
      },
      prependToContent: function(_additionalContent){
        _sectionContainer.prepend(_additionalContent);
      }
    }
  }

  ns.Widgets.ConfirmPopup = function(text, yesCallback, callback){
    var _popup = Pard.Widgets.Popup();
    _popup.setContentClass('alert-container-full');
    var _title = '¿Seguro/a?'
    var _mex = $('<div>');
    var _buttonsContainer = $('<div>').addClass('yes-no-button-container');
    if (text )_mex.append($('<p>').text(text));
    _mex.append(_buttonsContainer);

    var _yesBtn = $('<button>')
      .attr({'type':'button'})
      .addClass('pard-btn confirm-delete-btn')
      .text(Pard.t.text('dictionary.confirm').capitalize())
      .click(function(){
        $('body').append(spinner.el);
        if (yesCallback) yesCallback();
        if (callback) callback();
        spinner.stop();
        _popup.close();
      });
    var _noBtn = $('<button>')
      .attr({'type':'button'})
      .addClass('pard-btn cancel-delete-btn')
      .text(Pard.t.text('dictionary.cancel').capitalize())
      .click(function(){
        if (callback) callback();
        _popup.close();
      });
    _buttonsContainer.append(_noBtn, _yesBtn);


    var spinner =  new Spinner().spin();
          
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }



}(Pard || {}));
