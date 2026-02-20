'use strict';

(function(ns){

  ns.Displayer = function(the_event, forms){

    var event_id = the_event.id;
    var call_id = the_event.call_id;
    var eventName = the_event.name;
    var _displayerPopupCloseCallback = function(){};

    var _content = $('<div>').addClass('very-fast reveal full');
    var _popup =  new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true, closeOnEsc:false});
    $(document).ready(function(){
      $('body').append(_content);
    })

    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>').addClass('popup-container-full');
    var _sectionContainer = $('<section>').addClass('popup-content');
    var _header = $('<div>').addClass('row popup-header');
    var _title = $('<h4>').addClass('small-11 popup-title');
    var _callback = function(){};
    var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'})
      .append($('<span>').html('&times;'));
    _header.append(_title, _closeBtn);
    _popupContent.append(_header, _sectionContainer);
    _container.append(_popupContent)
    _outerContainer.append(_container);

    var _closePopup = function(){
      _content.empty();
      _sectionContainer.empty();
      _title.empty();
      _container.empty().append(_popupContent.removeClass('proposal-popup'));
      _outerContainer.removeClass('displayNone-for-large');
      _popup.close();
      _displayerPopupCloseCallback();
    }


    var _displayArtistProgram = function(profile_id){

      var _popupTitle = $('<div>');

      var _message = Pard.Widgets.PopupContent(
        _popupTitle, 
        Pard.Widgets.ArtistProgram(profile_id, the_event, _popupTitle), 
        'space-program-popup-call-manager'
      );
      _message.setCallback(function(){
        _popup.close();
        _content.empty();
      });

      _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _popup.close();
          _content.empty();
        }
      });
      
      _content.append(_message.render());
      _popup.open();
    }

    var _displaySpaceProgramList = function(proposal_id){

      var _spaceList = []; 
      for (var sp in the_event.spaces){
        _spaceList[the_event.spaces[sp].space.index] = sp; 
      }

      var _spaceIndex = the_event.spaces[proposal_id].space.index;

      var _leftBtn = $('<div>')
        .append(
          $('<div>').append(Pard.Widgets.IconManager('navigation_left').render()).css('position','relative')
        )
        .addClass('leftBtn-listProgramSpace')
        .click(function(){
          _spaceIndex = _spaceIndex - 1
          if (_spaceIndex < 0) _spaceIndex = _spaceList.length-1; 
         _displaySpaceProgram(_spaceList[_spaceIndex]);
        });
      var _rightBtn = $('<div>')
        .append(
          $('<div>').append(Pard.Widgets.IconManager('navigation_right').render().css('position','relative'))
        )
        .addClass('rightBtn-listProgramSpace')
        .click(function(){
          _spaceIndex = _spaceIndex + 1
          if(_spaceIndex == _spaceList.length) _spaceIndex = 0;
          _displaySpaceProgram(_spaceList[_spaceIndex]);        
        });
      _container.append(_leftBtn, _rightBtn);
      _displaySpaceProgram(proposal_id);

    }



    var _displaySpaceProgram = function(proposal_id){

      var space = the_event.spaces[proposal_id].space;

      var _tableProgram = Pard.Widgets.SpaceProgram(proposal_id,  the_event, _title);

      _sectionContainer.empty();
      _popupContent.addClass('space-program-popup-call-manager');

      _sectionContainer.append(_tableProgram.render());

      _closeBtn.click(function(){
        _closePopup();
        _popupContent.removeClass('space-program-popup-call-manager');
      });

      _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _closePopup();
          _popupContent.removeClass('space-program-popup-call-manager');
        }
      }); 

      if (!_content.html()) {
        _content.append(_outerContainer);
        _popup.open();
      }  

    }


    // ==================================
    // DEFINE DISPLAY PROPOSALS LIST

    var _cachedList;

    var _displayProposalsList = function(proposal, type, _list){
      if(_list && _list.length>1){  
        _cachedList = _list;
        var _proposalIndex = _list.findIndex(function(el, index){return el.indexOf(proposal.proposal_id)>0 });
        var _display = function(proposalIndex){
          var _nextProposal = _list[proposalIndex].split('_');
          var _profileId = _nextProposal[0];
          var _proposalId = _nextProposal[1];
          var _type = _nextProposal[2];
          _sectionContainer.empty();
          var _displayDict = {
            artist: function(){_displayProposal(the_event[_type+'s'][_profileId]['proposals'][_proposalId]['proposal'], _type)},
            space: function(){_displayProposal(the_event[_type+'s'][_proposalId]['space'], _type)}
          }
          _displayDict[_type]();
        };

        var _leftBtn = $('<div>')
          .append(
            $('<div>').append(Pard.Widgets.IconManager('navigation_left').render()).css('position','relative')
          )
          .addClass('leftBtn-listProposal')
          .click(function(){
            _proposalIndex = _proposalIndex - 1
            if (_proposalIndex < 0) _proposalIndex = _list.length-1; 
           _display(_proposalIndex);
          });
        var _rightBtn = $('<div>')
          .append(
            $('<div>').append(Pard.Widgets.IconManager('navigation_right').render().css('position','relative'))
          )
          .addClass('rightBtn-listProposal')
          .click(function(){
            _proposalIndex = _proposalIndex + 1
            if(_proposalIndex == _list.length) _proposalIndex = 0;
            _display(_proposalIndex);         
          });
        _container.append(_leftBtn, _rightBtn);
      }
      _displayProposal(proposal, type);
    }


    // ==================================
    // DEFINE DISPLAY PROPOSAL

    
    var _displayProposal = function(proposal, type){

      proposal.proposal_type = type;
      proposal.event_color = the_event.color;
      _popupContent.addClass('proposal-popup');

      var _proposal = $.extend(true, {}, proposal);
      var form = forms[type][_proposal.form_id];
      var _proposalPrinter = {
        'artist': Pard.Widgets.PrintArtistProposal,
        'space': Pard.Widgets.PrintSpaceProposal
      }
      var _proposalPrinted = _proposalPrinter[type](proposal, form);

       _sectionContainer.append(
        _proposalPrinted.render()
      );

      _sectionContainer.append(
        Pard.Widgets.goUpBtn(_content).render()
          .css({
            'top':'60vh',
            'right': 'calc(50vw - 24rem)'
          })
        );

      _closeBtn.click(function(){
        _closePopup()
      });

      _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _closePopup()
        }
      });   

      if (_proposal.amend){
        var _label = $('<span>').addClass('myProposals-field-label').text(Pard.t.text('dictionary.amend').capitalize() + ':').css('display', 'block');
        var _text = $('<span>').text(' ' + _proposal.amend);
        var _element = $('<div>').append($('<p>').append(_label, _text));
        _sectionContainer.append(_element);
      };
      
      _title.empty()
      if(proposal.proposal_type == 'artist') _title.append(
        Pard.Widgets.IconManager('performer').render().addClass('icon-proposalPopup-title'),
        $('<span>').html(proposal.title).addClass('text-proposalPopup-title')
        );
      else _title.append(
        Pard.Widgets.IconManager('stage').render().addClass('icon-proposalPopup-title'),
        $('<span>').html(proposal.space_name).addClass('text-proposalPopup-title')
        );

      if (!_content.html()) {
        _content.append(_outerContainer);
        _popup.open();
      }

