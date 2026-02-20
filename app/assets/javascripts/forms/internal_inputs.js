'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.MultipleSelectorObj = function(values, dictionary, optionsObj){

    var _createdWidget = $('<div>').addClass('MultipleSelector-Widget');
    var _select = $('<select>').attr("multiple", "multiple");
    
    if (Array.isArray(values)) values = values.reduce(
      function(valuesObj, k){
        valuesObj[k] = k;
        return valuesObj;
      }
      ,{}
    )
    
    $.each(values, function(key, value){
      var _option = $('<option>').val(key);
      if (dictionary) value = dictionary[value]; 
      _option.text(value.capitalize());
      _select.append(_option);
    });
    _createdWidget.append(_select);
    _select.on('change',function(){
      _select.next().find('.ms-choice').removeClass('warning');
    });
    var _options = {      
      placeholder: Pard.t.text('widget.multipleSelector.placeholder'),
      selectAll: false,
      countSelected: false,
      allSelected: false
    };


    if (optionsObj) for(var field in optionsObj){ _options[field] = optionsObj[field]};

    _select.multipleSelect(_options);

    
    return {
      render: function(){
        if(Object.keys(values).length == 1){
          _select.multipleSelect('setSelects', Object.keys(values));
          _select.multipleSelect("disable");
        }
        return _createdWidget;
      },
      setOptions: function(options){
        _options = options;
      },
      getVal: function(){
        var _values =  _select.val() ? _select.val().reduce(function(val_obj, val){
          val_obj[val] = values[val]; 
          return val_obj;
        },{}) : {};
        return _values;
      },
      setVal: function(valuesToSet){
        if(valuesToSet && Object.keys(values).length > 1){
          _select.multipleSelect('setSelects', Object.keys(valuesToSet));
        }
      },
      addWarning: function(){
        _select.next().find('.ms-choice').addClass('warning');
      },
      removeWarning: function(){
        _select.next().find('.ms-choice').removeClass('warning');
      },
      setClass: function(_class){
        _createdWidget.addClass(_class);
      },
      deselectAll: function(){
        _select.multipleSelect("uncheckAll")
      },
      enable: function(){
        _select.multipleSelect("enable");
      },
      disable: function(){
        _select.multipleSelect("disable");
      }
    }
  }


  ns.Widgets.EventsSelector = function(){
    var _createdWidget = $('<div>');
    var _eventSelector = $('<select>');

    _createdWidget.append(_eventSelector);

    _eventSelector.select2({
      dropdownCssClass: 'tags-select2',
      minimumInputLength: 1,
      ajax: {
        url: '/search/suggest_event_names',
        type: 'POST',
        dataType: 'json',
        delay: 250,
        data: function (params) {
          var _query = [];
          _query.push(params.term);
          return {
            query: _query
          };
        },
        processResults: function (data, params) {
          return {
            results: data.items
          };
        },
        templateSelection: function(resource){
          return resource.text;
        }
      }
    })


    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _dataSelected = _eventSelector.select2('data')[0];
        var _values = '';
        if (_dataSelected) _values = {
          event_id: _dataSelected.id,
          profile_id: _dataSelected.profile_id,
          call_id: _dataSelected.call_id,
          program_id: _dataSelected.program_id
        }
        return _values;
      },
      addWarning: function(){
        _createdWidget.addClass('warning');
      },
      removeWarning: function(){
        _createdWidget.removeClass('warning');
      }
    }
  }


  ns.Widgets.EventTime = function(addBtnText){

    var _createdWidget = $('<div>');

    var _dayTime = $('<div>');
    var _dayTimeInputs = Pard.Widgets.SummableInputs({
      '0':{
        'type':'mandatory',
        'input':'InputDate',
        'args': [{minDate: new Date()}],
        'label': Pard.t.text('widget.eventTime.date'),
        'class':'column-1_3 popup-form'
      }
      ,
      '1': {
        'type':'mandatory',
        'input':'InputTime',
        'args': [{minutes: { interval: 15 }}],
        'label': Pard.t.text('widget.eventTime.starting_time'),
        'class':'column-1_3 popup-form'
      },
      '2': {
        'type':'mandatory',
        'input':'InputTime',
        'args': [{minutes: { interval: 15 }}],
        'label': Pard.t.text('widget.eventTime.ending_time'),
        'class':'column-1_3 popup-form'
      }
    },
    addBtnText
    )

    _dayTime.append(_dayTimeInputs.render());
    _createdWidget.append(_dayTime);

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _values = [];
        var _dayInputsValues = _dayTimeInputs.getVal();
        if (Pard.Widgets.IsBlank(_dayInputsValues)) return null;
        _dayInputsValues
          .sort(function(dayInputVal1, dayInputVal2){
            if(dayInputVal1['0'] < dayInputVal2['0']) return -1;
            return 1;
          })
          .forEach(function(dayInputVal){
            var day = new Date(parseInt(dayInputVal['0']));
            var initT = dayInputVal['1'];
            var endT = dayInputVal['2'];
            day.setHours(initT.getHours(), initT.getMinutes());
            var initTmillisec = day.getTime();
            day.setHours(endT.getHours(), endT.getMinutes());
            var endTmillisec = day.getTime();
            if(initTmillisec > endTmillisec) endTmillisec += 24*60*60*1000
            _values.push({
              date: moment(day).format('YYYY-MM-DD'),
              time: [initTmillisec,endTmillisec]
            })
          })
        return _values;
      },
      addWarning: function(){
        _dayTimeInputs.addWarning();
      },
      removeWarning: function(){
        _dayTimeInputs.removeWarning();
      },
      setVal: function(eventTime){
        var _eventTime = eventTime.map(function(evt){
          return {
            '0': new Date(evt.date),
            '1': new Date(parseInt(evt.time[0])),
            '2': new Date(parseInt(evt.time[1]))
          };
        })
        _dayTimeInputs.setVal(_eventTime);        
      }
    }
  }

  ns.Widgets.DateTimeArray = function(availableDates){

    var _createdWidget = $('<div>');

    if (availableDates){

      function enableAllTheseDays(date) {
          var sdate = $.datepicker.formatDate( 'yy-mm-dd', date)
          if($.inArray(sdate, availableDates) != -1) {
              return [true];
          }
          return [false];
      }

      var options = {beforeShowDay: enableAllTheseDays};
    }
    // var _dayTime = $('<div>');
    var _subCategoriesObj = {};
    if (Pard.UserInfo && Pard.UserInfo['texts'] && Pard.UserInfo['texts'].subcategories) _subCategoriesObj = Pard.UserInfo['texts'].subcategories.artist;

    var _dayTimeInputs = Pard.Widgets.SummableInputs({
      '0':{
        'type':'mandatory',
        'input':'InputDate',
        'args': [options],
        'label': Pard.t.text('widget.eventTime.date'),
        'class':'column-1_5 popup-form'
      }
      ,
      '1': {
        'type':'mandatory',
        'input':'InputTime',
        'args': [{minutes: { interval: 15 }}],
        'label': Pard.t.text('widget.dateTimeArray.starting_time'),
        'class':'column-1_5 popup-form'
      },
      '2': {
        'type':'mandatory',
        'input':'InputTime',
        'args': [{minutes: { interval: 15 }}],
        'label': Pard.t.text('widget.dateTimeArray.ending_time'),
        'class':'column-1_5 popup-form'
      },
      'subcategories': {
        'type':'optional',
        'input':'MultipleSelector',
        'args': [_subCategoriesObj, null, null, {allSelected: Pard.t.text('widget.dateTimeArray.subcatSelector.allSelected'), placeholder: Pard.t.text('widget.dateTimeArray.subcatSelector.placeholder')}],
        'label': Pard.t.text('widget.dateTimeArray.subcatSelector.label'),
        'class':'column-2_5'
      }
    })

    _dayTime = _dayTimeInputs.render();
    _createdWidget.append(_dayTime);

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _values = [];
        var _dayInputsValues = _dayTimeInputs.getVal();
        if (Pard.Widgets.IsBlank(_dayInputsValues)) return null;
        _dayInputsValues
          .sort(function(dayInputVal1, dayInputVal2){
            if(dayInputVal1['0'] < dayInputVal2['0']) return -1;
            return 1;
          })
          .forEach(function(dayInputVal){
            var day = new Date(parseInt(dayInputVal['0']));
            var initT = dayInputVal['1'];
            var endT = dayInputVal['2'];
            day.setHours(initT.getHours(), initT.getMinutes());
            var initTmillisec = day.getTime();
            day.setHours(endT.getHours(), endT.getMinutes());
            var endTmillisec = day.getTime();
            if(initTmillisec > endTmillisec) endTmillisec += 24*60*60*1000
            var _val = {
              date: moment(day).format('YYYY-MM-DD'), 
              time: [initTmillisec, endTmillisec]
            }
            if (dayInputVal['subcategories'] && dayInputVal['subcategories'].length != Object.keys(_subCategoriesObj).length){ 
              _val['subcategories']= dayInputVal['subcategories']
            }
            _values.push(_val);
          })
          console.log(_values)
        return _values;
      },
      addWarning: function(){
        _dayTimeInputs.addWarning();
      },
      removeWarning: function(){
        _dayTimeInputs.removeWarning();
      },
      setVal: function(values){
        values = values || [];
        var _eventTime = values.map(function(dt){
          return {
            '0': new Date(dt.date),
            '1': new Date(parseInt(dt.time[0])),
            '2': new Date(parseInt(dt.time[1])),
            'subcategories': dt['subcategories']
          };
        }) 
        _dayTimeInputs.setVal(_eventTime);
      }
    }
  }

  ns.Widgets.ProgramSubcategories = function(){

    var _createdWidget = $('<div>');
    var _program;

    var _icontainer = $('<div>');

    var _availableLang = {
        'es': Pard.t.text('footer.languages.es'),
        'ca' : Pard.t.text('footer.languages.ca'),
        'en': Pard.t.text('footer.languages.en')
      }

    var selectedLanguages;

    var _langSelector = Pard.Widgets.MultipleSelector(
      _availableLang,
      function(){
        selectedLanguages = _langSelector.getVal();
        _printLangFields(selectedLanguages);
      }
    );

    var _artistSubCat, _spaceSubCat; 

    var _printLangFields = function(selectedLanguages){
      _textsInputsContainer.empty();
      var _artistInputs = {};
      var _spaceInputs = {};
      if (selectedLanguages){

        selectedLanguages.forEach(function(lang){
          _artistInputs[lang] = _artistTextsInputForm[lang];
          _spaceInputs[lang] = _spaceTextsInputForm[lang];
        });
        _artistInputs['categories'] =  {
          "type" : "mandatory",
          "input" : "MultipleSelector",
          "label" : "Corresponding categories",
          "args" : [
            Pard.OrfheoCategories,
            null,
            Pard.t.text('categories')
          ]
        }
        _artistSubCat = Pard.Widgets.SummableInputs(_artistInputs);
        _spaceSubCat = Pard.Widgets.SummableInputs(_spaceInputs);
        if(_program){
          var _artistSavedValues = []; 
          var _spaceSavedValues = [];
          Object.keys(_program['subcategories']['space']).forEach(function(key, index){
            _spaceSavedValues[index] = {};
            selectedLanguages.forEach(function(lang){
               _program['texts'][lang] ? _spaceSavedValues[index][lang] = _program['texts'][lang]['subcategories']['space'][key] : _spaceSavedValues[index][lang] = '' ;
            })
          });
          Object.keys(_program['subcategories']['artist']).forEach(function(key, index){
            _artistSavedValues[index] = {};
            selectedLanguages.forEach(function(lang){
              _program['texts'][lang] ? _artistSavedValues[index][lang] = _program['texts'][lang]['subcategories']['artist'][key] : _artistSavedValues[index][lang] = '';
               _artistSavedValues[index]['categories'] = _program['subcategories']['artist'][key]
            })
          });
          _spaceSubCat.setVal(_spaceSavedValues);
          _artistSubCat.setVal(_artistSavedValues);

        }
        _textsInputsContainer.append(
          $('<p>').text('Artist Subcategories').css({'margin':'2rem 0 -1rem 0'}),
          _artistSubCat.render(),
          $('<p>').text('Space Subcategories').css({'margin':'0 0 -1rem 0'}),
          _spaceSubCat.render()
        )
      }
    }

    var _artistTextsInputForm ={
      'es': {
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Artist Subcategory ES",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
      'ca':{
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Artist Subcategory CA",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
      'en':{
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Artist Subcategory EN",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
    }


    var _spaceTextsInputForm ={
      'es': {
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Space Subcategory ES",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
      'ca':{
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Space Subcategory CA",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
      'en':{
          "type" : "mandatory",
          "input" : "Input",
          "label" : "Space Subcategory EN",
          "args" : [ 
              "Subcategory name", 
              "text"
          ]
      },
    }


    var _textsInputsContainer = $('<div>');
    _icontainer.append(
      _langSelector.render(),
      _textsInputsContainer
    );

    _createdWidget.append(_icontainer);


    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        _values['texts'] = {};
        if(_langSelector.getVal()) _langSelector.getVal().forEach(function(lang){
          _values['texts'][lang] = {};
          _values['texts'][lang]['subcategories'] = {'artist':{}, 'space':{}};
        });
        else {
          _langSelector.addWarning();
          return null
        };
        _values['subcategories'] = {'artist':{}, 'space':{}};
        var _artistSubCatValues = _artistSubCat.getVal();
        if (_artistSubCatValues) _artistSubCatValues.forEach(function(aval, i){
          var index = i.toString();
          for(var k in aval){
            if (k == 'categories') _values['subcategories']['artist'][index] = aval[k]; 
            else _values['texts'][k]['subcategories']['artist'][index] = aval[k];
          }
        });
        else {
          _artistSubCat.addWarning();
          return null
        };
        var _spaceSubCatValues = _spaceSubCat.getVal();
        if (_spaceSubCatValues) _spaceSubCatValues.forEach(function(aval, i){
          var index = i.toString();
          _values['subcategories']['space'][index] = null; 
          for(var k in aval){
            _values['texts'][k]['subcategories']['space'][index] = aval[k];
          }
        });
        else{
          _spaceSubCat.addWarning();
          return null
        };
        return _values;
      },
      addWarning: function(){
      },
      removeWarning: function(){
      },
      setVal: function(values){
        _program = values;
        var _savedLangs = Object.keys(_program.texts); 
        _langSelector.setVal(_savedLangs);
        _printLangFields(_savedLangs);
      }
    }
  }


  ns.Widgets.MultiLangInputs = function(inputs){

    var _createdWidget = $('<div>');
    var _savedValues;

    var _icontainer = $('<div>');

    var _availableLang = Pard.Options.availableLangs().reduce(function(obj, lang){
      obj[lang] = Pard.t.text('footer.languages')[lang]
      return obj;
    }, {});

    var selectedLanguages;

    var _langSelector = Pard.Widgets.MultipleSelector(
      _availableLang,
      function(){
        selectedLanguages = _langSelector.getVal();
        _printLangFields(selectedLanguages);
      }
    );

    var _inputsObj = {};


    var _printLangFields = function(selectedLanguages){
      _textsInputsContainer.empty();
      _inputsObj = {};
     
      if (selectedLanguages){
        for (var field in inputs){ 
          var _inputsContainer = $('<div>')
            .css({
              'margin': '2rem 0'
            });
          selectedLanguages.forEach(function(lang){
            _inputsObj[lang] = _inputsObj[lang] || {};
            var _labelText = '- '+lang.toUpperCase()+'- ';
            if(inputs[field]['label']) _labelText +=  inputs[field].label;
            _inputsContainer.append(
              $('<label>').text(_labelText).css('margin-top','.5rem')
            );
            var _args = [];
            $.each(inputs[field].args, function(k, v){_args[parseInt(k)]=v});
            var _fieldInput = window['Pard']['Widgets'][inputs[field].input].apply(this, _args);
            _inputsObj[lang][field] = _fieldInput;
            if (_savedValues && _savedValues[lang] && _savedValues[lang][field]) _fieldInput.setVal(_savedValues[lang][field]);
            _inputsContainer.append(
              _fieldInput.render()
            );
          });
          _textsInputsContainer.append(
              _inputsContainer
            );                  
        }
      }
    }


    var _textsInputsContainer = $('<div>');
    _icontainer.append(
      _langSelector.render(),
      _textsInputsContainer
    );

    _createdWidget.append(_icontainer);


    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        if(_langSelector.getVal()) _langSelector.getVal().forEach(function(lang){
          _values[lang] = {};
          for (var field in _inputsObj[lang]){
            _values[lang][field] = _inputsObj[lang][field].getVal();
          }
        });
        else {
          _langSelector.addWarning();
          return null
        };
        return _values;
      },
      addWarning: function(){
      },
      removeWarning: function(){
      },
      setVal: function(values){
        _savedValues = values;
        var _savedLangs = Object.keys(_savedValues); 
        _langSelector.setVal(_savedLangs);
        _printLangFields(_savedLangs);
      }
    }
  }




  ns.Widgets.PerformancePriceInput = function(){

    var _createdWidget = $('<div>').addClass('performancePriceInput');
    
    var priceValue = Pard.Widgets.InputNumber(Pard.t.text('dictionary.price'), "€");
    var priceLink = $('<input>')
      .attr({
        type: 'text',
        placeholder: Pard.t.text('widget.inputPerformancePrice.linkPlaceholder') 
      })
    var buyBookSelector = Pard.Widgets.Selector({
      buy: Pard.t.text('widget.inputPerformancePrice.buy'),
      book: Pard.t.text('widget.inputPerformancePrice.book')
    })

    _createdWidget.append(
      priceValue.render().css({'display':'inline-block', 'width':'70%'}),
      buyBookSelector.render().css({'display':'inline-block', 'width':'30%', 'margin-bottom':0}), 
      priceLink
    ); 

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return {
          price: priceValue.getVal(),
          ticket_url: priceLink.val(),
          transition_type: buyBookSelector.getVal()
        }
      },
      setVal: function(val){
        priceValue.setVal(val['price']);
        priceLink.val(val['ticket_url']);
        if (val['transition_type']) buyBookSelector.setVal(val['transition_type']);
      },
      enable: function(){
        priceValue.enable();
        priceLink.attr('disabled',false);
        buyBookSelector.enable();
      },
      disable: function(){
        priceValue.disable();
        buyBookSelector.disable();
        priceLink.attr('disabled', true);
      }
    }
  }

  ns.Widgets.PersonalButton = function(){
    var _input = $('<div>');
    var _link = Pard.Widgets.Input(Pard.t.text('profile_page.free_block.LinkBottomForm'),'text');
    var _tooltip = Pard.Widgets.Input(Pard.t.text('profile_page.free_block.TooltipTextBottomForm'),'text');
    var _text = Pard.Widgets.TextAreaCounter(Pard.t.text('profile_page.free_block.PlaceHolderTextBottomForm'),30,Pard.t.text('profile_page.free_block.helptextBottomForm'));
    var _helptextLink = Pard.Widgets.HelpText(Pard.t.text('profile_page.free_block.helptextLink'));
    var _helptextTooltip = Pard.Widgets.HelpText(Pard.t.text('profile_page.free_block.helptextTooltip'));

    _input.append(
      _text.render().css('margin-top','.1rem'), 
      _link.render().css('margin-top','.4rem'), 
      _helptextLink.render(),
      _tooltip.render().css('margin-top','.4rem'),
      _helptextTooltip.render()
    );

    var _getVal = function(){
      if (_link.getVal() || _text.getVal()){ 
        return {
          link: _link.getVal(),
          text: _text.getVal(),
          tooltip: _tooltip.getVal()
        }
      }
      else return {};
    }

    return {
      render: function(){
        return _input;
      },
      getVal: function(){
        return _getVal();
      },
      addWarning: function(){
      },
      removeWarning: function(){
        _link.removeWarning();
        _text.removeWarning();
      },
      setVal: function(values){
        if (!$.isEmptyObject(values)){
          _link.setVal(values.link);
          _text.setVal(values.text);
          _tooltip.setVal(values.tooltip);
        }
      }
    }
  }



  ns.Widgets.PersonalButtons = function(btnInputLabel){
    var _createdWidget = $('<div>');
    var label = btnInputLabel || Pard.t.text('profile_page.free_block.labelBottomForm');
    if (btnInputLabel === false){
      label = '';
      _createdWidget.addClass('personalButtos-largeVspace');
    }
    var _input = Pard.Widgets.SummableInputs(
      {
        btnInput:{
          "type" : "optional",
          "label" : label,
          "input" : "PersonalButton",
          "args" : null,
          "helptext" : ''
        }
      },
      Pard.t.text('forms.event.addPersonalBtn') 
    )


    var _getVal = function(){
      var _gotVal = _input.getVal();
      var values = [];
      $.each(_gotVal, function(key, val){
        values.push(val.btnInput);
      })
      return values;
    }

    _createdWidget.append(
      _input.render()  
    );

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _getVal();
      },
      addWarning: function(){
      },
      removeWarning: function(){
       
      },
      setVal: function(values){
        var valuesToSet = {}; 
        $.each(values, function(i, val){
          valuesToSet[i] = {btnInput: val};
        });
        _input.setVal(valuesToSet);
      }
    }
  }


  ns.Widgets.InputTags = function(source){

    var _inputTags = $('<div>').addClass('tagsInput-div');
    var _select = $('<select>').appendTo(_inputTags);
    var _placeHolder = Pard.t.text('createProfile.artistForm.TagsPlaceholder')
    var optionsList = [];
    _select
      .select2({
        tags: true,
        multiple: true,
        placeholder: _placeHolder,
        dropdownCssClass: 'tags-select2',
        minimumInputLength: 1,
        ajax: {
          url: '/search/suggest_tags',
          type: 'POST',
          dataType: 'json',
          delay: 250,
          data: function (params) {
            var _query = [];
            _query.push(params.term);
            return {
              query: _query,
              source: source,
              page: params.page,
              event_id: '',
              lang: Pard.Options.language()
            };
          },
          processResults: function (data, params) {
            params.page = params.page || 1;
            return {
              results: data.items,
              pagination: {
                more: (params.page * 30) < data.total_count
              }
            };
          },
          templateSelection: function(resource){
            return resource.text;
          }
        }
      })
      .on('select2:unselecting', function() {
        $(this).data('unselecting', true);
      })
      .on('select2:opening', function(e) {
        if ($(this).data('unselecting')) {
          $(this).removeData('unselecting');
          e.preventDefault();
        }
      })
      .on('select2:select', function(){
        var justSelected = $(this).val()[$(this).val().length-1];
        if (optionsList.indexOf(justSelected.id)<0){
          var newoption = $('<option>').val(justSelected).text(justSelected); 
          optionsList.push(newoption.id);
        }
      })

    return {
      render: function(){
        return _inputTags;
      },
      getVal: function(){
        return _select.val();
      },
      addWarning: function(){
        _inputTags.addClass('warning');
      },
      removeWarning: function(){
        _inputTags.removeClass('warning');
      },
      setVal: function(values){
        if (values){
          values.forEach(function(tag){
            var option = new Option(tag, tag, true, true);
            _select.append(option);
          });
          _select.trigger('change');
          optionsList = values;
        }
      }
    }
  }



  ns.Widgets.InputTelContactForm = function(placeholder){

    var checkPhone = function(){
      var okPattern = new RegExp (/\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*/);
      if(_inputTel.getVal()){
        var notPattern = new RegExp (/[a-z]/);
          if ((notPattern.test(_inputTel.getVal())) || !(okPattern.test(_inputTel.getVal()))) {_inputTel.addWarning(); return ''}
        return _inputTel.getVal();
      }
    }

    var _inputTel = Pard.Widgets.Input(placeholder, 'tel', function(){_inputTel.removeWarning()}, checkPhone);

    return{
      render: function(){
        return _inputTel.render();
      },
      getVal: function(){
        return _inputTel.getVal();
      },
      setVal: function(value){
        _inputTel.setVal(value);
      },
      addWarning: function(){
        _inputTel.addWarning();
      },
      removeWarning: function(){
        _inputTel.removeWarning();
      },
      setClass: function(_class){
        _inputTel.setClass(_class);
      }
    }
  }


  ns.Widgets.FacetsSelector = function(){
    var facetsSelector;
    facetsSelector = Object.keys(Pard.OrfheoFacets).reduce(function(arr, type){
        return arr.concat(Pard.OrfheoFacets[type])
    },[])

    // facetsSelectorTranslated = facetsSelector.map(function(facet){return Pard.t.text('facets')[facet]})

    // var _createdWidget = Pard.Widgets.MultipleSelector(facetsSelector, null, Pard.t.text('facets'))

    var _createdWidget = Pard.Widgets.MultipleGroupSelector(Pard.OrfheoFacets, null, Pard.t.text('facets'))

    return {
      render: function(){
        return _createdWidget.render();
      },
      getVal: function(){
        return _createdWidget.getVal();
      },
      addWarning: function(){
        _createdWidget.addWarning();
      },
      removeWarning: function(){
        _createdWidget.removeWarning();
      },
      setVal: function(value){
        _createdWidget.setVal(value);
      },
      setClass: function(_class){
        _createdWidget.setClass(_class);
      },
      enable: function(){
        _createdWidget.enable();
      },
      disable: function(){
        _createdWidget.disable();
      }
    }
  }


  ns.Widgets.InputAddressArtist = function(){

    var _inputForm = {
      locality: Pard.Widgets.Input(Pard.t.text('widget.inputAddressArtist.city'),'text', function(){_inputForm.locality.removeWarning(); addressValue();}),
      postal_code: Pard.Widgets.Input(Pard.t.text('widget.inputAddressArtist.postalCode'),'text', function(){_inputForm.postal_code.removeWarning(); addressValue();}),
      neighborhood: Pard.Widgets.Input(Pard.t.text('widget.inputAddressArtist.neighborhood'), 'text', function(){
        addressValue();
      })
    }
  
    var _addressValues = {};
    var addressValue = function(){
      var _check = true;
      for (var field in _inputForm){
        _addressValues[field] = _inputForm[field].getVal();
      }
      ['locality', 'postal_code'].forEach(function(field){
        if (!(_addressValues[field])) {
          _inputForm[field].addWarning();
          _check = '';
        }
      });
      if (_check){
        var uri = "https://maps.googleapis.com/maps/api/geocode/json?address="  + _addressValues.locality + '+' + _addressValues.postal_code + "&key=AIzaSyCimmihWSDJV09dkGVYeD60faKAebhYJXg";
        $.get(uri, function(data){
          if(data.status == "OK" && data.results.length > 0){
            _addressValues.location = data.results[0].geometry.location;
          }
          else{
            _addressValues.location ={};
          }
        });
      } 
      else {
        _addressValues = {};
      }
    }

    var _placeForm = $('<div>');
    for (var field in _inputForm){
      var _input = _inputForm[field].render();
      _placeForm.append($('<div>').append(_input).addClass(field+'-ArtistForm'));
    };

    return {
      render: function(){
        return _placeForm;
      },
      getVal: function(){
        var _artistAddress;
        if ($.isEmptyObject(_addressValues)) _artistAddress = false;
        else _artistAddress = _addressValues;
        return _artistAddress;
      },
      setVal: function(_val){
        for(var field in _inputForm) {
          _inputForm[field].setVal(_val[field]);
          _addressValues[field] = _val[field];
        }
        _addressValues['location'] = _val['location'];
      },
      addWarning: function(){
        addressValue();
      }
    }
  } 


  ns.Widgets.InputAddressSpace = function(label, mandatoryFields){
   
    var autocomplete = {};

    var componentForm = {
      route: 'long_name',
      street_number: 'short_name',
      locality: 'long_name',
      country: 'long_name',
      postal_code: 'short_name'
    };

    var _mandatoryFields = mandatoryFields || ['route', 'street_number', 'locality', 'postal_code'];

    var _inputFormPlaceholders = {
      route: Pard.t.text('widget.inputAddressSpace.street'),
      street_number: Pard.t.text('widget.inputAddressSpace.number'),
      door: Pard.t.text('widget.inputAddressSpace.door'),
      locality: Pard.t.text('widget.inputAddressSpace.city'),
      country: Pard.t.text('widget.inputAddressSpace.state'),
      postal_code: Pard.t.text('widget.inputAddressSpace.postalCode')
    }

    _mandatoryFields.forEach(function(field){
      _inputFormPlaceholders[field] = _inputFormPlaceholders[field] +' *'
    })

    var _inputForm = {
      route: Pard.Widgets.Input(_inputFormPlaceholders['route'],'text', function(){_inputForm.route.removeWarning();}, function(){_checkLocation();}),
      street_number: Pard.Widgets.Input(_inputFormPlaceholders['street_number'], 'text', function(){_inputForm.street_number.removeWarning();}, function(){_checkLocation();}),
      door: Pard.Widgets.Input(_inputFormPlaceholders['door'], 'text', function(){_inputForm.door.removeWarning();}, function(){_checkLocation();}),
      locality: Pard.Widgets.Input(_inputFormPlaceholders['locality'],'text', function(){_inputForm.locality.removeWarning();}, function(){_checkLocation();}),
      country: Pard.Widgets.Input(_inputFormPlaceholders['country'],'text', function(){_inputForm.country.removeWarning();}, function(){_checkLocation();}),
      postal_code: Pard.Widgets.Input(_inputFormPlaceholders['postal_code'],'text', function(){_inputForm.postal_code.removeWarning();}, function(){_checkLocation();} )
    }

    for (var field in _inputForm) _inputForm[field].setClass(field+'-addressForm');

    label = label || Pard.t.text('widget.inputAddressSpace.placeholder');

    var _inputPlace = $('<input>').attr({type: 'text', id: 'place_address_autocomplete', placeholder:label}).css('margin-bottom','1rem');

    var AutocompleteFunction = function(){
      autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('place_address_autocomplete')),
        {types: ['address']}
      );
      autocomplete.addListener('place_changed', function(){
        FillInAddress(autocomplete, _inputForm)}
      );
    }

    // _inputPlace.one('focus', function(){
    //   AutocompleteFunction()
    // });


    _inputPlace.one('input', function(){
      for (var component in _inputForm) {
        _inputForm[component].setVal('');
        _latField.setVal('');
        _lonField.setVal('');
        _geocod = null;
        _inputForm[component].setAttr('disabled', false);
      }
      var _check = true;
      _inputPlace.on('input', function(){
        if(_check && _inputPlace.val().length > 2){
          AutocompleteFunction();
          _check = false;
        }
      })
      _inputPlace.on('focusout', function(){
        _checkLocation();
      });  
    });

    if (mandatoryFields) for (var component in _inputForm) {
        _inputForm[component].setAttr('disabled', false);
      }

    var FillInAddress = function(autocomplete, _inputForm) {
      var place = autocomplete.getPlace();

      for (var component in _inputForm) {
        _inputForm[component].setVal('');
        _latField.setVal('');
        _lonField.setVal('');
        _geocod = null;
        _inputForm[component].setAttr('disabled', false);
      }  

      if (place.address_components){
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            _inputForm[addressType].setVal(val);
            _inputForm[addressType].removeWarning();
          }
        }
      }
      _checkLocation();
    }

    var addressValue = function(){
      var _addressValues = {};
      var _check = true;
      for (var field in _inputForm){
        _addressValues[field] = _inputForm[field].getVal();
      }      
      _mandatoryFields.forEach(function(field){
        if (!(_addressValues[field])) {
          _inputForm[field].addWarning();
          _check = '';
        }
      });
      if (_check){
        if(_geocod) _addressValues['location'] = _geocod;
        return _addressValues;
      }
      else{
        return _check;
      }
    }
 
    var _placeForm = $('<div>').append(_inputPlace);
    for (var key in _inputForm){_placeForm.append(_inputForm[key].render().attr({disabled: 'true'}))};

    var _mapCheckContainer = $('<div>').css({'margin-bottom':'-.5rem'});
    // var _seeMapText = $('<a>').text('Comprueba la localización en el mapa').attr('href','#');         
    var _map = $('<div>').attr('id', 'gmapProfile');
    var _errorBox = $('<div>');
    var _geocodCont = $('<div>').addClass('geocod-container-adrees-imput');
    var _mapBox = $('<div>').append(_map, _geocodCont);
    // _mapCheckContainer.append($('<div>').append(_seeMapText).css({'text-align':'right','font-size':'0.8125rem', 'margin-top':'0.4rem'}), _errorBox, _mapBox);
    _mapCheckContainer.append(_errorBox, _mapBox);
    var geomap;
    var _geocod;
    var _check = true;
    var _latField = Pard.Widgets.Input('','text');
    var _lonField = Pard.Widgets.Input('','text');
    var _hereBtn = $('<a>').text(Pard.t.text('widget.inputAddressSpace.insertGeoBtn')).attr('href','#/');

    var _checkLocation = function(location){
      _errorBox.empty()
      var _addressInserted = addressValue();
      if (_addressInserted){
        var _spinnerCheckLocation = new Spinner();
        _spinnerCheckLocation.spin();
        $('body').append(_spinnerCheckLocation.el);
        var uri = Pard.Widgets.RemoveAccents("https://maps.googleapis.com/maps/api/geocode/json?address=" + _addressInserted.route + "+" + _addressInserted.street_number + "+" + _addressInserted.locality + "+" + _addressInserted.postal_code + "&key=AIzaSyCimmihWSDJV09dkGVYeD60faKAebhYJXg");
        var _location;
        $.post(uri, function(data){
          if(data.status == "OK" && data.results.length > 0){
            _geocod = data.results[0].geometry.location;
            _displayMap(_geocod);
          }
          else{
            _errorBox.append($('<p>').text(Pard.t.text('widget.inputAddressSpace.warning')).css({
              'color':'red',
              'margin-bottom':'0'
            }));
            if (_latField && _lonField) {
              _latField.setVal('');
              _lonField.setVal('');
              _hereBtn.trigger('click');
            }          
          }
          _spinnerCheckLocation.stop();
          _addressInserted['location'] = _geocod;
          return _addressInserted;
        });
      }
      else{
        return _addressInserted;
      }
    }

    _placeForm.append(_mapCheckContainer);

    _inputPlace.on('focus', function(){
      if ($('.reveal[aria-hidden="false"]').html() && $(window).width()<1024){
        var _distanceInputTop = _inputPlace.offset().top;
        // var _scroolTop = $('.reveal[aria-hidden="false"]').scrollTop();
        var _popupOpened = _inputPlace.closest('.reveal[aria-hidden="false"]');
        var _scroolTop = _popupOpened.scrollTop();
        var _popupPositionTop = $('.reveal[aria-hidden="false"]').offset().top;
          var _distanceToDo = _distanceInputTop + _scroolTop -_popupPositionTop - 120;
        _popupOpened.scrollTop(_distanceToDo);
        // $('.reveal[aria-hidden="false"]').scrollTop(_distanceToDo);
      }
    });

    var _displayMap = function(location){
      _geocod = location;
      if (location){ 
        _map.addClass('map-inputAddressWidgets');
        _location = [{lat: _geocod.lat, lon: _geocod.lng, zoom:17}];
        if (_check && $('#gmapProfile').length){ 
          geomap = new Maplace({
            locations: _location,
            map_div: '#gmapProfile',
            map_options: {
              mapTypeControl: false
            }
          }).Load();
          var _latLabel = $('<label>').text(Pard.t.text('dictionary.latitude').capitalize()).append(_latField.render());
          var _lonLabel = $('<label>').text(Pard.t.text('dictionary.longitude').capitalize()).append(_lonField.render());
          var _geoCodText = $('<p>').append(Pard.t.text('widget.inputAddressSpace.insertGeo'), _hereBtn,'.')
          .css({
            'font-size':'0.875rem',
            'margin-top':'0.4rem'
          });
          _hereBtn.click(function(){
            _geocod = {lat: _latField.getVal(), lng: _lonField.getVal()};
            _location = [{lat: _geocod.lat, lon: _geocod.lng, zoom:17}];
            geomap.SetLocations(_location, true);
          });
          _geocodCont.append(_latLabel, _lonLabel, _geoCodText)
          _check = false;
        }
        _mapBox.css({
          'margin-top':'0.5rem'
        })
        _latField.setVal(_geocod.lat);
        _lonField.setVal(_geocod.lng); 
        if (geomap) geomap.SetLocations(_location, true);
      }
      else{
        _errorBox.append($('<p>').text(Pard.t.text('widget.inputAddressSpace.warning')).css({
          'color':'red',
          'margin-bottom':'0'
        }));
        if (_latField && _lonField) {
          _latField.setVal('');
          _lonField.setVal('');
          _hereBtn.trigger('click');
        }          
      }
    }

    return {
      render: function(){
        return _placeForm;
      },
      getVal: function(){
        var _addressSubmitted = addressValue();
        return _addressSubmitted;
      },
      setVal: function(_val){
        for(var field in _inputForm) {
          _inputForm[field].setAttr('disabled', false);
          _inputForm[field].setVal(_val[field]);
        }
        $('#gmapProfile').waitUntilExists(function(){
          _check = true; 
          _displayMap(_val.location);
        }, true)
        // setTimeout(function(){
        //   _check = true; 
        //   _displayMap(_val.location);
        // }, 1200)
        
      },
      addWarning: function(){
        addressValue();
      },
      getLocation: function(){
        return _geocod;
      }
    }
  }


  ns.Widgets.InputPersonalWeb = function(){

    var _createdWidget = $('<div>');    
    var _results = [];
    var _inputs = [];
    var _input = Pard.Widgets.Input(Pard.t.text('widget.inputWeb.placeholder'),'url',function(){
      _addInputButton.addClass('add-input-button-enlighted')
    });
    _input.setClass('add-multimedia-input-field');
    var _addInputButton = $('<span>').addClass('material-icons add-multimedia-input-button').html('&#xE86C');

    var _addnewInput = function(url){
      var _container = $('<div>');
      var _newInput = Pard.Widgets.Input(Pard.t.text('widget.inputWeb.placeholder'),'url');
      _newInput.setClass('add-multimedia-input-field');
      _newInput.setVal(url);
      _newInput.setAttr('disabled', true);
      _inputs.push(_newInput);

      var _removeInputButton = $('<span>').addClass('material-icons add-multimedia-input-button-delete').html('&#xE888');

      _container.append(_newInput.render().addClass('add-multimedia-input-field'), _removeInputButton);
      _removeInputButton.on('click', function(){
        _inputs.splice(_inputs.indexOf(_newInput), 1);
        _container.empty();
      });
      return _container;
    }

    var _websAddedContainer = $('<div>');

    _addInputButton.on('click', function(){
      $(this).removeClass('add-input-button-enlighted');
      if(_checkUrl(_input)){
        _websAddedContainer.prepend(_addnewInput(_input.getVal()));
        _input.setVal('');
      }
    });

    _createdWidget.append(_input.render().addClass('add-multimedia-input-field'), _addInputButton, _websAddedContainer);

    var fb_url = /.*facebook\..*/i;
    var ig_url = /.*instagram\..*/i;
    var pt_url = /^(http|https)\:\/\/.*\.pinterest\.com\/.*/i;
    var vn_url = /^(http|https)\:\/\/vine\..*/i;
    var sp_url = /^(http|https)\:\/\/open\.spotify\..*/i;
    var bc_url = /^(http|https)\:\/\/.*\.bandcamp\.com\/.*/i;
    var tw_url = /.*twitter\.com\/.*/i;
    var yt_url = /.*youtube\.*/i;
    var vm_url = /^(http|https)\:\/\/vimeo\.*/i;
    var fl_url = /.*flickr\.*/i;
    var sc_url = /^(http|https)\:\/\/soundcloud\.*/i;
    var ln_url = /.*linkedin\.com\/in\/*/i 

    var _checkUrl = function(input){
      input.removeWarning();
      var url = input.getVal();
      if(url == false) return false;

      if(url.match(fb_url)) return _composeResults(url, 'facebook');
      if(url.match(ig_url)) return _composeResults(url, 'instagram');
      if(url.match(pt_url)) return _composeResults(url, 'pinterest');
      if(url.match(vn_url)) return _composeResults(url, 'vine');
      if(url.match(sp_url)) return _composeResults(url, 'spotify');
      if(url.match(bc_url)) return _composeResults(url, 'bandcamp');
      if(url.match(tw_url)) return _composeResults(url, 'twitter');
      if(url.match(yt_url)) return _composeResults(url, 'youtube');
      if(url.match(vm_url)) return _composeResults(url, 'vimeo');
      if(url.match(fl_url)) return _composeResults(url, 'flickr');
      if(url.match(sc_url)) return _composeResults(url, 'soundcloud');
      if(url.match(ln_url)) return _composeResults(url, 'linkedin');
      return _composeResults(url, 'my_web');
    }

    var _composeResults = function(url, provider, type){
      if(!url.match(/^(http|https)\:\/\/.*/)) url = 'https://' + url;
      _results.push({url: url, provider: provider});
      return _results;
    }

    var _filled = function(){
      var _check = true;
      _results = [];
      _inputs.forEach(function(input){
        if(_checkUrl(input) == false) _check = false;
      });
      return _check;
    }

    return {
      render: function(){
        return _createdWidget;
      },
      filled: function(){
        return _filled();
      },
      getVal: function(){
        if(_filled() != false) return _results;
        return false;
      },
      setVal: function(values){
        if(values == null || values == false) return true;
        var _personal_webs = [];
        Object.keys(values).forEach(function(key){
          _personal_webs.push(values[key]);
        });
        _personal_webs.forEach(function(web, index){
          _websAddedContainer.prepend(_addnewInput(web.url));
        });
      }
    }
  }


  
  ns.Widgets.InputName = function(profile_id){

    var _createdWidget = $('<div>');
    var _input = $('<input>').attr({'type': 'text'});
    var _error = $('<div>').append($('<p>').text(Pard.t.text('widget.inputName.unavailable'))
        .css({
        'color':'red',
        'font-size':'12px',
        'line-height':'.9rem'
      }))
      .css({
        'margin-bottom':'-.8rem',
      })
      .hide();

    var request;

    _input.on('input', function(){
      if (request) request.abort();
      request = Pard.Backend.checkName(
        _input.val(),
        profile_id, 
        function(data){
          _input.removeClass('warning');
          _input.removeClass('available');
          _error.hide();
          if(data.available == false) {
            _input.addClass('warning');
            _error.show();
          };
          if(data.available == true) {
            _input.addClass('available');
            _error.hide();
          }
        }
      )
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

    _createdWidget.append(_input, _error);

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _input.val();
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
      },
      input: _input
    }
  }


  ns.Widgets.InputParticipantName = function(participants){

    var _createdWidget = $('<div>');
    var _input = $('<input>').attr({'type': 'text'});
    var _error = $('<div>').append($('<p>').text(Pard.t.text('widget.inputName.unavailable'))
        .css({
        'color':'red',
        'font-size':'12px',
        'line-height':'.9rem'
      }))
      .css({
        'margin-bottom':'-.8rem',
      })
      .hide();

    var _participant_id, _call_id, _program_id, request, _participants, existingName;

    _participants = participants;

    _input.on('input', function(){
      var _name = _input.val();
      _input.removeClass('warning');
      _input.removeClass('available');
      _error.hide();
      if(_participants){

        if($.inArray(_name, _participants) > -1) {
          _input.addClass('warning');
          _error.show();
          existingName = true;
        }
        else {
          _input.addClass('available');
          _error.hide();
          existingName = false;
        } 
      }
      else{
        if (request) request.abort();
        request = Pard.Backend.checkParticipantName(
          _name,
          _call_id, 
          _program_id,
          _participant_id, 
          function(data){
            console.log(data)
            _input.removeClass('warning');
            _input.removeClass('available');
            _error.hide();
            if(data.available == false) {
              _input.addClass('warning');
              _error.show();
               existingName = true;
            };
            if(data.available == true) {
              _input.addClass('available');
              _error.hide();
              existingName = false;
            }
          }
        )
      };
    })

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

    _createdWidget.append(_input, _error);

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var val = _input.val();
        if(existingName) val = '';
        return val;
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
      }, 
      setIds: function(call_id, program_id, participant_id){
        _call_id = call_id;
        _program_id = program_id
        _participant_id = participant_id;
      },
      setParticipants: function(participantsToSet){
        _participants = participantsToSet;
      }
    }
  }




}(Pard || {}));
