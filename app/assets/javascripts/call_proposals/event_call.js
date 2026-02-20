'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};  

  ns.Widgets.ListProfiles = function(){
    return {
      render: function(data){
        if(data['status'] == 'success'){
          var _popup = Pard.Widgets.Popup();
          var _choosePorfileMex = Pard.Widgets.ChooseProfileMessage(data.profiles);
          _choosePorfileMex.setCallback(function(){_popup.close()});
          _popup.setContent('', _choosePorfileMex.render());
          _popup.setCallback(function(){
            setTimeout(function(){
              _popup.destroy();
            },500)
          });
          _popup.prependToHeader(Pard.Widgets.HelpContactBtn().render());
          _popup.open();
        }
        else{
          Pard.Widgets.Alert(Pard.t.text('error.serverProblem.title'), _dataReason).render();
        }
      }
    }
  }

  ns.Widgets.HelpContactBtn = function(){
    var _createdWidget = $('<div>').css({
      'width': '100%',
      'margin-top': '-.2rem',
      'margin-bottom': '1rem'
    });
    var _mex = Pard.t.text('call.helpContactText',{organizer_mail: Pard.CachedEvent.organizer_email.value});
    var _mexContainer = $('<div>').append(_mex).hide().addClass('mex-helpContactBtn');
    var _helpBtn = $('<button>')
      .attr({
        'type':'button'
      })
      .append(
          Pard.Widgets.IconManager('help').render().addClass('trash-icon-delete'), 
          $('<span>').text(Pard.t.text('dictionary.help').capitalize()) 
        )
      .addClass('abutton helpContactBtn')
      .click(function(){
        _mexContainer.show();
      })

    _createdWidget.append(
      _helpBtn,
      _mexContainer
    )

    return {
      render: function(){
        return _createdWidget;
      }
    }

  }


  ns.Widgets.ChooseProfileMessage = function(profiles){

    var call_id = Pard.CachedEvent.call_id;
    var _createdWidget = $('<div>');
    var _closeListProfilePopup = function(){};
    _createdWidget.append(
      $('<h4>').append(Pard.t.text('call.chooseProfile')).css({
        'margin-top': '-1rem'
      })
    );

    profiles.forEach(function(profile){
      var _cardContainer = $('<div>').addClass('card-container-popup position-profileCard-login');
      var _card = Pard.Widgets.CreateCard(profile).render();
      _card.removeAttr('href');
      _card.attr('href','#/');
      _card.click(function(){
        var _getFormCall = Pard.Widgets.PrintEventCall(_callForms, profile);
        _closeListProfilePopup();
        _getFormCall.render(); 
      });
      _createdWidget.append(_cardContainer.append(_card));
    });

    var _secondTitle = $('<h4>').text(Pard.t.text('call.newProfile'));
    _secondTitle.css({
      'margin-top': '2rem',
      'text-align': 'right'
    });
    var _createAndInscribeProfile = function(data){
      if (data['status'] == 'success'){
        var _profile = data.profile;
        var _getFormCall = Pard.Widgets.PrintEventCall(_callForms, _profile);
        _closeListProfilePopup();
        _getFormCall.render(); 
        Pard.Bus.trigger('reloadMenuHeaderDropdown');
      }
      else{
        var _dataReason = Pard.ErrorHandler(data.reason);
        if (typeof _dataReason == 'object'){
          var _popup = Pard.Widgets.Popup();
          _dataReason.setCallback(function(){
            _popup.close();
            setTimeout(function(){
              _popup.destroy();
             },500)
          });
          _popup.setContent('', _dataReason.render());
          _popup.setContentClass('alert-container-full');
          _popup.setCallback(function(){
            setTimeout(function(){
              _popup.destroy();
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

    var _createProfileCard;
    var _callForms;
    Pard.Backend.getCallForms(call_id, function(data){
      _callForms = data.forms;
      _createProfileCard = Pard.Widgets.CreateProfileCard(
        Pard.t.text('call.createProfile.title'),
        Pard.Widgets.CreateProfileMessage(_createAndInscribeProfile)).render();
      
      _createProfileCard.off('mouseenter mouseleave')
       .hover(
            function(){
              _createProfileCard.css({
                'box-shadow': 'rgb(255, 255, 255) 0px 0px 3px 1px'
              });
            },
            function(){
              _createProfileCard.css({
                'box-shadow':''
              });
            }
          )

      var _cardContainer = $('<div>').addClass('card-container-popup position-profileCard-login');
       _cardContainer.append(_createProfileCard);
      _createdWidget.append(_cardContainer.append(_createProfileCard), _secondTitle);
     });

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closeListProfilePopup = callback;
      }
    } 
  }


  ns.Widgets.CallbackSendProposal = function(formTexts, data, closeProposalPopup){

    var _popupMessageSentProposal = function(data){
      var _container = $('<div>');
      var _closepopup = function(){};
      var _message = $('<div>').append($('<h4>').text(Pard.t.text('call.successTitle')).addClass('success-inscription-title'),$('<h5>').text(Pard.t.text('call.succesMex')).css({
        'text-align':'center',
        'margin-bottom': '2rem'
      }));

      if (formTexts.sent_proposal_mex) _message.append(
          $('<div>').html(formTexts.sent_proposal_mex).addClass('sent_proposal_mex')
        );

      var _toProfilePageBtn = $('<a>').text(Pard.t.text('call.toProfile')).attr('href', '/profile?id=' + data.model['profile_id']).addClass('success-inscription-btn');
      var _sendOtherProposal = Pard.Widgets.Button(Pard.t.text('call.sendOther'), function(){
          _closepopup();
          Pard.Backend.listProfiles(Pard.Widgets.ListProfiles().render);
      }).render().addClass('success-inscription-btn');
      _container.append(_message, _toProfilePageBtn, _sendOtherProposal);
      return {
        render: function(){
          return _container;
        },
        setCallback: function(callback){
          _closepopup = callback;
        }
      }
    }

    if (data['status'] == 'success'){
      var _sentProposalMex = _popupMessageSentProposal(data);
      _sentProposalMex.setCallback(function(){_popup.close()});
      var _popup = Pard.Widgets.Popup();
      _popup.setContent('',  _sentProposalMex.render());
      _popup.setCallback(function(){
        setTimeout(function(){
          _popup.destroy();
        },500);
      });
      _popup.open();
      closeProposalPopup();
    }
    else{
      var _dataReason = Pard.ErrorHandler(data.reason);
      if (typeof  _dataReason == 'object'){
        var _popup = Pard.Widgets.Popup();
        _dataReason.setCallback(function(){
          _popup.close();
          setTimeout(function(){
            _popup.destroy();
           },500);
        });
        _popup.setContent('', _dataReason.render());
        _popup.setContentClass('alert-container-full');
        _popup.setCallback(function(){
          setTimeout(function(){
          _popup.destroy();
        },500);
        });
        _popup.open();
      }
      else{
        var _dataReason = Pard.ErrorHandler(data.reason);
        Pard.Widgets.Alert('', _dataReason);
      }
    }
  }

  
  ns.Widgets.PrintEventCall = function(callForms, profile){

    var eventInfo = Pard.CachedEvent;
    var _callManager = Pard.Widgets.CallFormManager(callForms, profile);
    _callManager.setCallback(function(){
        _popup.close();
        setTimeout(function(){
          _popup.destroy();
        },500)
      })
    var _popup = Pard.Widgets.Popup({closeOnEsc:false}, true);
    _popup.setContent(eventInfo.name, _callManager.render());
    _popup.prependToHeader(Pard.Widgets.HelpContactBtn().render());


    return {
      render: function(){
        _popup.open();
      }
    }
  };
 

  ns.Widgets.CallFormManager = function(forms, profile){
    var _createdWidget = $('<div>');

    var productions, spaces, submittedSpaces;

    Pard.Backend.getProfileSpacesAndProductions(profile.id, Pard.CachedEvent.id, function(data){
      if (data.status == 'success'){
        productions = data.productions;
        spaces = data.spaces;
        submittedSpaces = data.submitted_spaces;
      }
      else{
        console.log('error')
      }
    })

    var _type;

    var formsTexts = forms.texts || {};
    var _stageBtnText = formsTexts.space_call_btn || Pard.t.text('call.form.stagebtn');
    var _performerBtnText = formsTexts.artist_call_btn|| Pard.t.text('call.form.perfomerbtn');
    var _chooseTypeText = formsTexts.choose_type || Pard.t.text('call.form.chooseHow');
    
    _stageBtnText = _stageBtnText.capitalize();
    _performerBtnText = _performerBtnText.capitalize();

    var _performerBtn = $('<button>')
      .addClass('choose-type-btn-callEvent')
      .attr('type','button')
      .append(
        Pard.Widgets.IconManager('performer').render().css('vertical-align','middle'),
        $('<span>').text(_performerBtnText).addClass('text-btn-choose-type')
      )
      .click(function(){
        $('.active').removeClass('active');
        _performerBtn.addClass('active');
        _type = 'artist';
        showProductions();
        loadFormSelector();
        
      });
       
    var _stageBtn = $('<button>')
      .addClass('choose-type-btn-callEvent')
      .attr('type','button')
      .append(
        Pard.Widgets.IconManager('stage').render().css('vertical-align','middle'),
        $('<span>').text(_stageBtnText).addClass('text-btn-choose-type')
      )
      .click(function(){
        $('.active').removeClass('active');
        _stageBtn.addClass('active');
        _type = 'space';
        showSpaces();
        loadFormSelector();
        
      });

    var btnDict = {
      'artist': _performerBtn,
      'space': _stageBtn
    }

    var _tfs = ['space', 'artist']  
   
    var _typeButtons = $('<div>').css('margin-bottom','2rem');

    _tfs.forEach(function(tf){
      if (forms[tf] && Object.keys(forms[tf]).length>0) _typeButtons.append(btnDict[tf]);
    })

    var _chooseType = $('<div>')
      .append(
        $('<div>').html(_chooseTypeText).css({
          'font-size': '1rem',
          'margin-bottom': '2rem'
        }),
        _typeButtons
      );
    var _initialMexText = Pard.t.text('call.form.initMex', {link: '<a href="/profile?id='+profile.id + '", target=_blank">'+ profile.name +'</a>', organizer: Pard.CachedEvent.name}) +'.';
    var _initialMex = $('<p>').html(_initialMexText).css('margin-bottom','1.5rem');

    var _closepopup = {};
    var _profile_item_id;

    var _outerFormBox = $('<div>');
    var _formTypeSelectorCont = $('<div>');
    var _formTypeOptionsCont = $('<div>');
    var _contentSel = $('<div>');
    var _formTypes = [];
    var _acceptedProduction = {
      'categories': Object.keys(forms['artist']).reduce(function(acceptedCategories, form_id){
        var cat_args = forms['artist'][form_id]['blocks']['category']['args'];
        $.each(cat_args, function(k, cats){
          if (!Array.isArray(cats)) cats = Object.keys(cats)
          acceptedCategories = acceptedCategories.concat(cats);
        })
        return Pard.Widgets.UniqueArray(acceptedCategories);
      }, []),
      'formats': Object.keys(forms['artist']).reduce(function(acceptedFormats, form_id){
        var format_args = forms['artist'][form_id]['blocks']['format']['args'];
        $.each(format_args, function(k, formats){
          if (!Array.isArray(formats)) formats = Object.keys(formats)
          acceptedFormats = acceptedFormats.concat(formats);
        })
        return Pard.Widgets.UniqueArray(acceptedFormats);
      }, [])
    };
   
    var _formTypeSelector = $('<select>');

    var loadFormSelector = function(){

      _formTypes = [];
      _contentSel.empty();
      _formTypeSelectorCont.empty();
      $('#popupForm').addClass('top-position');
      _formTypeSelector = $('<select>');
      var _emptyOption = $('<option>').text(Pard.t.text('call.form.catPlaceholder')).val('');
      _formTypeSelector.append(_emptyOption);
      var _typeData = [];
      for (var typeForm in forms[_type]){
        _formTypes.push(typeForm);
        var _icon;
        if(_type == 'artist'){
          _icon = forms[_type][typeForm].blocks.category.args[0]
          if (!Array.isArray(_icon)) _icon = Object.keys(_icon);
        }
        _typeData.push({
          id: typeForm,
          icon: _icon,
          text: forms[_type][typeForm]['texts'].label
        });
      };

      if(_formTypes.length == 1) _printForm(_formTypes[0]);
      else{
        _formTypeSelectorCont.append(_formTypeSelector);
        _formTypeSelector.select2({
          minimumResultsForSearch: Infinity,
          data: _typeData,
          templateResult: Pard.Widgets.FormatResource,
          placeholder: Pard.t.text('call.form.catPlaceholder'),
          dropdownCssClass: 'orfheoTypeFormSelector'
        });
        _formTypeSelector.on('change',function(){
          if (_formTypeSelector.val()){
            $('.xbtn-production-event-page').remove();
            $('#popupForm').removeClass('top-position');
            $('.content-form-selected').removeClass('content-form-selected');
            _formTypeSelector.addClass('content-form-selected').css('font-weight','normal');
            _printForm(_formTypeSelector.val());
          }
        });
      }
    }

    var _prodContainer = $('<div>')

    _outerFormBox.append(_prodContainer, _formTypeSelectorCont,_formTypeOptionsCont);

    var showProductions = function(){
      _prodContainer.empty();
      if(_type == 'artist' && productions && productions.length){
        var _t1 = $('<div>')
          .append(
            $('<h6>').text(Pard.t.text('call.form.portfolio'))
          )
          .css({
            'margin-top':'1.5rem',
            'margin-bottom':'1rem'
          });
        var _t2 = $('<div>')
          .append(
            $('<h6>').text(Pard.t.text('call.form.newProposal'))
          )
          .css({
            'margin-bottom':'1rem'
          });
        _prodContainer.addClass('prodContainer-event-page');
        _prodContainer.append(_t1);
        var _compatibleProductions = false;

        productions.forEach(function(production){
          if ($.inArray(production.category, _acceptedProduction.categories) >- 1 && $.inArray(production.format, _acceptedProduction.formats) >- 1){
            var _prodBtn = $('<div>').addClass('production-nav-element-container production-btn-event-page');
            var _iconColumn = $('<div>')
              .addClass(' icon-column')
              .append(
                $('<div>').addClass('nav-icon-production-container')
                  .append($('<div>').addClass('production-icon-container')
                    .append(Pard.Widgets.IconManager(production['category']).render().css({'text-align': 'center', display:'block'})
                    )
                  )
              );
            _iconColumn.css({
              'padding':'0.2rem'
            });
            var _nameColumn = $('<div>').addClass('name-column name-column-production-nav').css('margin-top', '-0.4rem');
            var _name = $('<p>').text(production['title']).addClass('profile-nav-production-name');
            _prodBtn.append(
              _iconColumn, 
              _nameColumn.append(Pard.Widgets.FitInBox(_name,125,45).render())
            );
            _prodContainer.append(_prodBtn);
            _compatibleProductions = true;
            _prodBtn.click(function(){
              _contentSel.empty();
              if (_prodBtn.hasClass('content-form-selected')){
                $('.content-form-selected').removeClass('content-form-selected');
                $('.xbtn-production-event-page').remove();
                $('#popupForm').addClass('top-position');
                _formTypeSelector.show();
                _formTypeSelector.attr('disabled',false);
                _profile_item_id = false;
                _formTypeSelector.val('').trigger('change');
                _t2.show();
                loadFormSelector();
              }
              else{
                var _xbtn = $('<span>').addClass('material-icons xbtn-production-event-page').html('&#xE888');
                $('.xbtn-production-event-page').remove();                 
                $('#popupForm').addClass('top-position');
                $('.content-form-selected').removeClass('content-form-selected');
                _prodBtn.append(_xbtn);
                _prodBtn.addClass('content-form-selected');
                _profile_item_id = production.id;
                var _catProduction = production.category;
                var _formaProduction = production.format;
                var formsKey = Object.keys(forms.artist).filter(function(formcat){
                  var _formCategories = forms.artist[formcat].blocks.category.args[0];
                  if (!Array.isArray(_formCategories)) _formCategories =  Object.keys(_formCategories);
                  return $.inArray(_catProduction, _formCategories) >= 0;
                });
                                 
                if (formsKey.length == 1){
                  var _form = Pard.Widgets.CallForm(forms[_type][formsKey[0]], profile);
                  _form.setVal(production);
                  _formTypeSelectorCont.empty();
                  _formTypeSelector = $('<select>');
                  var _emptyOption = $('<option>').text(Pard.t.text('call.form.catPlaceholder')).val('');
                  _formTypeSelector.append(_emptyOption);
                  formsKey.forEach(function(typeForm){
                    _formTypes.push(typeForm);
                    _formTypeSelector.append($('<option>').val(typeForm).text(forms.artist[typeForm]['texts'].label));
                    _formTypeSelectorCont.append(_formTypeSelector);
                    
                  });
                  _formTypeSelector
                    .select2({
                      minimumResultsForSearch: Infinity,
                      dropdownCssClass: 'orfheoTypeFormSelector',
                      placeholder: Pard.t.text('call.form.catPlaceholder')
                    })
                  _formTypeSelector.val(formsKey[0]);
                  _formTypeSelector.trigger('change');
                  _formTypeSelector.attr('disabled',true);
                  _t2.hide();
                  _form.setCallback(function(){
                    _closepopup();
                  });
                  _contentSel.append(_form.render());
                  $('#popupForm').removeClass('top-position');
                }
                else if(formsKey.length>1){
                  _t2.hide(); 
                  _formTypeSelectorCont.empty();
                  _formTypeSelector = $('<select>');
                  var _emptyOption = $('<option>').text(Pard.t.text('call.form.catPlaceholder')).val('');
                  _formTypeSelector.append(_emptyOption);
                  formsKey.forEach(function(typeForm){
                    _formTypes.push(typeForm);
                    _formTypeSelector.append($('<option>').text(forms.artist[typeForm]['texts'].label).val(typeForm));
                    _formTypeSelectorCont.append(_formTypeSelector);
                  });
                  _formTypeSelector
                    .select2({
                      minimumResultsForSearch: Infinity,
                      dropdownCssClass: 'orfheoTypeFormSelector',
                      placeholder: Pard.t.text('call.form.catPlaceholder')
                    })
                    .on('change',function(){
                      if (_formTypeSelector.val()){
                        $('#popupForm').removeClass('top-position');
                        _formTypeSelector.addClass('content-form-selected').css('font-weight','normal');
                        if (_t2) _t2.show();
                        _printForm(_formTypeSelector.val(), production);
                      }
                    });
                }
                else{
                  if (_t2) _t2.hide();
                  var _xbtn = $('<span>').addClass('material-icons xbtn-production-event-page').html('&#xE888');
                  _prodBtn.append(_xbtn);
                  var _formTypeOptionsSelector = $('<select>');
                  var _emptyOpt = $('<option>').text(Pard.t.text('call.form.catPlaceholder')).val('');
                  _formTypeOptionsSelector.append(_emptyOpt);
                  for (var typeForm in forms[profile.type]){
                    if( $.inArray(production.category, forms[profile.type][typeForm].category) > -1){ 
                      _formTypeOptionsSelector.append($('<option>').text(typeForm).val(typeForm));
                    }
                  }
                  _formTypeSelector.hide();
                  _formTypeOptionsSelector.on('change', function(){
                    _printForm(_formTypeOptionsSelector.val(), production);
                  });
                  _formTypeOptionsCont.append(_formTypeOptionsSelector);
                  _formTypeOptionsSelector.select2({
                    minimumResultsForSearch: Infinity,
                    dropdownCssClass: 'orfheoTypeFormSelector',
                    placeholder: Pard.t.text('call.form.catPlaceholder')
                  });

                }
              }
            })
          }
        });
        if (_compatibleProductions) _prodContainer.append(_t2);
        else _prodContainer.empty();
      }
    }


    var showSpaces = function(){
      _prodContainer.empty();
      if(_type == 'space' && spaces && spaces.length){
        var _t1 = $('<div>')
          .append(
            $('<h6>').text(Pard.t.text('call.form.inscribeSpace'))
          )
          .css({
            'margin-top':'1.5rem',
            'margin-bottom':'1rem'
          });
        var _t2 = $('<div>')
          .append(
            $('<h6>').text(Pard.t.text('call.form.newSpace'))
          )
          .css({
            'margin':'1rem 0'
          });
        _prodContainer.addClass('prodContainer-event-page');
        _prodContainer.append(_t1);

        spaces.forEach(function(space){
          var _prodBtn = $('<div>').addClass('production-nav-element-container production-btn-event-page');
          if ($.inArray(space['id'],submittedSpaces)>-1){
            _prodBtn.css('opacity','0.6')
          }
          var _iconColumn = $('<div>')
            .addClass(' icon-column')
            .append(
              $('<div>').addClass('nav-icon-production-container')
                .append($('<div>').addClass('production-icon-container')
                  .append(Pard.Widgets.IconManager('space').render().css({'text-align': 'center', display:'block'})
                  )
                )
            );
          _iconColumn.css({
            'padding':'0.2rem'
          });
          var _nameColumn = $('<div>').addClass('name-column name-column-production-nav').css('margin-top', '-0.4rem');
          var _name = $('<p>').text(space['name']).addClass('profile-nav-production-name');
          _prodBtn.append(
            _iconColumn, 
            _nameColumn.append(Pard.Widgets.FitInBox(_name,125,45).render())
          );
          _prodContainer.append(_prodBtn);
          _prodBtn.click(function(){
            if ($.inArray(space['id'],submittedSpaces)>-1) {
              Pard.Widgets.Alert(Pard.t.text('call.alreadyInscribed.title'), Pard.t.text('call.alreadyInscribed.mex'));
              return false
            }
            _contentSel.empty();
            if (_prodBtn.hasClass('content-form-selected')){
              $('.content-form-selected').removeClass('content-form-selected');
              $('.xbtn-production-event-page').remove();
              $('#popupForm').addClass('top-position');
              _formTypeSelector.show();
              _formTypeSelector.attr('disabled',false);
              _profile_item_id = false;
              _formTypeSelector.val('').trigger('change');
              _t2.show();
              loadFormSelector();
            }
            else{
              var _xbtn = $('<span>').addClass('material-icons xbtn-production-event-page').html('&#xE888');
              $('.xbtn-production-event-page').remove();                 
              $('#popupForm').addClass('top-position');
              $('.content-form-selected').removeClass('content-form-selected');
              _prodBtn.append(_xbtn);
                _prodBtn.addClass('content-form-selected');
              _profile_item_id = space.id;
              var formsKey = Object.keys(forms.space);
                
              if (formsKey.length == 1){            
                var _form = Pard.Widgets.CallForm(forms[_type][formsKey[0]], profile);
                _t2.hide();
                _form.setVal(space);
                _form.setCallback(function(){
                  _closepopup();
                });
                _contentSel.append(_form.render());
                $('#popupForm').removeClass('top-position');
              }
              else {
                _t2.hide(); 
                _formTypeSelectorCont.empty();
                _formTypeSelector = $('<select>');
                var _emptyOption = $('<option>').text(Pard.t.text('call.form.catPlaceholder')).val('');
                _formTypeSelector.append(_emptyOption);
                formsKey.forEach(function(typeForm){
                  _formTypes.push(typeForm);
                  _formTypeSelector.append($('<option>').text(forms.space[typeForm]['texts'].label).val(typeForm));
                  _formTypeSelectorCont.append(_formTypeSelector);
                });
                _formTypeSelector
                  .select2({
                    minimumResultsForSearch: Infinity,
                    dropdownCssClass: 'orfheoTypeFormSelector',
                    placeholder: Pard.t.text('call.form.catPlaceholder')
                  })
                  .on('change',function(){
                    if (_formTypeSelector.val()){
                      $('#popupForm').removeClass('top-position');
                      _formTypeSelector.addClass('content-form-selected').css('font-weight','normal');
                      if (_t2) _t2.show();
                      _printForm(_formTypeSelector.val(), space);
                    }
                  });
              }
            }
          })
        });
        _prodContainer.append(_t2);
      }
    }

    var _printForm = function(_typeFormSelected, profileItem){
      _contentSel.empty();
      if (profileItem) _profile_item_id = profileItem.id;
      else _profile_item_id = false;
      var _form = Pard.Widgets.CallForm(forms[_type][_typeFormSelected], profile);
      _form.setCallback(function(){
        _closepopup();
      });

      if (profileItem) _form.setVal(profileItem); 
      _contentSel.append(_form.render());
    };

    _createdWidget.append(_initialMex)
    _createdWidget.append(_chooseType)

    _createdWidget.append(_outerFormBox.append(_contentSel));

    return{
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closepopup = callback;
      }
    }
  }


  
}(Pard || {}));
