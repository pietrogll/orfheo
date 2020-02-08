'use strict';

(function(ns){
    ns.Widgets = ns.Widgets || {};

  ns.Widgets.CreateOwnProposal = function(forms, proposalType, participants){
    var _createdWidget = $('<div>').addClass('popupOwnProposal');
    var _typeFormsCatArray = Object.keys(forms);
    let _formWidget, _selectedParticipant, _closepopup;
    var _send = function(){};

    var _outerFormBox = $('<div>');
    var _participantsSelectorCont = $('<div>');
    var _participantsSelector = $('<select>');
    var _formTypeSelectorCont = $('<div>');
    var _contentSel = $('<div>');
    var _formTypeSelector = $('<select>');
    var _emptyOption = $('<option>').text('').val('');
    _formTypeSelector.append(_emptyOption);
    var _t1 = $('<p>').text(Pard.t.text('manager.proposals.addAnother')).addClass('t-popupOwn');
    var _t2 = $('<p>').text(Pard.t.text('manager.proposals.orNew')).addClass('t-popupOwn');

    _participantsSelectorCont.append(_t1, _participantsSelector, _t2);
    var _emptyOptionParticpant = {
      name: '',
      email:'',
      phone:'',
      profile_id: ''
    };
   
    const _dataParticipants = participants.reduce(function(dataParticipants, participant){
      if(!dataParticipants.some(p => p.id == participant.profile_id) && participant.own && participant.own.is_true()){
          dataParticipants.push({
          id: participant.profile_id,
          text: participant.name,
          participant: participant
        })
      }
      return dataParticipants;
    },[])
    _dataParticipants.unshift({id:'',text:'', participant: _emptyOptionParticpant});

    var _placeholderParticipantSelector = Pard.t.text('manager.proposals.byName');

    _participantsSelector.select2({
      data: _dataParticipants,
      minimumResultsForSearch: Infinity,
      dropdownCssClass: 'orfheoTypeFormSelector',
      placeholder: _placeholderParticipantSelector,
      allowClear: true
    });

    _participantsSelector
      .on('select2:select',function(){
        _selectedParticipant = _participantsSelector.select2('data')[0].participant;
        var _valToSet = {
          name:_selectedParticipant.name,
          email:_selectedParticipant.email,
          phone:_selectedParticipant.phone,
          profile_id: _selectedParticipant.profile_id
        }
        if(_selectedParticipant.profile_id) {
          _t2.text('');
          if (_formWidget) _formWidget.disableFields('own');
        }
        if (_formWidget){
          _formWidget.setVal(_valToSet);
        }
      })
      .on('select2:unselecting', function(){
        _t2.text(Pard.t.text('manager.proposals.orNew'));
        _selectedParticipant = null;
        if (_formWidget) _formWidget.enableFields();
      });
    
    var _printForm = function(form_id){
      _contentSel.empty();
      _formWidget = Pard.Widgets.ProposalForm(forms[form_id], false);
      _formWidget.setCallback(function(){
        _closepopup();
      });
      _formWidget.setSend(_send);
      if (_selectedParticipant){
        var _valToSet = {
          name:_selectedParticipant.name,
          email:_selectedParticipant.email,
          phone:_selectedParticipant.phone,
          profile_id: _selectedParticipant.profile_id
        }
        _formWidget.setVal(_valToSet);
        _formWidget.disableFields('own');
      }
      _contentSel.append(_formWidget.render());
    }

    for (var typeForm in forms){
      _formTypeSelector.append(
        $('<option>').text(forms[typeForm]['texts'].label).val(typeForm)
      );
    };

    _outerFormBox.append(_formTypeSelectorCont.append(_formTypeSelector));

    _formTypeSelector.select2({
      minimumResultsForSearch: Infinity,
      dropdownCssClass: 'orfheoTypeFormSelector',
      placeholder: Pard.t.text('manager.proposals.selectCat')
    });

    _formTypeSelector.on('change',function(){
      if (_formTypeSelector.val()){
        $('#popupForm').removeClass('top-position');
        _formTypeSelector.addClass('content-form-selected').css('font-weight','normal');
        _printForm(_formTypeSelector.val());
      }
    });
  
    if (Object.keys(participants).length) {
      _createdWidget.append(_participantsSelectorCont);
    }

    _createdWidget.append(_outerFormBox.append(_contentSel));
    
    return {
      render: function(){
        return _createdWidget; 
      },
      setCallback: function(callback){
        _closepopup = callback;
      },
      getVal: function(){
        var _submitForm =  _formWidget.getVal();
        if (_selectedParticipant && _selectedParticipant.profile_id)  _submitForm['profile_id'] = _selectedParticipant.profile_id;
        return _submitForm;
      },
      setVal: function(proposal){
        _formWidget.setVal(proposal);
      }, 
      setSend: function(send){
        _send = send;
      }
    }
  }


}(Pard || {}));
