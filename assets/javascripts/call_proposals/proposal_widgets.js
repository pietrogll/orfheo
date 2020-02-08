'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.OrfheoFieldPrinter = function(proposal, form){

    var _address = function(){
      var _address = ' ';
      if (proposal['address']){
        if (proposal['address']['route']) _address +=  proposal['address']['route']+ ' ';
        if (proposal['address']['street_number']) _address += ' '+proposal['address']['street_number']+',  ';
        if (proposal['address']['door']) _address += ', ' + Pard.t.text('proposal.form.door') + proposal['address']['door']+',  ';
        _address += proposal['address']['postal_code']+', '+proposal['address']['locality'];
      }
      return _address;
    };

    var _availability = function(){
      var _list = $('<ul>');
      if (proposal['availability']) proposal['availability'].forEach(function(val){
        if (val.length > 2 ) {
          var _dayDate = new Date (val);
          var _date = moment(_dayDate).locale(Pard.Options.language()).format('dddd DD MMMM YYYY');
        }
        else {
          // CHAPUZA!!!! THIS IS A SHIT BUT HAS TO STAY HERE FOR OFF CALL 2019
          var _date = form.blocks.availability.args[0][parseInt(val)];
        }
        _list.append($('<li>').text(_date));
      });
      return _list;
    }  

    var _duration = function(){
      if (proposal['duration']){
        if ($.isNumeric(proposal['duration']) && proposal['duration'] != "0") return  proposal['duration'] + ' min';
      else return Pard.t.text('profile_page.production.noDuration');
      }
    }

    var _cache = function(){
      if (proposal.cache){
        var cache = '';
        if (proposal.cache.value && proposal.cache.value!='false') cache += proposal.cache.value+'€'
        if (proposal.cache.comment) cache += ' - '+proposal.cache.comment;
        return cache;
      }
    }

    var _name = function(){
      var _nameText;
      if (!proposal.own) _nameText = $('<a>').append(proposal['name']).attr({'href':'/profile?id='+proposal.profile_id,'target':'_blank'});
      else _nameText = proposal['name']; 
      var _nameEl = $('<span>').append(_nameText, $('<div>').append(Pard.t.text('proposal.form.category', {category: form['texts'].label})).css('font-size','0.875rem'))
      return _nameEl;
    }

    var _ambientsNumber = function(){
      if (proposal.ambients) return proposal.ambients.length;
    }

    var _allowed = function(){
      if (proposal.ambients){
        var allowedCat = []
        var allowedFormats = []
        var _catDictionary =  Pard.t.text('categories');
        var _formatDictionary = Pard.t.text('formats'); 
        for (var key in proposal.ambients){
          var ambient = proposal.ambients[key] 
          if (ambient['allowed_categories']) allowedCat = allowedCat.concat(ambient['allowed_categories'])
          if (ambient['allowed_formats']) allowedFormats = allowedFormats.concat(ambient['allowed_formats'])
        }
        var _list = $('<ul>');
        if (allowedCat.length) _list.append(
          $('<li>').text(Pard.Widgets.UniqueArray(allowedCat).map(function(cat){return _catDictionary[cat]}).join(', '))
        )
        if (allowedFormats.length) _list.append(
            $('<li>').text(Pard.Widgets.UniqueArray(allowedFormats).map(function(format){return _formatDictionary[format].capitalize()}).join(', '))
          )

        return _list
      }
    }

    var _format = function(){
      if (proposal.format) return Pard.t.text('formats')[proposal.format].capitalize();
    }

    var _otherCat = function(){
      if (proposal.other_categories){
        return proposal.other_categories.map(function(oc){
          return form.blocks.other_categories.args[0][oc]
        }).join(', ')
      }
    }

    var _spaceType = function(){
      var sptp = Pard.t.text('space_type')[proposal.type];
      if(sptp) return sptp.capitalize();
    }

    var _phone = '';
    if (proposal.phone) _phone = proposal.phone.value;

    return {
      'name': {
        label: Pard.t.text('proposal.sentBy'),
        text: _name()
      },
      'email': {
        label: Pard.t.text('dictionary.email').capitalize(),
        text: $('<a>').attr('href','mailto:'+proposal['email']).text(proposal['email'])
      },
      'phone':{
        label: Pard.t.text('dictionary.phone').capitalize(),
        text: _phone
      },
      'address': {
        label: Pard.t.text('dictionary.address').capitalize(),
        text: $('<a>').text(_address()).attr({
                href: 'https://maps.google.com/maps?q='+_address(),
                target: '_blank'
              })
      },
      'title': {
        label: Pard.t.text('dictionary.title').capitalize(),
        input: 'Inputtext'
      },
      'description': {
        label: Pard.t.text('dictionary.description').capitalize(),
        input: 'TextAreaEnriched'
      },
      'format':{
        label: Pard.t.text('proposal.format'),
        text: _format()
      },
      'ambients_number':{
        label: Pard.t.text('proposal.ambients_number'),
        text: _ambientsNumber()
      },
      'short_description': {
        label: Pard.t.text('dictionary.short_description').capitalize(),
        input: 'TextAreaEnriched'
      },
      'subcategory': {
        label: Pard.t.text('proposal.form.subcategory').capitalize(),
        text: form.blocks.subcategory.args[0][proposal.subcategory]
      },
      'other_categories': {
        label: Pard.t.text('dictionary.other_categories').capitalize(),
        text: _otherCat()
      },
      'category':{
        label: Pard.t.text('proposal.form.orfheo_category'),
        text: Pard.t.text('categories')[proposal.category]
      },
      'availability': {
        label: Pard.t.text('dictionary.availability').capitalize(),
        text:  _availability()
      },
      'duration': {
        label: Pard.t.text('proposal.form.duration'),
        text: _duration()
      },
      'cache': {
        label: Pard.t.text('proposal.form.cache'),
        text: _cache()
      },
      'children':{
        label: Pard.t.text('dictionary.audience').capitalize(),
        text: Pard.t.text('widget.inputChildren.' + proposal.children)
      },
      'allowed':{
        label: Pard.t.text('proposal.proposal_for'),
        text: _allowed()
      },
      'space_type':{
        label: Pard.t.text('dictionary.space_type').capitalize(),
        text:  _spaceType()
      }
    }
  }
 


  
  ns.Widgets.GeneralFieldPrinter = function(proposal, entireForm){
    
    var form = entireForm.blocks;
    var _fieldInputPrinter = Pard.Widgets.FieldInputPrinter;
    var _multimediaToPrint;
    
    var _printMultimedia = function(){
      var multimediaProposal = _multimediaToPrint || proposal;
      var _multimediaContainer = $('<div>');
      var _fieldFormLabel = $('<span>').addClass('myProposals-field-label').text(Pard.t.text('proposal.form.multimedia'));
      var _linkPhoto = $('<a>')
        .text(Pard.t.text('proposal.form.seeContents')).attr('href','#');
      var _fieldFormText = $('<span>').append(_linkPhoto);
      var _fieldForm = $('<div>')
        .append(
          $('<p>').append(_fieldFormLabel, _fieldFormText)
          )
        .addClass('proposalFieldPrinted');
      
      _linkPhoto.click(function(){
        if (!(_multimediaContainer.html())){ 
          var _spinner = new Spinner();
           _spinner.spin();
          $('body').append(_spinner.el); 
            Pard.Widgets.MultimediaDisplay(
              multimediaProposal, 
              function(multimedia){
                Pard.Widgets.AddMultimediaContent(_multimediaContainer, multimedia);
                _spinner.stop();
              }
            );
        }       
        Pard.Widgets.BigAlert('',_multimediaContainer,'multimedia-popup-bigalert');
      })

      return _fieldForm;
    }


    var _printSummable = function(field){
      var _inputs = form[field].args[0];
      var _container = $('<div>');
      for (var itemKey in proposal[field]){
        var _item =  proposal[field][itemKey];
        var _itemText = $('<p>').addClass('summableInputs-proposalResult');
        Object.keys(_item).forEach(function(key, i){
          var _input = _inputs[key];
          var _labelTxt = '';
          if (_input.label){
            _labelTxt = _input.label+': ';
            _itemText.append( $('<span>').append(_labelTxt).addClass('label-field'));
          }
          var _txt;
          if ($.inArray(_input['input'], Object.keys(_fieldInputPrinter))>-1) {
            _txt = _fieldInputPrinter[_input['input']](_item, key, _inputs);
          }
          else{
            _txt = $('<span>').text(_item[key])
          }
          _itemText.append(_txt);
         
          if (i < Object.keys(_item).length - 1) _itemText.append($('<span>').text(' / ').css('margin','0 .5rem'));
        });
        _container.append(_itemText);
      }
      return _container;

    }

    

    return {
      render: function(inputType, field, fieldFormText){
        var tempText;
        switch (inputType){
          case 'UploadPhotos':
          case 'UploadPDF':
            fieldFormText.css({
              'display':'block',
              'margin-top':'.5rem'
            })
            break;
          case 'Links':
          case 'LinkUploadPDF':
            tempText = $('<div>').append(_fieldInputPrinter[inputType](proposal, field));
            break;
          case 'SummableInputs':
            tempText = _printSummable(field);
            break;
          case 'multimedia':
            tempText = _printMultimedia();
            break;
        }
        var _text = tempText || _fieldInputPrinter[inputType](proposal, field, form);  
        return fieldFormText.append(_text);
      },
      inputTypes: function(){
        return Object.keys(_fieldInputPrinter).concat(['SummableInputs']);
      },
      setMultimediaToPrint: function(multimediaToPrint){
        _multimediaToPrint = multimediaToPrint;
      }
    }
  }

   

  ns.Widgets.FieldInputPrinter = {
    TextAreaEnriched: function(proposal, field){
      return proposal[field];
    },
    Links: function(proposal, field){
      return $('<a>').text(proposal[field]).attr({'href': proposal[field], target:'_blank'})
    },
    InputTel: function(proposal, field){
      return $('<span>').text(proposal[field].value)
    },
    CheckBox: function(proposal, field){
      var dictionaryCheckBox = {
        false: Pard.t.text('dictionary.no').capitalize(),
        true: Pard.t.text('dictionary.yes').capitalize()
      }
      return $('<span>').text(' ' + dictionaryCheckBox[proposal[field]]);
    },
    UploadPDF: function(proposal, field){
      if(proposal[field]){
        var _container = $('<span>');
        proposal[field].forEach(function(pdf, index){
          _container.append(Pard.Widgets.DownloadButton(pdf, index, 'pdf'))
        })
        return _container;
      }
    },
    UploadPhotos: function(proposal, field){
      if(proposal[field]){
        var _container = $('<span>');
        proposal[field].forEach(function(photo, index){
          _container.append(Pard.Widgets.DownloadButton(photo, index, 'img'))
        });
        return _container;
      }
    },
    LinkUploadPDF: function(proposal, field){
      var _container = $('<span>');
      if (proposal[field] && proposal[field]['img'] && !proposal[field]['img'].is_false)  _container.append(Pard.Widgets.DownloadButton(proposal[field]['img'][0], 0,'pdf'))
      if (proposal[field] && proposal[field]['link']) _container.append($('<a>').text('Link_to_pdf').attr({'href':proposal[field]['link'],'target':'_blank'}));
      return _container;  
    },
    InputCommentedCache: function(proposal, field){
      var _text ='';
      if (proposal[field] && proposal[field]['value']) _text += proposal[field]['value'];
      if (proposal[field] && proposal[field]['comment']) _text += ' - '+proposal[field]['comment'];
      return $('<span>').append(_text);
    },
    Selector:function(proposal, field, form){
      return $('<span>').append(' ' + form[field].args[0][proposal[field]]);
    },
    MultipleSelector: function(proposal, field, form){
      if(proposal[field]){ 
        var _list = $('<ul>');
        proposal[field].forEach(function(val){
        _list.append($('<li>').text(form[field].args[0][val]));
        });
        return _list;
      }
    },
    InputNumber: function(proposal, field, form){
      var _text = proposal[field];
      if (form[field].args) _text += ' '+ form[field].args[1];
      return $('<span>').append(_text);
    }
  }



  ns.Widgets.AddMultimediaContent =  function(_multimediaContainer, multimedia) {
  
    Pard.Widgets.MultimediaScripts();
    if(multimedia.video != false){
      var _outerVideocontainer = $('<div>');
      var _videoContainer = $('<div>').addClass('video-production-container')

      var _videoTitle = $('<div>').addClass('single-image-container ').append($('<div>').addClass('single-image-content images-title-box').append($('<h6>').text(Pard.t.text('dictionary.videos').capitalize())));
      
      _multimediaContainer.append(_outerVideocontainer);
      multimedia.video.forEach(function(video){
        _videoContainer.prepend($('<div>').addClass('single-video-container').append(video))
      });
      _outerVideocontainer.append(_videoTitle, _videoContainer);
    };

    if(multimedia.audio != false){
      var _outerAudiocontainer = $('<div>');
      var _audioContainer = $('<div>').addClass('image-production-container');
      var _audioTitle = $('<div>').addClass('single-image-container ').append($('<div>').addClass('single-image-content images-title-box').append($('<h6>').text(Pard.t.text('dictionary.audios').capitalize())));
      _multimediaContainer.append(_outerAudiocontainer);
      multimedia.audio.forEach(function(audio){
        _audioContainer.prepend($('<div>').addClass('single-image-container').append($('<div>').addClass('single-image-content').append(audio)));
      });
      _outerAudiocontainer.append(_audioTitle, _audioContainer);

    }

    if(multimedia.image != false){
      var _outerImagescontainer = $('<div>');
      var _imageContainer = $('<div>').addClass('image-production-container');
      var _imageTitle = $('<div>').addClass('single-image-container').append($('<div>').addClass('single-image-content images-title-box').append($('<h6>').text(Pard.t.text('dictionary.images').capitalize())));      
      _multimediaContainer.append(_outerImagescontainer);
      multimedia.image.forEach(function(image){
        _imageContainer.append($('<div>').addClass('single-image-container').append($('<div>').addClass('single-image-content').append(image)));
      });
      _outerImagescontainer.append(_imageTitle, _imageContainer);
    }
  }

  ns.Widgets.DownloadButton =  function(url, index, el_type){
    var _el = $.cloudinary.image(url)
    index = index +1;
    var _btn = $('<a>')
      .append(
        Pard.Widgets.IconManager('export').render(),
         $('<span>').append(el_type+' '+index).css({
          'margin-left':'.2rem',
          'vertical-align':'.3rem',
          'font-size':'14px'
        })
      )
      .attr({
        'href':_el[0].src,
        'download':'',
        'target':'_blank',
        'title':Pard.t.text('manager.tools.qr.download')
      })
      .addClass('dowloadPDFproposal-btn'); 
    return _btn
  }



  


}(Pard || {}));

  