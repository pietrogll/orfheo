'use strict';

(function(ns){

	ns.Widgets = ns.Widgets || {};

	ns.Widgets.PerformancesSubmitted = function(the_event, shows){
    var _dateTime = [];
    var ids = [];
    var _shows = shows.filter(function(show){
      _dateTime.push({date: show.date, time: show.time, id_time: show.id_time}); 
      if ($.inArray(show.id, ids)<0){
        ids.push(show.id);
        return true;
      }
      return false;
    }).map(function(show){
      show.dateTime = _dateTime;
      return show;
    })
    return {
      event_id: the_event.id,
      program: _shows,
      signature: Pard.Signature
    }
	}

	ns.Widgets.ArtistShows = function(performance, remove_performance){
    var the_event = Pard.CachedEvent;
    var _artistProgram = the_event.artists[performance.participant_id].program;
    if (Pard.Widgets.IsBlank(performance.permanent)) return [_artistProgram[performance.id_time].show];
    var _shows = Object.keys(_artistProgram).map(function(performance_id_time){
      return _artistProgram[performance_id_time].show;
    });
    if(!the_event.program[performance.id_time]) performance.host_id = _shows[0].host_id;
    var _permanentShows = _shows.filter(function(show){
      if (remove_performance) return (show.id == performance.id && show.id_time != performance.id_time);
      return (show.id == performance.id);
    }).map(function(show){
      for (var k in performance){
        if($.inArray(k, ['id_time', 'date', 'time']) < 0) show[k] = performance[k]
      }
      return show;
    });
    return _permanentShows;
  }




	ns.Widgets.CheckConflicts = function(displayer, performance_to_check){
    var the_event = Pard.CachedEvent;
    var artistProgram = the_event.artists[performance_to_check.participant_id].program;
    var myPerformances = Object.keys(artistProgram).map(function(performance_id_time){
      return artistProgram[performance_id_time].show;
    });
  
    var _conflictPerformances = Pard.Widgets.ConflictPerformances(myPerformances);


    if(
      Pard.Programations.get(performance_to_check.id).some(function(programation){
      return $.inArray(programation.id_time, _conflictPerformances) >= 0
      })
    ){
      displayer.close();
      displayer.displayArtistProgram(performance_to_check.participant_id);
    }
	}

  ns.Widgets.ConflictPerformances = function(myPerformances){

    var _conflictPerformances = [];

    if (myPerformances) myPerformances = Pard.Widgets.ReorderProgramCrono(myPerformances);
    myPerformances.forEach(function(performance, index){
      for(let i = index + 1; i < myPerformances.length; i++){
        if(performance.permanent == 'true' || myPerformances[i].permanent == 'true'){
          if(myPerformances[i].participant_proposal_id == performance.participant_proposal_id && myPerformances[i].host_proposal_id != performance.host_proposal_id){
            if(myPerformances[i].time[0] < performance.time[1]){
              _conflictPerformances.push(performance);
              _conflictPerformances.push(myPerformances[i]);
            }
          }
        }
        else if(myPerformances[i].permanent == 'false'){
          if(myPerformances[i].host_proposal_id != performance.host_proposal_id && myPerformances[i].time[0] < performance.time[1]){
            _conflictPerformances.push(performance);
            _conflictPerformances.push(myPerformances[i]);
          }
        }
      }
    });

    return _conflictPerformances.map(function(p){return p.id_time});
  }


  ns.Widgets.CommentsInputField = function(){

    var _createdWidget = $('<div>');

    var _inputsObj = {};

    var printField = function(key, label, placeholder){
      var _fieldContainer = $('<div>');
      var placeholder = placeholder || '';
      var _label = $('<label>')
        .text(label);
      var input = $('<textarea>')
        .attr({
          placeholder: placeholder,
          rows: 2
        });
      _createdWidget.append(
        _fieldContainer.append(
          _label,
          input
        )
      )
      _inputsObj[key] = input;
    }

    printField('needs',Pard.t.text('widget.inputComments.label_needs'),'');
    printField('comments', Pard.t.text('widget.inputComments.label'), Pard.t.text('widget.inputComments.placeholder'));

    return{
      render: function(){
        return _createdWidget;
      },
      getVal: function(){
        var values = {};
        for(var k in _inputsObj){
          values[k] = _inputsObj[k].val();
        }
        return values;
      },
      setVal: function(value){
        for(var k in value){
          if (_inputsObj[k]) _inputsObj[k].val(value[k]);
        }
      },
      enable: function(){
        for(var k in _inputsObj){
          _inputsObj[k].attr('disabled',false);
        }
      },
      disable: function(){
        for(var k in _inputsObj){
          _inputsObj[k].attr('disabled', true);
        }
      }
    }
  }


  ns.Widgets.PerformancePriceInputField = function(){

    var _createdWidget = $('<div>');
    var _label = $('<label>')
      .text(Pard.t.text('widget.inputPerformancePrice.label'))
    var _input = Pard.Widgets.PerformancePriceInput();

    _createdWidget.append(
      _label,
      _input.render()
    ); 


    return{
      render: () => _createdWidget,
      getVal: () => _input.getVal(),
      setVal: val => {_input.setVal(val)},
      enable(){_input.enable()},
      disable(){ _input.disable()}
    }
  }

  ns.Widgets.InputChildrenField = function(){

    const _childrenInput = Pard.Widgets.InputChildren();
    const _inputRendered = _childrenInput.render();
    let _changed = false;

    _inputRendered.on('change', function(){
      _changed = true;
    }); 

    return {
      render:() => $('<div>').append(
          $('<label>').text(Pard.t.text('production.form.childrenL')),
          _inputRendered
        ),
      getVal(){
        var val = _childrenInput.getVal();
        if(!_changed) val = null;
        return val;
      },
      setVal(valToSet){
        _childrenInput.setVal(valToSet);
      },
      disable(){
        _childrenInput.disable();
      },
      enable(){
        _childrenInput.enable();
      }
    }
  };

  ns.Widgets.CategorySelectorField = function(){

    var participant_category, proposal;
    var _categoryContainer = $('<div>');
    var _categorySelector = $('<select>');
    var _changed = false;
    var the_event = Pard.CachedEvent;

    var _trigger = function(selection){
      _categoryContainer.removeClass('warning');
      _categoryContainer.empty();
      if(the_event.subcategories.artist[selection].length == 1){
        participant_category = the_event.subcategories.artist[selection][0];
        _categoryContainer.removeClass('warning');
      }
      else{
        _categorySelector = $('<select>');
        the_event.subcategories.artist[selection].forEach(function(cat){
            _categorySelector.append(
              $('<option>').val(cat).text(Pard.t.text('categories')[cat])
            )
          })
        _categoryContainer.append(
          _categorySelector
        );
        participant_category = _categorySelector.val();
        _categorySelector.on('change', function(){
          participant_category = _categorySelector.val();
          _changed = true;
          _categoryContainer.removeClass('warning');
        })
      }
    }

    return {
      render: () => _categoryContainer,
      getVal(){
        var val = participant_category;
        if(proposal && !_changed) val = null;
        return val;
      },
      setVal(valToSet, proposalValues){
        _categorySelector.val(valToSet);
        _categorySelector.trigger('change');
        proposal = proposalValues;
      },
      disable(){_categorySelector.attr('disabled','disabled')},
      enable(){_categorySelector.removeAttr('disabled')},
      trigger(subcat){_trigger(subcat)},
      addWarning(){_categoryContainer.addClass('warning')}
    }
  }


  ns.Widgets.SubcategorySelectorField = function(){
    
    let proposal, _categorySelector;

    const _subcategoryContainer= $('<div>');
    const _label = $('<label>').text(Pard.t.text('widget.subcategorySelectorField.label'))
    const _categoryContainer = $('<div>');
    const _subcategorySelector = $('<select>');
    const the_event = Pard.CachedEvent;

    let _changed = false;

    _subcategoryContainer.append(
      _label,
      _subcategorySelector, 
      _categoryContainer
    );
    const _subcategoryOptions = Object.keys(the_event.texts.subcategories.artist).map(function(k){
      return{
        id: k,
        text: the_event.texts.subcategories.artist[k]
      }
    });
    _subcategoryOptions.unshift({id:'',text:''});
    _subcategorySelector.select2({
      data: _subcategoryOptions,
      dropdownCssClass: 'orfheoTableSelector',
      placeholder: Pard.t.text('widget.subcategorySelectorField.placeholder')
    })
    .on('select2:select', function(){
      _categorySelector.trigger(_subcategorySelector.val());
      _changed = true; 
      _subcategoryContainer.removeClass('warning')
    });

    return {
      render: () => _subcategoryContainer,
      getVal(){
        let val = _subcategorySelector.val();
        if(proposal && !_changed) val = null;
        return val;
      },
      setVal(valToSet, proposalValues){
        _subcategorySelector.val(valToSet);
        _subcategorySelector.trigger('change');
        _subcategorySelector.trigger('select2:select');
        proposal = proposalValues;
      },
      disable(){_subcategorySelector.attr('disabled','disabled')},
      enable(){_subcategorySelector.removeAttr('disabled')},
      setCategorySelector: categorySelector => _categorySelector = categorySelector,
      addWarning: () => _subcategoryContainer.addClass('warning')
    }
  }


  ns.Widgets.ShortDescriptionManagerField = function(){
    var shortDescriptionContainer = $('<div>');
    var _changed = false;
    var shortDescription = $('<textarea>')
      .attr({
        rows: 2, 
        maxlength: 140, 
        placeholder:Pard.t.text('dictionary.short_description')
      })
      .on('change', function(){
        _changed = true;
      })
    var _remainingCar = $('<span>')
      .text(140)
      .css({'display': ' inline-block', 'font-weight': 600})
      .text(140 - shortDescription.val().length);
    var _helptext = $('<p>')
      .append('Quedan: ', _remainingCar,'.')
      .addClass('help-text')
      .css({'text-align':'right'});
    shortDescriptionContainer
      .append(shortDescription, _helptext.hide())
      .addClass('short_description-performanceManager');

    shortDescription.on('input', function(){
      _remainingCar.text(140 - shortDescription.val().length);
    });

    var proposal;

    return {
      render: () => shortDescriptionContainer,
      getVal(){
        var val = shortDescription.val();
        if(proposal && !_changed) val = null;
        return val;
      },
      setVal(valToSet, proposalValues){
        shortDescription.val(valToSet);
        proposal = proposalValues;
      },
      disable(){
        shortDescription.attr({
          disabled: true
        });
        _helptext.hide();
      },
      enable(){
        shortDescription.attr({
          disabled: false
        });
        _helptext.show();
      }
    }
  }


  ns.Widgets.TitleManagerField = function(){

    var titleContainer = $('<div>');
    var _changed = false;
    var titleBox = $('<input>')
      .attr({
        type: 'text', 
        placeholder: Pard.t.text('dictionary.title')
      })
      .on('change', function(){
        _changed = true;
      });
    titleContainer.append(
      $('<label>').text(Pard.t.text('widget.titleManagerField.label')),
      titleBox
    );

    var proposal;

    return {
      render: () => titleContainer,
      getVal(){
        var val = titleBox.val();
        if(proposal && !_changed) val = null;
        return val;
      },
      setVal(valToSet, proposalValues){
        titleBox.val(valToSet);
        proposal = proposalValues;
      },
      disable(){
        titleBox.attr({
          disabled: true
        });
      },
      enable(){
        titleBox.attr({
          disabled: false
        });
      }
    }
  }



  


}(Pard || {}));
