'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.ModifyProfileBtn = function(profile){

    var _createdWidget = $('<div>');

    var _modifyBtn = $('<button>').addClass('modify-content-button').attr({type: 'button'}).append(Pard.Widgets.IconManager('modify_section_content').render())
      .click(function(){
        _modifyProfilePopup = Pard.Widgets.Popup();
        var _modifyMessage = Pard.Widgets.ModifyProfileMessage(profile);
        _modifyMessage.setCallback(_modifyProfilePopup.close);
        _modifyProfilePopup.setContent(Pard.t.text('modifyProfile.title'), _modifyMessage.render());
        _modifyProfilePopup.open();
        
      });

    var _triangle = $('<div>').addClass('modify-section-content-button-container');

    var _colorizeTriangle = function(_profileColor){

      var _colorWidget = Pard.Widgets.IconColor(_profileColor);
      var _iconColor = _colorWidget.render();
      _modifyBtn.css({color: _iconColor});

      var _profileColorRgba = _colorWidget.rgba(0.2);

      _modifyBtn.hover(
        function(){
          _triangle.css({'border-top': '70px solid rgb('+_profileColorRgba[0]+','+_profileColorRgba[1]+','+_profileColorRgba[2]+')'});
        },
        function(){
          _triangle.css({'border-top': '70px solid '+_profileColor});
        });
        _triangle.css({'border-top': '70px solid '+_profileColor})

      }

      _colorizeTriangle(profile.color);

      Pard.Bus.on('modifyProfile',function(){
        _colorizeTriangle(profile.color);
      })

     _createdWidget.append(
      _triangle,
      _modifyBtn
    );

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }


  ns.Widgets.ModifyProfileMessage = function(profile){

    var _createdWidget = $('<div>').addClass('modifyProfilePopup');
    var _form = Pard.Forms.Profile;
    _form['name']['args'] = [profile.id]
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);
    
    _formWidget.setVal(profile);

    var _confirmPopup = Pard.Widgets.Popup();
    var _deleteMessage = Pard.Widgets.DeleteProfileMessage(profile.id, function(){_confirmPopup.close();});
    _confirmPopup.setContent(Pard.t.text('popup.delete.title'), _deleteMessage.render());
    var _deleteProfile = $('<a>').attr('href','#').append(Pard.Widgets.IconManager('delete').render().addClass('trash-icon-delete'), Pard.t.text('modifyProfile.delete')).addClass('deleteProfile-caller')
      .click(function(){
        _confirmPopup.open();
      });

    var _closepopup = function(){};

    var _modifyCallback = function(data, modifiedProfile){
      
      if (data['status'] == 'success'){
        for (var field in Pard.Forms.Profile){
          profile[field] = data.profile[field];
        }
        Pard.Bus.trigger('updateGallery', {'gallery': data.profile.gallery, 'ids': [data.profile.id]});
        Pard.Bus.trigger('modifyProfile');  
      }
    }

    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['id'] = profile.id;
      _formVal['description'] = profile.description;
      if (profile['links']) _formVal['links'] = profile.links;
      if (profile['photos']) _formVal['photos'] = profile.photos;
      if (_formVal['address']['location'] && _formVal['address']['location']['lat'] && _formVal['address']['location']['lng']){
        Pard.Backend.modifyProfile(_formVal, function(data){_modifyCallback(data,_formVal)});
        callbackSent();
      }
      else{
        var _content = $('<div>').addClass('very-fast reveal full');
        _content.empty();
        $('body').append(_content);
        var _popup = new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out',multipleOpened:true});
        var _closepopup2 = function(){
          _popup.close();
        }
        var _message = Pard.Widgets.PopupContent(Pard.t.text('popup.noMapLocation.title'), Pard.Widgets.AlertNoMapLocation(_formVal, _closepopup2, function(){
           Pard.Backend.modifyProfile(_formVal, _modifyCallback); 
          _closepopup();
        }));

        _message.setCallback(function(){
          _content.remove();
          _popup.close();
        }); 

        _content.click(function(e){
          if ($(e.target).hasClass('vcenter-inner')) {
            _content.remove();
            _popup.close();
          }
        });

        _content.append(_message.render());
        _popup.open();
        callbackSent();
      }
    }

    _formWidget.setSend(_send);
    _formWidget.setCallback(function(){_closepopup()}); 


    _createdWidget.append(_formWidget.render(),  _deleteProfile);
    
    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closepopup = callback;
      }
    }
  }

  ns.Widgets.ModifyFreeBlock = function(profile){
    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('profile_page.free_block.default_title');
    
    var _form = Pard.Forms.FreeBlock;
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);
    _formWidget.setVal(profile.free_block);
    
    var _modifyFreeBlockCallback = function(data){
      if (data['status']=='success'){
        profile.free_block = data.free_block;
        var element_gallery = data.free_block.gallery;
        Pard.Bus.trigger('updateGallery', {'gallery': element_gallery, 'ids': [data.free_block.id]});
        delete profile.free_block['gallery'];
        Pard.Bus.trigger('modifyBlock', 'free_block');
      }
      else{
        console.log(data)
      }  
    }

    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      if (profile.free_block && profile.free_block.id){
        _formVal['id'] = profile.free_block.id;
        Pard.Backend.modifyFreeBlock(_formVal, function(data){
          _modifyFreeBlockCallback(data,_formVal); 
          callbackSent();
        });
      }
      else {
        Pard.Backend.createFreeBlock(_formVal, function(data){_modifyFreeBlockCallback(data,_formVal); callbackSent();});
      }
    }

    _formWidget.setCallback(_popup.close);
    _formWidget.setSend(_send); 

    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  
  }

  ns.Widgets.ModifyDescriptionBlock = function(profile){
    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('profile_page.menu.description');
    
    var _form = Pard.Forms.DescriptionBlock;
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);
    _formWidget.setVal(profile);

    var _modifyDescriptionBlockCallback = function(data, modifiedBlock){
      if (data['status']=='success'){
        profile.description = modifiedBlock.description
        Pard.Bus.trigger('modifyBlock', 'description');
      }
      else{
        console.log(data)
      }  
    }

    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      Pard.Backend.modifyProfileDescription(_formVal.description, profile.id, function(data){_modifyDescriptionBlockCallback(data, _formVal);})
      callbackSent();
    }

    _formWidget.setSend(_send); 
    _formWidget.setCallback(_popup.close);

    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }

  ns.Widgets.AddSpace = function(profile){
    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('profile_page.SpaceBlock.addSpace');

    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    
    var _formWidget = Pard.Widgets.PrintSpaceForm(_submitButton);
    // _formWidget.setVal(profile.space);

    var _createSpaceCallback = function(data){
      if (data['status']=='success'){
        profile['space'] = profile['space'] || [];
        var _newSpace = data.space;
        var space_ambients_ids =  data.space.ambients.reduce(function(arr_ids, amb){return arr_ids.concat(amb.id)},  [data.space.id])
        var element_gallery = data.space.gallery;
        delete _newSpace['gallery'];
        profile['space'].push(_newSpace);
        Pard.Bus.trigger('modifyBlock', 'space');
        Pard.Bus.trigger('updateGallery',{'gallery': element_gallery, 'ids': space_ambients_ids})
      }
      else{
        console.log(data)
      }  
    }
   
    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      var _photos = _formVal['ambients'].reduce(function(photosArray, amb){
        var amb_photos = amb['photos'] || [];
        return photosArray.concat(amb_photos);
      },[])
      if (_photos.length) _formVal['main_picture'] = [_photos[0]];
      Pard.Backend.createSpace(_formVal, function(data){
        _createSpaceCallback(data);
        callbackSent();
      })
    }

    _formWidget.setSend(_send); 
    _formWidget.setCallback(_popup.close);

    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }


  ns.Widgets.ModifySpace = function(space, profile){
    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('dictionary.modify').capitalize();

    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    
    var _formWidget = Pard.Widgets.PrintSpaceForm(_submitButton);
    console.log('ModifySpace', space)
    _formWidget.setVal(space);

   var _modifySpaceCallback = function(data){
      if (data['status']=='success'){
        var _index = profile['space'].findIndex(function(el){
          return el.id == data.space.id;
        });
        profile['space'][_index] = data.space;
        var space_ambients_ids =  data.space.ambients.reduce(function(arr_ids, amb){return arr_ids.concat(amb.id)},  [data.space.id])
        var element_gallery = data.space.gallery;
        delete profile['space'][_index]['gallery'];
        Pard.Bus.trigger('modifyBlock', 'space');
        Pard.Bus.trigger('modifySpace', data.space);
        Pard.Bus.trigger('updateGallery', {'gallery': element_gallery, 'ids': space_ambients_ids});
      }
      else{
        console.log(data);
      }  
    }
   
    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['id'] = space.id;
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      var _photos = _formVal['ambients'].reduce(function(photosArray, amb){
        var amb_photos = amb['photos'] || [];
        return photosArray.concat(amb_photos);
      },[])
      if (_photos.length){
        if ($.inArray(space['main_picture'], _photos)<0) _formVal['main_picture'] = [_photos[0]];
      }
      else{
        _formVal['main_picture'] = null;
      }
      Pard.Backend.modifySpace(_formVal, function(data){
        _modifySpaceCallback(data);
        callbackSent();
      })
    }
   
    _formWidget.setSend(_send);
    _formWidget.setCallback(_popup.close);
    
    var _mex = $('<div>')
      .append(_formWidget.render())
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy()
      },500)
    })

    _popup.open();
    
  }


  ns.Widgets.AddEventItem = function(profile){

    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('profile_page.events.popup.createTitle');
    var _mex = $('<div>');
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _form = $.extend(true,{}, Pard.Forms.Event);
    delete _form.profile_id
    if (Pard.UserStatus['status'] !== 'admin') delete _form.professional;
    Object.keys(_form.texts.args[0]).forEach(function(textField){
      if (textField != 'lang') _form[textField] = _form.texts.args[0][textField]
    })
    delete _form.texts
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);

    var _addEventItemCallback = function(data){
      if (data['status']=='success'){
        profile['upcoming'] = profile['upcoming'] || {};
        profile['upcoming']['events'] = profile['upcoming']['events'] || [];
        profile['upcoming']['events'].push(data.event);
        Pard.Bus.trigger('modifyBlock', 'upcoming');
      }
      else{
        console.log(data)
      }  
    }
   
    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      _formVal['categories'] = {artist: _formVal['categories']};
      var _text = {}
      Object.keys(Pard.Forms.Event.texts.args[0]).forEach(function(textField){
        if (textField != 'lang') _text[textField] = _formVal[textField]
      })
      delete _text.lang
      _formVal['texts'] = {
        'es': _text
      }

      Pard.Backend.createEvent(_formVal, function(data){
        _addEventItemCallback(data);
        callbackSent();
      });
    }

    _formWidget.setSend(_send); 
    _formWidget.setCallback(_popup.close);



    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }


  ns.Widgets.DeleteEventItem = function(event_id, blockToUpdate){
    Pard.Widgets.ConfirmPopup('', () => {
      Pard.Backend.deleteEvent(event_id, data => {
        if (data['status']== 'success'){
          const index = Pard.CachedProfile[blockToUpdate]['events'].findIndex(el => {return el.id == event_id})
          Pard.CachedProfile[blockToUpdate]['events'].splice(index,1);
          Pard.Bus.trigger('modifyBlock', blockToUpdate);
        }
        else{
          console.log(data)
        }
      })
    })
  }
  
  ns.Widgets.ModifyEventItem = function(the_event, blockToUpdate){

    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _popup = Pard.Widgets.Popup();
    var _form = $.extend(true,{}, Pard.Forms.Event);
    delete _form.profile_id
    if (Pard.UserStatus['status'] !== 'admin') delete _form.professional;
    Object.keys(_form.texts.args[0]).forEach(function(textField){
      if (textField != 'lang') _form[textField] = _form.texts.args[0][textField]
    })
    delete _form.texts

    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);
    
    var _eventCopy = $.extend(true, {}, the_event);
    _eventCopy['categories'] = _eventCopy['categories']['artist'];

    var _textKey = Object.keys(_eventCopy['texts'])[0];
    for (var field in _eventCopy['texts'][_textKey]){
      _eventCopy[field] = _eventCopy['texts'][_textKey][field]
    }

    _formWidget.setVal(_eventCopy);
   
    _formWidget.setSend(function(stopSpinner){
      var _submittedForm = _formWidget.getVal();
      _submittedForm['id'] = the_event.id;
      _submittedForm['profile_id'] = Pard.CachedProfile.id;
      _submittedForm['categories'] = {artist: _submittedForm['categories']};
      var _text = {}
      Object.keys(Pard.Forms.Event.texts.args[0]).forEach(function(textField){
        if (textField != 'lang') _text[textField] = _submittedForm[textField]
      })
      delete _text.lang
      _submittedForm['texts'] = {
        'es': _text
      }

      Pard.Backend.modifyEvent(_submittedForm, function(data){
        if (data['status'] == 'success'){

          for (var field in data.event){
            the_event[field] = data.event[field];
          }

          var _eIndex = Pard.CachedProfile[blockToUpdate].events.findIndex(function(ev){
            return ev.id === the_event.id 
          })
          Pard.CachedProfile[blockToUpdate].events[_eIndex] = the_event;
          Pard.Bus.trigger('modifyBlock', blockToUpdate);
          Pard.Bus.trigger('updateGallery', {'gallery': [data.event.gallery], 'ids': [the_event.id]});
          Pard.Bus.trigger('modifyEvent', the_event);
          stopSpinner();
          setTimeout(function(){
            _popup.destroy();
          },500);
        }
        else {
          stopSpinner();
          Pard.Widgets.Alert('Error', data['reason'])
        }
      })

    })    

    var _content = $('<div>')
      .append(
        _formWidget.render()
      );

    _popup.setContent(
      Pard.t.text('dictionary.modify').capitalize(), 
      _content
    );

    _popup.open();

  }

  ns.Widgets.AddPortfolioItem = function(profile){
    var _popup = Pard.Widgets.Popup();
    var _title = Pard.t.text('profile_page.proposalBlock.addProposal');
    var _mex = $('<div>');
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _form = Pard.Forms.PortfolioProposal;
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);

     var _addPortfolioItemCallback = function(data){
      if (data['status']=='success'){
        profile['portfolio']['proposals'] = profile['portfolio']['proposals'] || [];
        profile['portfolio']['proposals'].push(data.production);
        Pard.Bus.trigger('modifyBlock', 'portfolio');
      }
      else{
        console.log(data)
      }  
    }
   
    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      if(_formVal['photos'] && _formVal['photos'].length) _formVal['main_picture'] = [_formVal['photos'][0]]
      Pard.Backend.createProposal(_formVal, function(data){
        _addPortfolioItemCallback(data);
        callbackSent();
      });
    }

    _formWidget.setSend(_send); 
    _formWidget.setCallback(_popup.close);



    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }

  ns.Widgets.ModifyPortfolioProposal = function(proposal, profile){
    var _popup = Pard.Widgets.Popup();
    var _mex = $('<div>');
    var _title = Pard.t.text('dictionary.modify').capitalize();
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
    var _form = Pard.Forms.PortfolioProposal;
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);
   _formWidget.setVal(proposal);

   var _modifyPortfolioProposalCallback = function(data){
      if (data['status']=='success'){
        var _index = profile['portfolio']['proposals'].findIndex(function(el){
          return el.id == data.production.id;
        });
        Pard.Bus.trigger('updateGallery', {'gallery': data.production.gallery, 'ids': [proposal.id]});
        delete data.production.gallery;
        Pard.CachedProfile['portfolio']['proposals'][_index] = data.production;
        Pard.Bus.trigger('modifyBlock', 'portfolio');
        Pard.Bus.trigger('modifyProposal', data.production);
      }
      else{
        console.log(data)
      }  
    }
   
    var _send = function(callbackSent){
      var _formVal = _formWidget.getVal();
      _formVal['id'] = proposal.id;
      _formVal['profile_id'] = profile.id;
      _formVal['user_id'] = profile.user_id;
      if (_formVal['photos'] && _formVal['photos'].length){
        if ($.inArray(proposal['main_picture'], _formVal['photos'])<0) _formVal['main_picture'] =[ _formVal['photos'][0]];
      }
      else{
        _formVal['main_picture'] = null;
      }
      Pard.Backend.modifyProposal(_formVal, function(data){
        _modifyPortfolioProposalCallback(data);
        callbackSent();
      });
    }


    _formWidget.setSend(_send); 
    _formWidget.setCallback(_popup.close);


    var _mex = $('<div>')
      .append(_formWidget.render());
    _popup.setContent(_title, _mex);
    _popup.setCallback(function(){
      setTimeout(function(){
        _popup.destroy();
      },500);
    });

    _popup.open();
  }


  ns.Widgets.DeleteProfileMessage = function(profile_id, closePopup){  
    
    var _createdWidget = $('<div>');
    var _message = $('<p>').text(Pard.t.text('popup.delete.profile'));
    var _yesBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn confirm-delete-btn').text(Pard.t.text('popup.delete.confirm'));
    var _noBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn cancel-delete-btn').text(Pard.t.text('popup.delete.cancel'));

    _yesBtn.click(function(){
      var spinner = new Spinner();  
      spinner.spin();
      $('body').append(spinner.el);
      Pard.Backend.deleteProfile(profile_id, function(data){
        Pard.Events.DeleteProfile(data); 
        spinner.stop();
      });
      closePopup();
    });

    _noBtn.click(function(){
      closePopup();
    });

    var _buttonsContainer = $('<div>').addClass('yes-no-button-container');   

    _createdWidget.append(_message,  _buttonsContainer.append(_noBtn, _yesBtn));

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
       
      }
    }
  }
  




}(Pard || {}));
