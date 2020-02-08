'use strict';

(function(ns){

  ns.ProgramManager = function(the_event, displayer){

    var artists = the_event.artists;
    var spaces = the_event.spaces;
    var order = the_event.order;
    var _shownSpaces = order;
    var _program = {};

    var _tables = {};
    var _lines = [];
    var _linesLength;
    var _emptySpaces = {};

    var timeManager = Pard.Widgets.TimeManager(the_event.eventTime);
    var hours = timeManager.hours;
    the_event.eventTime = timeManager.eventTime;
    var eventTime = the_event.eventTime.slice();
    if (!Pard.Widgets.IsBlank(the_event.permanents)) eventTime.push({date: 'permanent', time: the_event.permanents});

    var _createdWidget = $('<div>').attr('id', 'programPanel').addClass('program-panel-call-manager');
    var _tableBox = $('<div>').addClass('table-box-call-manager');

    var _timeTableContainer = $('<div>').addClass('time-table-call-manager');
    var _tableContainer = $('<div>').addClass('tableContainer table-container-call-manager');  

    var _artistsList = $('<ul>').addClass('accordion').attr({'data-accordion':'', 'role': 'tablist'}).attr({'id':'artistAccordeon'});
    var _artistsListContainer =  $('<div>')
      .addClass('artist-list-container-call-manager')
      .css({
        'height': '80vh',
        'max-height':(hours.length -1) * Pard.HourHeight
      });
    _artistsListContainer.append(_artistsList);
    var _artistsBlock = $('<div>').addClass('artist-accordeon-call-manager is-active');

    Pard.Widgets.StickTableHeader(_artistsBlock, _tableBox, 220,0)

    var _scrollLeftBtn = $('<button>').attr('type','button').append(Pard.Widgets.IconManager('navigation_left').render().addClass('navigation-btn-icon'));
    var _scrollRightBtn = $('<button>').attr('type','button').append(Pard.Widgets.IconManager('navigation_right').render().addClass('navigation-btn-icon'));

    _scrollRightBtn.mousehold(500,function(){
      var _leftPos = _tableContainer.scrollLeft();
      $(_tableContainer).animate({
        scrollLeft: _leftPos + 528
      }, 500);
    });

    _scrollLeftBtn.mousehold(500,function(){
      var _leftPos = _tableContainer.scrollLeft();
      $(_tableContainer).animate({
        scrollLeft: _leftPos - 528
      }, 500);
    });

    var _scrollers = $('<div>').append( _scrollLeftBtn, _scrollRightBtn).addClass('scrollers-call-managers');
    _timeTableContainer.append(_scrollers);
    Pard.Widgets.StickTableHeader(_scrollers,_tableBox,220,0)

  
    var _timeTable = $('<div>');
    hours.forEach(function(hour, hourIndex){
      if(hour < 10) hour = '0' + hour;
      var _time = $('<div>').html(hour + ':00').addClass('time-timeTable-call-manager');
      _time.css({top: 28 + hourIndex * Pard.HourHeight + "px"});
      var _line = $('<hr>').addClass('line-timeTable-call-manager');
      _line.css({top: 20 + hourIndex * Pard.HourHeight + "px"});
      _lines.push(_line);
      _timeTable.append(_time, _line);
    });
    _timeTableContainer.append(_timeTable);

    var _selectors = $('<div>').addClass('selectors-call-manager');
    var _buttonsContainer = $('<div>').addClass('buttons-container-call-manager');

    var _toolsContainer = $('<div>').addClass('tools-buttons-container');
    var _submitBtnContainer = $('<div>').addClass('submit-program-btn-container');

    var _daySelectorContainer = $('<div>').addClass('day-selector-container-call-manager');
    var _daySelector = $('<select>');

    var _spaceSelectorContainer = $('<div>').addClass('space-selector-container-call-manager');
    var _spaceSelector = $('<select>');
   
    var _artistSelectorContainer = $('<div>').addClass('artists-selector-container-call-manager');
    var _artistSelector = $('<select>');

    var _showArtists = $('<button>').attr('type','button').addClass('show-hide-btn-call-manager');
    var _showIcon = $('<span>')
      .append(
        Pard.Widgets.IconManager('performer').render()
          .css({
            'font-size': '1.3rem',
            'margin-right':'-0.5rem',
            'vertical-align':'.1rem'
          }),
        Pard.Widgets.IconManager('navigation_left').render()
      )
      .addClass('show-artistBlock');

    var _hideIcon = Pard.Widgets.IconManager('navigation_right').render()
      .addClass('hide-artistBlock');
    _showArtists.append(_hideIcon);
    Pard.Widgets.StickTableHeader(_showArtists,_tableBox,220,0);

    _daySelectorContainer.append(_daySelector);
    _spaceSelectorContainer.append(_spaceSelector);
    _artistSelectorContainer.append(_artistSelector);



    var _createTable = function(day, index){
      var _table = $('<div>').css({
        // 'width': 'max-content',
        'height': (hours.length - 1) * Pard.HourHeight + 44
      })
      .addClass('dayTable-programManager');

      var _emptyColumn = $('<div>').css({
        'display': 'inline-block',
        'width': '11rem',
        'height': '100%',
        'vertical-align': 'top',
        'background':'white'
      });
      if($.isEmptyObject(spaces)) _emptyColumn.css({'background':'transparent'});
      _tables[day] = _table;

      _emptySpaces[day] = _emptyColumn;
      _tableContainer.append(_tables[day]);
      if(index != 0)  _tables[day].hide();
      if (day == 'permanent') _daySelector.append($('<option>').val(day).text(Pard.t.text('dictionary.permanent').capitalize()));
      else{
        var date = $('<option>').val(day).text(moment(day).format('DD-MM-YYYY'));
        _daySelector.append(date);
      }
    }

    eventTime.forEach(function(evt, index){
      var day = evt.date;
      _createTable(day, index);
    });

    var _lastSelected = eventTime[0].date;
    var artistProposals, spaceProposals;

    _daySelector.select2({
      dropdownCssClass:'orfheoTableSelector',
      minimumResultsForSearch: Infinity,
      allowClear:false,
      templateResult: Pard.Widgets.FormatResource
    }).on('select2:select', function(){
      Object.keys(artists).forEach(function(profile_id){
        artists[profile_id].setDay(_daySelector.val());
      });
      if(_daySelector.val() == 'permanent') _timeTable.hide();
      else{_timeTable.show();}
      _tables[_lastSelected].hide();
      _tables[_daySelector.val()].show();
      _lastSelected = _daySelector.val();
    });
  
    var _loadSpaceSelector = function(_deletedSpaceId){
      _spaceSelectorContainer.empty();
      _spaceSelector = $('<select>');
      _spaceSelectorContainer.append(_spaceSelector);
       var _emptySpace = $('<option>');
      _spaceSelector.append(_emptySpace);
      spaceProposals = [];
      if(Object.keys(the_event.subcategories.space).length > 1){
        Object.keys(the_event.subcategories.space).forEach(function(category){
          spaceProposals.push({
            type: 'category',
            id: category,
            text: Pard.UserInfo['texts']['subcategories']['space'][category]
          });
        });
      }
      Object.keys(the_event.spaces).forEach(function(proposal_id){
        if (proposal_id != _deletedSpaceId && the_event.spaces[proposal_id].space.selected){
          spaceProposals.push({
            type: 'profile',
            id: proposal_id,
            text: the_event.spaces[proposal_id].space.space_name
          });
        }
      });
      _spaceSelector.select2({
        placeholder: Pard.t.text('dictionary.spaces').capitalize(),
        allowClear: true,
        data: spaceProposals,
        templateResult: Pard.Widgets.FormatResource,
        dropdownCssClass: 'orfheoTableSelector'
      });
      _spaceSelector
        .on("select2:select", function(e) {
          selectSpaces();
          _setScroller();
        })
        .on("select2:unselecting", function(e){
          _shownSpaces = order;
          _adjustTable();
          _shownSpaces.forEach(function(proposal_id, index){
            the_event.spaces[proposal_id].showColumns();
            the_event.spaces[proposal_id].alignPerformances(index);
          });
          $(this).val("");
          $(this).trigger('change');
          e.preventDefault();
          _setScroller();
        })
        .on('reload',function(e,_id, _deletedSpaceId){
          if (!_id || _id == _deletedSpaceId) return _spaceSelector.trigger('select2:unselecting');
          _spaceSelector.val(_id);
          _spaceSelector.trigger('change');
          _spaceSelector.trigger('select2:select');
        })
    }



    var selectSpaces = function(){
      var _data = _spaceSelector.select2('data')[0];
      _shownSpaces = [];
      if(_data['type'] == 'category'){
        order.forEach(function(proposal_id){
          if(the_event.spaces[proposal_id].space.subcategory == _data['id']){
            the_event.spaces[proposal_id].showColumns();
            _shownSpaces.push(proposal_id);
          }
          else{ the_event.spaces[proposal_id].hideColumns();}
        });
      }
      else{
        order.forEach(function(proposal_id){
          if(proposal_id == _spaceSelector.val()){
            the_event.spaces[proposal_id].showColumns();
            _shownSpaces.push(proposal_id);
          }
          else{the_event.spaces[proposal_id].hideColumns();}
        });
      }
      _adjustTable(true);
    }

    var _adjustTable = function(alignPerformances){
      Pard.ColumnWidth = 176;
      _linesLength = '100%';
      var tableWidth = $('.tableContainer').width();
      if(_shownSpaces.length <= (tableWidth-208)/Pard.ColumnWidth ){
        Pard.ColumnWidth = ($('.tableContainer').width() -176)/ _shownSpaces.length
        _linesLength = Pard.ColumnWidth * _shownSpaces.length + 6;
      }
      if (_shownSpaces.length == 0){
        eventTime.forEach(function(evt){
          _emptySpaces[evt.date].css({'background':'transparent'});
        });
      }
      else{
        eventTime.forEach(function(evt){
          _emptySpaces[evt.date].css({'background':'white'});
        });
      }
      _lines.forEach(function(line){
        line.css('width', _linesLength);
      });
      if (alignPerformances) _shownSpaces.forEach(function(proposal_id, index){
        the_event.spaces[proposal_id].alignPerformances(index);
      });
    }

    var _loadArtistSelector = function(_deletedArtistId){
      _artistSelectorContainer.empty();
      _artistSelector = $('<select>');
      _artistSelectorContainer.append(_artistSelector);
      var _emptyArtist = $('<option>');
      _artistSelector.append(_emptyArtist);
      artistProposals = [];
      if(Object.keys(the_event.subcategories.artist).length > 1){
        Object.keys(the_event.subcategories.artist).forEach(function(subcat){
          artistProposals.push({
            type: 'category',
            id: subcat,
            icon: the_event.subcategories.artist[subcat].icon,
            text: Pard.UserInfo['texts']['subcategories']['artist'][subcat]
          });
        });
      }
      Object.keys(the_event.artists).forEach(function(profile_id){
        var hasProposalsSelected;
        if(the_event.artists[profile_id].artist.proposals) hasProposalsSelected = the_event.artists[profile_id].artist.proposals.some(function(proposal){return proposal.selected})
        if (profile_id == _deletedArtistId || !hasProposalsSelected) return false;
        artistProposals.push({
          id: profile_id,
          text: the_event.artists[profile_id].artist.name
        });
      });
      _artistSelector.select2({
        placeholder: Pard.t.text('dictionary.artists').capitalize(),
        data: artistProposals,
        allowClear: true,
        templateResult: Pard.Widgets.FormatResource,
        dropdownCssClass:'orfheoTableSelector'
      });
      _artistSelector
        .on("select2:select", function(e) {
          selectArtists();
        })
        .on("select2:unselecting", function(e){
          Object.keys(artists).forEach(function(profile_id){
            artists[profile_id].accordion.show();
          });
          if(lastArtist && lastArtist.hasClass('is-active')){
            lastArtist.slideToggle();
            lastArtist.removeClass('is-active');
          }
          $(this).val("");
          $(this).trigger('change');
          e.preventDefault();
        })
        .on('reload',function(e,_id, _deletedArtistId){
          if(!_id || _id == _deletedArtistId) return _artistSelector.trigger('select2:unselecting');
          _artistSelector.val(_id);
          _artistSelector.trigger('change');
          _artistSelector.trigger('select2:select');
        })
    }

    var selectArtists = function(){
      var _data = _artistSelector.select2('data')[0];
      if(_data['type'] == 'category'){
        Object.keys(artists).forEach(function(profile_id){
          if (artists[profile_id].artist.proposals.some(function(proposal){
              var check = false;
              if(proposal.selected) check = proposal.subcategory == _data['id'];
              return check;
            })){
            artists[profile_id].accordion.show();
          }
          else{artists[profile_id].accordion.hide();}
        });
      }
      else{
        Object.keys(artists).forEach(function(profile_id){
          if(profile_id == _artistSelector.val()){
            artists[_artistSelector.val()].accordion.show();
            artists[_artistSelector.val()].accordion.find('.accordion-item').trigger('click');
          }
          else{artists[profile_id].accordion.hide();}
        });
      }
    }   

    _loadSpaceSelector();
    _loadArtistSelector();

    _showArtists.on('click', function(){
      _artistsBlock.toggle('slide', {direction: 'right'}, 500);
      if(_artistsBlock.hasClass('is-active')){
        _artistsBlock.removeClass('is-active');
        _showArtists.empty();
        _showArtists.append(_showIcon);
      }
      else{
        _artistsBlock.addClass('is-active');
        _showArtists.empty();
        _showArtists.append(_hideIcon);
      }
    });

    var lastArtist;
    var _closePopup = function(){}

    Pard.Bus.on('spaceDrag', function(drag){
      var index = _shownSpaces.indexOf(drag.space);
      if(drag.direction == 'right' && index < _shownSpaces.length - 1){
        eventTime.forEach(function(evt){
          var date = evt.date;
          the_event.spaces[_shownSpaces[index + 1]].columns[date].after(the_event.spaces[_shownSpaces[index]].columns[date]);
        });
        the_event.spaces[_shownSpaces[index + 1]].alignPerformances(index);
        the_event.spaces[_shownSpaces[index]].alignPerformances(index + 1);
        _shownSpaces.splice(index + 1, 0, _shownSpaces.splice(index, 1)[0]);
      }

      if(drag.direction == 'left' && index > 0){
        eventTime.forEach(function(evt){
          var date = evt.date;
          the_event.spaces[_shownSpaces[index]].columns[date].after(the_event.spaces[_shownSpaces[index - 1]].columns[date]);
        });
        the_event.spaces[_shownSpaces[index - 1]].alignPerformances(index);
        the_event.spaces[_shownSpaces[index]].alignPerformances(index - 1);
        _shownSpaces.splice(index - 1, 0, _shownSpaces.splice(index, 1)[0]);
      }
    });

    Pard.Bus.on('detachPerformance', function(performance){
      the_event.spaces[performance.host_proposal_id].deletePerformance(performance);
    });

    Pard.Bus.on('checkConflicts', function(performance_to_check){
      Pard.Widgets.CheckConflicts(displayer, performance_to_check);
    });

    Pard.Bus.on('addPerformances', function(performances){
      performances.forEach(function(performance){
        if(!the_event.artists[performance.participant_id]) Pard.Bus.trigger('addArtist', (function(p){
          return {
            name: p.participant_name,
            phone: p.phone,
            profile_id: p.participant_id,
            email: p.email,
            own: p.own_participant.is_true()
          }; 
        })(performance))
        create(performance);
      });
      drawProgramTable();    
    });

   

    Pard.Bus.on('modifyPerformances', function(performances){
      if (performances.length){
        const performances_ids_time = performances.map(function(p){return p.id_time});
        const performances_ids = Pard.Widgets.UniqueArray(performances.map(function(p){return p.id}));
        var performancesToDelete =  Object.keys(the_event.program).filter(function(id_time){
          return ($.inArray(the_event.program[id_time].show.id,performances_ids) > -1 && ($.inArray(id_time, performances_ids_time) < 0))
        })        
        performancesToDelete.forEach(function(performance_id_time){
          destroy(the_event.program[performance_id_time].show);
        })
      }

      var programationsUpdated = false;

      performances.forEach(function(performance){
        if(!programationsUpdated){
          Pard.Programations.set(performance.id, performance.dateTime);
          programationsUpdated = true;
        }
        if(the_event.program[performance.id_time]) modify(performance);
        else create(performance);
      });
      drawProgramTable();
    });

    Pard.Bus.on('deletePerformances', function(performances){
      performances.forEach(function(performance){
        destroy(performance);
      });
      drawProgramTable();
    });

    var save = function(performance){
      var show = the_event.program[performance.id_time].show;
      the_event.spaces[show.host_proposal_id].addPerformance(the_event.program[performance.id_time]);
      the_event.artists[show.participant_id].addPerformance(the_event.program[performance.id_time]);
      if (_programTable) _programTable.modify(show);
    }
    
    var create = function(performance){
      the_event.program[performance.id_time] = new Performance(performance);
      save(performance);
    }

    var modify = function(performance){
      var show = the_event.program[performance.id_time].show;
      the_event.spaces[show.host_proposal_id].deletePerformance(show);
      the_event.program[performance.id_time].modify(performance);  // modify the single performance
      save(the_event.program[performance.id_time].show);
    }

    var drawProgramTable = function(){
      if (_programTable) _programTable.draw();
    }

    var destroy = function(performance){
      if(the_event.program[performance.id_time]){
        the_event.spaces[performance.host_proposal_id].deletePerformance(performance);
        the_event.artists[performance.participant_id].deletePerformance(performance);
        the_event.program[performance.id_time].destroy();
        delete the_event.program[performance.id_time];
        _programTable.destroy(performance.id_time);
        if (the_event.artists[performance.participant_id] && the_event.artists[performance.participant_id].hasNoProgramNorProposals()) delete the_event.artists[performance.participant_id];
      }
    }


    var Performance = function(performance){
      return Pard.Performance(displayer, _tables,  performance);
    }

    var _toolsDropdownMenu = Pard.Widgets.ToolsDropdownMenu(the_event, displayer);
    _toolsDropdownMenu.setOrder(order);
   

    var setClickAccordeon = function(profile_id){
      var accordionNav = artists[profile_id].accordion.find('.accordion-item');
      var content = artists[profile_id].accordion.find('.accordion-content');
      accordionNav.unbind('click');
      accordionNav.on('click', function(){
        content.slideToggle();
        $('.selected-accordionItem').removeClass('selected-accordionItem');
        accordionNav.addClass('selected-accordionItem');

        if(lastArtist && lastArtist == content){
          if(lastArtist.hasClass('is-active')){ // if it was open now it is close due to the slide toggle --> so, mark it as not active and remove tha select class to the accordeon item
            lastArtist.removeClass('is-active');
            accordionNav.removeClass('selected-accordionItem');
          }
          else{
            content.addClass('is-active');
          }
        }
        else{
          content.addClass('is-active');
          if(lastArtist && lastArtist.hasClass('is-active')){ // if last artist was open, close it and mark it as not active
            lastArtist.slideToggle();
            lastArtist.removeClass('is-active');
          }
        }
        
        lastArtist = content;
      });
    }

    var _addAccordion = function(profile_id){
      _artistsList.append(artists[profile_id].accordion);
      setClickAccordeon(profile_id);
    }

    _artistsBlock.append(_artistSelectorContainer, _artistsListContainer);
    Object.keys(artists).forEach(function(profile_id){
      _addAccordion(profile_id);      
      artists[profile_id].setDay(_daySelector.val());
    });

  
    Object.keys(_tables).forEach(function(day){
      _tables[day].append(_emptySpaces[day]);
    });

    var _addSpaceColumns = function(proposal_id, call_foundation){
      eventTime.forEach(function(evt){
        var day = evt.date;
        var height = _tables[day].height() - 42;
        the_event.spaces[proposal_id].addColumn(day, height, evt.time);
        _emptySpaces[day].before(the_event.spaces[proposal_id].columns[day]);
        if(call_foundation) the_event.spaces[proposal_id].columns[day].foundation();
      });
    }

    _shownSpaces.forEach(function(proposal_id){
      _addSpaceColumns(proposal_id);
    });

   
    if(the_event.program){
      the_event.program.forEach(function(performance, index){
          _program[performance.id_time] = new Performance(performance);
      });
    }

    the_event.program = _program;
    Object.keys(_program).forEach(function(performance_id_time){
      save(_program[performance_id_time].show);
    });

    var _managerView = $('<div>');
    var _tableView = $('<div>');
    var _programTable, _tableViewSecondScroller;
    $(document).ready(function(){
      var infoProgram = Pard.Widgets.ProgramTableInfo(the_event, displayer);
      _programTable = Pard.Widgets.ProgramTable(infoProgram, the_event);
      _tableViewSecondScroller = _programTable.secondScroller;
      var _compactPermanentBtn = $('<button>')
        .attr('type','button')
        .text(Pard.t.text('manager.program.permanentTable.btn'))
        .click(function(){
          var _permanentTablePopup = Pard.Widgets.Popup();
          var _permanentTable = Pard.Widgets.PermanentTable(the_event);
          _permanentTablePopup.setContent(Pard.t.text('manager.program.permanentTable.title'), _permanentTable.render());
          _permanentTablePopup.setContentClass('space-program-popup-call-manager permanentTable-popupContent');
          _permanentTablePopup.open();
        })
        .addClass('permanentTableBtn');
      _tableView.append(
        _compactPermanentBtn,
        _programTable.render
      );
    })
    var _switcher = $('<div>');
    var _viewSelector = $('<select>');
    var _viewSelectorContainer = $('<div>').addClass('switcherContainer-callPage noselect').append(_viewSelector);
    _switcher.append(_viewSelectorContainer).css('margin-bottom', '0.5rem');
    var _viewTags = [{id:'manager', text: Pard.t.text('manager.program.manageTool'), view:_managerView},{id:'table',text: Pard.t.text('dictionary.table').capitalize(), view:_tableView}];
    var firstTimeTableView = true;
    _viewSelector.select2({
      data: _viewTags,
      minimumResultsForSearch: Infinity,
      dropdownCssClass: 'orfheoTableSelector'
    })
    .on('select2:select', function(){
      _viewSelected.hide();
      _viewSelected = _viewSelector.select2('data')[0].view.show();
      if(_viewSelector.select2('data')[0].id == 'table'){_tableViewSecondScroller.setScroller();
        if(firstTimeTableView){ 
          drawProgramTable();
          firstTimeTableView = false;
        }
      }
    });

    var _secondScroller = Pard.Widgets.SecondScroller(_tableContainer, 0)
    var _setScroller = _secondScroller.setScroller;
    _secondScroller.setClass('secondScroller-programManager');

    _toolsContainer.append(_toolsDropdownMenu.render());
    _tableBox.append(
      _timeTableContainer,
      _tableContainer, 
      _artistsBlock,  
      _showArtists
    );
    _managerView.append( 
      _selectors.append(
        _daySelectorContainer, 
        _spaceSelectorContainer
      )
    );
    _managerView.append(
      _secondScroller.render(),
      _tableBox
    );
    var _innerBtnContainer = $('<div>').append(_toolsContainer,_submitBtnContainer).addClass('innerBtnContainer-programManager');
    _buttonsContainer.append(_innerBtnContainer);

    var _gotUpBtn = Pard.Widgets.goUpBtn().render();

    _createdWidget.append(
      _buttonsContainer
    );
    if ($(window).width() > 640){
      var _viewSelected = _managerView;
      _tableView.hide();
      _createdWidget.append(
        _switcher,
        _managerView
      );
    } 
    _createdWidget.append(  
      _tableView, 
      _gotUpBtn
    );    
 

  	return {
      render: function(){
        setTimeout(function(){_adjustTable(true)},10);
        _setScroller();
        return _createdWidget;
      },
      addArtist: function(artist){
        if(the_event.artists[artist.profile_id].artist.proposals &&the_event.artists[artist.profile_id].artist.proposals.length == 1){
          _addAccordion(artist.profile_id);
          artists[artist.profile_id].accordion.foundation();
        }
        var _id = _artistSelector.val();
        _loadArtistSelector();
        _artistSelector.trigger('reload',[_id]);
        the_event.artists[artist.profile_id].setDay(_daySelector.val());
      },
      addSpace: function(space){
        _addSpaceColumns(space.proposal_id, true);
        order.push(space.proposal_id);
        the_event.order = order;
        var _id = _spaceSelector.val();
        _loadSpaceSelector();
        _toolsDropdownMenu.setOrder(order);
        _spaceSelector.trigger('reload',[_id]);
      },
      deleteArtistproposal: function(artist){
        var artistProgram = the_event.artists[artist.profile_id].program;
        var _performancesToDelete = Object.keys(artistProgram).reduce(function(performance_ids, performance_id_time){
          if(artistProgram[performance_id_time].show.participant_proposal_id == artist.proposal_id) {
            destroy(artistProgram[performance_id_time].show, true);
            performance_ids.push(performance_id_time);
          }
          return performance_ids;
        },[]);
        var _id = _artistSelector.val();
        _programTable.deleteArtistperformances(_performancesToDelete);
        _loadArtistSelector(artist.profile_id);
        _artistSelector.trigger('reload',[_id, artist.profile_id]);
      },
      deleteSpace: function(space){
        var spaceProgram = the_event.spaces[space.proposal_id].program;
        Object.keys(spaceProgram).forEach(function(performance_id_time){
          if(spaceProgram[performance_id_time].show.host_proposal_id == space.proposal_id){
            destroy(spaceProgram[performance_id_time].show);
          }
        });
        order.splice(order.indexOf(space.proposal_id), 1);
        the_event.order = order;
        var _id = _spaceSelector.val();
        _loadSpaceSelector(space.proposal_id);
        _spaceSelector.trigger('reload',[_id, space.proposal_id]);
        Pard.Bus.trigger('orderSpaces', order);
        _toolsDropdownMenu.setOrder(order);
      },
      modifyArtist: function(artist){
        const _performancesToModify = [];
        const e_artist = the_event.artists[artist.profile_id]
        const artistProgram = e_artist.program;
        Object.keys(artistProgram).forEach(function(performance_id_time){ 
          const show = artistProgram[performance_id_time].show
          var proposalObj = e_artist.proposals[show.participant_proposal_id]
          if(proposalObj){
            const proposal = e_artist.proposals[show.participant_proposal_id].proposal
            show['participant_name'] = proposal['name']
            show['title'] = proposal['title']
            show['short_description'] = proposal['short_description']
            show['children'] = proposal['children']
          }
          // _artistName = show['participant_name']
          modify(show, true);
          _performancesToModify.push(performance_id_time);
        });
        const _id = _artistSelector.val();
        e_artist.setDay(_daySelector.val());
        _programTable.modifyArtist(_performancesToModify);
        _loadArtistSelector();
        _artistSelector.trigger('reload',[_id]);
      },
      modifySpace: function(space){
        var _performancesToModify = [];
        var e_space = the_event.spaces[space.proposal_id];
        var spaceProgram = e_space.program;
        Object.keys(spaceProgram).forEach(function(performance_id_time){
          var show = spaceProgram[performance_id_time].show;
          var space = e_space.space;
          show['host_name'] = space['space_name'];
          show['address'] = space['address'];
          modify(show, true);
          _performancesToModify.push(performance_id_time);
        });
        var _id = _spaceSelector.val();
        _programTable.modifySpace(_performancesToModify);
        _loadSpaceSelector();
        _spaceSelector.trigger('reload',[_id]);
      },
      selectArtist: function(artist){
        _loadArtistSelector();
        // deselect _arstist selector
        Object.keys(artists).forEach(function(profile_id){
          artists[profile_id].accordion.show();
        });
        _artistSelector.val("");
        _artistSelector.trigger('change');
        //
        lastArtist = undefined;
        setClickAccordeon(artist.profile_id);
      },
      selectSpace: function(space){
        proposal_id = space.proposal_id;
        if (the_event.spaces[proposal_id].space.selected){
          order.push(proposal_id);
          _addSpaceColumns(proposal_id, true);
        }
        else{
          order.splice(order.indexOf(proposal_id), 1);
          the_event.spaces[proposal_id].deleteColumns(); 
        }
        the_event.order = order;
        _shownSpaces = order;
        _loadSpaceSelector();
        Pard.Bus.trigger('orderSpaces', order);
        _toolsDropdownMenu.setOrder(order);
        _spaceSelector.trigger('reload');
      },
      orderSpaces: function(new_order){
        _spaceSelector.trigger('select2:unselecting');
        _shownSpaces = new_order;
        order = new_order;
        _shownSpaces.forEach(function(space_proposal_id, index){
          if(index == _shownSpaces.length - 1) return;
          eventTime.forEach(function(evt){
            var date = evt.date;
            the_event.spaces[_shownSpaces[index]].columns[date].after(the_event.spaces[_shownSpaces[index + 1]].columns[date]);
          });
          the_event.spaces[space_proposal_id].reorder(index);
          the_event.spaces[space_proposal_id].alignPerformances(index);

        });
        _toolsDropdownMenu.setOrder(new_order);
        _programTable.orderSpaces(new_order);
      },
      assignPrices: function(subcategories_price){
        _programTable.assignPrices(subcategories_price);
      },
      assignPermanentsTime: function(permanents, permanent_activities){
        eventTime['permanent'] = permanents;
        Pard.Bus.trigger('modifyPerformances', permanent_activities);
      }
    }
  }

}(Pard || {}));
