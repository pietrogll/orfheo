'use strict';

(function(ns){
  
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.CallForm = function(form, profile){

    var _submittableInputs = [];
    var _allPhotos = [];
    var _done = 0;
    var _toBeSubmitted = [];
    var _toBeDone = 0;
    var _form = {};
    var _submitForm = {};
    var _profile_item_id;

    var type = form.type;
    var form_id = form.form_id;

    var _formTexts = form.texts || {};

    var _createdWidget = $('<div>');
    var _formContainer = $('<form>').addClass('popup-form');

    var _txts = {
      'artist':{
        'part_one': _formTexts.part_one || Pard.t.text('call.form.partI'),
        'part_two': _formTexts.part_two || Pard.t.text('call.form.partII'),
        'final_text': _formTexts.final_text || ''
      },
      'space': {
        'part_one': _formTexts.part_one || Pard.t.text('call.form.initSpace'),
        'part_two': _formTexts.part_two || Pard.t.text('call.form.partII'),
        'final_text': _formTexts.final_text || ''
      }
    }
    
    var _message_1 = $('<div>')
      .append(
        $('<p>')
          .html(Pard.t.text('call.form.pI') +_txts[type]['part_one'])
          .addClass('m-artistCall')
      )
      .addClass('message-call'); 
    var _message_2 = $('<div>')
      .append(
        $('<p>')
          .html(Pard.t.text('call.form.pII') +_txts[type]['part_two'])
          .addClass('m-artistCall')
      )
      .addClass('message-call');
    var _finalMessage =  $('<div>')
      .append(
        _txts[type]['final_text'],
        $('<p>').html(Pard.t.text('call.form.finalMex'))
      )
      .css({'margin-top':'1rem','margin-bottom':'2rem'});

    var _invalidInput = $('<div>').addClass('not-filled-text');

    var _containerOrfheoFields = $('<div>');
    var _containerCustomFields = $('<div>');

    var _upperPart = $('<div>');
    var _bottomPart = $('<div>');

    if (form.texts && form.texts.helptext)
    _upperPart.append(
      $('<p>').append(form.texts.helptext)
        .css({
          'margin-bottom':'2rem'
        })
      )

    _upperPart.append( 
        _message_1)
      .css({
          'margin-top':'2rem'
        });

    if (form.widgets && form.widgets.check_name){ 
      var _checkName = Pard.Widgets.CheckNameField(form.widgets.check_name, profile);
      _upperPart.append(_checkName.render());
    }

    _bottomPart.append(_message_2.css('margin-top','3rem'));
   
    var _fieldsToOrder = {
        'subcategory': null, 
        'other_categories': null, 
        'other': null, 
        'availability':null, 
        'conditions':null
      };


    var _submitBtnContainer = $('<div>').addClass('submit-btn-container');
    var submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html(Pard.t.text('dictionary.send').capitalize());

    var _defaultMandatoryAdditionalField = {
      phone:{
        "type" : "mandatory",
        "label" : Pard.t.text('widget.InputTel.label'),
        "input" : "InputTel",
        "args" : [ 
            ""
        ],
        "helptext" : ""
      },
      email: {
        "type" : "mandatory",
        "label" : Pard.t.text('widget.InputEmail.label'),
        "input" : "InputEmail",
        "args" : [ 
            ""
        ],
        "helptext" : ""
      }
    }

    var _setDefaultAdditional = function(){
      for (var field in _defaultMandatoryAdditionalField){
        _tempForm[field] = $.extend(true,{},_defaultMandatoryAdditionalField[field]);
        if(form.blocks[field]){ 
          _tempForm[field]['label'] = form.blocks[field]['label'];
          _tempForm[field]['helptext'] = form.blocks[field]['helptext'];
        }
      }
    }

    var _tempForm = {};
    if(type == 'space'){
      _bottomPart.hide();
      var _spaceCallForm = Pard.Widgets.PrintSpaceCallForm(form.blocks['ambient_info'], _bottomPart);
      _submittableInputs.push(_spaceCallForm);
      _containerOrfheoFields.append(_spaceCallForm.render());
      Object.keys(form.blocks).forEach(function(field){
        if(field != 'ambient_info') _tempForm[field] = form.blocks[field];
      });
    }
    if(type == 'artist'){
      Object.keys(form.blocks).forEach(function(field){
        _tempForm[field] = form.blocks[field];
      });
    }

    _setDefaultAdditional();


    var _formFieldsInputs = Pard.Widgets.FormFields();

    var _defaultValues = {
      'category': null,
      'subcategory': null,
      'format': null,
      'children': null
    }

    Object.keys(_tempForm).forEach(function(field){
      _form[field] = {};
      _form[field]['type'] = _tempForm[field].type;
      if (_formFieldsInputs[_tempForm[field].input]){
        _form[field].input = _formFieldsInputs[_tempForm[field].input](_tempForm[field]);
      }
      else{
        _form[field]['label'] = Pard.Widgets.InputLabel(_tempForm[field].label);
        if(_form[field].type == 'mandatory') _form[field]['label'] = Pard.Widgets.InputLabel(_tempForm[field].label + ' *');
        var _args = [];
        $.each(_tempForm[field].args, function(k, v){_args[parseInt(k)]=v});
        _form[field].input = window['Pard']['Widgets'][_tempForm[field].input].apply(this, _args);
        _form[field]['helptext'] = Pard.Widgets.HelpText(_tempForm[field].helptext);
      }

      if ($.inArray(field, Object.keys(_defaultValues))>-1){
        if (field == 'category') {
          _form[field].input.setForm(_form);
        }    
        if(_tempForm[field].args && _tempForm[field].args['0'] && Object.keys(_tempForm[field].args['0']).length == 1){
          var argsValues = _tempForm[field]['args']['0'];
          if (!Array.isArray(argsValues)) argsValues = Object.keys(argsValues);
          _defaultValues[field] = argsValues[0];
          _form[field].input.setVal(_defaultValues[field]);
          return ;
        }
      }

      if (field == 'conditions'){
        var _linkToConditions = Pard.CachedEvent.conditions;
        if(form.blocks.conditions.args && form.blocks.conditions.args['0']) _linkToConditions = form.blocks.conditions.args['0'];
        _form[field].input.conditions(_linkToConditions);
      }

      var _appendFormField = function(formField){
        if ($.inArray(field, Object.keys(_fieldsToOrder))>-1){
          _fieldsToOrder[field] = formField;
        }
        else if($.isNumeric(field)) _containerCustomFields.append(formField);
        else _containerOrfheoFields.append(formField);
      }
                   
      if (_formFieldsInputs[_tempForm[field].input]){
        var _formField = _form[field].input.render();
        _appendFormField(_formField);
      }
      else{
        
        if (_tempForm[field].input == 'SummableInputs' || _tempForm[field].input == "LinkUploadPDF"){
          _submittableInputs.push(_form[field].input);
        }
        
        if (_tempForm[field].input == 'UploadPhotos' || _tempForm[field].input == 'UploadPDF') {
          var _thumbnail = $('<div>');
          var _labelText =  _tempForm[field].label;
          if (_tempForm[field].type == 'mandatory') _labelText += ' *';
          var _photosLabel = $('<label>').html(_labelText);
          var _photoWidget = _form[field].input;
          var _photos = _photoWidget.getPhotos();
          _allPhotos.push(_photos);
          var _photosContainer = _photoWidget.render().prepend(_photosLabel).addClass('photoContainer');
          if (_tempForm[field].helptext) {
            _photosContainer.append(_form[field].helptext.render().css('margin-top','0'));
          }
          else{
            _photosContainer.css({'margin-bottom':'-1rem'});
          }
          _photos.cloudinary().bind('cloudinarydone', function(e, data){
            var _url = _photoWidget.getVal();
            _url.push(data['result']['public_id']);
            _done += 1;
            if(_url.length >= _photos.dataLength() && _done == _toBeDone) _send();
          });
        if ($.isNumeric(field)) _containerCustomFields.append(_photosContainer);
        else  _containerOrfheoFields.append(_photosContainer);
        }
        else if ($.inArray(field, Object.keys(_defaultMandatoryAdditionalField))>-1){
          var _helpText = _form[field].helptext.render();
          if(profile && profile[field] && profile[field].value){
            if (field == 'email') _form[field].input.setVal(profile[field].value);
            else _form[field].input.setVal(profile[field]);
            _form[field].input.disable();
          }
          _helpText.append($('<span>').html(Pard.t.text('widget')[_defaultMandatoryAdditionalField[field].input]['helptext']+" " + "<strong>"+Pard.t.text('widget')[_defaultMandatoryAdditionalField[field].input]['modify']+"</strong>").css('display','block'));
          var _formField = $('<div>').addClass(_tempForm[field].input + '-FormField' + ' call-form-field').append(
            _form[field].label.render(),
            _form[field].input.render()
          )
          _formField.append(_helpText);
          _containerCustomFields.append(_formField);
        }
        else{
          var _helpText = _form[field].helptext.render();
          var _formField = $('<div>').addClass(_tempForm[field].input + '-FormField' + ' call-form-field').append(
            _form[field].label.render(),
            _form[field].input.render()
          )
          if (_tempForm[field]['helptext']) _formField.append(_helpText);
          _appendFormField(_formField);
        }
      }
    });
    
    _containerCustomFields.prepend(_fieldsToOrder['subcategory'], _fieldsToOrder['other_categories'], _fieldsToOrder['other']);
    _containerCustomFields.append(_fieldsToOrder['availability'], _fieldsToOrder['conditions']);
    if(_form['category'])
      _form['category']['input'].activate(_form);

    var _filled = function(){
      var _check = true;
      if (_spaceCallForm) _check = _spaceCallForm.filled();
      for(var field in _form){
        if(form['blocks'][field] && form['blocks'][field].input == 'UploadPhotos'){
          if(_form[field].type == 'mandatory' && _form[field].input.getVal() === null){
            _form[field].input.addWarning();
            _invalidInput.text(Pard.t.text('error.incomplete'));
            _check = false;
          }
          else {
            _form[field].input.removeWarning();
          }
        }
        else if (_form[field].type == 'mandatory' && Pard.Widgets.IsBlank(_form[field].input.getVal()) && field != 'category'){
          _form[field].input.addWarning();
          _invalidInput.text(Pard.t.text('error.incomplete'));
          _check = false;
        }
      }
      return _check;
    }
      

    var _getVal = function(){
      if (_spaceCallForm) _submitForm = _spaceCallForm.getVal();
      for(var field in _form){
        if (field == 'email'
          || (form['blocks'][field] && form['blocks'][field].input == 'NoneInput')
        ) ; 
        else _submitForm[field] = _form[field].input.getVal();
      };
      _submitForm['call_id'] = Pard.CachedEvent.call_id;
      _submitForm['event_id'] = Pard.CachedEvent.id;
      _submitForm['profile_id'] = profile.id;
      _submitForm['form_id'] = form_id;
      if (_profile_item_id && type == 'artist') _submitForm['production_id'] = _profile_item_id; 
      if (_profile_item_id && type == 'space') _submitForm['space_id'] = _profile_item_id;
      _submitForm['conditions'] = _submitForm['conditions'] || true; 
      return _submitForm;
    }

    var _backEndDictionary = {
      artist: Pard.Backend.sendArtistProposal,
      space: Pard.Backend.sendSpaceProposal 
    }

    var spinner = new Spinner();  
    var _closepopup = {};
    var _send = function(){
      var _submitForm = _getVal();
      _backEndDictionary[type](_submitForm, function(data){
        var callbackSendProposal = Pard.Widgets.CallbackSendProposal(_formTexts, data, _closepopup);     
        spinner.stop();
        submitButton.attr('disabled',false);
      })
    }

    var _submitAndSend = function(){
      if(_allPhotos.length){
        _toBeSubmitted = _allPhotos.filter(function(photos){
          _toBeDone +=  photos.dataLength();
          return photos.dataLength()>0;
        })
        if(!_toBeDone) _send();
        else  _toBeSubmitted.forEach(function(photos){
          photos.submit();
        });
      }
      else  _send();
    }


    submitButton.on('click',function(){
      spinner.spin();
      $('body').append(spinner.el);
      submitButton.attr('disabled',true);
      if(_filled() == true){
        if (_submittableInputs.length) {
          var _index = 0;
          var _submitInput = function(input){
            if(_index == _submittableInputs.length -1) input.setSend(_submitAndSend); 
            else {
              _index += 1;
              input.setSend(
                function(){_submitInput(_submittableInputs[_index])}
              ); 
            }
            input.submit();
          }
          _submitInput(_submittableInputs[_index]);
        }
        else _submitAndSend();      
      }
      else{
        spinner.stop();
        submitButton.attr('disabled',false);
      }
    });
    
    _submitBtnContainer.append(submitButton);

    _upperPart.append(_containerOrfheoFields);
    _bottomPart.append(
      _containerCustomFields, 
      _finalMessage, 
      _invalidInput, 
      _submitBtnContainer,
      $('<p>').text(Pard.t.text('call.form.dataPolicy')).css({
        'margin-top':'3rem',
        'font-size': '12px'
      })

    );

    _formContainer.append(_upperPart, _bottomPart);
    _createdWidget.append(_formContainer);

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closepopup = callback;
      },
      setVal: function(profileItem){
        profileItem = $.extend(true, {}, profileItem);
        Object.keys(_defaultValues).forEach(function(field){
          if (profileItem[field] && _tempForm[field]){
            _defaultValues[field] = profileItem[field];
            if (_tempForm[field]['args'] && _tempForm[field]['args']['0'] && Object.keys(_tempForm[field]['args']['0']).length == 1){
             var argsValues = _tempForm[field]['args']['0'];
             if (!Array.isArray(argsValues)) argsValues = Object.keys(argsValues);
             _defaultValues[field] = argsValues[0];
            }
            _form[field].input.setVal(_defaultValues[field]);
          }  
        })
        _profile_item_id = profileItem.id;
        if (_spaceCallForm) _spaceCallForm.setVal(profileItem);
        for(var field in profileItem){
          if (_form[field] && $.inArray(field, Object.keys(_defaultValues))<0) _form[field].input.setVal(profileItem[field]);
        }
      }
    }
    
  }




  ns.Widgets.PrintSpaceCallForm = function(additionalAmbientForm, bottomPart, disablePictures){

    var _spaceForm = $.extend(true, {}, Pard.Forms.SpaceCall);
    var _ambientForm = $.extend(true, {}, Pard.Forms.AmbientCall);
    var _singleAmbientForm = $.extend(true, {}, Pard.Forms.AmbientCall);
    delete _singleAmbientForm.name;
    delete _singleAmbientForm.description;
    delete _singleAmbientForm.size;

    if (additionalAmbientForm) for(var field in additionalAmbientForm) {
      _ambientForm[field] = additionalAmbientForm[field];
      _singleAmbientForm[field] = additionalAmbientForm[field];
    }


    var _formsObj = {
      space:'',
      ambients:{}
    }

    var _single_ambient_check;
    
    var _formContainer = $('<div>');
    var _submitBtnContainer = $('<div>').addClass('submit-btn-container');
    var _invalidInput = $('<div>').addClass('not-filled-text');

    var _closepopup = function(){};
    var _send = function(){};
    var spinner =  new Spinner();
    var _allPhotos = [];
    var _done = 0;
    var _toBeSubmitted = [];   
    var _toBeDone = 0;



    var _printForm = function(form){
      var _form = {};
      var _formContent = $('<form>').addClass('popup-form');
      var numericKey = [];
      var alphaKey = []
      var _formKeys = Object.keys(form).forEach(function(key){
        if ($.isNumeric(key)) numericKey.push(key)
        else alphaKey.push(key)
      });
      _formKeys = alphaKey.concat(numericKey)
      _formKeys.forEach(function(field){
        _form[field] = {};
        _form[field]['type'] = form[field].type;
        if(form[field]['type'] == 'mandatory') _form[field]['label'] = Pard.Widgets.InputLabel(form[field].label+' *');
        else _form[field]['label'] = Pard.Widgets.InputLabel(form[field].label);
        if (form[field]['input']=='CheckBox') {
          form[field].args[0] = form[field].label;
          if (form[field]['type'] == 'mandatory') form[field].args[0] += ' *';
        }
        var _args = [];
        $.each(form[field].args, function(k, v){_args[parseInt(k)]=v});
        _form[field]['input'] = window['Pard']['Widgets'][form[field].input].apply(this, _args);
        form[field]['helptext'] = form[field]['helptext'] || '';
        _form[field]['helptext'] = Pard.Widgets.HelpText(form[field].helptext); 


        if (form[field].input == 'UploadPDF' || form[field].input == 'UploadPhotos'){
          if (disablePictures) return null;
          var _thumbnail = $('<div>');
          var _photosLabel = $('<label>').html(form[field].label);
          var _photoWidget = _form[field].input;
          var _photos = _photoWidget.getPhotos();
          _allPhotos.push(_photos);
          var _photosContainer = _photoWidget.render().prepend(_photosLabel).css({'margin-bottom':'-1rem'}).addClass('photoContainer');
          if (form[field].helptext) _photosContainer.append(_form[field].helptext.render());
          _photos.cloudinary().bind('cloudinarydone', function(e, data){
            var _url = _photoWidget.getVal();
            _url.push(data['result']['public_id']);
            _done += 1;
            if(_url.length >= _photos.dataLength() && _done == _toBeDone) _send();
          });
        _formContent.append(_photosContainer);
        }
        else if (form[field].input == 'TextAreaCounter'){
          _formContent.append(
             $('<div>').addClass(form[field].input + '-FormField' + ' call-form-field '+field+'-FormDiv').append(
                _form[field].label.render(),_form[field].input.render()
              )
          );
        }
        else if (form[field].input == 'CheckBox'){
          var _genericField = $('<div>');
          _formContent.append(
             _genericField.addClass(form[field].input + '-FormField' + ' call-form-field '+field+'-FormDiv').append(_form[field].input.render()));
          if (form[field]['helptext'].length) {
            var _helptextfield = _form[field].helptext.render();
            _helptextfield.css({'margin-top':'0'});
            _genericField.append(_helptextfield);
          }
        }
        else{
          var _genericField = $('<div>');
          var _helpText = _form[field].helptext.render();
          if(form[field]['input'] == 'MultipleSelector' || form[field]['input'] == 'MultipleDaysSelector'){
            if (field == 'availability'){
              _form[field].input.setOptions({      
                placeholder: "Selecciona una o más opciones",
                selectAllText: "Selecciona todo",
                countSelected: false,
                allSelected: "Disponible todos los días"
              });
            }
            _helpText.css('margin-top', 5);
          }
          _formContent.append(
          _genericField.addClass(form[field].input + '-FormField' + ' call-form-field '+field+'-FormDiv').append(
            _form[field].label.render(),
            _form[field].input.render())
          )
          if (form[field]['helptext'].length) _genericField.append(_helpText);
        }
      })

      return {
        render: function(){
          return _formContent;
        },
        getVal: function(){
          var _submitForm = {};
          for(var field in _form){
             if (form[field] && form[field].input == 'NoneInput'); 
             else _submitForm[field] = _form[field].input.getVal();
          }
          return _submitForm;
          },
        setVal: function(values){
          for(var field in values){
            if (_form[field]) _form[field].input.setVal(values[field]);
          }
        },
        filled: function(){
          var _check = true;
          for(var field in _form){
            if(_form[field].type == 'mandatory' && !(_form[field].input.getVal())){
              _form[field].input.addWarning();
              _invalidInput.text(Pard.t.text('error.incomplete'));
              _check = false;
            }
          } 
          return _check;
        }
      }
    }

    var _ambientsContainer = $('<div>');
    var _addAmbientBtnContainer = $('<div>');
    var _addAmbientBtnInnerCont = $('<div>').addClass('addAmb-btnContainer')

    var _addAmbient = function(ambient){
      var _ambientFormContainer = $('<div>');
      var _ambientFormWidget = _printForm(_ambientForm);
      var _ambient_id = 'ambient-'+Date.now();
      if (ambient) {
        _ambientFormWidget.setVal(ambient);
      }
      _formsObj['ambients'][_ambient_id] = _ambientFormWidget;
      var _removeAmbientBtn = Pard.Widgets.Button(Pard.t.text('createProfile.spaceForm.removeAmb'), function(){_removeAmbient(_ambient_id)});
      _ambientsContainer
      .append(
        _ambientFormContainer
        .append(
          $('<div>').append(_removeAmbientBtn.render().addClass('removeAmb-btn')).css('position','relative'),
          _ambientFormWidget.render()
        )
        .attr('id',_ambient_id));
    }

    var _removeAmbient = function(ambient_id){
      $('#'+ambient_id).remove();
      delete _formsObj['ambients'][ambient_id];
      if($.isEmptyObject(_formsObj['ambients'])) {
        _invalidInput.detach();
        _submitBtnContainer.detach();
      }
    }

    var _addSingleAmbient = function(single_ambient){
      var _ambientFormContainer = $('<div>');
      var _singleAmbientFormWidget = _printForm(_singleAmbientForm);
      var _ambient_id = 'ambient-'+Date.now();
      if (single_ambient){
        _singleAmbientFormWidget.setVal(single_ambient);
      }
      _formsObj['ambients'][_ambient_id] = _singleAmbientFormWidget;
      _ambientsContainer.append(_ambientFormContainer.append(_singleAmbientFormWidget.render())).attr('id',_ambient_id);
    }

    var _ambientsRadioBtn =  $('<input>')
      .attr({
        type:"radio",
        name: "myradio", 
        value:true
      })
      .click(function(){
        delete _formsObj['ambients'];
        _formsObj['ambients'] = {};
        _ambientsContainer.empty(); 
        _addAmbient();
        var _addAmbientBtn = Pard.Widgets.Button(Pard.t.text('createProfile.spaceForm.addAmb'), function(){
          $(this).removeClass('warning');
          _addAmbient()
        }).render().addClass('addAmb-btn');
      _addAmbientBtnInnerCont.append(_addAmbientBtn);
        _addAmbientBtnContainer.append(_addAmbientBtnInnerCont);
        _single_ambient_check = 'false';
        bottomPart.show();
      });
    var _singleAmbientRadioBtn = $('<input>')
      .attr({
        type:"radio",
        name: "myradio", 
        value:false
      })
      .click(function(){
        delete _formsObj['ambients'];
        _formsObj['ambients'] = {};
        _ambientsContainer.empty();
        _addAmbientBtnContainer.empty();
        _addSingleAmbient();
        _single_ambient_check = 'true';
        bottomPart.show();
      });
    var _question = $('<div>')
      .append(
        $('<p>')
          .text(Pard.t.text('createProfile.spaceForm.question'))
          .css({
            'font-weight':'bold',
            'font-size':'14px',
            'margin-top':'2rem'
          }),
        _ambientsRadioBtn,
        $('<span>').text(Pard.t.text('createProfile.spaceForm.yes')).css('margin-left','.5rem'),
        _singleAmbientRadioBtn.css({'margin-left':'1.5rem'}),
        $('<span>').text(Pard.t.text('createProfile.spaceForm.no')).css('margin-left','.5rem')
      )

    var _spaceFormWidget = _printForm(_spaceForm);
    _formsObj['space'] = _spaceFormWidget;
    var _spaceFormContainer = $('<div>');
    _formContainer.append(
      _spaceFormContainer.append(_spaceFormWidget.render()),
       _question, 
       _ambientsContainer, 
       _addAmbientBtnContainer
    );

    var _filled = function(){
      var _check = (_formsObj['space'].filled() && Object.keys(_formsObj['ambients']).every(function(ambient_id){return _formsObj['ambients'][ambient_id].filled()}));
      if (_check){
        if (Object.keys(_formsObj['ambients']).length == 0){
          _check = false;
          $('.addAmb-btn').addClass('warning');
          _invalidInput.text(Pard.t.text('error.incomplete'));
        }
      }
      return _check;
    }

    var _submit = function(){
      $('body').append(spinner.el);
      if(_filled() == true){
        if(_allPhotos.length){
          _toBeSubmitted = _allPhotos.filter(function(photos){
            _toBeDone +=  photos.dataLength();
            return photos.dataLength()>0;
          })
          if(!_toBeDone) _send();
          else  _toBeSubmitted.forEach(function(photos){
            photos.submit();
          });
        }
        else  _send();
      }
    };

    return {
      render: function(){
        return _formContainer;
      },
      stopSpinner: function () {
        spinner.stop();
      },
      setSend: function(send){
        _send = send
      },
      setCallback: function(callback){
        _closepopup = callback;
      },
      getVal: function(){
        var _submitForm = {};
        _submitForm = _formsObj['space'].getVal();
        _submitForm['ambients'] = [];
        _submitForm['single_ambient'] = _single_ambient_check;
        for(var ambient_id in _formsObj['ambients']){
          var _ambientValues = _formsObj['ambients'][ambient_id].getVal();
          if (ambient_id.indexOf('ambient') < 0) _ambientValues['id'] = ambient_id;
          if (_single_ambient_check == 'true'){
            _ambientValues.name = _submitForm.space_name;
            _ambientValues.description = _submitForm.description;
          }
          _submitForm['ambients'].push(_ambientValues);
        }
        return _submitForm;
      },
      setVal: function(space){
        space['space_name'] = space['space_name'] || space['name'];
        _formsObj['space'].setVal(space);
        if (space.single_ambient == 'false'){
          for (var index in space.ambients){
            ambient = space.ambients[index];
            _addAmbient(ambient)
          };
          _ambientsRadioBtn.attr('checked','checked');
          var _addAmbientBtn = Pard.Widgets.Button(Pard.t.text('createProfile.spaceForm.addAmb'), function(){
            $(this).removeClass('warning');
            _addAmbient()
          }).render().addClass('addAmb-btn');  
          _addAmbientBtnInnerCont.append(_addAmbientBtn);
          _addAmbientBtnContainer.append(_addAmbientBtnInnerCont);
          _single_ambient_check = 'false';
        }
        else if (space.single_ambient == 'true'){
          _addSingleAmbient(space.ambients[0]);
          _singleAmbientRadioBtn.attr('checked','checked');
          _single_ambient_check = 'true';
        }
        bottomPart.show();
      },
      filled: function(){
        return _filled();
      },
      submit: function(){
        _submit();
      },
      own: function(){
        delete _singleAmbientForm['photos'];
        delete _singleAmbientForm['links'];
        delete _singleAmbientForm['description'];
        delete _singleAmbientForm['allowed_categories'];
        delete _singleAmbientForm['allowed_formats'];

        delete _ambientForm['photos'];
        delete _ambientForm['links'];
        delete _ambientForm['description'];
        delete _ambientForm['allowed_categories'];
        delete _ambientForm['allowed_formats'];

        delete _spaceForm['plane_picture'];
        delete _spaceForm['description'];
        _spaceFormWidget = _printForm(_spaceForm);
        _formsObj['space'] = _spaceFormWidget;
        _spaceFormContainer.empty().append(_spaceFormWidget.render())
      }
    }
  }
  
  


  ns.Widgets.ProposalForm = function(formObj, received){  

  // ==========================================================
  // It is used for OWN-PROPOSALS AND for MODIFYING proposals 
  //===========================================================

    var proposalType = formObj.type;
    var form_id = formObj.form_id;
    var form = formObj.blocks;

    var _rfhFields = ['name', 'email', 'phone', 'address', 'title', 'space_name', 'short_description', 'category', 'subcategory', 'other_categories', 'other', 'duration', 'availability', 'children', 'cache'];

    var _mandatoryFields = ['name', 'email', 'phone', 'address', 'title', 'space_name', 'short_description', 'category', 'subcategory', 'children', 'availability'];
    
    var _optionalFields = [];
    var _participantForm = $.extend(true,{}, Pard.Forms.Participant);
    var _bottomPart = $('<div>');
    if (proposalType == 'space') {
      _bottomPart.hide();      
      var _spaceCallForm = Pard.Widgets.PrintSpaceCallForm(form['ambient_info'], _bottomPart, 'disablePictures');
      if(!received) {
        _spaceCallForm.own();
        form['description'] = {
          'type':'optional',
          'label': Pard.t.text('manager.proposals.space_description'),
          'input':'TextAreaEnriched',
          'args':['',4],
          'helptext':""
        }
      }
    }
    var submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');

    var _note = $('<span>');
    _participantForm.phone.helptext = _note

    var _send = function(){};

    var _submitForm = {};
    var _form = {};
    var _url = [];
    var _formContainer = $('<form>').addClass('popup-form');
    var _submitBtnContainer = $('<div>').addClass('submit-btn-container');
    var _invalidInput = $('<div>').addClass('not-filled-text');

    var _closepopup = {};
    var spinner =  new Spinner();

    var _address, _proposalType;

    var _displayAllBtn = $('<a>').attr('href','#/').text(Pard.t.text('manager.proposals.showFields')).css('font-size','0.75rem');
    var _containerRfhFields = $('<div>');
    var _containerOptionalFields = $('<div>');
    _bottomPart.append(_containerOptionalFields);
    var _optionalFieldsDiv = $('<div>').hide();
    _containerOptionalFields.append(_displayAllBtn, _optionalFieldsDiv);
    _formContainer.append(_containerRfhFields, _bottomPart);

    _displayAllBtn.on('click', function(){
      _optionalFieldsDiv.show();
      _displayAllBtn.remove();
    });

    for (var field in _participantForm){
      form[field] = _participantForm[field];
    }

    var _formFieldsInputs = Pard.Widgets.FormFields();

    var _defaultValues = {
      'category': null,
      'subcategory': null,
      'format': null,
      'children': null
    }

    var _printField = function(field){
      _form[field] = {};
      _form[field]['type'] = form[field]['type'];

      if ($.inArray(field, Object.keys(_defaultValues))>-1){
         if(form[field].args){
          var argsValues = form[field].args[0];
          if (!Array.isArray(argsValues)) argsValues = Object.keys(form[field].args[0]); 
          if (argsValues.length == 1){ 
            _defaultValues[field] = argsValues[0];

            if (_formFieldsInputs[form[field].input]){
              _form[field].input = _formFieldsInputs[form[field].input](form[field]);
            }
            else{
              var _args = [];
              $.each(form[field].args, function(k, v){_args[parseInt(k)]=v});
              _form[field].input = window['Pard']['Widgets'][form[field].input].apply(this, _args);             
            }
          return ;
          }
        }
      }

      if (_formFieldsInputs[form[field].input])
        _form[field].input = _formFieldsInputs[form[field].input](form[field]);
      else{
        _form[field]['label'] = Pard.Widgets.InputLabel(form[field].label);
        if(form[field].type == 'mandatory') _form[field]['label'] = Pard.Widgets.InputLabel(form[field].label + ' *');
        var _args = [];
        $.each(form[field].args, function(k, v){_args[parseInt(k)]=v});
        _form[field].input = window['Pard']['Widgets'][form[field].input].apply(this, _args);
        _form[field]['helptext'] = Pard.Widgets.HelpText(form[field].helptext);
      }

      var _formField = $('<div>').addClass(form[field].input + '-FormField' + ' call-form-field');

      if(!received){
        if (field =='name'){
          if (proposalType == 'space'){
            _form['name'].input.setVal(Pard.CachedEvent['organizer']);
            _form['name'].label = Pard.Widgets.InputLabel(Pard.t.text('manager.proposals.responsible')+' *');
          }
          else{
            _form['name'].label = Pard.Widgets.InputLabel(Pard.t.text('manager.proposals.artistName')+' *');
          }
          _form['name'].input.setIds(Pard.CachedEvent['call_id'], Pard.CachedEvent['program_id']);
          var _participants_names = Object.keys(Pard.CachedEvent['artists']).map(function(artist_id){
            return Pard.CachedEvent['artists'][artist_id].name();
          })
          .concat( Object.keys(Pard.CachedEvent['spaces']).map(function(space_id){
              return Pard.CachedEvent['spaces'][space_id]['space']['name'];
            })
          );
          _form['name'].input.setParticipants(_participants_names);
        }
        if (field =='email' || field == 'phone'){
          _form[field].input.setVal(Pard.CachedEvent['organizer_'+field]);
        }
      }
      switch(field){
        case 'photos':
        case 'links':
        case 'conditions':
        case 'plane_picture': 
          break;
        default:
          if (form[field].input == 'UploadPDF' || form[field].input == 'UploadPhotos' || form[field].input == 'LinkUploadPDF'){}
          else{
            if (_formFieldsInputs[form[field].input])
              var _formField = _form[field].input.render();
            else{
              var _formField = $('<div>').addClass(form[field].input + '-FormField' + ' call-form-field');
              _formField.append( _form[field].label.render(), _form[field].input.render(), _form[field].helptext.render());
            }
            if($.isNumeric(field) || $.inArray(field, _optionalFields) > -1) _optionalFieldsDiv.append(_formField);
            else if ($.inArray(field, _rfhFields) < 0) _optionalFieldsDiv.prepend(_formField);
            else _containerRfhFields.append(_formField);
          }
      }
    } 

    _rfhFields.forEach(function(field){
      if ($.inArray(field,Object.keys(form))>-1) _printField(field);
    });

    Object.keys(form).forEach(function(field){
      if ($.inArray(field,_rfhFields)<0 && field != 'ambient_info')  _printField(field);
    });

    if(_form['category']) _form['category'].input.activate(_form);

    if (_spaceCallForm) _containerRfhFields.append(_spaceCallForm.render())

    var _filled = function(){
      var _check = true;
      if (_spaceCallForm) _check = _spaceCallForm.filled()
      var _values = _getVal();
      for(var field in _form){
        if (received){
          if ($.isNumeric(field) && _form[field].type == 'mandatory' && !_values[field]){
            _form[field].input.addWarning();
            _check = false;
          }
        }
        if($.inArray(field, _mandatoryFields)>-1 && !_values[field] && field != 'category'){
          _form[field].input.addWarning();
          _check = false;
        }
      }
      if (!_check) _invalidInput.text(Pard.t.text('error.incomplete'));
      return _check;
    }

    var _getVal = function(){
      if (_spaceCallForm) {
        _spaceVal = _spaceCallForm.getVal();
        for(var field in _spaceVal){
          _submitForm[field] = _spaceVal[field];
        }
      }      
      for(var field in _form){
        if(form[field] && form[field].input == 'NoneInput');
        else _submitForm[field] = _form[field].input.getVal();
      };
      if (_proposalType)  _submitForm['proposal_type'] = _proposalType;
      else _submitForm['proposal_type'] = proposalType;
      if (!(_submitForm['description']))_submitForm['description'] = '_';
      for (var field in _defaultValues){
        if (_defaultValues[field]) _submitForm[field] = _defaultValues[field];
      }
      _submitForm['form_id'] = form_id;
      if (_address && !_submitForm['address']) _submitForm['address'] = _address;
      return _submitForm;
    }


    submitButton.on('click',function(){
      spinner.spin();
      $('body').append(spinner.el);
      submitButton.attr('disabled',true);
      if(_filled() == true){
        _send();
      }
      else{
        spinner.stop();
        submitButton.attr('disabled',false);
      }
    });

    _submitBtnContainer.append(submitButton);
    _bottomPart.append(_invalidInput, _submitBtnContainer);

    return {
      render: function(){
        return _formContainer;
      },
      setSend: function(send){
        _send = function(){
          send(function(){
            spinner.stop();
            submitButton.attr('disabled',false);
          });
        }
      },
      setCallback: function(callback){
        _closepopup = callback;
      },
      getVal: function(){
        return _getVal();
      },
      setVal: function(proposal){
        if(proposal.proposal_type == 'space'){
          var _spaceProposal = $.extend(true,{},proposal);
          _spaceCallForm.setVal(_spaceProposal);
        }
        for(var field in proposal){
          if (_form[field]) _form[field].input.setVal(proposal[field]);
        }
        if (proposal.address && !form.address) _address = proposal.address;
        if (proposal.proposal_type) _proposalType = proposal.proposal_type;
        _form['name'].input.setIds(Pard.CachedEvent['call_id'],Pard.CachedEvent['program_id'], proposal['profile_id'].replace('-own',''))
        _submitForm['own'] = proposal['own'];
      },
      disableFields: function(own){
        _form['email'].input.disable();
        _form['name'].input.disable();
        _form['phone'].input.disable();
        if(!own ) _note.html(Pard.t.text('manager.proposals.modifyNote1')).css('font-weight','bold');
        else {
          _note.html(Pard.t.text('manager.proposals.modifyNote2')).css('font-weight','bold');
        }
       },
      enableFields: function(){
        _form['email'].input.enable();
        _form['name'].input.enable();
        _form['phone'].input.enable();
      },
      showAll: function(){
        _displayAllBtn.trigger('click');
      }
    }
  }


}(Pard || {}));
