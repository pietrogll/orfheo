'use strict';

(function(ns){

	ns.Widgets = ns.Widgets || {};


  ns.Widgets.PerformanceManager = function(performance, proposal, check_conflicts){

    const the_event = Pard.CachedEvent;
    let _card, _closePopup;  

    const artistShows = function(){
      return Pard.Widgets.ArtistShows(performance);
    }

    const _sendForm = function(shows){
      return Pard.Widgets.PerformancesSubmitted(the_event, shows);
    } 

    const checkConflicts = function(performance){
      Pard.Bus.trigger('checkConflicts', performance);
    }

    const managerContainer = $('<div>').css({'padding': '0'}).addClass('noselect');
    
    const performanceBox = $('<div>')
      .addClass('noselect performanceManager');
    
    const _programationSelectorsContainer = $('<div>')
      .addClass('performance-programationContainer');
  
    const _upperBtnContainer = $('<div>').css({'text-align':'right'});
    const _modifyBtnContainer = $('<div>').css({'text-align':'right'});

    const spaceSelector = $('<select>');
    const spaceSelectorContainer = $('<div>')
      .append(spaceSelector)
      .addClass('noselect');

  
    const removeInputButton = Pard.Widgets.IconManager('delete')
      .render()
      .addClass('material-icons add-multimedia-input-button-delete abutton')
      .css({
        'font-size':'1.5rem',
        'left':'0'
      });
    
    const modifyIcon = $('<a>')
      .attr('href','#/')
      .append(Pard.Widgets.IconManager('modify').render())
      .addClass('modifyIcon-performanceManager');
    if (the_event.finished){
      modifyIcon.css({
        'color':'#6f6f6f',
        'cursor': 'default'
      });
      removeInputButton.css({
        'color':'#6f6f6f',
        'cursor': 'default'
      });
    }

    const inputConfirmed = $('<input>')
      .attr({type: 'checkbox'});
    const label = $('<label>')
      .html(Pard.t.text('dictionary.confirmed').capitalize())
      .css('display','inline');
    const confirmed = $('<span>')
      .append(inputConfirmed, label)
      .css('margin-left', 5);

    const _addProgramationBtn = $('<button>')
      .attr('type','button')
      .append(
        Pard.Widgets.IconManager('add_circle').render()
      );
    
    _upperBtnContainer.append(
      confirmed, 
      removeInputButton
    );

    _modifyBtnContainer.append(
      modifyIcon
    )


    const _inputsContainer = Pard.Widgets.PerformanceFieldInputs();
    _inputsContainer.setVal(performance, proposal);
    _inputsContainer.disable();

    performanceBox.append(
      _upperBtnContainer,
      spaceSelectorContainer, 
      _programationSelectorsContainer,
      _modifyBtnContainer,
      _inputsContainer.render()
    );


    const _programationManagerContainer = $('<div>').appendTo(_programationSelectorsContainer);

    artistShows().forEach(function(performance, index){
      const _programationManager = Pard.Widgets.ProgramationManager(check_conflicts);
      _programationManager.setVal(performance);
      _programationManager.setModify();
      _programationManager.setClickModifyIcon(function(disable_fields){
        _modifyIconClick(disable_fields);
      })
      _programationManager.setRemovePerformanceBtn(removeInputButton);
      const _programationManagerRendered = _programationManager.render().addClass('programationManager');
      _programationManagerContainer.append(
        _programationManagerRendered
      );
    });


    if (performance.permanent.is_true()){
      const _addProgramationBtnContainer = $('<div>')
      .append(
        _addProgramationBtn
      )
      .css('margin-top','.2rem')
      .appendTo(_programationSelectorsContainer);
    }
    else{
      _programationSelectorsContainer.css('margin-bottom','.5rem');
    }

    _addProgramationBtn.click(function(){
      const _newPerformance = $.extend(true, {}, performance);
      delete _newPerformance.id_time;
      const _as = artistShows();
      _as.push(_newPerformance);

      Pard.Backend.modifyPerformances(_sendForm(_as), function(data){
        Pard.Bus.trigger(data.event, data.model);
        const last_show = data.model.slice(-1).pop();
        if(check_conflicts) checkConflicts(last_show);
        const _programationManager = Pard.Widgets.ProgramationManager(check_conflicts);
        _programationManager.setVal(data.model[data.model.length-1]);
        _programationManager.setModify();
        _programationManager.setClickModifyIcon(function(disable_fields){
          _modifyIconClick(disable_fields);
        })
        _programationManager.setRemovePerformanceBtn(removeInputButton);
        _programationManagerContainer.append(_programationManager.render().addClass('programationManager'));
      });
    })  


    spaceSelector.select2({
      dropdownCssClass: 'orfheoTableSelector'
    })
   
    const _spaceSelect = function(host_proposal_id){
      Pard.Programations.get(performance.id).forEach(function(show){the_event.spaces[performance.host_proposal_id].deletePerformance(show)
      });
      performance.host_proposal_id = host_proposal_id;
      performance.host_id = the_event.spaces[host_proposal_id].space.profile_id;
    }

    Object.keys(the_event.spaces).forEach(function(proposal_id){
      const space = the_event.spaces[proposal_id].space;
      const spaceOption = $('<option>').val(proposal_id).text(space.space_name);
      spaceSelector.append(spaceOption);
    });

    spaceSelector.val(performance.host_proposal_id).trigger('change');

    spaceSelector.on('select2:select',function(e, state){
      _modifyIconClick(true);
      _spaceSelect(spaceSelector.val());
      Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
        Pard.Bus.trigger(data.event, data.model);
        const last_show = data.model.slice(-1).pop();
        if(check_conflicts) checkConflicts(last_show);
      });
    });


    removeInputButton.on('click', function(){
      if (the_event.finished) return false;
      Pard.Backend.deletePerformances(_sendForm(artistShows()), function(data){
          Pard.Bus.trigger(data.event, data.model);
          managerContainer.remove();
          _closePopup();
        });
      performanceBox.remove();
    });

    inputConfirmed.on('change', function(){
      performance.confirmed = inputConfirmed.is(":checked");
      if (performance.confirmed) _card.find('.checker').append(Pard.Widgets.IconManager('done').render());
      else _card.find('.checker').empty();
        _modifyIconClick(true);
        Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
          Pard.Bus.trigger(data.event, data.model);
        });
    });
    
    if (the_event.finished){
      inputConfirmed.attr('disabled',true);
      spaceSelector.attr('disabled',true);
    }


    // MODIFY TITLE AND SHORT DESCRIPTION


    const _modifyIconClick = function(disable_fields){
      if (the_event.finished) return false;
      if(disable_fields || modifyIcon.hasClass('activated')){
        const inputsVal = _inputsContainer.getVal();
        Object.keys(inputsVal).forEach(function(key){
          if (inputsVal[key] != null) performance[key] = inputsVal[key];
        })
        _inputsContainer.disable();
        modifyIcon.empty().append(Pard.Widgets.IconManager('modify').render());
        modifyIcon.removeClass('activated');
      }
      else{
        _inputsContainer.enable();
        modifyIcon.empty().append(Pard.Widgets.IconManager('save').render());
        modifyIcon.addClass('activated');
      }
    };



    if (performance.confirmed == 'true') performance.confirmed = true;
    if (performance.confirmed == 'false') performance.confirmed = false;
    inputConfirmed.prop('checked', performance.confirmed);

    modifyIcon.click(function(){
      _modifyIconClick();
      if (!modifyIcon.hasClass('activated')) Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
        Pard.Bus.trigger(data.event, data.model);
      });
    })


    return {
      setCallback: function(callback){
        _closePopup = function(){
          performanceBox.remove();
          callback();
        }
      },
      render: function(){
        return performanceBox;
      },
      setElement: function(card){
        _card = card;
      }
    }
  }

  

  ns.Widgets.CreatePerformanceManager = function(defaultSpace, defaultDay){
    
    const the_event = Pard.CachedEvent;
    function _closePopup(){};

    const _createdWidget = $('<div>')
    .addClass('noselect performanceManager');  

    const performance = {
      event_id: the_event.id,
      program_id: the_event.program_id
    };  

    const _sendForm = function(shows){
      return Pard.Widgets.PerformancesSubmitted(the_event, shows);
    }
    
/*============
PARTICIPANT 
=============*/

    

    const _participantSelectorContainer = $('<div>')
      .css({
        'margin':'1rem 0',
        'display': 'flex',
        'justify-content': 'space-between'
      });
    const _participantsFieldsContainer = $('<div>');
    
    const _initialInputs = $('<div>');

    let _participantFields;
    const _createParticipantBtn = $('<button>')
      .attr('type','btn')
      .html(Pard.t.text('performanceManager.addParticipantBtn'))
      .click(function(){
        _hiddenInputs.show();
        _participantFields = Pard.Widgets.ParticipantFormFields(the_event);
        _participantsFieldsContainer.empty().append(_participantFields.render()); 
      })
      .addClass('createNewParticipantBtn-performanceManager')

    const _participantSelector = $('<select>');
    _participantSelectorContainer.append(
      $('<div>').append(_participantSelector).css('width','50%'),
      _createParticipantBtn
    );

    _initialInputs.append(
      _participantSelectorContainer
    )

    const _participantsIds = [];
    let _participantOptions = Object.keys(the_event['artists'])
      .map(artist_id => {
        _participantsIds.push(artist_id);
        return {
          id: artist_id,
          text: Pard.CachedEvent['artists'][artist_id].name()
        }
      })
      .concat( Object.keys(the_event['spaces']).map(space_id => {
        _participantsIds.push(the_event['spaces'][space_id]['space']['profile_id']);
          return {
            id: the_event['spaces'][space_id]['space']['profile_id'],
            text: the_event['spaces'][space_id]['space']['name']
          }
        })
      )
      .filter((el, i)=>{
        return i === $.inArray(el.id, _participantsIds)
      });
      _participantOptions = [{id:'',text:''}].concat(_participantOptions);
    _participantSelector.select2({
      data: _participantOptions,
      dropdownCssClass: 'orfheoTableSelector',
      placeholder: Pard.t.text('performanceManager.participantSelector.placeholder')
    })
    .on('select2:select', function(){
      _hiddenInputs.show();
      _participantFields = Pard.Widgets.ParticipantFormFields(the_event);
      _participantsFieldsContainer.empty().append(_participantFields.render()); 
      performance.participant_id = _participantSelector.val();
      let _participant;
      if(the_event.artists[_participantSelector.val()])
        _participant = the_event.artists[_participantSelector.val()].artist;
      else _participant = the_event.spaces[_participantSelector.val()].space;
      _participantFields.setVal(_participant);
      _participantFields.disable();
      _participantSelectorContainer.removeClass('warning'); 
    });

        
/*============
PERMANENTSELECTOR
=============*/

   
    const _permanentSelectorContainer = $('<div>');
    const _permanentSelector = $('<select>')
    _permanentSelectorContainer.append(
      $('<label>').text(Pard.t.text('widget.permanentSelector.label')),
      _permanentSelector
    );
    const _permanentOptions = [
      {
        id: 'false', 
        text: Pard.t.text('widget.permanentSelector.puntual')
      },
      {
        id: 'true', 
        text: Pard.t.text('widget.permanentSelector.permanent')
      }
    ]
    _permanentOptions.forEach(function(opt){
      _permanentSelector.append(
        $('<option>').val(opt.id).text(opt.text)
      )
    })
    _permanentSelector.on('change', function(e, day){
      if (day == 'permanent') _permanentSelector.val('true');
      _programationManagers = {};
      n = 0;
      performance.permanent = _permanentSelector.val();
      _programationManagerContainer.empty();
      if (performance.permanent && performance.permanent.is_true()){
        _addProgramationBtnContainer
          .append(
            _addProgramationBtn
          )
          .css('margin-top','.2rem')
      }
      else{
        _addProgramationBtn.detach();
        _programationSelectorsContainer.css('margin-bottom','.5rem');
      }
      _addProgramationManager(day);

    });

    const _upperContainer = $('<div>');

    _upperContainer.append(
      _participantsFieldsContainer.addClass('participantFieldContainer-PerformanceManager'),
      _permanentSelectorContainer.addClass('permanentSelectorContainer-PerformanceManager') 
    );

   

/*============
PROGRAMATION
=============*/


    const inputConfirmed = $('<input>')
      .attr({type: 'checkbox'});
    const label = $('<label>')
      .html(Pard.t.text('dictionary.confirmed').capitalize())
      .css('display','inline');
    const confirmed = $('<span>')
      .append(inputConfirmed, label)
      .css('margin-left', 5);
    inputConfirmed.on('change', function(){
      performance.confirmed = inputConfirmed.is(":checked");
    });



    const _spaceSelect = function(host_proposal_id){
      spaceSelectorContainer.removeClass('warning');
      performance.host_proposal_id = host_proposal_id;
      performance.host_id = the_event.spaces[host_proposal_id].space.profile_id;
      performance.space_id = the_event.spaces[host_proposal_id].space.space_id;
    }

    const spaceSelector = $('<select>');
    const spaceSelectorContainer = $('<div>')
      .append(spaceSelector)
      .addClass('noselect');


    let _spaceOptions = Object.keys(the_event.spaces).map( proposal_id => {
      const space = the_event.spaces[proposal_id].space;
      return {
        id: proposal_id,
        text:space.space_name
      }
    });

    _spaceOptions = [{id:'',text:''}].concat(_spaceOptions);
    spaceSelector
      .select2({
        data: _spaceOptions,
        dropdownCssClass: 'orfheoTableSelector',
        placeholder: 'select space'
      })
      .on('select2:select',function(){
        _spaceSelect(spaceSelector.val());
      });
    
    if(defaultSpace) spaceSelector.val(defaultSpace.proposal_id).trigger('select2:select').trigger('change'); 

    const _programationSelectorsContainer = $('<div>')
      .addClass('performance-programationContainer');
    const _programationManagerContainer = $('<div>').appendTo(_programationSelectorsContainer);
    const _addProgramationBtnContainer = $('<div>');
    _programationSelectorsContainer.append(
      _programationSelectorsContainer,
      _addProgramationBtnContainer
    )

    
    const _addProgramationBtn = $('<button>')
      .attr('type','button')
      .append(
        Pard.Widgets.IconManager('add_circle').render()
      )
      .click(function(){
        _addProgramationManager();
      })  

    let _programationManagers = {};
    let n = 0;
    const _addProgramationManager = function(day){
      const _programationManager = Pard.Widgets.ProgramationManager();
      if(!performance.permanent.is_true()) _programationManager.removeRemoveBtn();
      n += 1;
      const k = 'k'+n;
      _programationManagers[k] = _programationManager; 
      const _programationsValue = {};
      _programationsValue.permanent = performance.permanent;
      if(day){
        _programationsValue.date = day;
      }
      _programationManager.setVal(_programationsValue);
      _programationManager.reload
      _programationManager.setRemoveCallback(function(){
        delete _programationManagers[k];
      });
      _programationSelectorsContainer.css('margin-bottom','.5rem');
      _programationManager.render().addClass('programationManager');
      const _programationManagerRendered = _programationManager.render().addClass('programationManager');
      _programationManagerContainer.append(
        _programationManagerRendered
      );
    }
    
    _permanentSelector.trigger('change', [defaultDay]);
    
    const _programation = $('<div>').append(
      confirmed,
      spaceSelectorContainer, 
      _programationSelectorsContainer,
    )





/*============
INPUTS FIELDS
=============*/


    const _inputsContainer = Pard.Widgets.PerformanceFieldInputs();
    if (the_event.finished){
      _inputsContainer.disable();
    }


/*============
SUBMIT
=============*/

    const _mandatoryPerformanceFields = {
      'host_id': spaceSelectorContainer
    }

    const _submitBtnContainer = $('<div>');
    const _submitBtn = $('<button>')
      .attr('type','button')
      .text('OK')
      .addClass('submit-button')
      .appendTo(_submitBtnContainer)
      .click(function(){
        let _checkParticipant = !Pard.Widgets.IsBlank(performance.participant_id  );
        if(!_checkParticipant){ 
          _checkParticipant = _participantFields.filled();
          const _participantFieldsVal = _participantFields.getVal();
          for (let k in _participantFieldsVal){
            performance[k] = _participantFieldsVal[k];
          }
        };
        const _checkValues = Object.keys(_mandatoryPerformanceFields).every(function(field){
          const _isFilled = !Pard.Widgets.IsBlank(performance[field]);
          if(!_isFilled) _mandatoryPerformanceFields[field].addClass('warning');
          return _isFilled;
        }) 
        const _checkInput = _inputsContainer.checkVal();
        const inputsVal = _inputsContainer.getVal();
        Object.keys(inputsVal).forEach(function(key){
          performance[key] = inputsVal[key];
        })
        let _checkProgramation = true;
        const performances = Object.keys(_programationManagers).map(function(k){
          const programation = _programationManagers[k].getVal();
          const _isFilled = _programationManagers[k].checkVal();
          if (_checkProgramation) _checkProgramation = _isFilled;
          const _newPerformance = $.extend(true, {}, performance);
          _newPerformance.time = programation.time;
          _newPerformance.date = programation.date;
          return _newPerformance;
        })
        if(_checkParticipant && _checkInput && _checkValues && _checkProgramation){
          const spinner = new Spinner().spin();
          $('body').append(spinner.el);
          Pard.Backend.createPerformances(_sendForm(performances), function(data){
            if(data['status']=='success'){
              Pard.Bus.trigger(data.event, data.model);
              var last_show = data.model.slice(-1).pop();
              Pard.Bus.trigger('checkConflicts', last_show);
              spinner.stop();
              _closePopup();
            }
            else{
              console.log('error createPerformance')
            }
          });
        }
        else{
          _addWarning();
        }
      });

    var _invalidInput = $('<div>').addClass('not-filled-text');
    var _addWarning = function(){
      _invalidInput.text(Pard.t.text('error.incomplete'));
    }


    var _hiddenInputs = $('<div>').append(
      _upperContainer,
      _programation,
      _inputsContainer.render(),
      _invalidInput, 
      _submitBtnContainer
    )
    .hide();


    _createdWidget.append(
      _initialInputs,
      _hiddenInputs
    );


    return {
      setSentCallback: function(callback){
        _closePopup = callback;
      },
      render: function(){
        return _createdWidget;
      }
    }
  }


  ns.Widgets.ProgramationManager = function(check_conflicts){

    var the_event = Pard.CachedEvent;
    var eventTime = the_event.eventTime;

    var _removePerformanceBtn, existing, removeCallback;
    var performance = {};

    var _container = $('<div>');

    var daySelector = $('<select>');
    var daySelectorContainer = $('<div>')
      .addClass('daySelector-performanceManager noselect')
      .append(daySelector)


    var startTime = $('<select>');
    var startTimeContainer = $('<div>')
      .addClass('timeSelector-performanceManager noselect')
      .append(startTime)

    var endTime = $('<select>');
    var endTimeContainer = $('<div>')
      .addClass('timeSelector-performanceManager noselect')
      .append(endTime)

    var removeBtn = $('<button>')
      .attr('type', 'button')
      .addClass('material-icons add-multimedia-input-button-delete')
      .html('&#xE888');
    var removeBtnContainer = $('<div>')
      .addClass('removeBtnContainer-performanceManager')
      .append(removeBtn);


    _container.append(
      daySelectorContainer,
      startTimeContainer, 
      endTimeContainer,
      removeBtnContainer
    );

  
    var _changeDate = function(new_start, new_end){
      var dateArray = performance.date.split('-');
      var start = new Date(new_start);
      var end = new Date(new_end);

      start.setUTCFullYear(parseInt(dateArray[0]));
      end.setUTCFullYear(parseInt(dateArray[0]));

      start.setUTCMonth(parseInt(dateArray[1] - 1));
      end.setUTCMonth(parseInt(dateArray[1] - 1));

      start.setUTCDate(parseInt(dateArray[2]));
      end.setUTCDate(parseInt(dateArray[2]));

      performance.time[0] = start.getTime();
      performance.time[1] = end.getTime();
      setStartTimes();
      setEndTimes();
    }

    var dayStart, dayEnd;

    
    var setStartTimes = function(){
      startTimeContainer.empty();
      startTime = $('<select>');
      startTimeContainer.append(startTime);
      var dayTime = eventTime.find(function(evt){
        return evt.date == performance.date
      })
      dayStart = new Date(parseInt(dayTime.time[0]));
      var maxStart = new Date(parseInt(dayTime.time[1]));
      maxStart.setMinutes(maxStart.getMinutes() - 5);
      var _startOptions = [];
      while(dayStart <= maxStart){
        _startOptions.push({
          id: moment(dayStart).locale(Pard.Options.language()).format('HH:mm'), 
          text: moment(dayStart).locale(Pard.Options.language()).format('HH:mm'),
          time:  dayStart.getTime()
        })
        dayStart.setMinutes(dayStart.getMinutes() + 5);
      };
      startTime.select2({
        data: _startOptions,
        dropdownCssClass: 'orfheoTableSelector',
        placeholder: Pard.t.text('widget.programationManager.startingTime')
      })
        .on('select2:select', function(){
          _container.removeClass('warning');
          var duration;
          if (performance.permanent.is_false()) duration = performance.time[1] - performance.time[0];
          performance.time[0] = parseInt(startTime.select2('data')[0].time);
          if (duration){
            if (performance.time[0] + duration < dayEnd.getTime()) performance.time[1] = performance.time[0] + duration;
            else performance.time[1] = dayEnd.getTime();
          }
          else if (performance.time[0] >= performance.time[1]) {
            performance.time[1] = performance.time[0] + 5 * (Pard.HourHeight * 1000);
          }
          endTime.val(moment(parseInt(performance.time[1])).locale(Pard.Options.language()).format('HH:mm'))
              .trigger('change');

          if (existing){
            _modifyIconClick(true);
            Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
              console.log(data)
              Pard.Bus.trigger(data.event, data.model);
              var last_show = data.model.slice(-1).pop();
              if(check_conflicts) checkConflicts(last_show);
            });
          }

        });

      startTime.on('reload', function(){
        performance.time[0] = parseInt(startTime.select2('data')[0].time);
        startTime.val(moment(performance.time[0]).locale(Pard.Options.language()).format('HH:mm')).trigger('change');
        if (performance.time[0] >= performance.time[1]) {
          performance.time[1] = performance.time[0] + 5 * (Pard.HourHeight * 1000);
          endTime.val(moment(parseInt(performance.time[1])).locale(Pard.Options.language()).format('HH:mm'))
            .trigger('change');
        }
      });
      startTime
        .val(moment(performance.time[0]).locale(Pard.Options.language()).format('HH:mm'))
        .trigger('change');
    }

    var setEndTimes = function(){
      endTimeContainer.empty();
      endTime = $('<select>');
      endTimeContainer.append(endTime);
      var dayTime = eventTime.find(function(evt){
        return evt.date == performance.date
      }) 
      dayEnd = new Date(parseInt(dayTime.time[1]));
      var minEnd = new Date(parseInt(dayTime.time[0] + 5 * (Pard.HourHeight * 1000)));
      var _endOptions = [];
      while(minEnd <= dayEnd){
        _endOptions.push({
          time: minEnd.getTime(), 
          id: moment(minEnd).locale('ese').format('HH:mm'),
          text: moment(minEnd).locale('ese').format('HH:mm')
        });
        minEnd.setMinutes(minEnd.getMinutes() + 5);
      };
      endTime.select2({
        data: _endOptions,
        dropdownCssClass: 'orfheoTableSelector',
        placeholder: Pard.t.text('widget.programationManager.endingTime')
      })
        .on('select2:select', function(){
          _container.removeClass('warning');
          performance.time[1] = parseInt(endTime.select2('data')[0].time);
          if (performance.time[1] <= performance.time[0]) {
            performance.time[0] = performance.time[1] - 5 * (Pard.HourHeight * 1000);
            startTime.val(moment(parseInt(performance.time[0])).locale(Pard.Options.language()).format('HH:mm'))
              .trigger('change');
          }

          if(existing){
            _modifyIconClick(true);
            Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
              Pard.Bus.trigger(data.event, data.model);
              var last_show = data.model.slice(-1).pop();
              if(check_conflicts) checkConflicts(last_show);
            });
          }

        });

      endTime.on('reload', function(){
        performance.time[1] = parseInt(endTime.select2('data')[0].time);
        endTime.val(moment(performance.time[1]).locale(Pard.Options.language()).format('HH:mm')).trigger('change');
        if (performance.time[1] <= performance.time[0]) {
          performance.time[0] = performance.time[1] - 5 * (Pard.HourHeight * 1000);
          startTime.val(moment(parseInt(performance.time[0])).locale(Pard.Options.language()).format('HH:mm'))
            .trigger('change');
        }
      });

      endTime
        .val(moment(parseInt(performance.time[1])).locale(Pard.Options.language()).format('HH:mm'))
        .trigger('change');
    }


    daySelector.select2({
      dropdownCssClass: 'orfheoTableSelector',
      placeholder: Pard.t.text('widget.programationManager.day')
    })
      .on('select2:select', function(){
        _container.removeClass('warning');
        performance.date = daySelector.val();
        performance.time = performance.time || [];
        _changeDate(performance.time[0], performance.time[1]);

        if(existing){
          _modifyIconClick(true);
          Pard.Backend.modifyPerformances(_sendForm(artistShows()), function(data){
            Pard.Bus.trigger(data.event, data.model);
            if(check_conflicts) checkConflicts(performance);
          });
        }

      });

    daySelector.on('reload', function(e, date){
      daySelector.empty();
      daySelector.select2("enable");
      eventTime.forEach(function(evt){
        var _textDay = moment(new Date(evt.date)).locale(Pard.Options.language()).format('DD-MM-YYYY');
        var _date = $('<option>').val(evt.date).text(_textDay);
        daySelector.append(_date);
      });
      daySelector.val(performance.date).trigger('change');
    });  

    var artistShows = function(remove_performance){
      return Pard.Widgets.ArtistShows(performance, remove_performance);
    }

    var _sendForm = function(shows){
      return Pard.Widgets.PerformancesSubmitted(the_event, shows);
    } 

    var checkConflicts = function(performance){
      Pard.Bus.trigger('checkConflicts', performance);
    }


    var _modifyIconClick = function(){};

    if (the_event.finished){
      daySelector.attr('disabled',true);
      endTime.attr('disabled',true);
      startTime.attr('disabled',true);
      removeBtn.remove();
    }


    removeBtn
      .on('click',function(){
        if(existing){
          _modifyIconClick(true);
          if (!Pard.Programations.get(performance.id) || Pard.Programations.get(performance.id).length == 1){
              _removePerformanceBtn.trigger('click');
          }
          else {
            Pard.Backend.modifyPerformances(_sendForm(artistShows(true)), function(data){
              Pard.Bus.trigger(data.event, data.model);
              if(check_conflicts) checkConflicts(performance);
            });
          }
        }
        if(removeCallback) removeCallback();
        _container.remove();
      })

    var _addWarning = function(){
      _container.addClass('warning');
    }

    startTime.select2({
      dropdownCssClass: 'orfheoTableSelector'
    })
    endTime.select2({
      dropdownCssClass: 'orfheoTableSelector'
    })


    return{
      render: () => _container,
      setClickModifyIcon(modifyIconClick){_modifyIconClick = modifyIconClick},
      setRemovePerformanceBtn(btn){_removePerformanceBtn = btn},
      getVal: () => performance,
      setVal(p){
        performance = p;
        daySelector.trigger('reload');
        if (performance.date && performance.date != 'permanent') daySelector.val(performance.date).trigger('select2:select').trigger('change');
        if(performance.time && performance.time.length == 2){
          setStartTimes();
          setEndTimes();
        }
      },
      setModify(){existing = true},
      setRemoveCallback(callback){removeCallback = callback},
      checkVal(){
        var _isFilled = !(Pard.Widgets.IsBlank(performance.date) || performance.time[0] == performance.time[1]);
        if (!_isFilled) _addWarning();
        return _isFilled;
      },
      removeRemoveBtn(){removeBtn.remove()}
    }

  }

  ns.Widgets.ParticipantFormFields = function(the_event){
    const participantForm = $.extend(true,{}, Pard.Forms.Participant);
    
    const _formWidget = Pard.Widgets.FormPrinter(participantForm);

    const _participants_names = Pard.Widgets.GetEventParticipantNames(the_event);
    const _form = _formWidget.getForm();
    _form['name'].input.setParticipants(_participants_names);
    
    return{
      render: () =>_formWidget.render(),
      setVal(values){
        _formWidget.setVal(values);
      },
      getVal: () => _formWidget.getVal(),
      filled: () => _formWidget.filled(),
      disable(){
        _formWidget.disable();
      },
      stopSpinner() { 
        _formWidget.stopSpinner()
      },
      setSend: send => _formWidget.setSend(send)
    }
  }



  ns.Widgets.PerformanceFieldInputs = function(){
    
    var _inputsContainer = $('<div>');

    var titleBox = Pard.Widgets.TitleManagerField();

    var shortDescription = Pard.Widgets.ShortDescriptionManagerField();

    var participant_subcategory = Pard.Widgets.SubcategorySelectorField();

    var participant_category = Pard.Widgets.CategorySelectorField();
    participant_subcategory.setCategorySelector( participant_category);

    var childreInput = Pard.Widgets.InputChildrenField();

    var priceInput = Pard.Widgets.PerformancePriceInputField();

    var comments = Pard.Widgets.CommentsInputField();
    
    var performanceInputs = {
      'participant_subcategory': participant_subcategory,
      'participant_category': participant_category,
      'title': titleBox,
      'short_description': shortDescription,
      'children': childreInput,
      'comments': comments, 
      'price': priceInput
    };

    for(let inputKey in performanceInputs){
      _inputsContainer.append(
        performanceInputs[inputKey].render().addClass(`performanceInput pi-${inputKey}` )
      );
    }

    var mandatoryFields = ['participant_subcategory', 'participant_category',] 


    return{
      render: () => _inputsContainer,
      disable(){
        Object.keys(performanceInputs).forEach(function(key){
          performanceInputs[key].disable();
        })
      },
      enable(){
        Object.keys(performanceInputs).forEach(function(key){
          performanceInputs[key].enable();
        })
      },
      setVal(performance, proposal){
        var _performanceTitle = performance.title || proposal.title;
        var _short_description = performance.short_description || proposal.short_description;
        var _participantSubcategory =   performance.participant_subcategory || proposal.subcategory;
        var participantCategory = performance.participant_category || proposal.category;
        var childrenVal = performance.children || proposal.children;
        titleBox.setVal(_performanceTitle, proposal);
        shortDescription.setVal(_short_description, proposal);
        participant_subcategory.setVal(_participantSubcategory, proposal);
        participant_category.setVal(participantCategory, proposal)
        childreInput.setVal(childrenVal, proposal);
        if(!Pard.Widgets.IsBlank(performance.price)) priceInput.setVal(performance.price);
        if (performance.comments) comments.setVal(performance.comments);
      },
      getVal(){
        var values = {};
        Object.keys(performanceInputs).forEach(function(key){
          values[key] = performanceInputs[key].getVal();
        })
        return values;
      },
      checkVal(){
        return mandatoryFields.every(function(key){
          var _isFilled = performanceInputs[key].getVal() != undefined && performanceInputs[key].getVal() != '';
          if(!_isFilled) performanceInputs[key].addWarning();
          return _isFilled;
        })
      }
    }
  }         
  

}(Pard || {}));
