'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};  

  ns.Widgets.FormsFieldsInputs = {
    'CategorySelector': ['categories_obj'], // OBJECT ---> ARRAY
    'SubcategorySelector': ['subcategories_obj'], // OBJECT ---> ARRAY
    'FormatSelector' : ['format_obj'], // OBJECT ---> ARRAY
    'Duration': ['duration_obj'], // OBJECT WITH DEFAULT VALUE
    'Conditions': ['link']
  }


  ns.Widgets.FormFields = function(){
    return {
      'CategorySelector': Pard.Widgets.CategorySelectorFormField,
      'SubcategorySelector': Pard.Widgets.SubcategorySelectorFormField,
      'FormatSelector' : Pard.Widgets.FormatSelector,
      'MultipleDaysSelector': Pard.Widgets.MultipleDaysFormField,
      'Duration': Pard.Widgets.DurationFormField,
      'CheckBox':Pard.Widgets.CheckBoxFormField,
      'Conditions':Pard.Widgets.ConditionsFormField,
      'TextAreaCounter': Pard.Widgets.TextAreaCounterFormField
    }
  }


    ns.Widgets.CategorySelectorFormField = function(block){
      var _formField = $('<div>').addClass('CategorySelector-FormField call-form-field')
      var _input = $('<select>')
      var _label = Pard.Widgets.InputLabel(block.label).render();
      if(block.type == 'mandatory') _label.text(block.label + ' *')
      var _helptxt = block.helptext || Pard.t.text('widget.categorySelector.helptext');
      var _helptext = $('<p>').addClass('help-text').html(_helptxt);

      var _form;

      var categories_obj = block.args[0];
 
      if (Array.isArray(categories_obj)) categories_obj = categories_obj.reduce(function(cat_obj, cat){
        cat_obj[cat] = cat_obj;
        return cat_obj;
      },{})

      var catArrayTranslated = Object.keys(categories_obj).map(function(cat){
        return Pard.t.text('categories.'+ cat)
      })

      Object.keys(categories_obj).forEach(function(value, index){
        _input.append($('<option>').append(catArrayTranslated[index]).val(value))
      })
      _input.on('change',function(){
        _input.removeClass('warning')
        if(categories_obj[_input.val()] && categories_obj[_input.val()].activateOptions){
          Object.keys(categories_obj[_input.val()].activateOptions).forEach(function(field){
            _form[field].input.reload(categories_obj[_input.val()].activateOptions[field])
          })
        }
      })
      .one('click',function(){
        _input.removeClass('placeholderSelect')
      })
      
      _formField.append(_label, _input, _helptext)
    

      return {
        render: function(){
          if (Object.keys(categories_obj).length > 1) 
            return _formField;
        },
        getVal: function(){
          return _input.val()
        },
        addWarning: function(){
          _input.addClass('warning')
        },
        removeWarning: function(){
          _input.removeClass('warning')
        },
        setVal: function(value){
          _input.val(value)
        },
        setForm: function(form){
          _form = form;
        },
        activate: function(_form){
          if(block.args[_input.val()] && block.args[_input.val()].activateOptions){
            Object.keys(block.args[_input.val()].activateOptions).forEach(function(field){
              _form[field].input.reload(block.args[_input.val()].activateOptions[field])
            });
          }
        }
      }
    }

    ns.Widgets.SubcategorySelectorFormField = function(block){
      var _formField = $('<div>').addClass('SubcategorySelector-FormField call-form-field')
      var _input = $('<select>')
      var _label = Pard.Widgets.InputLabel(block.label).render();
      if(block.type == 'mandatory')
        _label.text(block.label + ' *')
      var _helptext = Pard.Widgets.HelpText(block.helptext).render();

      var subcategories_obj = block.args[0]

      if (Array.isArray(subcategories_obj)) subcategories_obj = subcategories_obj.reduce(function(subc_obj, subcat, i){
        subc_obj[i] = subcat;
        return subc_obj;
      },{})

      Object.keys(subcategories_obj).forEach(function(value){
        _input.append($('<option>').append(subcategories_obj[value]).val(value))
      })

      _input.on('change',function(){
        _input.removeClass('warning')
      })
      .one('click',function(){
        _input.removeClass('placeholderSelect')
      })
      
      _formField.append(_label, _input, _helptext)

      

      return {
        render: function(){
          if (Object.keys(subcategories_obj).length > 1)
            return _formField
        },
        getVal: function(){
          return _input.val()
        },
        addWarning: function(){
          _input.addClass('warning')
        },
        removeWarning: function(){
          _input.removeClass('warning')
        },
        setVal: function(value){
          _input.val(value)
        }
      }
    }



    ns.Widgets.FormatSelector = function(block){
      var _formField = $('<div>').addClass('SubcategorySelector-FormField call-form-field')
      var _input = $('<select>')
      var _label = Pard.Widgets.InputLabel(block.label).render();
      if(block.type == 'mandatory')
        _label.text(block.label + ' *')
      var _helptext = Pard.Widgets.HelpText(block.helptext).render();

      var formats_obj = block.args[0]

      if (Array.isArray(formats_obj)) formats_obj = formats_obj.reduce(function(f_obj, f){
        f_obj[f] = f_obj;
        return f_obj;
      },{})

      Object.keys(formats_obj).forEach(function(value){
        var text = Pard.t.text('formats')[value] || value;
        text = text.capitalize();
        _input.append($('<option>').append(text).val(value));
      })

      _input.on('change',function(){
        _input.removeClass('warning')
      })
      .one('click',function(){
        _input.removeClass('placeholderSelect')
      })
      
      _formField.append(_label, _input, _helptext)

      

      return {
        render: function(){
          if (Object.keys(formats_obj).length > 1)
            return _formField
        },
        getVal: function(){
          return _input.val()
        },
        addWarning: function(){
          _input.addClass('warning')
        },
        removeWarning: function(){
          _input.removeClass('warning')
        },
        setVal: function(value){
          _input.val(value)
        }
      }
    }    
    



    ns.Widgets.MultipleDaysFormField = function(block){
      var _formField = $('<div>').addClass('MultipleDaysSelector-FormField call-form-field');
      var _label = Pard.Widgets.InputLabel(block.label).render();;
      if(block.type == 'mandatory') _label.text(block.label + ' *');
      var _helptext = Pard.Widgets.HelpText(block.helptext).render();
      var _input = Pard.Widgets.MultipleDaysSelector(block.args[0]);
      var _options = {
        placeholder: Pard.t.text('widget.availability.placeholder'),
        selectAllText: Pard.t.text('widget.availability.selectAllText'),
        countSelected: false,
        allSelected: Pard.t.text('widget.availability.allSelected')
      }
      _input.setOptions(_options);
      _helptext.css('margin-top', 5)

      return {
        render: function(){
          var _inputRendered = _input.render();
          if (_inputRendered) return _formField.append(_label, _inputRendered, _helptext);
        },
        getVal: function(){
          return _input.getVal();
        },
        setVal: function(values){
          _input.setVal(values);
        },
        addWarning: function(){
          _input.addWarning();
        },
        removeWarning: function(){
          _input.removeWarning();
        }
      }
    }


  ns.Widgets.DurationFormField = function(block){
    var _formField = $('<div>').addClass('Selector-FormField call-form-field')
    var _label = Pard.Widgets.InputLabel(block.label).render();
    if(block.type == 'mandatory')
      _label.text(block.label + ' *')
    var _input = Pard.Widgets.Selector(block.args[0]);
    var _helptext = Pard.Widgets.HelpText(block.helptext).render();

    _formField.append(_label, _input.render(), _helptext)

    return {
      render: function(){
        return _formField
      },
      getVal: function(){
        return _input.getVal()
      },
      addWarning: function(){
        _input.addWarning()
      },
      removeWarning: function(){
        _input.removeWarning()
      },
      setVal: function(value){
        _input.setVal(value)
      },
      reload: function(new_choices){
       _input.reload(new_choices)
      }
    }
  }


  ns.Widgets.CheckBoxFormField = function(block){
    var _formField = $('<div>').addClass('CheckBox-FormField call-form-field')
    var _label = Pard.Widgets.InputLabel(block.label).render();
    if(block.type == 'mandatory')
      _label.text(block.label + ' *')
    var _input = $('<input>').attr({type: 'checkbox'})
    var _helptext = Pard.Widgets.HelpText(block.helptext).render();

    _input.on('change', function(){
      _input.removeClass('checkBox-warning')
    })

    _formField.append(_input, _label, _helptext)
    _label.css('display','inline')
    _helptext.css({'margin-top':'0'})

    return {
      render: function(){
        return _formField
      },
      getVal: function(){
        return _input.is(":checked")
      },
      setVal: function(val){
        if (val && val != 'false'){ _input.attr('checked', val)}
        if (val === false){_input.attr('checked', false)}
      },
      addWarning: function(){
        _input.addClass('checkBox-warning')
      },
      removeWarning: function(){
        _input.removeClass('checkBox-warning')
      },
      conditions:function(link){
        _helptext.append($('<a>').text(Pard.t.text('widget.conditions.see')).attr({'href': link, 'target':'_blank'}))
      }
    }
  }

  ns.Widgets.ConditionsFormField = function(block){
    var _formField = $('<div>').addClass('CheckBox-FormField call-form-field')
    var _label = Pard.Widgets.InputLabel(block.label).render();
    if(block.type == 'mandatory')
      _label.text(block.label + ' *')
    var _input = $('<input>').attr({type: 'checkbox'})
    var _helptext = Pard.Widgets.HelpText(block.helptext).render();

    _input.on('change', function(){
      _input.removeClass('checkBox-warning')
    })

    _formField.append(_input, _label, _helptext)
    _label.css('display','inline')
    _helptext.css({'margin-top':'0'})

    console.log(block.args)

    return {
      render: function(){
        return _formField
      },
      getVal: function(){
        return _input.is(":checked")
      },
      setVal: function(val){
        if (val && val != 'false'){ _input.attr('checked', val)}
        if (val === false){_input.attr('checked', false)}
      },
      addWarning: function(){
        _input.addClass('checkBox-warning')
      },
      removeWarning: function(){
        _input.removeClass('checkBox-warning')
      },
      conditions:function(link){
        if (link) _helptext.append($('<a>').text(Pard.t.text('widget.conditions.see')).attr({'href': link, 'target':'_blank'}))
      }
    }
  }
  


  ns.Widgets.TextAreaCounterFormField = function(block){
    var _formField = $('<div>').addClass('TextAreaCounter-FormField call-form-field')
    var _label = Pard.Widgets.InputLabel(block.label).render();
    if(block.type == 'mandatory')
      _label.text(block.label + ' *')
    
    var _input = Pard.Widgets.TextAreaCounter(block.args[0], block.args[1], block.helptext, block.args[2]);

    _formField.append(_label, _input.render())

    return {
      render: function(){
        return _formField
      },
      getVal: function(){
        return _input.getVal();
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

  ns.Widgets.CheckNameField = function(texts, profile){

    if (!profile) var profile = {};

    var _createdWidgets = $('<div>').css('margin-top','2rem');
    var _input = Pard.Widgets.InputName(profile.id);
    _input.setVal(profile.name);
    _input.disable();
    var _label = $('<label>');
    var _tlabel = texts.label || Pard.t.text('widget.checkName.label');
    _label.html(_tlabel);
    var _helptext = $('<p>').addClass('help-text');
    var _ht = $('<span>').text(Pard.t.text('widget.checkName.helptext'));
    var _modifyBtn = $('<button>')
      .attr({
        'type':'button'
      })
      .addClass('abutton')
      .text(Pard.t.text('widget.checkName.here'))
      .click(function(){
        _input.enable();
        _activated = true;
      });
      _helptext.append(_ht, _modifyBtn,'. ');
    if (texts.helptext) {
      _helptext.append($('<span>').html(texts.helptext));
    }

    _input.input.focusout(function(){
      if(!_input.input.hasClass('warning')){
        Pard.Backend.modifyProfileName(_input.getVal(), profile.id, function(data){
           if (data['status'] == 'success'){
            _input.disable();
            _input.input.removeClass('available');
           }
          else{
            _input.addWarning();
          }
        })
      }
    })

    _createdWidgets.append(
      _label,
      _input.render(),
      _helptext
      )
    return {
      render: function(){
        return _createdWidgets;
      }
    }
  }

 
}(Pard || {}));
