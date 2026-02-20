'use strict';


(function(ns){
  ns.Widgets = ns.Widgets || {};

  
  ns.Widgets.FormsInputs = {
    'Input': ['placeholder', 'type', 'oninputcallback_function', 'onchangecallback_function'],
    'InputNumber': ['placeholder', 'unit', 'oninputcallback_function', 'onchangecallback_function'],
    'ArraySelector': ['labels', 'values', 'callback_function', 'placeholder'],
    'Selector': ['values_labels_obj', 'onChangeCallback_function', 'placeholder'], //OBJECT
    'TextArea': ['placeholder', 'Nrows_number'],
    'TextAreaCounter': ['placeholder', 'maxCharacters_number', 'Nrows'], // ['placeholder', 'maxCharacters_number', 'message', 'Nrows'], --->  message'replaced by helptext --> see form_fields.js
    'TextAreaEnriched': ['placeholder', 'Nrows_number'],
    'CheckBox': [], // ['label', 'value', 'callback_function'] ---> label and value not used for form call --> see form_fields.js
    'NoneInput':['htmlToDisplay_textarea'],
    'Links': ['placeholder'],
    'Text': ['placeholder']
  }

  ns.Widgets.NoneInput = function(text_to_display){
    var _createdWidget = $('<div>').html(text_to_display);

    return{
      render: function(){
        return _createdWidget;
      }
    }

  }

  ns.Widgets.Input = function(placeholder, type, oninputcallback, onchangecallback){

    var _input = $('<input>').attr({'type':type, 'placeholder': placeholder});

    _input.on('input',function(){
      _input.removeClass('warning');
      if(oninputcallback) oninputcallback();
    });
    _input.on('change', function(){
      if(onchangecallback) onchangecallback();
    });

    _input.on('focus', function(){
      if($(window).width()<1024){
        if ($('.reveal[aria-hidden="false"]').html()){
          var _distanceInputTop = _input.offset().top;
          var _popupOpened = _input.closest('.reveal[aria-hidden="false"]');
          var _scroolTop = _popupOpened.scrollTop();
          var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120; 
          _popupOpened.scrollTop(_distanceToDo);
        }
      }
    });


    return{
      render: function(){
        return _input;
      },
      getVal: function(){
        var _value = _input.val();
        if (_value.replace(/\s/g, '').length == 0){
          _value = '';
          _input.val(_value);
        }        
        return _value;
      },
      setVal: function(value){
        _input.val(value);
      },
      addWarning: function(){
        _input.addClass('warning');
      },
      removeWarning: function(){
        _input.removeClass('warning');
      },
      setClass: function(_class){
        _input.addClass(_class);
      },
      setAttr: function(attribute, value){
        _input.attr(attribute,value);
      },
      disable: function(){
        _input.prop('disabled', true);
      },
      enable: function(){
        _input.prop('disabled', false);
      }
    }
  };

  ns.Widgets.InputNumber = function(placeholder, unit, oninputcallback, onchangecallback){

    var _createdWidget = $('<div>');
    var _inputContainer = $('<div>').css('position','relative');
    var _input = $('<input>').attr({'type':'text', 'placeholder': placeholder});
    var _warning = $('<p>')
      .addClass("help-text")
      .text(Pard.t.text('widget.inputNumber.warning'))
      .css('color','red');

    _inputContainer.append(_input);    
    if (unit) {
      _inputContainer.append($('<div>').append(unit).addClass('unit-InputNumber'));
      _input.addClass('InputNumber-withUnit')
    }


    _createdWidget.append(_inputContainer);

    _input.on('input',function(){
      _input.removeClass('warning');
      var clean = _input.val()
        .replace(/[^0-9.]/g, "")
        .replace(/((\.).*?)\.(.*\.)?/, "$1");
      if (clean !== _input.val()) {
        _input.val(clean);
        _createdWidget.append(_warning);
      }
      else  _warning.detach();

      if(_input.val() && !$.isNumeric(_input.val())) _input.addClass('warning');
 
      if(oninputcallback) oninputcallback();
    });
    
    _input.on('change', function(){
      if(onchangecallback) onchangecallback();
      _warning.detach();
    });

    _input.on('focus', function(){
      if($(window).width()<1024){
        if ($('.reveal[aria-hidden="false"]').html()){
          var _distanceInputTop = _input.offset().top;
          var _popupOpened = _input.closest('.reveal[aria-hidden="false"]');
          var _scroolTop = _popupOpened.scrollTop();
          var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120;
          _popupOpened.scrollTop(_distanceToDo);
        }
      }
    });

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return $.isNumeric(_input.val()) ? _input.val() : false;
      },
      setVal: function(value){
        if (value && $.isNumeric(value)) _input.val(value);
        else _input.val('');
      },
      addWarning: function(){
        _input.addClass('warning');
      },
      removeWarning: function(){
        _input.removeClass('warning');
      },
      setClass: function(_class){
        _input.addClass(_class);
      },
      setAttr: function(attribute, value){
        _input.attr(attribute,value);
      },
      disable: function(){
        _input.prop('disabled', true);
      },
      enable: function(){
        _input.prop('disabled', false);
      }
    }
  };


  ns.Widgets.InputLabel = function(label){

    var _label = $('<label>').text(label); // does not work html ??

    return{
      render: function(){
        return _label;
      },
      setClass: function(_class){
        _label.addClass(_class);
      }
    }
  };

  ns.Widgets.HelpText = function(label){

    var _helptext = $('<p>').addClass('help-text').html(label);

    return{
      render: function(){
        return _helptext;
      },
      setClass: function(_class){
        _helptext.addClass(_class);
      }
    }
  };


  ns.Widgets.Button = function(label, callback){

    var _createdWidget = $('<button>').addClass('pard-btn').attr({type:'button'}).html(label);
    if (callback) _createdWidget.click(callback);

    return {
      render: function(){
        return _createdWidget;
      },
      disable: function(){
        _createdWidget.attr('disabled',true);
      },
      enable: function(){
        _createdWidget.attr('disabled',false);
      },
      setClass: function(_class){
        _createdWidget.addClass(_class);
      },
      deleteClass: function(_class){
        _createdWidget.removeClass(_class);
      }
    };
  };

  


  ns.Widgets.ArraySelector = function(labels, values, onChange_callback, placeholder){
    var _createdWidget = $('<select>');
    var _emptyOption = $('<option>');
    if(!values) var  values = labels;
    if(placeholder) {
      _emptyOption.attr({'value':'', 'disabled':'', 'selected':'selected'}).text(placeholder).addClass('placeholderSelect');
      _createdWidget.append(_emptyOption);
    }
    values.forEach(function(value, index){
      _createdWidget.append($('<option>').append(labels[index].capitalize()).val(value));
    });

    //CODE TO ORDER ALFABETICALLY THE OPTIONS OF THE SELECTOR!! 
    // var _labelValObj = {};
    // labels.forEach(function(label, index){
    //   _labelValObj[label] = values[index];
    // })
    // Object.keys(_labelValObj).sort().forEach(function(label, index){
    //   _createdWidget.append($('<option>').append(label.capitalize()).val(_labelValObj[label]));
    // });

    _createdWidget.on('change',function(e, val){
      if(onChange_callback) {
        var boundCallback = onChange_callback.bind(_createdWidget);
        boundCallback(val);
      };
      _emptyOption.remove();
      _createdWidget.removeClass('warning');
    })
    .one('click',function(){
      _createdWidget.removeClass('placeholderSelect');
      _emptyOption.empty();
    });

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _createdWidget.val();
      },
      addWarning: function(){
        _createdWidget.addClass('warning');
      },
      removeWarning: function(){
        _createdWidget.removeClass('warning');
      },
      setVal: function(value){
        _createdWidget.val(value);
      },
      setClass: function(_class){
        _createdWidget.addClass(_class);
      },
      enable: function(){
        _createdWidget.attr('disabled',false);
      },
      disable: function(){
        _createdWidget.attr('disabled',true);
      },
      triggerChange: function(val){
        _createdWidget.trigger('change', [val]);
      }
    }
  }

  


  ns.Widgets.Selector = function(obj_values_labels, onChangeCallback, placeholder){
 
    var _createdWidget = $('<select>');
    var _emptyOption = $('<option>');

    if(placeholder) {
      _emptyOption.attr({'value':'', 'disabled':'', 'selected':'selected'}).text(placeholder).addClass('placeholderSelect');
      _createdWidget.append(_emptyOption);
    }
    Object.keys(obj_values_labels).forEach(function(value){
      _createdWidget.append($('<option>').append(obj_values_labels[value]).val(value))
    })
    _createdWidget.on('change',function(){
      if(onChangeCallback) {
        var boundCallback = onChangeCallback.bind(_createdWidget);
        boundCallback();
      };
      _emptyOption.remove();
      _createdWidget.removeClass('warning');
    })
    .one('click',function(){
      _createdWidget.removeClass('placeholderSelect');
      _emptyOption.empty();
    });

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _createdWidget.val();
      },
      addWarning: function(){
        _createdWidget.addClass('warning');
      },
      removeWarning: function(){
        _createdWidget.removeClass('warning');
      },
      setVal: function(value){
        _createdWidget.val(value);
      },
      setClass: function(_class){
        _createdWidget.addClass(_class);
      },
      enable: function(){
        _createdWidget.attr('disabled',false);
      },
      disable: function(){
        _createdWidget.attr('disabled',true);
      },
      reload: function(new_choices){
        var old_val = _createdWidget.val()
        if (new_choices == 'all') new_choices = Object.keys(obj_values_labels)
        _createdWidget.empty()
        new_choices.forEach(function(value){
          _createdWidget.append($('<option>').append(obj_values_labels[value]).val(value))
        })
        if($.inArray(old_val, new_choices)){
          _createdWidget.val(old_val)
          _createdWidget.trigger('change')
        }
      }
    }
  }

  
  
  ns.Widgets.TextArea = function(placeholder, Nrows){

    var _textarea = $('<textarea>').attr({placeholder: placeholder})
    Nrows = Nrows || 4;
    _textarea.attr({'rows': parseInt(Nrows)});

    _textarea.on('input',function(){_textarea.removeClass('warning')});

    _textarea.on('focus', function(){
      if($(window).width()<1024){
        if ($('.reveal[aria-hidden="false"]').html()){
          var _distanceInputTop = _textarea.offset().top;
          var _popupOpened = _textarea.closest('.reveal[aria-hidden="false"]');
          var _scroolTop = _popupOpened.scrollTop();
          var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120;
          _popupOpened.scrollTop(_distanceToDo);
        }
      }
    });



    return {
      render: function(){
        return _textarea;
      },
      getVal: function(){
        return _textarea.val();
      },
      setVal: function(value){
        _textarea.val(value);
      },
      addWarning: function(){
        _textarea.addClass('warning');
      },
      removeWarning: function(){
        _textarea.removeClass('warning');
      },
      setClass: function(_class){
        _textarea.addClass(_class);
      }, 
      setAttr: function(attribute, value){
        _textarea.attr(attribute,value);
      }
    }
  }

  


  ns.Widgets.TextAreaCounter = function(placeholder, max, message, nrows){
    var _createdWidget = $('<div>');
    var _nrows = nrows || 1;
    var _textarea = $('<textarea>').attr({placeholder: placeholder, maxlength: max, rows: parseInt(_nrows)});
    var _remainingCar = $('<span>').text(max).css({display: 'inline', 'font-weight':600});
    var _counter = $('<p>').append(message, _remainingCar,'.').addClass('help-text');
    _textarea.on('input',(function(){
    	_textarea.removeClass('warning');
    	_remainingCar.text(max - _textarea.val().length);
    }));

    _textarea.on('focus', function(){
      if($(window).width()<1024){
        if ($('.reveal[aria-hidden="false"]').html()){
          var _distanceInputTop = _createdWidget.offset().top;
          var _popupOpened = _createdWidget.closest('.reveal[aria-hidden="false"]');
          var _scroolTop = _popupOpened.scrollTop();
          var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120;
          _popupOpened.scrollTop(_distanceToDo);
        }
      }
    });

    _createdWidget.append(_textarea, _counter);

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
      	return _textarea.val();
      },
      setVal: function(value){
        _textarea.val(value);
        _remainingCar.text(max - _textarea.val().length);
      }, 
      setAttr: function(attribute, value){
        _textarea.attr(attribute,value);
      }, 
      setClass: function(_class){
        _textarea.addClass(_class);
      },
      addWarning: function(){
        _textarea.addClass('warning');
      },
      removeWarning: function(){
        _textarea.removeClass('warning');
      },
    }
  }

  
  ns.Widgets.TextAreaEnriched = function(placeholder, Nrows){
    var _createdWidget = $('<div>');
    var _textarea = $('<textarea>').attr({placeholder: placeholder})
    if (Nrows)_textarea.attr({'rows': parseInt(Nrows)});

    _createdWidget.append(_textarea).addClass('TextAreaEnrichedContainer');

    if ($('#trumbowyg-icons').html()){}
    else{
    $('body').append($('<div>').css('display','none').attr('id','trumbowyg-icons')
      .append('<svg xmlns="http://www.w3.org/2000/svg"><symbol id="trumbowyg-strong" viewBox="0 0 72 72"><path d="M51.1 37.8c-1.1-1.4-2.5-2.5-4.2-3.3 1.2-.8 2.1-1.8 2.8-3 1-1.6 1.5-3.5 1.5-5.3 0-2-.6-4-1.7-5.8-1.1-1.8-2.8-3.2-4.8-4.1-2-.9-4.6-1.3-7.8-1.3h-16v42h16.3c2.6 0 4.8-.2 6.7-.7 1.9-.5 3.4-1.2 4.7-2.1 1.3-1 2.4-2.4 3.2-4.1.9-1.7 1.3-3.6 1.3-5.7.2-2.5-.5-4.7-2-6.6zM40.8 50.2c-.6.1-1.8.2-3.4.2h-9V38.5h8.3c2.5 0 4.4.2 5.6.6 1.2.4 2 1 2.7 2 .6.9 1 2 1 3.3 0 1.1-.2 2.1-.7 2.9-.5.9-1 1.5-1.7 1.9-.8.4-1.7.8-2.8 1zm2.6-20.4c-.5.7-1.3 1.3-2.5 1.6-.8.3-2.5.4-4.8.4h-7.7V21.6h7.1c1.4 0 2.6 0 3.6.1s1.7.2 2.2.4c1 .3 1.7.8 2.2 1.7.5.9.8 1.8.8 3-.1 1.3-.4 2.2-.9 3z"/></symbol><symbol id="trumbowyg-em" viewBox="0 0 72 72"><path d="M26 57l10.1-42h7.2L33.2 57H26z"/></symbol><symbol id="trumbowyg-fullscreen" viewBox="0 0 72 72"><path d="M25.2 7.1H7.1v17.7l6.7-6.5 10.5 10.5 4.5-4.5-10.4-10.5zM47.2 7.1l6.5 6.7-10.5 10.5 4.5 4.5 10.5-10.4 6.7 6.8V7.1zM47.7 43.2l-4.5 4.5 10.4 10.5-6.8 6.7h18.1V47.2l-6.7 6.5zM24.3 43.2L13.8 53.6l-6.7-6.8v18.1h17.7l-6.5-6.7 10.5-10.5z"/><path fill="currentColor" d="M10.7 28.8h18.1V11.2l-6.6 6.4L11.6 7.1l-4.5 4.5 10.5 10.5zM60.8 28.8l-6.4-6.6 10.5-10.6-4.5-4.5-10.5 10.5-6.7-6.9v18.1zM60.4 64.9l4.5-4.5-10.5-10.5 6.9-6.7H43.2v17.6l6.6-6.4zM11.6 64.9l10.5-10.5 6.7 6.9V43.2H11.1l6.5 6.6L7.1 60.4z"/></symbol><symbol id="trumbowyg-link" viewBox="0 0 72 72"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"/><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2z"/></symbol><symbol id="trumbowyg-ordered-list" viewBox="0 0 72 72"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"/></symbol><symbol id="trumbowyg-unordered-list" viewBox="0 0 72 72"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"/></symbol><symbol id="trumbowyg-view-html" viewBox="0 0 72 72"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"/></symbol><symbol id="trumbowyg-base64" viewBox="0 0 72 72"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"/><path d="M29.9 28.9c-.5-.5-1.1-.8-1.8-.8s-1.4.2-1.9.7c-.5.4-.9 1-1.2 1.6-.3.6-.5 1.3-.6 2.1-.1.7-.2 1.4-.2 1.9l.1.1c.6-.8 1.2-1.4 2-1.8.8-.4 1.7-.5 2.7-.5.9 0 1.8.2 2.6.6.8.4 1.6.9 2.2 1.5.6.6 1 1.3 1.2 2.2.3.8.4 1.6.4 2.5 0 1.1-.2 2.1-.5 3-.3.9-.8 1.7-1.5 2.4-.6.7-1.4 1.2-2.3 1.6-.9.4-1.9.6-3 .6-1.6 0-2.8-.3-3.9-.9-1-.6-1.8-1.4-2.5-2.4-.6-1-1-2.1-1.3-3.4-.2-1.3-.4-2.6-.4-3.9 0-1.3.1-2.6.4-3.8.3-1.3.8-2.4 1.4-3.5.7-1 1.5-1.9 2.5-2.5 1-.6 2.3-1 3.8-1 .9 0 1.7.1 2.5.4.8.3 1.4.6 2 1.1.6.5 1.1 1.1 1.4 1.8.4.7.6 1.5.7 2.5h-4c0-1-.3-1.6-.8-2.1zm-3.5 6.8c-.4.2-.8.5-1 .8-.3.4-.5.8-.6 1.2-.1.5-.2 1-.2 1.5s.1.9.2 1.4c.1.5.4.9.6 1.2.3.4.6.7 1 .9.4.2.9.3 1.4.3.5 0 1-.1 1.3-.3.4-.2.7-.5 1-.9.3-.4.5-.8.6-1.2.1-.5.2-.9.2-1.4 0-.5-.1-1-.2-1.4-.1-.5-.3-.9-.6-1.2-.3-.4-.6-.7-1-.9-.4-.2-.9-.3-1.4-.3-.4 0-.9.1-1.3.3zM36.3 41.3v-3.8l9-12.1H49v12.4h2.7v3.5H49v4.8h-4v-4.8h-8.7zM45 30.7l-5.3 7.2h5.4l-.1-7.2z"/></symbol><symbol id="trumbowyg-create-link" viewBox="0 0 72 72"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"/><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"/></symbol><symbol id="trumbowyg-del" viewBox="0 0 72 72"><path d="M45.8 45c0 1-.3 1.9-.9 2.8-.6.9-1.6 1.6-3 2.1s-3.1.8-5 .8c-2.1 0-4-.4-5.7-1.1-1.7-.7-2.9-1.7-3.6-2.7-.8-1.1-1.3-2.6-1.5-4.5l-.1-.8-6.7.6v.9c.1 2.8.9 5.4 2.3 7.6 1.5 2.3 3.5 4 6.1 5.1 2.6 1.1 5.7 1.6 9.4 1.6 2.9 0 5.6-.5 8-1.6 2.4-1.1 4.3-2.7 5.6-4.7 1.3-2 2-4.2 2-6.5 0-1.6-.3-3.1-.9-4.5l-.2-.6H44c0 .1 1.8 2.3 1.8 5.5zM29 28.9c-.8-.8-1.2-1.7-1.2-2.9 0-.7.1-1.3.4-1.9.3-.6.7-1.1 1.4-1.6.6-.5 1.4-.9 2.5-1.1 1.1-.3 2.4-.4 3.9-.4 2.9 0 5 .6 6.3 1.7 1.3 1.1 2.1 2.7 2.4 5.1l.1.9 6.8-.5v-.9c-.1-2.5-.8-4.7-2.1-6.7s-3.2-3.5-5.6-4.5c-2.4-1-5.1-1.5-8.1-1.5-2.8 0-5.3.5-7.6 1.4-2.3 1-4.2 2.4-5.4 4.3-1.2 1.9-1.9 3.9-1.9 6.1 0 1.7.4 3.4 1.2 4.9l.3.5h11.8c-2.3-.9-3.9-1.7-5.2-2.9zm13.3-6.2zM22.7 20.3zM13 34.1h46.1v3.4H13z"/></symbol><symbol id="trumbowyg-unlink" viewBox="0 0 72 72"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"/><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"/></symbol><symbol id="trumbowyg-back-color" viewBox="0 0 72 72"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"/><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"/></symbol></svg>'
      )
    )
    }

    _textarea.trumbowyg({
      btns: [
        ['strong', 'em'],
        ['link'],
        ['unorderedList', 'orderedList']
      ],
      autogrow: true,
      removeformatPasted: true,
      useComposition: false
      // svgPath : '/assets/icons_trumbowyg.svg'
      // "#{asset_path('/assets/font/icons_trumbowyg.svg')}"
    });
    
    _textarea.on('tbwchange', function(){
      _createdWidget.removeClass('warning');
    });

    _textarea.on('tbwfocus',function(){
      if($(window).width()<1024){
        if ($('.reveal[aria-hidden="false"]').html()){
          var _distanceInputTop = _createdWidget.offset().top;
          var _popupOpened = _createdWidget.closest('.reveal[aria-hidden="false"]');
          var _scroolTop = _popupOpened.scrollTop();
          var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120;
          _popupOpened.scrollTop(_distanceToDo);
        }
      }
    });

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _text = _textarea.trumbowyg('html');
        // var _text = _textarea.html();
        _text = _text.replace(/style=".*?"/g,'');
        return _text;
      },
      setVal: function(value){
        _textarea.trumbowyg('html', value);
      },
      addWarning: function(){
        _createdWidget.addClass('warning');
      },
      removeWarning: function(){
        _createdWidget.removeClass('warning');
      },
      setClass: function(_class){
        _textarea.addClass(_class);
      }, 
      setAttr: function(attribute, value){
        _textarea.attr(attribute,value);
      }
    }
  }



  ns.Widgets.CheckBox = function(label, value, callback){

    var _input = $('<input>').attr({ type: 'checkbox', 'value': value});
    var _label = $('<label>').html(label);
    _label.css({
      'display':'inline',
      'margin': '0',
      'padding':'0 .5rem'
    });
    var _createdWidget = $('<div>').append(_input, _label);

    _input.on('change', function(){
      _input.removeClass('checkBox-warning');
      if (callback) callback();
    });

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _input.is(":checked");
      },
      setVal: function(_val){
        if (_val && _val != 'false'){ _input.prop('checked', _val)};
        if (_val === false){_input.prop('checked', false)};     
      },
      addWarning: function(){
        _input.addClass('checkBox-warning');
      },
      removeWarning: function(){
        _input.removeClass('checkBox-warning');
      },
      labelToggle: function(){
        _label.css('cursor','pointer')
        _label.on('click', function(){
          _input.prop("checked", !_input.prop("checked"));
          _input.trigger("change");
        });
      } 
    }
  }

  ns.Widgets.Switcher = function(opt1, opt2){
    var _createdWidget = $('<div>').addClass("switch");
    var _opt1 = opt1 || Pard.t.text('dictionary.yes');
    var _opt2 = opt2 || Pard.t.text('dictionary.no');
    var _switcher = $('<input>').addClass("switch-input").attr({id:"yes-no", type:"checkbox"});
    var _label = $('<label>')
      .addClass("switch-paddle")
      .attr('for',"yes-no")
      .append(
        $('<span>').addClass("switch-active").attr('aria-hidden',"true").text(_opt1.capitalize()),
        $('<span>').addClass("switch-inactive").attr('aria-hidden',"true").text(_opt2.capitalize())
        )
      .css({
        'border-radius':'2px'
      });

    _switcher.prop('checked', true);

    _createdWidget.append(_switcher, _label);

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _switcher.is(":checked");
      },
      setVal: function(_val){
        if (_val && _val != 'false'){ _switcher.prop('checked', _val)};
        if (_val === false){_switcher.prop('checked', false)};    
      },
      addWarning: function(){
        _switcher.addClass('checkBox-warning');
      },
      removeWarning: function(){
        _switcher.removeClass('checkBox-warning');
      }
    }
  }


  ns.Widgets.Links = function(placeholder){

    var placeholder = placeholder || Pard.t.text('widget.Links.placeholder');
    var _input = Pard.Widgets.Input(placeholder,'text');


    return{
      render: function(){
        return _input.render()
      },
      getVal: function(){
        return _input.getVal()
      },
      setVal: function(value){
        _input.setVal(value)
      },
      addWarning: function(){
        _input.addWarning()
      },
      removeWarning: function(){
        _input.removeWarning()
      }
    }
  }

  ns.Widgets.Text = function(placeholder){
    var placeholder = placeholder || '';
    var _input = Pard.Widgets.Input(placeholder,'text');

    return{
      render: function(){
        return _input.render();
      },
      getVal: function(){
        return _input.getVal()
      },
      setVal: function(value){
        _input.setVal(value)
      },
      addWarning: function(){
        _input.addWarning()
      },
      removeWarning: function(){
        _input.removeWarning()
      }
    }
  }



  
}(Pard || {}));