//------------------------------------------------------
// DEFINE MODIFY, DELETE, COMMENT AND SELECT
//------------------------------------------------------
        
      var _deleteProposalCaller = $('<button>')
        .append(
          Pard.Widgets.IconManager('delete').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.delete').capitalize())
        )
        .addClass('abutton deleteProfile-caller')
        .on('click', function(){
          var _name = _proposal.name;
          var _mex = Pard.t.text('manager.proposals.deleteNote', {name: _name});
          if(proposal.own) _mex = '';
          Pard.Widgets.ConfirmPopup(
            _mex,
            function(){
              var spinnerDeleteProposal = new Spinner();
              spinnerDeleteProposal.spin();
              $('body').append(spinnerDeleteProposal.el);
              var _deleteProposalBackend = {
                artist: Pard.Backend.deleteArtistProposal,
                space: Pard.Backend.deleteSpaceProposal
              }
              _deleteProposalBackend[type](_proposal.proposal_id, the_event.call_id, the_event.id, function(data){
                deleteCallback(data);
                _closePopup();
                spinnerDeleteProposal.stop();
              });
            }
          )
        });

      var deleteCallback = function(data){
        if (data['status'] == 'success'){
          Pard.Widgets.TimeOutAlert('', Pard.t.text('manager.proposals.deleteOk'));
        }
        else{
          var _dataReason = Pard.ErrorHandler(data.reason);
          if (typeof _dataReason == 'object')
            Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.t.text('error.unsaved'), location.reload());
          else{
            console.log(data.reason);
            Pard.Widgets.Alert('', _dataReason, location.reload());
          }
        }
      }


      var _modifyProposal = $('<button>')
        .append(
          Pard.Widgets.IconManager('modify').render().addClass('trash-icon-delete'), 
          $('<span>').text(Pard.t.text('dictionary.modify').capitalize())
        )
        .addClass('abutton deleteProfile-caller')
        .click(function(){

          _outerContainer.addClass('displayNone-for-large');

          var _formWidget = Pard.Widgets.ProposalForm(form, (!proposal.own));
          _formWidget.setVal(_proposal);
          if (!proposal.own) _formWidget.disableFields();
        
          _formWidget.showAll();
          _formWidget.setSend(function(stopSpinner){
            var _submitForm = _formWidget.getVal();
            _submitForm['id'] = _proposal.proposal_id;
            _submitForm['event_id'] = event_id;
            _submitForm['call_id'] = call_id;
            _submitForm['profile_id'] = _proposal.profile_id; 
            _modifyProposalBackend[type](_submitForm, 
              function(data){
                if (data.status != 'success'){
                  modifyCallback(data);
                  stopSpinner();
                }
                else{
                  if (type == 'space') {
                    var _modifiedProposal = data.model;
                  }
                  else {
                    var _artist = data.model;
                    var _modifiedProposal = data.model.proposals[0];
                    _modifiedProposal.name = _artist.name;
                    _modifiedProposal.proposal_type = 'artist';
                    _modifiedProposal.email = _artist.email;
                    _modifiedProposal.profile_id = _artist.profile_id;
                    _modifiedProposal.own = _artist.own;
                  }
                  _content.empty();
                  _sectionContainer.empty();
                  _title.empty();
                  _container.empty().append(_popupContent.removeClass('proposal-popup'));
                  _outerContainer.removeClass('displayNone-for-large');
                  _displayProposalsList(_modifiedProposal, type, _cachedList);
                  stopSpinner();
                }
              }
            );
          });
          var _modifyMessage = Pard.Widgets.PopupContent(eventName, _formWidget);
          _modifyMessage.prependToContent(
            $('<div>').append(
              $('<div>')
                .append(
                  $('<button>')
                    .attr('type','button')
                    .append(Pard.Widgets.IconManager('navigation_left').render(), $('<span>').text(Pard.t.text('dictionary.back').capitalize()))
                    .click(function(){
                      _modifyMessageRendered.remove();
                      _outerContainer.removeClass('displayNone-for-large');
                    })
                    .addClass('back-button')
                  )
                .css({
                  'position':'relative',
                  'height':'1rem'
                }),
              $('<p>')
                .text(Pard.t.text('manager.proposals.modifymex',{type: form.texts.label}))  
            )
           .css('margin-bottom','-.5rem')
          );
          _modifyMessage.appendToContent(Pard.Widgets.Button(
            Pard.t.text('dictionary.cancel').capitalize(),
            function(){
              _modifyMessageRendered.remove();
              _outerContainer.removeClass('displayNone-for-large');
            }).render()
            .addClass('cancelBtn-modifyProposalForm')
          );
          _modifyMessage.setCallback(function(){
            _closePopup()
          });
          var _modifyMessageRendered = _modifyMessage.render();
          _content.append(
            _modifyMessageRendered
          );
        });

      var modifyCallback = function(data){
        if (data['status'] != 'success'){
          var _dataReason = Pard.ErrorHandler(data.reason);
          if (typeof _dataReason == 'object')
            Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.t.text('error.unsaved'), location.reload());
          else{
            console.log(data.reason);
            Pard.Widgets.Alert('', _dataReason);
          }
        }
      };

      var _modifyProposalBackend = {
        artist: Pard.Backend.modifyArtistProposal,
        space: Pard.Backend.modifySpaceProposal
      };

      
      var _commentsContainer = $('<div>').css({'position':'relative'});
      var _commentsBtn = $('<button>')
        .append(
          Pard.Widgets.IconManager('comments').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.comment').capitalize())
        )
        .addClass('abutton deleteProfile-caller')
        .click(function(){
          _commentsBtn.addClass('disabled-abutton');
          _commentsBtn.attr('disabled', true);
          var _sendCommentsButton = $('<button>')
            .attr({type: 'button'})
            .addClass('abutton save_commentsBtn')
            .append(Pard.Widgets.IconManager('save').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.save').capitalize()))
            .click(function(){
              _commentsBtn.removeAttr('disabled');
              _commentsBtn.removeClass('disabled-abutton');
              var _comments = _textArea.val();
              Pard.Backend.modifyParamCallProposal(
                {
                  param: 'comments',
                  value: _comments,
                  id: proposal.proposal_id,
                  call_id: the_event.call_id,
                  event_id: the_event.id,
                  type: proposal.proposal_type,
                  profile_id: proposal.profile_id

                }, 
                function(data){
                  if (data['status'] == 'success'){
                    proposal['comments'] = _comments;
                    _printComments();
                  }
                  else{
                    console.log(data.reason);
                  }
                }
              );
            });
          var _textArea = $('<textarea>')
            .attr('rows', 2)
            .on('input', function(){$(this).removeClass('warning')})
            .css({'font-size':'14px', 'margin-bottom':'2.5rem'});
          if (proposal.comments){
            _commentsContainer.empty();
            _textArea.val(proposal['comments']);
            _commentsContainer.append(_textArea, _sendCommentsButton);
          }
          else{
            _commentsContainer.append(_textArea, _sendCommentsButton);
          }
        });

       

      var _printComments = function(){
        _commentsContainer.empty();           
        if (proposal.comments){
          const _commentsLabel = Pard.t.text('widget.inputComments.label').capitalize();
          const _commentsFormLabel = $('<span>').text(_commentsLabel).addClass('myProposals-field-label');
          const _commentsText = $('<div>').append(
            $('<p>')
              .text(proposal['comments'])
              .css({'word-wrap': 'break-word'})
            );
          _commentsContainer.append( _commentsFormLabel,_commentsText);
        }
      }
      _printComments();

      
              

      var _backendSelectProposal = function(){
        var _programDic = {
          artist: function(){return the_event.artists[proposal.profile_id].program},
          space: function(){return the_event.spaces[proposal.proposal_id].program}
        }
        var _program = _programDic[proposal.proposal_type]();
        var _proposalProgram = Object.keys(_program).filter(function(show_id){
          return (_program[show_id].show.participant_proposal_id == proposal.proposal_id || _program[show_id].show.host_proposal_id == proposal.proposal_id) 
        });
        if (_proposalProgram.length && proposal.selected){
          _selectProposal.prop('checked', true)
          var _popupAlert = Pard.Widgets.Popup();
          var _contentAlert = function(){
            var _displayProgramDic = {
              space: function(){
                _content.empty();
                _sectionContainer.empty();
                _title.empty();
                _container.empty().append(_popupContent.removeClass('proposal-popup'));
                _outerContainer.removeClass('displayNone-for-large');
                _displaySpaceProgram(proposal.proposal_id);
              },
              artist: function(){
                _content.empty();
                _displayArtistProgram(proposal.profile_id);
              }
            }
            var _text = $('<p>').text(Pard.t.text('manager.proposals.hasProgramAlert.mex'));
            var _btn = Pard.Widgets.Button(Pard.t.text('manager.proposals.hasProgramAlert.btn'), function(){
              _popupAlert.close();
              _displayProgramDic[proposal.proposal_type]();
            });
            var _btnContainer = $('<div>')
              .append(_btn.render())
              .css({'text-align':'right'});
            return $('<div>').append( 
              _text, 
              _btnContainer
            );
          }
          _popupAlert.setContentClass('alert-container-full');
          _popupAlert.setContent(Pard.t.text('dictionary.attention'),_contentAlert());
          return _popupAlert.open();
        }
        var spinnerSelectProposal = new Spinner();
        spinnerSelectProposal.spin();
        $('body').append(spinnerSelectProposal.el);
        var _backendDictionary = {
          artist: Pard.Backend.selectArtistProposal,
          space: Pard.Backend.selectSpaceProposal
        }
        _backendDictionary[proposal.proposal_type](
          proposal.proposal_id, 
          call_id, 
          event_id, 
          function(data){
            if (data['status'] != 'success'){
              var _dataReason = Pard.ErrorHandler(data.reason);
              if (typeof _dataReason == 'object')
                Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.t.text('error.unsaved'), location.reload());
              else{
                console.log(data.reason);
                Pard.Widgets.Alert('', _dataReason);
              }
            }
            else{
              spinnerSelectProposal.stop();
            }
          }
        )
      }


      var _selectProposal = $('<input>').attr({ type: 'checkbox'});
      _selectProposal.attr('checked',proposal.selected);
      var _label = $('<label>').html(Pard.t.text('dictionary.selected').capitalize());
      _label.css('display','inline');
      _selectProposal.on('change', function(){
        _backendSelectProposal();
      });
      var _selectProposalRendered = $('<div>').append(_selectProposal, _label);


      // --------------------------------------------
      //APPEND ACTION BUTTONS ONLY IF EVENT NOT PAST
      //----------------------------------------------

      var _actionBtnContainer = $('<div>').addClass('actionButton-container-popup');

      if (!the_event.finished){
        _actionBtnContainer.append(
          $('<span>').append(_commentsBtn).addClass('element-actionButton'), 
          $('<span>').append(_modifyProposal).addClass('element-actionButton').css({ 'border-left':'1px solid #bebebe' }),
          $('<span>').append(_deleteProposalCaller).addClass('element-actionButton').css({ 'border-left':'1px solid #bebebe' }), 
          _selectProposalRendered.css({display: 'inline-block', float: 'right'})
        );
      }
      else{
        _selectProposal.attr('disabled',true);
        _actionBtnContainer.append(
           $('<span>')
            .append(
              Pard.Widgets.IconManager('comments').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.comment').capitalize()) 
            )
            .addClass('element-actionButton event-finished'),
          $('<span>')
            .append(
              Pard.Widgets.IconManager('modify').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.modify').capitalize())
            )
            .addClass('element-actionButton event-finished')
            .css({ 'border-left':'1px solid #bebebe' }),
          $('<span>')
            .append(
              Pard.Widgets.IconManager('delete').render().addClass('trash-icon-delete'), $('<span>').text(Pard.t.text('dictionary.delete').capitalize()) 
            )
            .addClass('element-actionButton event-finished')
            .css({ 'border-left':'1px solid #bebebe' }),
          _selectProposalRendered.css({display: 'inline-block', float: 'right'})
        );
      }
    

      _sectionContainer.prepend(
        _actionBtnContainer,
        _commentsContainer
      );

      
    }


    //END DISPLAY PROPOSAL
    //==============================================

    // =======================================
    // DEFINE DISPLAY PARTICIPANT

    var _displayParticipant = function(participant){

      const _participant = the_event.artists[participant.profile_id].artist;
      const _participantForm = $.extend(true,{}, Pard.Forms.Participant);
      _participantForm.name.args = [Pard.Widgets.GetEventParticipantNames(the_event)]
      const _participantFormWidget = Pard.Widgets.PrintForm(_participantForm);
      _participantFormWidget.setVal(_participant);
      if (participant.profile_id.endsWith('-own')) {
        _participantFormWidget.setSend(function(){
          const valTosend = _participantFormWidget.getVal();
          valTosend.id = participant.profile_id.replace('-own','');
          valTosend.event_id = the_event.id;
          Pard.Backend.modifyParticipant(
            valTosend, 
            () => {
              _closeModifyParticipantCallback();
              _participantFormWidget.stopSpinner();
            }
          )
        })
      }
      else{
        _participantFormWidget.disable();
        _participantFormWidget.appendFinalNote(
          $('<div>').html(Pard.t.text('manager.participants.modifyNote')).css('font-weight','bold')
        )
        _participantFormWidget.removeSubmitButton()
      }
      _participantFormWidget.setCallback(function(){
        _popup.close();
        _content.empty();
      });

      const _message = Pard.Widgets.PopupContent(
        `MODIFY ${participant.name}`, 
        _participantFormWidget
      );

      function _closeModifyParticipantCallback(){
        _popup.close();
        _content.empty();
        _displayerPopupCloseCallback();
      }

      _message.setCallback(() => {
        _closeModifyParticipantCallback()
      })

      _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _closeModifyParticipantCallback();
        }
      });
      
      _content.append(_message.render());
      _popup.open();
    }

    // =======================================
    // DEFINE CREATE OWN PROPOSAL


    var _createOwnProposal = function(type){
      const participants_artists = Object.keys(the_event['artists']).map( artist_id => the_event['artists'][artist_id]['artist']);
      const participants_spaces = Object.keys(the_event['spaces']).map( space_id =>the_event['spaces'][space_id]['space']);
      const participants = [...participants_artists, ...participants_spaces];
      var _contentCreateOwn = $('<div>').addClass('very-fast reveal full top-position').attr('id','popupForm');
      $('body').append(_contentCreateOwn);
      var _popup = new Foundation.Reveal(_contentCreateOwn, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out',  multipleOpened:true});

      var _callbackCreatedProposal = function(data, callback){
        if(data['status'] == 'success') {
          _closePopupForm();
          Pard.Widgets.TimeOutAlert('', Pard.t.text('manager.proposals.createOk'));
          callback();
        }
        else{
          Pard.Widgets.Alert('', Pard.ErrorHandler(data.reason));
          callback();
        }
      }

      var _sendProposal = function(callback){
        var _submitForm = _createOwnProposalWidget.getVal();
        _submitForm['call_id'] = call_id;
        _submitForm['event_id'] = event_id;
        if (type == 'artist') Pard.Backend.sendArtistOwnProposal(_submitForm, function(data){_callbackCreatedProposal(data, callback)});
        else if (type == 'space') Pard.Backend.sendSpaceOwnProposal(_submitForm, function(data){_callbackCreatedProposal(data, callback)});
      };

      const _createOwnProposalWidget = Pard.Widgets.CreateOwnProposal(forms[type], type, participants);
      _createOwnProposalWidget.setSend(_sendProposal);
      var _message = Pard.Widgets.PopupContent(Pard.t.text('manager.proposals.createTitle', {type: Pard.t.text('dictionary.' + type).capitalize()}), _createOwnProposalWidget);
      _message.setCallback(function(){
        _popup.close();
        setTimeout(
          function(){
             _contentCreateOwn.remove();
          },500);
      });

      _contentCreateOwn.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _popup.close();
          setTimeout(
            function(){
               _contentCreateOwn.remove();
            },500);
          }
      });   

      _contentCreateOwn.append(_message.render());
      const _closePopupForm = function(){
        _popup.close();
        setTimeout(
          function(){
             _contentCreateOwn.remove();
          },500);
      };
      _popup.open();
    }

    //=========================================
    // RETURN

    return{
      displayProposal: _displayProposal,
      displayProposalsList: _displayProposalsList,
      displayArtistProgram: _displayArtistProgram,
      displaySpaceProgram: _displaySpaceProgram,
      displaySpaceProgramList :_displaySpaceProgramList,
      createOwnProposal: _createOwnProposal,
      displayParticipant: _displayParticipant,
      close: function(){
        if (_popup) _popup.close();
        _displayerPopupCloseCallback();
      },
      destroy: function(){
        if (_popup){ 
          _closePopup();  
          setTimeout(function(){
            _popup.destroy();
            _content.remove();
          }, 500); 
        }
      },
      setCloseCallback: function(callback){
        _displayerPopupCloseCallback = callback;
      }
    }
  }

}(Pard || {}));
