'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};

ns.Widgets.InputFormWidgets = function(){
    var _createdWidget = $('<div>');

    var _widgetsObj = {};
    var i = 0;
    var _availableWidgets = {
      'check_name': ['label','helptext']
    } 
    var _availableWidgetsArr = Object.keys(_availableWidgets).sort();

    var _fieldsCont = $('<div>');
    var _addBnt = $('<button>')
      .attr({
        'type':'button'
      })
      .append(Pard.Widgets.IconManager('add_circle').render())
      .click(function(){
        _fieldsCont.append(_widgetInput().render());
      });
    var _addBntCont = $('<div>').append(_addBnt).addClass('add-btn-container-summableInput');
    _createdWidget.append(_fieldsCont, _addBntCont);

     var _removeEl = function(el){
      _widgetsObj[el]['container'].remove();
      delete _widgetsObj[el];
    }
   

    var _widgetInput = function(){
      var inputsObj = {};
      var _container = $('<div>');
      var _inputsCont = $('<div>').addClass('fields-container-summableInput');
      var _el = 'w'+i;
      var _removeBtn = $('<button>')
        .attr({
          'type':'button'
        })
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          _removeEl(_el);
        });
      var _btnCont = $('<div>').append(_removeBtn).addClass('remove-btn-container-summableInput');
      _container.append(_inputsCont, _btnCont);
      var _widgetsSelector = Pard.Widgets.ArraySelector(
        _availableWidgetsArr, 
        _availableWidgetsArr,
        function(values){
          var selected =_widgetsSelector.getVal();
          if (values) selected =  values[0];
          _availableWidgets[selected].forEach(function(field){
            var input = Pard.Widgets.Input(field, 'text');
            if (values) input.setVal(values[1][field]);
            inputsObj[field] = input;
            _inputsCont.append(inputsObj[field].render());
          });
        },
        'select widgets'
      );
      _widgetsObj[_el] = {
        'selector': _widgetsSelector,
        'argInputs': inputsObj,
        'container': _container,
        'removeBtn': _removeBtn 
      }
      _inputsCont.append(_widgetsSelector.render());
      _fieldsCont.append(_container);
      i += 1;

      return {
        render: function(){
          return _container;
        },
        triggerChange: function(values){
          _widgetsSelector.triggerChange(values)
        }
      }
    }

    _fieldsCont.append(_widgetInput().render());

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        $.each(_widgetsObj, function(k, v){
          var _selected = v.selector.getVal();
          if (_selected){
            _values[_selected] = {};
            for (var field in v.argInputs){
            _values[_selected][field] = v.argInputs[field].getVal();
            }
          }
        })
        return _values;
      },
      setVal: function(value){
        _widgetsObj = {};
        i = 0;
        _fieldsCont.empty();
        $.each(value, function(k, v){
          var _wInput = _widgetInput();
          _wInput.triggerChange([k, v]);
          _fieldsCont.append(_wInput.render());;
        })
      },
      addWarning: function(){
      },
      removeWarning: function(){
      },
      disable: function(){
      },
      enable: function(){
      },
      activateTranslationSetting: function(){
        _addBntCont.empty();
        $.each(_widgetsObj, function(k, v){
          v.selector.disable();
          v.removeBtn.remove();
        })
      }
    }
  }


  ns.Widgets.FormFieldCreatorInputs = function(form_type){

    var _defaultFields = {
      artist: Pard.Forms.DefaultArtistCallFormFields,
      space: Pard.Forms.DefaultSpaceCallFormFields
    }

    var _mandatory = {
      artist: [ 'title', 'description', 'short_description', 'category', 'subcategory', 'format', 'children'],
      space: ['subcategory']
    }

    var _additionalMandatory = ['email', 'phone'];

    var _ambient_info_fields = $.extend(true, {}, Pard.Forms.Ambient);

    delete _ambient_info_fields['name']
    delete _ambient_info_fields['description']
    delete _ambient_info_fields['links']
    delete _ambient_info_fields['photos']
     
    var _createdWidget = $('<div>');
    if (!form_type) _createdWidget.addClass('summableImputs-FormFieldCreatorInputs')
    var _fieldsCont = $('<div>');
    
    var _addBnt = $('<button>')
      .attr({
        'type':'button'
      })
      .append(
        $('<span>').text('add_new_field'),
        Pard.Widgets.IconManager('add_circle').render()
      )
      .click(function(){_addFields()});

    var _addBntCont = $('<div>');
    if(!form_type) _addBntCont
      .append(
        $('<button>')
          .attr({'type':'button'})
          .append(Pard.Widgets.IconManager('add_circle').render())
          .click(function(){_addFields()})
      )
      .addClass('add-btn-container-summableInput');

    _createdWidget.append(_fieldsCont, _addBntCont);

    var _addDefaultSelector;

    if (form_type){
      var _defaultFieldsArr = Object.keys(_defaultFields[form_type]);
      var _mandatoryFields = _mandatory[form_type];
      if (form_type == 'space') _defaultFieldsArr.push('ambient_info');
      _addDefaultSelector = Pard.Widgets.ArraySelector(
        _defaultFieldsArr.sort(),
        _defaultFieldsArr.sort(),
        function(){
          var _defaultFielToAdd = _addDefaultSelector.getVal();
          if (!_inputsObj[_defaultFielToAdd]){
            _addFields(_defaultFields[form_type][_defaultFielToAdd],_defaultFielToAdd);
          }
          _addDefaultSelector.setVal('');
        },
        'add default field'
      )
      _addBntCont.addClass('add_field-btn-container-summableInput').append(
        _addDefaultSelector.render().css({
          'display': 'inline-block',
          'width': '30%'
        }),
        $('<div>')
          .append(
            _addBnt
          )
          .css({
            'display': 'inline-block',
            'width': '30%'       
          })
      ); 
    }

    var _inputsObj = {};
    var _index = 0;
    var _removeEl = function(el){
      _index -= 1;
      _inputsObj[el]['container'].remove();
      delete _inputsObj[el];
    }


    var _addFields = function(val, field, container){
      var _el = field || 'el_'+_index;
      _inputsObj[_el] = {};
      var _inputsCont = $('<div>').addClass('fields-container-summableInput');
      var _removeBtn = $('<button>')
        .attr({
          'type':'button'
        })
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          _removeEl(_el);
        });
      var _btnCont = $('<div>').addClass('remove-btn-container-summableInput');
      _inputsObj[_el]['removeBtn'] = _removeBtn;
      _inputsObj[_el]['container'] = $('<div>').addClass('inputsCont-summableInput');

      if (field == 'ambient_info'){
        
        var _ambientInfoSelector = Pard.Widgets.ArraySelector(
          Object.keys(_ambient_info_fields), 
          Object.keys(_ambient_info_fields), 
          function(kv){
            var  _selectedField, _formInput;
            if (kv){
              _selectedField = kv[0];
              _formInput = kv[1];
            }
            else{
              _selectedField = _ambientInfoSelector.getVal();
              _formInput = _ambient_info_fields[_selectedField];
            }
            _addFields(_formInput, _selectedField, _inputsObj[field]['container']); 
          },
          'Select ambient_info field to add'
        )
        if (val) {
          for (var k in val){ 
            _ambientInfoSelector.setVal(k);
            _ambientInfoSelector.triggerChange([k, val[k]]);
          }
        }

        _inputsCont.append(_ambientInfoSelector.render());
      }
      else {

        _inputsObj[_el]['type'] = Pard.Widgets.Selector({optional: 'optional', mandatory: 'mandatory'});
        _inputsObj[_el]['label'] = Pard.Widgets.Input('field label', 'text');
        _inputsObj[_el]['helptext'] = Pard.Widgets.Input('field helptext', 'text');
        _inputsObj[_el]['input_args'] = Pard.Widgets.TypeFormInputSelector(form_type);

        if (val) {
          _inputsObj[_el]['type'].setVal(val['type']);
          _inputsObj[_el]['label'].setVal(val['label']);
          _inputsObj[_el]['helptext'].setVal(val['helptext']);
          _inputsObj[_el]['input_args'].setVal({input: val['input'], args: val['args']});
        }
        if ($.inArray(field, _mandatoryFields)>-1){
          _inputsObj[field]['type'].setVal('mandatory');
          _inputsObj[field]['type'].disable();
        }
        else{
          if ($.inArray(field, _additionalMandatory)>-1){
            _inputsObj[field]['type'].setVal('mandatory');
            _inputsObj[field]['type'].disable();
            _inputsObj[field]['input_args'].disable('input');
          }
          _btnCont.append(_removeBtn);
        }
        _inputsCont.append(
          _inputsObj[_el]['label'].render().addClass('label_input-formBuilder'),
          _inputsObj[_el]['type'].render().addClass('type_input-formBuilder'),
          _inputsObj[_el]['helptext'].render().addClass('helptext_input-formBuilder'),
          _inputsObj[_el]['input_args'].render() 
        );
      }

      if (container){
        container
          .prepend(_inputsObj[_el]['container']
            .append(_inputsCont, _btnCont)
          );
      }
      else{
        _fieldsCont
          .append(_inputsObj[_el]['container']
            .append(_inputsCont, _btnCont)
          );
      }

      if (!field) _index += 1;

    }

    _createdWidget.click(function(){
      _createdWidget.css("border","none");
    });

    var _printDefault = function(){
      if (form_type) Object.keys(_defaultFields[form_type]).forEach(function(field){ 
        _addFields(_defaultFields[form_type][field], field);
      });
      else _addFields();
    }

    if ($.isEmptyObject(_inputsObj)){
      _printDefault();
    };

    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        if ($.isEmptyObject(_inputsObj)) return null;
        var _values = {};
        var i = 0;
        var _getFieldVal = function(el){
          var _elV = _inputsObj[el]['input_args'].getVal();
          if(_elV) ['label', 'type', 'helptext'].forEach(function(field){
            var _fieldVal = _inputsObj[el][field].getVal();
            if(_fieldVal) _elV[field] = _fieldVal;
          });
          if (_elV && _elV.input == 'NoneInput'){
            _elV['type'] = 'optional';
            _elV['label'] = '';
            _elV['helptext'] = '';
          }
          
          return _elV;
        }
        Object.keys(_inputsObj).forEach(function(el){

          if(el == 'ambient_info'){
            _values[el] = Object.keys(_ambient_info_fields).reduce(function(ambient_info_values, field){
              if (_inputsObj[field] && _getFieldVal(field)) ambient_info_values[field] = _getFieldVal(field);
              return ambient_info_values
            }, {})
          }
          else if ($.inArray(el, Object.keys(_ambient_info_fields))<0) {
            var key = el;
            if (! form_type || $.inArray(key, Object.keys(_defaultFields[form_type]))<0){
              key = i;
              i +=1;
            }
            var _fv = _getFieldVal(el);
            if(_fv) _values[key] = $.extend(true,{},_fv);
          }
        })
        return _values;
      },
      addWarning: function(){
        _createdWidget.css('border','1px solid red');
      },
      removeWarning: function(){
        _createdWidget.css('border','none');
      },
      setVal: function(values){
        
        _fieldsCont.empty();
        _inputsObj = {};
        if (values){
          var _orderDefault = [];
          if (form_type) _orderDefault = Object.keys(_defaultFields[form_type]);
          _orderDefault.forEach(function(k){
            if (values[k]) _addFields(values[k], k);
          })
          _index = 0;
          Object.keys(values).forEach(function(k){
            if ($.inArray(k, _orderDefault) < 0) _addFields(values[k], k);
          })
        } 
      },
      activateTranslationSetting: function(){
        _addBntCont.remove();
        if ($.isEmptyObject(_inputsObj)) return null;
        $.each(_inputsObj, function(key, input){
          if (input['type']) input['type'].disable();
          if (input['input_args']) input['input_args'].activateTranslationSetting();
          input['removeBtn'].remove();
        })
      }
    }
  }

  ns.Widgets.TypeFormInputSelector = function(form_type){

    var _createdWidget = $('<div>');

    var _availableInputs = $.extend(true, Pard.Widgets.FormsSpecialInputs, Pard.Widgets.FormsInputs, Pard.Widgets.FormsFieldsInputs);

    _availableInputs = Object.keys(_availableInputs).sort().reduce(function(obj, k){
      obj[k] = _availableInputs[k];
      return obj;
    },{})
    
    var _dataInputs = [];

    Object.keys(_availableInputs).forEach(function(input){
      _dataInputs.push({
        id: input,
        text: input,
        args: _availableInputs[input]
      })
    })
    
    var _inputSelector = $('<select>');
    var _argsObjInputs;
    var _argsCont = $('<div>');

    _createdWidget.append(_inputSelector, _argsCont);

    _inputSelector.append($('<option>'));

    _inputSelector.select2({
      data: _dataInputs,
      // minimumResultsForSearch: Infinity,
      dropdownCssClass: 'orfheoTypeFormSelector',
      placeholder: 'input type',
      allowClear: true
    });

    var _args;

    var _specialObjFields = ['CategorySelector', 'FormatSelector', 'SubcategorySelector']
   
    _inputSelector.on('change',function(e, argsVal){
      var _selected = _inputSelector.select2('data')[0];
      _argsObjInputs = {};
      _argsCont.empty();
  
      if (_selected){
        var _selectedInput = _selected.id;
        _args = _selected.args;
        if (_args) $.each(_args, function(index, arg){
          if (arg.indexOf('_function')>-1 || arg.indexOf('Obj')>-1) return;
          else if (_selectedInput == 'MultipleDaysSelector' && arg) _argsObjInputs[arg] = Pard.Widgets.MultipleDaysSelectorArgs();
          else if (_selectedInput == 'CategorySelector' && arg) _argsObjInputs[arg] = Pard.Widgets.MultipleSelector(Pard.OrfheoCategories);
          else if (_selectedInput == 'FormatSelector' && arg) _argsObjInputs[arg] = Pard.Widgets.MultipleSelector(Pard.OrfheoFormats);
          else if (_selectedInput == 'InputChildren' && arg){
           _argsObjInputs[arg] = Pard.Widgets.MultipleSelector(['all_public', 'baby',   'family', 'young', 'adults'],null, null, {placeholder: 'all options selected by default'});
          }
          else if (arg == 'inputs_obj')_argsObjInputs[arg] = Pard.Widgets.FormFieldCreatorInputs();
          else if (arg.indexOf('_obj')>-1) _argsObjInputs[arg] = Pard.Widgets.InputObj();
          else if (arg.indexOf('_array')>-1) _argsObjInputs[arg] = Pard.Widgets.InputTagsSimple(arg);
          else if (arg.indexOf('_textarea')>-1) _argsObjInputs[arg] = Pard.Widgets.TextArea(arg);
          else if (arg.indexOf('_boolean')>-1) _argsObjInputs[arg] = Pard.Widgets.TextArea(arg);    
          else _argsObjInputs[arg] = Pard.Widgets.Input(arg, 'text'); 
          if(argsVal){
            _argsObjInputs[arg].setVal(argsVal[index]);
          }
          _argsCont.append(_argsObjInputs[arg].render());
        })
      }
    })



    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        var _argVal = {};

        if (!_argsObjInputs){
          _createdWidget.css('border','1px solid red');
          return null;
        }

        Object.keys(_argsObjInputs).forEach(function(arg, i){
          _argVal[_args.indexOf(arg)] = _argsObjInputs[arg].getVal();
          if (!_argVal[i]) _argVal[i] = '';
        })
        var _values = {
          input: _inputSelector.val(),
          args: _argVal
        };
        return _values;
      },
      addWarning: function(){
        _createdWidget.css('border','1px solid red');
      },
      removeWarning: function(){
        _createdWidget.css('border','none');
      },
      setVal: function(values){
        _inputSelector.val(values.input);
        _inputSelector.trigger('change', [values.args]);
      },
      activateTranslationSetting: function(){
        _inputSelector.attr('disabled', true);
        if (_argsObjInputs && $.inArray(_inputSelector.val(),_specialObjFields)<-1) Object.keys(_argsObjInputs).forEach(function(arg, i){
          if (arg.indexOf('_obj')>-1) _argsObjInputs[arg].activateTranslationSetting();
        })
      },
      disable: function(input, args){ 
        if (input) _inputSelector.attr('disabled', true);
        if (args) Object.keys(_argsObjInputs).forEach(function(arg, i){
          _argsObjInputs[arg].disable();
        })
      }
    }

  }
  

  ns.Widgets.MultipleDaysSelectorArgs = function(){

    var _createdWidget = $('<div>').addClass('summableInpts_args_formBuilder');

    var _input = Pard.Widgets.SummableInputs(
      {
        'day': {
          'input': 'InputDate'
        }
      }
    )

    return {
      render: function(){
        return _createdWidget.append(_input.render());
      },
      getVal: function(){
        var _values = _input.getVal().map(function(v){return v['day']}).sort();
        return _values;
      },
      setVal:function(values){
        if (values){ 
          var _values = values.map(function(v){return {'day': v}});
          _input.setVal(_values);
        }
      }
    }
  }

  ns.Widgets.InputObj = function(){

    var _createdWidget = $('<div>').addClass('summableInpts_args_formBuilder');
    var _fieldsCont = $('<div>');
    var _addBtn = $('<button>')
      .attr({
        'type':'button'
      })
      .append(Pard.Widgets.IconManager('add_circle').render())
      .click(function(){_addFields()});
    var _addBtnCont = $('<div>').append(_addBtn).addClass('add-btn-container-summableInput');
    _createdWidget.append(_fieldsCont, _addBtnCont);

    var _inputsObj = {};
    var _index = 0;
    var _removeEl = function(el){
      _index -= 1;
      _inputsObj[el]['container'].remove();
      delete _inputsObj[el];
    }
    var _addFields = function(val){
      var _el = 'el_'+_index;
      _inputsObj[_el] = {};
      var _inputsCont = $('<div>').addClass('fields-container-InputObjInput');
      var _removeBtn = $('<button>')
        .attr({
          'type':'button'
        })
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          _removeEl(_el);
        });
      var _btnCont = $('<div>').append(_removeBtn).addClass('remove-btn-container-summableInput');
      _inputsObj[_el]['container'] = $('<div>').addClass('inputsCont-summableInput');
      _inputsObj[_el]['removeBtn'] = _removeBtn;

      var _keyInput = Pard.Widgets.Input('key: '+_index, 'text');
      _inputsObj[_el]['key'] = _keyInput;
      if (val) _keyInput.setVal(val.key);
      _inputsCont.append(_keyInput.render().addClass('InputObj-keyInput'));

      var _valueInput = Pard.Widgets.Input('value', 'text');
      _inputsObj[_el]['value'] = _valueInput;
      if (val) _valueInput.setVal(val.value);
      _inputsCont.append(_valueInput.render().addClass('InputObj-valueInput'));

      _fieldsCont
        .append(_inputsObj[_el]['container']
          .append(_inputsCont, _btnCont)
        );
      _index += 1;

    }

    _createdWidget.click(function(){
      _createdWidget.css("border","none");
    });

    if ($.isEmptyObject(_inputsObj)){
     _addFields();
    };

    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        if ($.isEmptyObject(_inputsObj)) return null;
        Object.keys(_inputsObj).forEach(function(el, index){
          var key = _inputsObj[el]['key'].getVal();
          var val = _inputsObj[el]['value'].getVal();
          if (!key && !val) return;
          var k = key || index;
          _values[k] = val;
        })
        return _values;
      },
      addWarning: function(){
        _createdWidget.css('border','1px solid red');
      },
      removeWarning: function(){
        _createdWidget.css('border','none');
      },
      setVal: function(obj){
        _fieldsCont.empty();
        _inputsObj = {};
        _index = 0;
        if (obj){
          if($.isArray(obj)) obj = obj.reduce(function(new_obj, el){
            new_obj[el] = el;
            return new_obj;
          }, {})
          for (var k in obj){
            var valToset = {};
            valToset.key = k;
            valToset.value = obj[k];
            _addFields(valToset);
          }
        } 
      },
      activateTranslationSetting: function(){
        _addBtn.remove();
        $.each(_inputsObj, function(key, input){
          input['removeBtn'].remove();
        })
      }
    }
  }



}(Pard || {}));