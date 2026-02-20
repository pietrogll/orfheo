'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.FormPrinter = function(form){
    
    var _submitForm = {};
    var _form = {};
    var _formContainer = $('<form>').addClass('popup-form');
   
    var spinner =  new Spinner();

    var _send = function(){};
    
    var _inputsParams = {
      allPhotos: [],
      done: 0,
      toBeSubmitted: [],
      toBeDone: 0,
      submittableInputs: []
    }

    for(var field in form){
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
      _form[field]['helptext'] = Pard.Widgets.HelpText(form[field].helptext);
      if (form[field].input == 'SummableInputs' || form[field].input == "LinkUploadPDF"){
        _inputsParams.submittableInputs.push(_form[field].input);
      }

      if (form[field].input == 'UploadPhotos' || 
        form[field].input == 'UploadPDF' 
        ){
        var _thumbnail = $('<div>');
        var _photosLabel = $('<label>').text(form[field].label);
        var _photoWidget = _form[field].input
        var _photos = _photoWidget.getPhotos();
        _inputsParams.allPhotos.push(_photos);
        var _photosContainer = _photoWidget.render().prepend(_photosLabel).css({'margin-bottom':'-1rem'}).addClass('photoContainer');
        if (form[field].helptext) _photosContainer.append(_form[field].helptext.render());
        _photos.cloudinary().bind('cloudinarydone', function(e, data){
          var _url = _photoWidget.getVal();
          _url.push(data['result']['public_id']);
          _inputsParams.done += 1;
          if(_url.length >= _photos.dataLength()){
              _photoWidget.resetPhotos();              
            if(_inputsParams.done == _inputsParams.toBeDone) {
              _send();
              _inputsParams.done = 0;
              _inputsParams.toBeDone = 0;
              _inputsParams.toBeSubmitted = [];
            }
          }
        });
      _formContainer.append(_photosContainer);
      }
      else if (form[field].input == 'TextAreaCounter'){
        _formContainer.append(
           $('<div>').addClass(form[field].input + '-FormField' + ' call-form-field '+field+'-FormDiv').append(
              _form[field].label.render(),_form[field].input.render()
            )
        );
      }
      else if (form[field].input == 'CheckBox'){
        var _genericField = $('<div>');
        _formContainer.append(
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
              allSelected: "Todas las opciones"
            });
          }
          _helpText.css('margin-top', 5);
        }
        _formContainer.append(
        _genericField.addClass(form[field].input + '-FormField' + ' call-form-field '+field+'-FormDiv').append(
          _form[field].label.render(),
          _form[field].input.render())
        )
        if (form[field]['helptext'] && form[field]['helptext'].length) _genericField.append(_helpText);
      }
    }


    return {
      render: function(){
        return _formContainer;
      },
      stopSpinner: function () {
        spinner.stop();
        submitButton.attr('disabled',false);
      },
      filled: function(){
        var _check = true;
        for(var field in _form){
          if(_form[field].type == 'mandatory' && !(_form[field].input.getVal())){
            _form[field].input.addWarning();
            _check = false;
          }
        } 
        return _check;
      },
      getVal: function(){
        for(var field in _form){
          if (form[field] && form[field].input == 'NoneInput') ;
          else _submitForm[field] = _form[field].input.getVal();
        }
        return _submitForm;
      },
      setVal: function(values){
        for(var field in values){
          if (_form[field]) _form[field].input.setVal(values[field]);
        }
      },
      setSend: function(send){
        _send = function(){
          send();
        };
      },
      getInputsParams: function(){
        return _inputsParams;
      },
      getForm: function(){
        return _form;
      },
      disable: function(){
        for(var field in _form){
          _form[field].input.disable();
        }
      }
    }
  }



  ns.Widgets.PrintForm = function(form, submitButton){
    var _submitForm = {};

    var _submitBtnContainer = $('<div>').addClass('submit-btn-container');

    var submitButton = submitButton || $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');

    var _closepopup = function(){};
    var _send = function(){};

    var spinner =  new Spinner();

    var _formWidget = Pard.Widgets.FormPrinter(form);

    _formWidget.setSend(function(){_send(_callbackSent)});

    var _formContainer = _formWidget.render();
    var _formParams = _formWidget.getInputsParams();

    var _invalidInput = $('<div>').addClass('not-filled-text');

    var _finalNoteContainer = $('<div>');

    var _callbackSent = function(){
      spinner.stop();
      submitButton.attr('disabled',false);
      _closepopup();
    }

    var _submitAndSend = function(){
      if(_formParams.allPhotos.length){
        _formParams.toBeSubmitted = _formParams.allPhotos.filter(function(photos){
          _formParams.toBeDone +=  photos.dataLength();
          return photos.dataLength()>0;
        })
        if(!_formParams.toBeDone) _send(_callbackSent);
        else  _formParams.toBeSubmitted.forEach(function(photos){
          photos.submit();
        });
      }
      else  _send(_callbackSent);
    }



    submitButton.on('click',function(){
      spinner.spin();
      $('body').append(spinner.el);
      submitButton.attr('disabled',true);
      if(_formWidget.filled() == true){
        if (_formParams.submittableInputs.length) {
          var _index = 0;
          var _submitInput = function(input){
            if(_index == _formParams.submittableInputs.length -1) input.setSend(_submitAndSend); 
            else {
              _index += 1;
              input.setSend(
                function(){_submitInput(_formParams.submittableInputs[_index])}
              ); 
            }
            input.submit();
          }
          _submitInput(_formParams.submittableInputs[_index]);
        }
        else _submitAndSend();      
      }
      else{
        _invalidInput.text(Pard.t.text('error.incomplete'));
        spinner.stop();
        submitButton.attr('disabled',false);
      }
    });

    
    _submitBtnContainer.append(submitButton);
    
    _formContainer.append(
      _finalNoteContainer,
      _invalidInput, 
      _submitBtnContainer
    );

    return {
      render: function(){
        return _formContainer;
      },
      stopSpinner: function () {
        spinner.stop();
        submitButton.attr('disabled',false);
      },
      setSend: function(send){
        _send = function(){
          send(_callbackSent);
        };
      },
      setCallback: function(callback){
        _closepopup = callback;
      },
      getVal: function(){
      return _formWidget.getVal();
      },
      setVal: function(values){
        _formWidget.setVal(values);
      },
      disable: function(){
        _formWidget.disable();
      },
      appendFinalNote: function($element){  
        _finalNoteContainer.append($element);
      },
      removeSubmitButton: function(){  
        _submitBtnContainer.remove();
      }
    }
  }



  ns.Widgets.PrintSpaceForm = function(submitButton){

    var _spaceForm = $.extend(true, {}, Pard.Forms.Space);
    var _ambientForm = $.extend(true, {}, Pard.Forms.Ambient);
    var _singleAmbientForm = $.extend(true, {}, Pard.Forms.Ambient);
    delete _singleAmbientForm.name;
    delete _singleAmbientForm.description;
    delete _singleAmbientForm.size;

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
      for(var field in form){
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
        _form[field]['helptext'] = Pard.Widgets.HelpText(form[field].helptext);

        if (field == 'photos' || field == 'plane_picture'){
          var _thumbnail = $('<div>');
          var _photosLabel = $('<label>').text(form[field].label);
          var _photoWidget = _form[field].input;
          var _photos = _photoWidget.getPhotos();
          _allPhotos.push(_photos);
          var _photosContainer = _photoWidget.render().prepend(_photosLabel).css({'margin-bottom':'-1rem'}).addClass('photoContainer');
          if (form[field].helptext) _photosContainer.append(_form[field].helptext.render());
          _photos.cloudinary().bind('cloudinarydone', function(e, data){
            var _url = _photoWidget.getVal();
            _url.push(data['result']['public_id']);
            _done += 1;
            if(_url.length >= _photos.dataLength()){
              _photoWidget.resetPhotos();              
              if(_done == _toBeDone) {
                _send(_callbackSent);
                _done = 0;
                _toBeDone = 0;
                _toBeSubmitted = [];
              }
            }
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
      }

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
        setVal: function(production){
          for(var field in production){
            if (_form[field]) _form[field].input.setVal(production[field]);
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
    var _addAmbientBtnContainer = $('<div>')
    var _addAmbientBtnInnerCont = $('<div>').addClass('addAmb-btnContainer');

    var _addAmbient = function(ambient){
      var _ambientFormContainer = $('<div>');
      var _ambientFormWidget = _printForm(_ambientForm);
      var _ambient_id = 'ambient-'+Date.now();
      if (ambient) {
        _ambientFormWidget.setVal(ambient);
        _ambient_id = ambient.id; 
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

      if (!_submitPart.html()) _submitPart.append(_invalidInput.empty(), _submitBtnContainer);
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
        _ambient_id = single_ambient.id;
      }
      _formsObj['ambients'][_ambient_id] = _singleAmbientFormWidget;
      _ambientsContainer.append(_ambientFormContainer.append(_singleAmbientFormWidget.render())).attr('id',_ambient_id);
      if (!_submitPart.html()) _submitPart.append(_invalidInput.empty(), _submitBtnContainer);
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
    _formContainer.append(_spaceFormWidget.render(), _question, _ambientsContainer, _addAmbientBtnContainer);

    var _filled = function(){
      var _check = (_formsObj['space'].filled() && Object.keys(_formsObj['ambients']).every(function(ambient_id){return _formsObj['ambients'][ambient_id].filled()}));
      if (_check) {
        if (Object.keys(_formsObj['ambients']).length == 0){
          _check = false;
          $('.addAmb-btn').addClass('warning');
          _invalidInput.text(Pard.t.text('error.incomplete'));
        }
      }
      return _check;
    }

    var _callbackSent = function(){
      spinner.stop();
      submitButton.attr('disabled',false);
      _closepopup();
    }

    submitButton.on('click',function(){
      spinner.spin();
      $('body').append(spinner.el);
      submitButton.attr('disabled',true);
      if(_filled() == true){
        if(_allPhotos.length){
          _toBeSubmitted = _allPhotos.filter(function(photos){
            _toBeDone +=  photos.dataLength();
            return photos.dataLength()>0;
          })
          if(!_toBeDone) _send(_callbackSent);
          else  _toBeSubmitted.forEach(function(photos){
            photos.submit();
          });
        }
        else  _send(_callbackSent);
      }
      else{
        spinner.stop();
        submitButton.attr('disabled',false);
      }
    });

    _submitBtnContainer.append(submitButton);    
    var _submitPart = $('<div>');
    _formContainer.append(_submitPart);

    return {
      render: function(){
        return _formContainer;
      },
      stopSpinner: function () {
        spinner.stop();
        submitButton.attr('disabled',false);
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
            _ambientValues.name = _submitForm.name;
            _ambientValues.description = _submitForm.description;
          }
          _submitForm['ambients'].push(_ambientValues);
        }
        return _submitForm;
      },
      setVal: function(space){
        _formsObj['space'].setVal(space);
        if (space.single_ambient == 'false'){
          space.ambients.forEach(function(ambient){
            _addAmbient(ambient)
          });
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
        if (!_submitPart.html()) _submitPart.append(_invalidInput, _submitBtnContainer);
      }
    }
  }

  
 

		

}(Pard || {}));