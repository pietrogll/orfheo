'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {}; 

  

  ns.Widgets.PrintMyProposal = function(proposal, form, proposalType, closepopup){
    var _createdWidget = $('<div>');
    var _proposalPrinter = {
      'artist': Pard.Widgets.PrintArtistProposal,
      'space': Pard.Widgets.PrintSpaceProposal
    }
    _createdWidget.append(_proposalPrinter[proposalType](proposal, form).render());
    if (form.blocks['conditions'] 
      // && form.blocks['conditions']['helptext']
      ){
      // var _conditionsLink = '<a href="' + form.blocks['conditions']['helptext'] + '" target="_blank">' + Pard.t.text('proposal.terms') + '</a>'; 
      var _conditionsLink = Pard.t.text('proposal.terms');
      if(form.blocks.conditions.args && form.blocks.conditions.args['0']) _conditionsLink =  '<a href="' + form.blocks.conditions.args['0'] + '" target="_blank">' + Pard.t.text('proposal.terms') + '</a>'; 
      _createdWidget.append($('<p>').append(Pard.t.text('proposal.termsOk', {link: _conditionsLink, event: proposal.event_name}))); 
    }
    var _deadline = new Date(parseInt(proposal.deadline));
    var _now = new Date();
    if(_now.getTime() < proposal.deadline){
      var _backendAmendProposal = {
        space: Pard.Backend.amendSpaceProposal,
        artist: Pard.Backend.amendArtistProposal
      }
      var _postData = $('<div>').addClass('postData-container');
      var _postDataLabel = $('<p>').addClass('myProposals-field-label').text(Pard.t.text('proposal.amend.helper') + ' ('+ moment(_deadline).locale(Pard.Options.language()).format('DD MMMM YYYY')+')');

      

      var _printPostData = function(){
        _postData.empty();
        var _sendButton = $('<button>').attr({type: 'button'}).addClass('send-post-data-btn').text(Pard.t.text('dictionary.send').capitalize());

        var _textArea = $('<textarea>')
          .attr('rows', 4)
          .on('input', function(){$(this).removeClass('warning')});

        var _sendButton = $('<button>')
          .attr({type: 'button'})
          .addClass('send-post-data-btn')
          .text(Pard.t.text('dictionary.send').capitalize())
          .click(function(){
            var _amend = _textArea.val();
            if (_amend) { 
              _backendAmendProposal[proposalType](
                proposal.id, 
                proposal.call_id, 
                _amend, 
                function(data){
                  if (data['status'] == 'success'){
                    proposal['amend'] = _amend;
                    _printPostData();
                    Pard.Widgets.TimeOutAlert('', Pard.t.text('proposal.amend'),'', function(){ });
                  }
                  else{
                    console.log(data.reason);
                    //Pard.Widgets.Alert('', _dataReason);
                  }
                }
              );
            }
            else _textArea.attr({placeholder: Pard.t.text('proposal.amend.placeholder')}).addClass('warning');
          });
          
        if (proposal.amend){
          var _amendLabel = Pard.t.text('proposal.amend.title');
          _amendFormLabel = $('<span>').text(_amendLabel).addClass('myProposals-field-label');
          var _amendText = $('<div>').append($('<p>').text(proposal['amend']));
          var _modifyAmendButton = $('<button>').attr({type: 'button'}).addClass('send-post-data-btn').text(Pard.t.text('proposal.amend.modify'));
          _modifyAmendButton.click(function(){
            _postData.empty();
            _textArea.val(proposal['amend']);
            _postData.append(_postDataLabel, _textArea, _sendButton);
          });
          _postData.append(_postDataLabel, _amendFormLabel,_amendText,_modifyAmendButton);
        }
        else{
          _postData.append(_postDataLabel, _textArea, _sendButton);
        }
      }

      _printPostData();

      var _deleteProposal = $('<button>')
        .attr('type','button')
        .text(Pard.t.text('proposal.delete'))
        .addClass('button_a')
        .css('font-size','12px')
        .on('click', function(){
          var _confirmPopup = Pard.Widgets.Popup();
          _confirmPopup.setContent(
            Pard.t.text('popup.delete.title'), 
            Pard.Widgets.DeleteMyProposalMessage(proposal, proposalType, closepopup, function(){_confirmPopup.close();}).render()
          );
          _confirmPopup.open();
        });
      _createdWidget.append(_postData);
      _createdWidget.append(_deleteProposal.prepend(Pard.Widgets.IconManager('delete').render().addClass('trash-icon-delete')));
    }


    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
      }
    }
  }


  ns.Widgets.PrintArtistProposal = function(proposal, form){

    var form = $.extend(true, {}, form);

    var _gPrinter = Pard.Widgets.GeneralFieldPrinter(proposal, form);
    var _gPrinterInputs = _gPrinter.inputTypes();
    var _rfhPrinter = Pard.Widgets.OrfheoFieldPrinter(proposal, form);

    var _createdWidget = $('<div>');
    _createdWidget.append($('<div>').addClass('colorLine-myProposal-popup').css('border-color', proposal.color));
    var _orfheoFields = ['name', 'phone','email','subcategory', 'other_categories', 'other','category','format', 'title', 'short_description','description','duration','availability', 'children', 'cache'];

    _orfheoFields.forEach(function(field){
      if (proposal[field]){
        var _fieldFormLabel = $('<span>').addClass('myProposals-field-label');
        var _fieldFormText = $('<span>');
        var _proposalField = _rfhPrinter[field] || form.blocks[field];
        _proposalField['text'] = _proposalField['text'] || proposal[field];
        _proposalField['label'] = _proposalField['label'] || form.blocks[field]['label'];
        _proposalField['input'] = _proposalField['input'] || '';
        _fieldFormLabel.append(_proposalField['label'],':');
        _fieldFormText.append(' ',_proposalField['text']).addClass('proposalText-'+_proposalField['input']+' proposal-text');
        var _fieldForm = $('<div>').append($('<p>').append(_fieldFormLabel, _fieldFormText)).addClass('proposalFieldPrinted');
        _createdWidget.append(_fieldForm);
      }
    });

    if (proposal['photos'] || proposal['links']){
      _createdWidget.append(_gPrinter.render('multimedia', '', $('<div>')));
    }

    for(var field in proposal){
      if ($.isNumeric(field)  && form.blocks[field]){
        var _fieldFormLabel = $('<span>').addClass('myProposals-field-label');
        var _fieldFormText = $('<span>').addClass('proposalText-'+ form.blocks[field]['input']+' proposal-text');
        var _fieldForm = $('<div>').append($('<p>').append(_fieldFormLabel, _fieldFormText)).addClass('proposalFieldPrinted');
        _createdWidget.append(_fieldForm);
        _textLabel = form.blocks[field]['label'];          
        if (_textLabel && _textLabel.indexOf('*')>0) _textLabel = _textLabel.replace(' *','');
        _textLabel += ':';
        _fieldFormLabel.append(_textLabel);
        if ($.inArray(form.blocks[field]['input'], _gPrinterInputs)>-1) _fieldFormText.append(_gPrinter.render(form.blocks[field]['input'], field, _fieldFormText));
        else _fieldFormText.text(' ' + proposal[field]);    
      }
    }

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
      }
    }
  }

  ns.Widgets.PrintSpaceProposal = function(proposal, form){

    var form = $.extend(true, {}, form);

    var _spaceForm = $.extend(true, {}, Pard.Forms.SpaceCall);
    var _ambientInfoForm = form['blocks']['ambient_info'] || {};
    var _ambientForm = $.extend(true, Pard.Forms.AmbientCall, _ambientInfoForm);
    if (proposal.single_ambient == 'true'){
      delete _ambientForm['description'];
      delete _ambientForm['name'];
    }
    form['blocks'] = $.extend(true, _spaceForm, form['blocks']);

    var _gPrinter = Pard.Widgets.GeneralFieldPrinter(proposal, form);
    var _gPrinterInputs = _gPrinter.inputTypes();

    var _rfhPrinter = Pard.Widgets.OrfheoFieldPrinter(proposal, form);

    var _createdWidget = $('<div>');
    _createdWidget.append($('<div>').addClass('colorLine-myProposal-popup').css('border-color', proposal.color));
    var _orfheoFields = ['name', 'space_name', 'phone','email','subcategory', 'address', 'availability', 'space_type', 'description', 'allowed', 'ambients_number'];

    _orfheoFields.forEach(function(field){
        var _fieldFormLabel = $('<span>').addClass('myProposals-field-label');
        var _fieldFormText = $('<span>');
        var _proposalField = _rfhPrinter[field] || form.blocks[field];
        _proposalField['text'] = _proposalField['text'] || proposal[field];
        _proposalField['label'] = _proposalField['label'] || form.blocks[field]['label'];
        _proposalField['input'] = _proposalField['input'] || '';
        _fieldFormLabel.append(_proposalField['label'],':');
        _fieldFormText.append(' ',_proposalField['text']).addClass('proposalText-'+_proposalField['input']+' proposal-text');
        var _fieldForm = $('<div>').append($('<p>').append(_fieldFormLabel, _fieldFormText)).addClass('proposalFieldPrinted');
        _createdWidget.append(_fieldForm);
    });

    if (proposal['plane_picture'] || proposal['photos'] || proposal['links'])
    {
     _createdWidget.append(_gPrinter.render('multimedia', '', $('<div>')));
    }

    var _ambientFields = Object.keys(Pard.Forms.Ambient);

    // var checkAmbient = true
    for (var index in proposal.ambients){
      var multimediasAmbientNotPrinted = true;
      var ambient = proposal.ambients[index];
      _ambientFields.forEach(function(field){ 
        if ((field == 'allowed_categories' || field == 'allowed_formats') || $.inArray(field, Object.keys(_ambientForm))<0){}
        else if ((field == 'links' || field == 'photos') && ambient[field]) { 
          if (multimediasAmbientNotPrinted){
            _gPrinter.setMultimediaToPrint(ambient);
            _createdWidget.append(_gPrinter.render('multimedia', '', $('<div>')))
          }; 
          multimediasAmbientNotPrinted = false;
        }
        else if (ambient[field]){
          var _fieldFormLabel = $('<span>').addClass('myProposals-field-label');
          var _fieldFormText = $('<span>');
          var _proposalField = $.extend(true, {}, _ambientForm[field]);
          _proposalField['text'] = _proposalField['text'] || ambient[field];
          _proposalField['label'] = _proposalField['label'] || form.blocks[field]['label'];
          _proposalField['input'] = _proposalField['input'] || '';
          if(field == 'name') {
            _fieldFormLabel.append(_proposalField['label'],' '+(parseInt(index)+1).toString()+':');
          }
          else _fieldFormLabel.append(_proposalField['label'],':');
          _fieldFormText.append(' ',_proposalField['text']).addClass('proposalText-'+_proposalField['input']+' proposal-text');
          var _fieldForm = $('<div>').append($('<p>').append(_fieldFormLabel, _fieldFormText)).addClass('proposalFieldPrinted');
          _createdWidget.append(_fieldForm);
        }
      })

    }

    for(var field in proposal){
      if ($.isNumeric(field) && form.blocks[field]){
        var _fieldFormLabel = $('<span>').addClass('myProposals-field-label');
        var _fieldFormText = $('<span>').addClass('proposalText-'+ form.blocks[field]['input']+' proposal-text');
        var _fieldForm = $('<div>').append($('<p>').append(_fieldFormLabel, _fieldFormText)).addClass('proposalFieldPrinted');
        _createdWidget.append(_fieldForm);
        _textLabel = form.blocks[field]['label'];          
        if (_textLabel.indexOf('*')>0) _textLabel = _textLabel.replace(' *','');
        _textLabel += ':';
        _fieldFormLabel.append(_textLabel);

        if ($.inArray(form.blocks[field]['input'], _gPrinterInputs)>-1) _fieldFormText.append(_gPrinter.render(form.blocks[field]['input'],field, _fieldFormText));
        else _fieldFormText.text(' ' + proposal[field]);  
      }
    }

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
      }
    }
  }

  ns.Widgets.DeleteMyProposalMessage = function(proposal, proposalType, closepopup, closeConfirmPopup){  
    var _createdWidget = $('<div>');
    var _message = $('<p>').text(Pard.t.text('proposal.deleteAlert', {event: proposal.event_name}));
    var _yesBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn confirm-delete-btn').text(Pard.t.text('dictionary.confirm').capitalize());
    var _noBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn cancel-delete-btn').text(Pard.t.text('dictionary.cancel').capitalize());

    var _deleteProposalBackend = {
      artist: Pard.Backend.deleteArtistProposal,
      space: Pard.Backend.deleteSpaceProposal
    }    

    proposal['proposal_id'] = proposal['proposal_id'] || proposal['space_id'];

    var _deleteCallback = function(data){
      if (data['status'] == 'success'){
        var callProposals =  Pard.CachedProfile.history.call_proposals;
        for (var type in callProposals){
          Pard.CachedProfile.history.call_proposals[type] = callProposals[type].filter(function(proposal){return !(proposal.id == data.model.proposal_id)})
        }
        Pard.Widgets.TimeOutAlert('', Pard.t.text('proposal.deleteOk',''));
        Pard.Bus.trigger('modifyBlock', 'history');
      }
      else{
        var _dataReason = Pard.ErrorHandler(data.reason);
        if (typeof _dataReason == 'object'){
          var _popup = Pard.Widgets.Popup();
          _dataReason.setCallback(function(){
            _popup.close();
            setTimeout(function(){
              _popup.destroy()
             },500);
          });
          _popup.setContent('', _dataReason.render());
          _popup.setContentClass('alert-container-full');
          _popup.setCallback(function(){
            setTimeout(function(){
            _popup.destroy()
          },500);
          });
          _popup.open();
        }
        else{
          console.log(data.reason);
          Pard.Widgets.Alert('', _dataReason);
        }
      }
    }

    _yesBtn.click(function(){
      _deleteProposalBackend[proposalType](
        proposal.id, 
        proposal.call_id, 
        proposal.event_id, 
        _deleteCallback
      );
      closepopup();
      closeConfirmPopup();
    });

    _noBtn.click(function(){
      closeConfirmPopup();
    });

    var _buttonsContainer = $('<div>').addClass('yes-no-button-container');

    _createdWidget.append(_message,  _buttonsContainer.append(_noBtn, _yesBtn));

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }



}(Pard || {}));
