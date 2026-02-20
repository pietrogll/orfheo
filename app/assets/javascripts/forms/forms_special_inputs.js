'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};


  ns.Widgets.FormsSpecialInputs = {
    'InputMultimedia' : [],
    'UploadPhotos': ['folder', 'maxNumPhotos_number', 'maxBytes_number - default 500000 (=500kb) ', 'acceptedFormats_array - default[jpe?g, png, gif]', 'minNumPhotos_number'],
    'UploadPDF': ['pdf_folder', 'maxNumPdf_number'],
    'InputEmail': ['placeholder'],
    'InputEmailChecked': [],
    'InputTel': ['placeholder', 'showTel'],
    'InputCommentedCache': ['placeholder'],
    'InputChildren': ['selectable_choices_obj'], // OBJECT ---> ARRAY
    'InputDate': ['optionsObj'], // Obj ?
    'InputTime': ['optionsObj', 'placeholder'], // Obj ?
    'InputStartEndTime': [],
    'MultipleSelector': ['values_obj', 'callback_function', 'dictionaryObj', 'optionsObj'], // OBJECT
    'MultipleGroupSelector': ['values_obj', 'callback_function', 'dictionaryObj', 'optionsObj'], // OBJECT
    'MultipleDaysSelector': ['millisecValues_array', 'callback_function'],
    'InputColor': [],
    'InputTagsSimple': ['placeholder'],
    'SortableList': ['dictionaryObj'],
    'SummableInputs': ['inputs_obj', 'addBtn_label', 'writeTrueToRemoveAddButton'], // OBJECT OF OBJECTS
    'SelectorOther': ['values_labels_obj', 'placeholder'], // OBJECT
    'LinkUploadPDF': ['folder'],
    'FormsInputs': ['inputs_obj']  // OBJECT OF OBJECTS
  }

  ns.Widgets.InputMultimedia = function(){

    var _createdWidget = $('<div>'); 
    var _results = [];
    var _inputs = [];
    var _input = Pard.Widgets.Input(Pard.t.text('widget.inputMultimedia.placeholder'),'url', function(){
      _addInputButton.addClass('add-input-button-enlighted');
      _invalidInput.empty();
    });
    _input.setClass('add-multimedia-input-field');
    var _addInputButton = $('<span>').addClass('material-icons add-multimedia-input-button').html('&#xE86C');

    var _addnewInput = function(url){
      var _container = $('<div>');
      var _newInput = Pard.Widgets.Input(Pard.t.text('widget.inputMultimedia.placeholder'),'url');
      _newInput.setClass('add-multimedia-input-field');
      _newInput.setVal(url);
      _newInput.setAttr('disabled', true);
      _inputs.push(_newInput);

      var _removeInputButton = $('<span>').addClass('material-icons add-multimedia-input-button-delete').html('&#xE888');

      _container.append(_newInput.render().addClass('add-multimedia-input-field'), _removeInputButton);
      _removeInputButton.on('click', function(){
        var _index = _inputs.indexOf(_newInput);
        _inputs.splice(_index, 1);
        _results.splice(_index, 1);
        _container.empty();
      });
      return _container;
    }
    
    var _websAddedContainer = $('<div>');

    _addInputButton.on('click', function(){
      $(this).removeClass('add-input-button-enlighted');
      _checkUrl(_input, function(){
        _websAddedContainer.prepend(_addnewInput(_input.getVal()));
        _input.setVal('');
      });
    });

    var _linksPermitted = Pard.Widgets.MultimediaAccepted().render();

    _linksPermitted.addClass('links-accepted-caller');

    var _linksPermittedContainer = $('<div>').addClass('links-accepted-container');
    _linksPermittedContainer.append(_linksPermitted); 

    var _invalidInput = $('<div>');

    _createdWidget.append(_linksPermittedContainer, _input.render(), _addInputButton, _invalidInput, _websAddedContainer);

    var fb_photos_url = /^(http|https)\:\/\/www\.facebook\.com\/photo.*/i;
    var fb_photos_2url = /^(http|https)\:\/\/www\.facebook\.com\/.*\/photos.*/i;
    var fb_posts_url = /^(http|https)\:\/\/www\.facebook\.com\/.*\/posts\/.*/i;
    var fb_videos_url = /^(http|https)\:\/\/www\.facebook\.com\/.*\/video.*/i;
    var fb_videos_2url = /^(http|https)\:\/\/www\.facebook\.com\/video.*/i;

    var ig_url = /^(http|https)\:\/\/www\.instagram\..*/i;
    var pt_url = /^(http|https)\:\/\/.*\.pinterest\.com\/pin\//i;
    var vn_url = /^(http|https)\:\/\/vine\..*/i;
    var sp_url = /^(http|https)\:\/\/open\.spotify\.com\/track\/.*/i;
    var sp_2url = /^(http|https)\:\/\/play\.spotify\.com\/track\/.*/i;
    var sp_3url = /^spotify:track:.*/i;
    var bc_url = /.*src=\"(http|https)\:\/\/bandcamp\.com\/EmbeddedPlayer\/.*/i;

    var tw_url = /^(http|https)\:\/\/twitter\.com\/.*/i;
    var yt_url = /^(http|https)\:\/\/www\.youtube\..*/i;
    var vm_url = /^(http|https)\:\/\/vimeo\..*/i;
    var fl_url = /^(http|https)\:\/\/www\.flickr\..*/i;
    var sc_url = /^(http|https)\:\/\/soundcloud\..*/i;

    var _checkUrl = function(input, callback){
      input.removeWarning();
      _invalidInput.empty();
      var url = input.getVal();

      var _composeResults = function(provider, type){
        if(provider == 'spotify'){
          var _id = url.split('track').pop().substring(1);
          url = 'https://open.spotify.com/track/' + _id;
        }
        _results.push({url: url, provider: provider, type: type});
        callback();
        return _results;
      }

      var _callProvider = function(provider, type){
        $.getJSON("https://noembed.com/embed?callback=?",
        {"format": "json", "url": url}, function (data) {
          if ('error' in data) input.addWarning();
          else{
            _composeResults(provider, type);
          }
        });
      }

      if(url.match(fb_photos_url) || url.match(fb_photos_2url)) return _composeResults('facebook', 'image');
      if(url.match(fb_posts_url)) return _composeResults('facebook', 'image');
      if(url.match(fb_videos_url) || url.match(fb_videos_2url)) return _composeResults('facebook', 'video');
      if(url.match(ig_url)) return _composeResults('instagram', 'image');
      if(url.match(pt_url)) return _composeResults('pinterest', 'image');
      if(url.match(vn_url)) return _composeResults('vine', 'video');
      if(url.match(sp_url) || url.match(sp_2url) || url.match(sp_3url)) return _composeResults('spotify', 'audio');
      if(url.match(bc_url)) return _composeResults('bandcamp', 'audio');
      if(url.match(tw_url)) return _callProvider('twitter', 'image');
      if(url.match(yt_url)) return _callProvider('youtube', 'video');
      if(url.match(vm_url)) return _callProvider('vimeo', 'video');
      if(url.match(fl_url)) return _callProvider('flickr', 'image');
      if(url.match(sc_url)) return _callProvider('soundcloud', 'audio');
      
      input.addWarning();
      _invalidInput.append($('<p>').text(Pard.t.text('widget.inputMultimedia.invalid')).addClass('error-multimedia-text'));
      return false;
    }

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _results;
      },
      setVal: function(values){
        if(values == null || values == false) return true;
        var _links = [];
        Object.keys(values).forEach(function(key){
          _links.push(values[key]);
        });
        _links.forEach(function(web, index){
          _results.push(web);
          _websAddedContainer.prepend(_addnewInput(web.url));
        });
      },
      addWarning: function(){
        _input.addWarning();
      },
      removeWarning: function(){
        _input.removeWarning();
      }
    }
  }





  ns.Widgets.UploadPhotos = function(folder, maxNumPhotos, maxMb, acceptedFormats, minNumPhotos){

    var _thumbnail = $('<div>');
    var _url = [];
    var _folder = folder;
    var _photos = Pard.Widgets.Cloudinary(folder, _thumbnail, _url, maxNumPhotos, maxMb, acceptedFormats);
    var _photosContainer = $('<div>').append(_photos.render(), _thumbnail);

    return{
      render: function(){
        return _photosContainer;
      },
      getVal: function(){
        if (!(_photos.dataLength() + _url.length)) return null;
        if (minNumPhotos && _photos.dataLength() + _url.length < minNumPhotos) return null;
        return _url;
      },
      setVal: function(photos){
        if (photos && Array.isArray(photos) && photos.length){
          photos.forEach(function(photo){
            _url.push(photo);
            var _container = $('<span>');
            var _previousPhoto = $.cloudinary.image(photo,
              { format: 'jpg', width: 50, height: 50,
                crop: 'thumb', gravity: 'face', effect: 'saturation:50' });
            _photosContainer.append(_previousPhoto);
            var _icon = $('<span>').addClass('material-icons').html('&#xE888').css({
              'position': 'relative',
              'bottom': '20px',
              'cursor': 'pointer'
            });

            _icon.on('click', function(){
              _url.splice(_url.indexOf(photo), 1);
              _photos.setUrl(_url);
              _container.empty();
            });

            _container.append(_previousPhoto, _icon);
            _thumbnail.append(_container);
          });
        }
      },
      getPhotos: function(){
        return _photos;
      },
      addWarning: function(){
        _photos.addWarning();
      },
      removeWarning: function(){
        _photos.removeWarning();
      },
      resetPhotos: function(){
        _photos.resetData();
      }
    }
  }


  ns.Widgets.UploadPDF = function(pdf_folder, maxAmount){

    var maxAmount = maxAmount || 1;
    var _thumbnail = $('<div>');
    var _url = [];
    pdf_folder = pdf_folder || '/photos';

    var cloudinaryPDF = function(){
      var _data = [];
      var _photo = $.cloudinary.unsigned_upload_tag(
        "kqtqeksl",
        {
          // cloud_name: 'hxgvncv7u',
          folder: pdf_folder
        }
      );

      _photo.fileupload({
        multiple: true,
        replaceFileInput: false,
        add: function(e, data) {
          var uploadErrors = [];
          var acceptFileTypes = /^(pdf)$/i;
          _photo.val(null);

          if (_data.length + _url.length >= maxAmount){
            Pard.Widgets.Alert('', Pard.t.text('widget.uploadPDF.max1'));
            uploadErrors.push('un archivo');
          }
          if(data.originalFiles[0]['type'].length && !data.originalFiles[0]['type'].endsWith('pdf')) {
            Pard.Widgets.Alert('', Pard.t.text('widget.uploadPDF.acceptedFormat'));
            uploadErrors.push('no accepted');
          }
          if(data.originalFiles[0]['size'] > 1000000) {
            Pard.Widgets.Alert('', Pard.t.text('widget.uploadPDF.tooBigError'));
            uploadErrors.push('tamaño max');
          }
          if(uploadErrors.length == 0){
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(data.originalFiles[0]); // read the local file

            _data.push(data);
            reader.onloadend = function(){ // set image data as background of div
              var _container = $('<div>').css({
                  position: 'relative'
                });
              var _img = $('<p>').addClass('pdfIcon');
              var _icon = $('<span>').addClass('material-icons').html('&#xE888').css({
                  position: 'absolute',
                  bottom: '40px',
                  left: '40px',
                  cursor: 'pointer'
              });

              _icon.on('click', function(){
                _data.splice(_data.indexOf(data), 1);
                _url.splice(_url.indexOf(data), 1);
                _container.empty();
              });

              _container.append(_img, _icon);
              _thumbnail.append(_container);
            }
          }
        }
      });

      var _fakeButton = $('<button>').addClass('browse-btn').attr({type:'button'}).append(
         Pard.Widgets.IconManager('upload').render().css({'vertical-align':'middle', 'font-size':'16px', 'margin-right':'.5rem'}),
        $('<span>').html( Pard.t.text('widget.uploadPDF.btn')).css('vertical-align','middle')
        );
      _fakeButton.on('click', function(){
        _photo.click();
      });

      return {
        render: function(){
          return _fakeButton;
        },
        cloudinary: function(){
          return _photo;
        },
        setUrl: function(url){
          _url = url;
        },
        submit: function(){
          _data.forEach(function(photo){
            photo.submit();
          });
        },
        dataLength: function(){
          return _data.length;
        },
        addWarning: function(){
          _fakeButton.addClass('warningBold');
        },
        removeWarning: function(){
          _fakeButton.removeClass('warningBold');
        },
        resetData: function(){
          _data = [];
        }
      }
    }

    var _photos = cloudinaryPDF();
    var _photosContainer = $('<div>').append(_photos.render(), _thumbnail);

    return{
       render: function(){
        return _photosContainer;
      },
      // checkVal: function(){
      //   return _photos.dataLength() + _url.length;
      // },
      getVal: function(){
        if(!(_photos.dataLength() + _url.length)) return false;
        return _url;
      },
      setVal: function(photos){
        if (photos && photos != null){
          photos.forEach(function(photo){
            _url.push(photo);
            var _container = $('<span>');
            var _previousPhoto = $.cloudinary.image(photo,
              { format: 'jpg', width: 50, height: 50,
                crop: 'thumb', gravity: 'face', effect: 'saturation:50' });
            _photosContainer.append(_previousPhoto);
            var _icon = $('<span>').addClass('material-icons').html('&#xE888').css({
              'position': 'relative',
              'bottom': '20px',
              'cursor': 'pointer'
            });

            _icon.on('click', function(){
              _url.splice(_url.indexOf(photo), 1);
              _photos.setUrl(_url);
              _container.empty();
            });

            _container.append(_previousPhoto, _icon);
            _thumbnail.append(_container);
          });
        }
      },
      getPhotos: function(){
        return _photos;
      },
      addWarning: function(){
        _photos.addWarning();
      },
      removeWarning: function(){
        _photos.removeWarning();
      },
      resetPhotos: function(){
        _photos.resetData();
      }
    }
  }


  ns.Widgets.InputEmail = function(placeholder){

    var _checkInput = function(){
      if(_input.getVal() && !regEx.test(_input.getVal())){
        _input.addWarning();
        return false;
      }
      else{
        _input.removeWarning();
        return _input.getVal();
      }  
    }
    var _removeWarning = function(){
      _input.removeWarning();
    }

    var regEx = /[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]/i;

    var _input = Pard.Widgets.Input(placeholder, 'text', _removeWarning,_checkInput);
    
    return{
      render: function(){
        return _input.render();
      },
      getVal: function(){
        return _checkInput();
      },
      setVal: function(value){
        _input.setVal(value);
      },
      addWarning: function(){
        _input.addWarning();
      },
      removeWarning: function(){
        _input.removeWarning();
      },
      disable: function(){
        _input.disable();
      },
      enable: function(){
        _input.enable();
      }
    }
  
  }


  ns.Widgets.InputEmailChecked = function(){
    var _input = $('<div>');
    var _inputEmail = Pard.Widgets.InputEmail();
    var _showEmail = Pard.Widgets.CheckBox(Pard.t.text('widget.InputTel.show')); 

    return{
      render: function(){
        _input.append(
           _inputEmail.render().addClass('InputPhone-InputTel'),
          _showEmail.render().addClass('InputPhone-showTel')
        );
        return _input;
      },
      getVal: function(){
        return _inputEmail.getVal() ? { value: _inputEmail.getVal(), visible: _showEmail.getVal()} : false
      },
      setVal: function(email){
        if(email){
          _inputEmail.setVal(email.value);
          _showEmail.setVal(email.visible);
        }
      },
      addWarning: function(){
        _inputEmail.addWarning();
      },
      removeWarning: function(){
        _inputEmail.removeWarning();
      }
    }

  }


 
  ns.Widgets.InputTel = function(placeholder, showTel){

    var _phoneInput = $('<div>');

    var checkPhone = function(){
      var okPattern = new RegExp (/\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*/);
      if(_inputTel.getVal()){
        var tel = _inputTel.getVal()
        tel = tel.replace(/\.|\-|\,|[a-zA-Z]+/g, "");
        var notPattern = new RegExp (/[a-z]/);
          if ((notPattern.test(tel)) || !(okPattern.test(tel))) {
            _inputTel.addWarning(); 
            return ''
          }
        return {value: tel, visible: 'false' };
      }
      return '';
    }

    var _inputTel = Pard.Widgets.Input(placeholder, 'tel', function(){_inputTel.removeWarning()}, checkPhone);
    var _showTel = Pard.Widgets.CheckBox(Pard.t.text('widget.InputTel.show')) 


    return{
      render: function(){
        var _inputTelRendered = _inputTel.render();
        _inputTelRendered.on('input', function(){
          tel = _inputTel.getVal().replace(/\.|\-|\,|[a-zA-Z]+/g, "")
          _inputTel.setVal(tel)
        })
        _phoneInput.append(
          _inputTelRendered
        );

        if (showTel === true){
          _phoneInput.append(_showTel.render().addClass('InputPhone-showTel'));
          _inputTelRendered.addClass('InputPhone-InputTel')
        }  
        return _phoneInput;
      },
      getVal: function(){
        if(!showTel){
          if(checkPhone()) {
            return { value: _inputTel.getVal(), visible: 'false'};
          }
          else {
            return false;
          }
        }
        else {
          return { value: _inputTel.getVal(), visible: _showTel.getVal()}
        }
      },
      setVal: function(phone){
        if(phone){
          _inputTel.setVal(phone.value);
          _showTel.setVal(phone.visible);
        }
        else{
          _inputTel.setVal('');
        }
      },
      addWarning: function(){
        _inputTel.addWarning();
      },
      removeWarning: function(){
        _inputTel.removeWarning();
      },
      setClass: function(_class){
        _inputTel.setClass(_class);
      },
      disable: function(){
        _inputTel.disable();
      },
      enable: function(){
        _inputTel.enable();
      }
    }
  }

  ns.Widgets.InputCommentedCache = function(placeholder){

    var _cacheInput = $('<div>');
    var _inputCache = Pard.Widgets.InputNumber(placeholder, "€", function(){_inputCache.removeWarning()});
    var _showCache = Pard.Widgets.CheckBox(Pard.t.text('widget.inputCache.show'));
    var _inputComment = Pard.Widgets.Input(Pard.t.text('proposal.form.cacheComment'),'text');


    return{
      render: function(){
        _cacheInput.append(
          _inputCache.render().addClass('InputCache-InputCache'),
          _inputComment.render().css('margin-top','.1rem'),
          _showCache.render().addClass('InputCache-showCache'));
        return _cacheInput;
      },
      getVal: function(){
          return { value: _inputCache.getVal(), visible: _showCache.getVal(), comment: _inputComment.getVal()};
      },
      setVal: function(cache){
        if (cache){
          _inputCache.setVal(cache.value);
          _showCache.setVal(cache.visible);
          _inputComment.setVal(cache.comment);
        }
      },
      addWarning: function(){
        _inputCache.addWarning();
      },
      removeWarning: function(){
        _inputCache.removeWarning();
      },
      setClass: function(_class){
        _inputCache.setClass(_class);
      }
    }
  } 

   
  ns.Widgets.InputCache = function(placeholder, showCache){

    var _cacheInput = $('<div>');

    var _inputCache = Pard.Widgets.Input(placeholder, 'text', function(){_inputCache.removeWarning()});
    var _showCache = Pard.Widgets.CheckBox(Pard.t.text('widget.inputCache.show'));


    return{
      render: function(){
        _cacheInput.append(
          _inputCache.render().addClass('InputCache-InputCache')
        );
        if (showCache == true) _cacheInput.append(_showCache.render().addClass('InputCache-showCache'));
        return _cacheInput;
      },
      getVal: function(){
        if (showCache == true) {
          return { value: _inputCache.getVal(), visible: _showCache.getVal()}
        }
        else{
          return {value: _inputCache.getVal(), visible: 'false'}
        }
      },
      setVal: function(cache){
        if (cache){
          _inputCache.setVal(cache.value);
          _showCache.setVal(cache.visible);
        }
      },
      addWarning: function(){
        _inputCache.addWarning();
      },
      removeWarning: function(){
        _inputCache.removeWarning();
      },
      setClass: function(_class){
        _inputCache.setClass(_class);
      }
    }
  } 



  ns.Widgets.InputChildren = function(selectable_choices_obj){


    var _values = [ 
      'all_public', 
      'baby', 
      'family', 
      'young', 
      'adults'
    ] ;

    if (selectable_choices_obj) _values = Array.isArray(selectable_choices_obj) ? selectable_choices_obj : Object.keys(selectable_choices_obj);

    obj_values_labes = {}
    _values.forEach(function(val){
      obj_values_labes[val] = Pard.t.text('widget.inputChildren.'+val)
    })

    var _createdWidget = Pard.Widgets.Selector(obj_values_labes);

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



  ns.Widgets.InputDate = function(options){
 	  
    var _options = {
      dateFormat: "dd/mm/yy"
    };
    var _createdWidget = $('<div>');
  	var _datePicker = $('<input>').attr('type','text');
    _createdWidget.append(_datePicker);
    if(options) for (var k in options){
      _options[k] = options[k]
    };
  	_datePicker.datepicker(_options);
   
 
	 return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){ // return millisec
        var _dateInserted = _datePicker.datepicker('getDate');
        if (_dateInserted) return _dateInserted.getTime();
        return null;
      },
      setVal: function(date){
        if (date && typeof date.getMonth != 'function') date = new Date(parseInt(date))
        _datePicker.datepicker( "setDate", date);
      },
      addWarning: function(){
        _datePicker.addClass('warning');
      },
      removeWarning: function(){
        _datePicker.removeClass('warning');
      },
      setClass: function(_class){
        _datePicker.addClass(_class);
      }
    }
  }


  ns.Widgets.InputTime = function(options, placeholder){
    
    var _options = {
      minuteText: 'Min'
    };
    if(options) for (var k in options){
      _options[k] = options[k]
    };
    var _createdWidget = $('<div>');
    var _timePicker = $('<input>')
      .attr({
        'type':'text',
        'placeholder': placeholder
      });
    _createdWidget.append(_timePicker);
    _timePicker.timepicker(_options);
   
 
   return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var _timeInserted = _timePicker.timepicker('getTimeAsDate');
        // 'getTimeAsDate'
        if (_timeInserted) return _timeInserted;
        return false;
      },
      setVal: function(time){
        if (time) _timePicker.timepicker( "setTime", time);
      },
      addWarning: function(){
        _timePicker.addClass('warning');
      },
      removeWarning: function(){
        _timePicker.removeClass('warning');
      },
      setClass: function(_class){
        _timePicker.addClass(_class);
      }
    }
  }


  ns.Widgets.InputStartEndTime = function(){
    var _createdWidget = $('<div>');

    var startTime = $('<input>');

    var endTime = $('<input>');

    _createdWidget.append(startTime, endTime);

    startTime.timepicker({
       showLeadingZero: false,
       onSelect: tpStartSelect
   });

   endTime.timepicker({
       showLeadingZero: false,
       onSelect: tpEndSelect
   });

     // when start time change, update minimum for end timepicker
    function tpStartSelect( time, endTimePickerInst ) {
       endTime.timepicker('option', {
           minTime: {
               hour: endTimePickerInst.hours,
               minute: endTimePickerInst.minutes
           }
       });
    }

    // when end time change, update maximum for start timepicker
    function tpEndSelect( time, startTimePickerInst ) {
       startTime.timepicker('option', {
           maxTime: {
               hour: startTimePickerInst.hours,
               minute: startTimePickerInst.minutes
           }
       });
    }

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return {
          start: startTime.timepicker('getTime'),
          end: endTime.timepicker('getTime')
        }
      }
    }
  }


  ns.Widgets.MultipleSelector = function(values, callback, dictionary, optionsObj){

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
    if (callback) _options['onClick'] = function(){
      var boundCallback = callback.bind(_select);
      boundCallback();
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
        return _select.val();
      },
      setVal: function(valuesToSet){
        if(valuesToSet && Object.keys(values).length > 1){
          _select.multipleSelect('setSelects', valuesToSet);
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


  ns.Widgets.MultipleGroupSelector = function(valuesObj, callback, dictionary, optionsObj){
    var _createdWidget = $('<div>');
    var _select = $('<select>').attr("multiple", "multiple");
    for(var group in valuesObj){
      var _optgroup = $('<optgroup>');
      valuesObj[group].forEach(function(value, index){
        var _option = $('<option>').val(value);
        if (dictionary) value = dictionary[value] 
        _option.text(value.capitalize())
        _optgroup.append(_option);
      });
      dictionary ?  _optgroup.attr('label',dictionary[group].capitalize()) : _optgroup.attr('label', group.capitalize());
      _select.append(_optgroup);
    }
    _createdWidget.append(_select);
    _select.on('change',function(){
        _select.next().find('.ms-choice').removeClass('warning');
      if(callback) {
        var boundCallback = callback.bind(_select);
        boundCallback();
      };
    });
    var _options = {      
      placeholder: Pard.t.text('widget.multipleSelector.placeholder'),
      selectAll: false,
      countSelected: false,
      allSelected: false
    };

    if (optionsObj) for(var field in optionsObj){_options[field] = optionsObj[field]};

    _select.multipleSelect(_options);
    
    return {
      render: function(){
        return _createdWidget;
      },
      setOptions: function(options){
        _options = options;
      },
      getVal: function(){
        return _select.val();
      },
      setVal: function(values){
        if(values && values.length > 0){
          _select.multipleSelect('setSelects', values);
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
        _select.attr('disabled',false);
      },
      disable: function(){
        _select.attr('disabled',true);
      }
    }
  }


  ns.Widgets.MultipleDaysSelector = function(millisecValues, callback){
    var _createdWidget;
    var _select = $('<select>').attr("multiple", "multiple");
    var _arrayDays = [];
    // If one can choose just one day or the event organizer does not allow participants to choose, orfheo does not ask for availability. In the second case, millisecValues[0] must be the Array of the default days. 
    if (millisecValues.length>1){
      _createdWidget = $('<div>');
      millisecValues.forEach(function(value){
        var _newDate = new Date(parseInt(value));
        var _day = moment(_newDate).locale(Pard.Options.language()).format('dddd DD/MM/YYYY');
        _select.append($('<option>').text(_day).val(value));
        _arrayDays.push(moment(_newDate).locale(Pard.Options.language()).format('YYYY-MM-DD'));
      });
      _createdWidget.append(_select);
      _select.on('change',function(){
          _select.next().find('.ms-choice').removeClass('warning');
        if(callback) {
          var boundCallback = callback.bind(_select);
          boundCallback();
        };
      });
    }
    var _options={};
    return {
      render: function(){
        _select.multipleSelect(_options);
        return _createdWidget;
      },
      setOptions: function(options){
        _options = options;
      },
      getVal: function(){
        // if ($.isArray(millisecValues[0])) return millisecValues[0].map(function(day){return moment(new Date(parseInt(day))).locale(Pard.Options.language()).format('YYYY-MM-DD')});  
        if (millisecValues.length == 1){ 
          return millisecValues.map(function(day){return moment(new Date(parseInt(day))).locale(Pard.Options.language()).format('YYYY-MM-DD')});
        }
        else if(_select.val()) {
          var _daysArray = [];
          _select.val().forEach(function(val){
            _daysArray.push(moment(new Date(parseInt(val))).locale(Pard.Options.language()).format('YYYY-MM-DD'));
          });
          return _daysArray;
        }
        return '';
      },
      setVal: function(values){
        var _values = [];
        values.forEach(function(value){
          var _index = _arrayDays.indexOf(value);
          if (_index>-1) _values.push(millisecValues[_index]);
        });
        _select.multipleSelect("setSelects", _values);
      },
      addWarning: function(){
        _select.next().find('.ms-choice').addClass('warning');
      },
      removeWarning: function(){
        _select.next().find('.ms-choice').removeClass('warning');
      },
      setClass: function(_class){
        _select.addClass(_class);
      },
      enable: function(){
        _select.attr('disabled',false);
      },
      disable: function(){
        _select.attr('disabled',true);
      }
    }
  }


  ns.Widgets.InputColor = function(){

    var _createdWidget = $('<div>');

    var _colorPicker = $('<input>').attr({'type': 'text', 'value': '#000000'});

    _createdWidget.append(_colorPicker);

    _colorPicker.spectrum({
      chooseText: "OK",
      cancelText: "cancel",
      preferredFormat: "hex",
      showInput: true,
      move: function(color){
        _colorPicker.val(color);
      }
    });

   return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _colorPicker.spectrum('get').toHexString(); 
      },
      setVal: function(colorPicked){
        _colorPicker.spectrum("set",colorPicked);
      },
      addWarning: function(){
        _colorPicker.addClass('warning');
      },
      removeWarning: function(){
        _colorPicker.removeClass('warning');
      },
      setClass: function(_class){
        _colorPicker.addClass(_class);
      }
    }
  }




  ns.Widgets.InputTagsSimple = function(placeholder){

    var _inputTags = $('<div>').addClass('tagsInput-div');
    var _select = $('<select>').appendTo(_inputTags);
    var _placeHolder = '';
    if (placeholder) _placeHolder = placeholder;
    var optionsList = [];
    _select
      .select2({
        tags: true,
        multiple: true,
        placeholder: _placeHolder,
        dropdownCssClass: 'tags-select2',
        minimumInputLength: 1,
        tokenSeparators: [',', ' ']
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
        _inputTags.addWarning();
      },
      removeWarning: function(){
        _inputTags.removeWarning();
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

  
  ns.Widgets.SortableList = function(dictionary){
    var _createdWidget = $('<div>');
    var _listSortable = $('<ul>').addClass('sortable-list');
    _createdWidget.append(_listSortable);
    _listSortable.sortable({
      cursor: "move",
      cancel: 'ui-state-disabled'
    });

    var _addListItem = function(item, disabled){
      var _item = $('<li>')
        .attr('id',item)
        .addClass('ui-state-default cursor_grab')
        .mousedown(function(){
          _item.removeClass('cursor_grab').addClass('cursor_move');
        })
        .mouseup(function(){
          _item.removeClass('cursor_move').addClass('cursor_grab');
        })
        .appendTo(_listSortable);
      if (disabled) _item.addClass('ui-state-disabled');
      (dictionary && dictionary[item]) ? _item.append(dictionary[item]) : _item.append(item)
    }

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        return _listSortable.sortable('toArray');
      },
      addWarning: function(){
        _createdWidget.addWarning();
      },
      removeWarning: function(){
        _createdWidget.removeWarning();
      },
      setVal: function(list, disabledItems){
        var disabledItems = disabledItems || [];
        list.forEach(function(item){
          var disabled =  $.inArray(item, disabledItems)>-1;
          _addListItem(item, disabled)
        })        
      },
      disable:function(){
        _listSortable.disableSelection();
      }
    }
  }



  ns.Widgets.SummableInputs = function(inputs, addBtn_label, notSummable){

    var _createdWidget = $('<div>');
    var _fieldsCont = $('<div>');
    var _addBnt = $('<button>')
      .attr({
        'type':'button'
      })
      .append(Pard.Widgets.IconManager('add_circle').render().css({'vertical-align':'middle'}))
      .click(function(){_addFields()});
    if(addBtn_label) _addBnt.prepend(
      $('<span>').html(addBtn_label)
        .css({
          'vertical-align':'middle', 
          'margin-right':'.5rem',
          'font-size': '14px'
        })
      );
    var _addBntCont = $('<div>').append(_addBnt).addClass('add-btn-container-summableInput');
    _createdWidget.append(_fieldsCont)
    if (!notSummable) _createdWidget.append(_addBntCont);

    var _allPhotos = [];

    var _done = 0;
    var _toBeDone = 0;
    var _toBeSubmitted = [];
    var _send = function(){};

    var _inputsObj = {};
    var _index = 0;
    var _removeEl = function(el){
      _inputsObj[el]['container'].remove();
      delete _inputsObj[el];
    }
    var _addFields = function(val){
      _index += 1;
      var _el = 'el_'+_index;
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
      if (!notSummable) {
        _btnCont.append(_removeBtn);
        _inputsCont.css('margin-bottom',0);
      }
      _inputsObj[_el]['container'] = $('<div>').addClass('inputsCont-summableInput');
      for (var field in inputs){
        var _innerInputsCont = $('<div>');
        _inputsCont.append(_innerInputsCont);

        if(inputs[field]['label']){ 
          var _labelText =  inputs[field].label;
          if (inputs[field].type == 'mandatory') _labelText += ' *';
          _innerInputsCont.append(
            $('<label>')
              .text(_labelText)
              .css({
                'margin-top':'.5rem',
                'color': '#6f6f6f'
              })
          );
        }

        var _args = [];
        $.each(inputs[field].args, function(k, v){_args[parseInt(k)]=v});
        var _fieldInput = window['Pard']['Widgets'][inputs[field].input].apply(this, _args);
          _inputsObj[_el][field] = _fieldInput;
        if (val) _fieldInput.setVal(val[field]);

        if (inputs[field].input == 'UploadPhotos' || inputs[field].input == 'UploadPDF') {
          var _photoWidget = _fieldInput;
          var _photos = _photoWidget.getPhotos();
          _allPhotos.push(_photos);
          var _photosContainer = _photoWidget.render().addClass('photoContainer');
          _photos.cloudinary().bind('cloudinarydone', function(e, data){
            var _url = _photoWidget.getVal();
            _url.push(data['result']['public_id']);
            _done += 1;
            if(_url.length >= _photos.dataLength()){
              _photoWidget.resetPhotos();              
              if(_done == _toBeDone) {
                _send();
                _done = 0;
                _toBeDone = 0;
                _toBeSubmitted = [];
              }
            }
          });
          _innerInputsCont.append(_photosContainer);
        }
        else{
          var renderedInput = _fieldInput.render();
          _innerInputsCont.append(renderedInput);
        }
        if (inputs[field].class) _innerInputsCont.addClass(inputs[field].class);
      }
      _fieldsCont
        .append(_inputsObj[_el]['container']
          .append(_inputsCont, _btnCont)
        );
    }

    _createdWidget.click(function(){
      removeWarning();
    });

    if ($.isEmptyObject(_inputsObj)){
     _addFields();
    };

    var addWarning = function(){
      _createdWidget.css('border','1px solid red');
    }
    var removeWarning = function(){
      _createdWidget.css('border','none');
    }

    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        var _values = [];
        if ($.isEmptyObject(_inputsObj)) return null;
        for(var el in _inputsObj){
          var _elV = {};
          for (var field in inputs){
            var _fieldVal = _inputsObj[el][field].getVal();
            if (inputs[field]['type'] == 'mandatory' && !_fieldVal){ 
              return null;}
            _elV[field] = _fieldVal;
          }
          _values.push(_elV);
        }
        return _values;
      },
      addWarning: function(){
        addWarning()
      },
      removeWarning: function(){
        removeWarning()
      },
      setVal: function(values){
        _fieldsCont.empty();
        _inputsObj = {};
        if ( typeof values === "object") values = Object.keys(values).map(function(key){
          return values[key];
        })
        if (values) values.forEach(function(val){
          _addFields(val);
        });
      },
      setSend: function(send){
        _send = send;
      },
      submit: function(){
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
        else _send();        
      }
    }
  }


  
  ns.Widgets.SelectorOther = function(obj_values_labels, placeholder){
    
    var _createdWidget = $('<div>');
    var _inputText = $('<input>')
      .attr({
        'type':'text',
        'placeholder': Pard.t.text('widget.selectorOther.textPlaceholder')+" '"+obj_values_labels['other']+"' *"
      })
      .on('input', function(){
        _inputText.removeClass('warning');
      })
      .hide();
    var _select = $('<select>');
    var _emptyOption = $('<option>');
    _createdWidget.append(
      _select, 
      $('<div>').append(_inputText).css('margin-top','.2rem')
    );

    // placeholder = placeholder || Pard.t.text();
    if(placeholder) {
      _emptyOption.attr({'value':'', 'disabled':'', 'selected':'selected'}).text(placeholder).addClass('placeholderSelect');
      _select.append(_emptyOption);
    }
    Object.keys(obj_values_labels).forEach(function(value){
      _select.append($('<option>').append(obj_values_labels[value]).val(value))
    })
    _select.on('change',function(){
      if(_select.val() == 'other') {
        _inputText.show();
        _inputText.addClass('warning');
      }
      else{
        _inputText.val('').hide();
        _inputText.removeClass('warning');
      }
      _emptyOption.remove();
      _select.removeClass('warning');
    })
    .one('click',function(){
      _select.removeClass('placeholderSelect');
      _emptyOption.empty();
    });

    return {
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var value = _select.val();
        if (value == 'other'){ 
          if (_inputText.val()) value += '$'+_inputText.val();
          else return null;
        }
        return value;
      },
      setVal: function(value){
        if (value){
          if (value.includes('other$')){
            _select.val('other');
            _inputText.val(value.split('$')[1]);
            _inputText.show();
          }
          else _select.val(value);
        }
      },
      addWarning: function(){
        if (_select.val() == 'other' && !_inputText.val()) _inputText.addClass('warning');
        else _select.addClass('warning');
      },
      removeWarning: function(){
        _inputText.removeClass('warning');
        _select.removeClass('warning');
      },
      enable: function(){
        _inputText.prop('disabled', false);
        _select.attr('disabled',false);
      },
      disable: function(){
        _inputText.prop('disabled', true);
        _select.attr('disabled', true);
      }
    }
  }


  ns.Widgets.LinkUploadPDF = function(folder){

    var _createdWidget = $('<div>');
    var _intro = $('<p>')
      .text(Pard.t.text('widget.linkUploadPdf.introText'))
      .css({'font-size':'0.8125rem'});
    var _fieldsCont = $('<div>');
    
    _createdWidget.append(_intro, _fieldsCont);


    var _allPhotos = [];

    var _done = 0;
    var _toBeDone = 0;
    var _toBeSubmitted = [];
    var _send = function(){}; 
    
    var _photoWidget = Pard.Widgets.UploadPDF(folder, 1);
    var _photos = _photoWidget.getPhotos();
    _allPhotos.push(_photos);
    var _photosContainer = _photoWidget.render();
    _photos.cloudinary().bind('cloudinarydone', function(e, data){
      var _url = _photoWidget.getVal();
      _url.push(data['result']['public_id']);
      _done += 1;
      if(_url.length >= _photos.dataLength()){
        _photoWidget.resetPhotos();              
        if(_done == _toBeDone) {
          _send();
          _done = 0;
          _toBeDone = 0;
          _toBeSubmitted = [];
        }
      }
    });
    _fieldsCont.append(_photosContainer);

    var _textInput = Pard.Widgets.Input('Link', 'text');
    _fieldsCont.append(_textInput.render());
   
    _fieldsCont.click(function(){
      _fieldsCont.css("border","none");
    });

   

    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        if (_photoWidget.getVal()) _values['img'] = _photoWidget.getVal();
        if (_textInput.getVal()) _values['link'] = _textInput.getVal();
        if(_values['img'] || _values['link']) return _values;
        else return null;
      },
      addWarning: function(){
        _fieldsCont.css('border','1px solid red');
      },
      removeWarning: function(){
        _fieldsCont.css('border','none');
      },
      setVal: function(values){
        if (values && values['img'] && !values['img'].is_false) _photoWidget.setVal(values['img']);
        if (values && values['link']) _textInput.setVal(values['link']);
      },
      // getAllPhotos: function(allPhotos){
      //   return _allPhotos;
      // },
      setSend: function(send){
        _send = send;
      },
      submit: function(){
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
        else _send();        
      }
    }
  }


  ns.Widgets.FormInputs = function(inputs){

    var _createdWidget = $('<div>');
    var _fieldsCont = $('<div>');
    var _inputs = {};
    
    _createdWidget.append(_fieldsCont);

    for (var field in inputs){
      if(inputs[field]['label']){ 
        var _labelText =  inputs[field].label;
        if (inputs[field].type == 'mandatory') _labelText += ' *';
        _fieldsCont.append($('<label>').text(_labelText).css('margin-top','.5rem'));
      }
      var _args = [];
      $.each(inputs[field].args, function(k, v){_args[parseInt(k)]=v});
      var _fieldInput = window['Pard']['Widgets'][inputs[field].input].apply(this, _args);
      _inputs[field] = _fieldInput;
      _fieldsCont.append(_fieldInput.render());
    } 

    _createdWidget.click(function(){
      _createdWidget.css("border","none");
    });


    return {
      render: function(){   
        return _createdWidget;
      },
      getVal: function(){
        var _values = {};
        for (var field in _inputs){
          _values[field] = _inputs[field].getVal()
        }
        return _values;
      },
      addWarning: function(){
        _createdWidget.css('border','1px solid red');
      },
      removeWarning: function(){
        _createdWidget.css('border','none');
      },
      setVal: function(valuesObj){
        if (valuesObj) Object.keys(valuesObj).forEach(function(k){
          _inputs[k].setVal(valuesObj[k]);
        })
      }
    }
  }


}(Pard || {}));
