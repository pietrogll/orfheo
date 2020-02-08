'use strict';

(function(ns){

  ns.Space = function(space, displayer){
    var columns = {};
    var _columns = {};
    var program = {};
    var _performance;
    var _performances;
    var columnsIndex;

    Pard.Bus.on('drag', function(performance){
      _performance = performance;
    });

    Pard.Bus.on('dragPermanents', function(performances){
      _performances = performances;
    });

    var SpaceColumn = function(day, height, dayTime){
      var _spaceCol = $('<div>').addClass('spaceCol');
      _spaceCol.css({
        'display': 'inline-block',
        'width': '11rem',
        'border-style': 'solid',
        'border-width': '1px',
        'border-color': 'black'
      });

      var _spaceHeaderOuterContainer = $('<div>').css({
        'height':0,
        position:'relative'
      });
      var _spaceHeaderContainer = $('<div>')
        .addClass('spaceHeaderContainer');
      Pard.Widgets.StickTableHeader(_spaceHeaderContainer,_spaceCol, 220,0);
      var _spaceHeader = $('<div>').addClass('spaceHeader space-column-header cursor_grab');
      var _icon = SpaceDropdownMenu().render();
      var _menuIcon = $('<div>').append(_icon);
      _menuIcon.css({
        'display': 'inline-block',
        'vertical-align': 'middle',
      });
      _spaceCol.append(_menuIcon);

      var _spacename = $('<div>');
      _spacename.addClass('space-name-container-call-manager');
      var _titleText = $('<a>').attr('href','#/');
      _titleText.text(Pard.Widgets.CutString((space.index + 1) + '. ' + space.space_name, 35));
      _spacename.append($('<p>').addClass('space-name-headerTable-call-manager').append(_titleText));
      _spaceHeader.append(_spacename, _menuIcon);
      _spaceCol.append(
        _spaceHeaderOuterContainer.append( 
          _spaceHeaderContainer.append(_spaceHeader)
        )
      );

      _spaceHeader.mousedown(function(){
        _spaceHeader.removeClass('cursor_grab').addClass('cursor_move');
      });
      _spaceHeader.mouseup(function(){
        _spaceHeader.removeClass('cursor_move').addClass('cursor_grab');
      });

      //Popup showing the space form
      _titleText.on('click', function(){
        displayer.displayProposal(space, 'space');
      });

      var _time = $('<div>')
        .addClass('spaceTime')
        .html('&nbsp')
        .css({
          'height': height - 2
        });

      if(!Pard.CachedEvent.finished){
        _time
          .css({'cursor': 'crosshair'})
          .dblclick(function() {
            const _createPerformancePopup = Pard.Widgets.Popup();
            const _createPerformanceManager = Pard.Widgets.CreatePerformanceManager(space, day);
            _createPerformanceManager.setSentCallback(() => {
              _createPerformancePopup.close();
              setTimeout(() => {
              _createPerformancePopup.destroy();
              },500)
            });
            _createPerformancePopup.setContent(Pard.t.text('performanceManager.popup.title'), _createPerformanceManager.render());
            _createPerformancePopup.open();
          });
      }

      //Giving background to space if not availabe
      if( day != 'permanent' && space.availability && $.inArray(day, space.availability) < 0) _spaceCol.addClass('space-not-available-call-manager');
      else{_spaceCol.removeClass('space-not-available-call-manager');}

      _time.droppable({
        accept: function(card){
          if(card.hasClass('proposalCard') || card.hasClass('programHelper')) return true;
        },
        drop: function(event, ui) {
          
          var position = ui.helper.position().top -40;
          var _windowScrollTop = $(window).scrollTop();

          var _tableWidth = $('.tableContainer').width();
          var _cardWidth = ui.helper.width();
          var _cardHeight = ui.helper.height();
          var _tableOffset = $('.tableContainer').offset();
          var _cardOffset = ui.helper.offset();
          var _distanceTableFromTop = _tableOffset.top -_windowScrollTop;
          var _rightCorrection = 0;
          var _accordeonOpen = $('.artist-accordeon-call-manager').hasClass('is-active');
          if(_accordeonOpen) _rightCorrection = -$('.artist-accordeon-call-manager').width() + _cardWidth/3;
          
          var is_out = (_distanceTableFromTop + position + _cardHeight < 3) || (_cardOffset.left + _cardWidth*2/3 < _tableOffset.left) || (_cardOffset.left + _cardWidth/3  > _tableOffset.left+_tableWidth + _rightCorrection);

          if(is_out) {
            ui.helper.data('dropped', false);
          }
          else{
            ui.helper.data('dropped', true);
            var colPosition = _time.position().top;
            

            //If the element is higher, its height is adjusted to the top of the _time zone
            if(position < colPosition) position = colPosition;

            //Adjusting to time line
            var _offset = (position - colPosition) % 15;
            if(_offset >= 8) position += 15 - _offset;
            if(_offset < 8) position -= _offset;

            //If the card is below the drop zone it adjustes to the low end
            var duration = Math.round(ui.helper.height() / 5)*5;
            if(position + duration > colPosition + _time.height()) position = colPosition + _time.height() - duration;

            var _sendForm = function(shows){
              return {
                event_id: space.event_id,
                program: shows,
                signature: Pard.Signature
              }
            }

            var create = function(performance){
              performance.host_id = space.profile_id;
              performance.host_proposal_id = space.proposal_id;
              performance.space_id = space.space_id;
              Pard.Backend.createPerformances(_sendForm([performance]), function(data){
                Pard.Bus.trigger(data.event, data.model);
                var last_show = data.model.slice(-1).pop();
                Pard.Bus.trigger('checkConflicts', last_show);
              });
            }

            var createPermanents = function(performance){

              var _performances = [];
              var myShows = Object.keys(program).map(function(performance_id_time){
                return program[performance_id_time].show;
              });
              myShows = myShows.filter(function(show){
                return (show.permanent == 'true' && show.participant_proposal_id == _performance.participant_proposal_id);
              });
              if (myShows.length == 0){
                var show = {}
                for(var key in performance){
                  show[key] = performance[key];
                }
                show.space_id = space.space_id;
                show.host_id = space.profile_id;
                show.host_proposal_id = space.proposal_id;
                show.dateTime = [];
                var dt_assigned = false;
                var subcat = Pard.CachedEvent.artists[show.participant_id]['proposals'][show.participant_proposal_id].proposal.subcategory;
                Pard.CachedEvent.permanents.forEach(function(dt){
                  if(!dt.subcategories || $.inArray(subcat, dt.subcategories)>-1){
                    var start = new Date(parseInt(dt.time[0]));
                    var end = new Date(parseInt(dt.time[1]));
                    show.dateTime.push({date: dt.date, time: [start.getTime(), end.getTime()]});
                    dt_assigned = true;
                  }
                });
                if (dt_assigned) Pard.Backend.createPerformances(_sendForm([show]), function(data){
                  if(data.status == 'success'){
                    Pard.Bus.trigger(data.event, data.model);
                    var last_show = data.model.slice(-1).pop();
                    Pard.Bus.trigger('checkConflicts', last_show);
                  }
                  else{
                    Pard.Widgets.Alert(data.reason,'')
                  }
                });
                else Pard.Widgets.Alert(Pard.t.text('dictionary.attention'), Pard.t.text('error.noPermanentsTime')+'"'+Pard.UserInfo['texts']['subcategories']['artist'][subcat]+'".')
              }
            }

            var modifyPermanents = function(performances){
              var dates = [];
              var ids = [];
              var _dateTime = [];
              var shows = performances.filter(function(performance){
                _dateTime.push({date: performance.date, time: performance.time, id_time: performance.id_time}); 
                if ($.inArray(performance.id, ids)<0){
                  ids.push(performance.id);
                  return true;
                }
                return false;
              }).map(function(performance){
                Pard.Bus.trigger('detachPerformance', performance);
                var show = {}
                for(var key in performance){
                  show[key] = performance[key];
                }
                show.host_id = space.profile_id;
                show.host_proposal_id = space.proposal_id;
                show.dateTime = _dateTime;
                return show;
              });

              Pard.Backend.modifyPerformances(_sendForm(shows), function(data){
                Pard.Bus.trigger(data.event, data.model);
                var last_show = data.model.slice(-1).pop();
                Pard.Bus.trigger('checkConflicts', last_show);
              });
            }

            var modify = function(performance){

              Pard.Bus.trigger('detachPerformance', performance);
              var show = {}
              for(var key in performance){
                show[key] = performance[key];
              }
              show.host_id = space.profile_id;
              show.host_proposal_id = space.proposal_id;
              Pard.Backend.modifyPerformances(_sendForm([show]), function(data){
                Pard.Bus.trigger(data.event, data.model);
                Pard.Bus.trigger('checkConflicts', performance);
              });
            }

            if(day == 'permanent'){
              _performance.permanent = 'true';
              if(_performance.id) return modifyPermanents(_performances)
              createPermanents(_performance);
            }
            else{
              _performance.permanent = 'false';
              _performance.date = day;
              var start = new Date(parseInt(dayTime[0]));
              start.setMinutes(start.getMinutes() + (position - colPosition));
              var end = new Date(start.getTime());
              end.setMinutes(start.getMinutes() + duration);
              _performance.time = [start.getTime(), end.getTime()];
              if(_performance.id) return modify(_performance);
              create(_performance);
            }
          }
        }
      });

      _spaceCol.append(_time);
      _spaceCol.draggable({
        containment: '.tableContainer',
        revert: 'invalid',
        axis: 'x',
        handle: '.spaceHeader',
        helper: function(){
          return Pard.Widgets.SpaceHelper(_spaceCol).render();
        },
        start: function(event, ui){
          _spaceCol.addClass('ui-sortable-placeholder');
        },
        drag: function(event, ui){
          _spaceHeader.removeClass('cursor_grab').addClass('cursor_move');
          //We get the original position of the column, necessary for later calculations
          var originalPosition = $(this).data("uiDraggable").originalPosition;
          var position = ui.position.left;

          if (position > (originalPosition.left + Pard.ColumnWidth / 2)){
            Pard.Bus.trigger('spaceDrag', {'direction': 'right', 'space': space.proposal_id});
            $(this).data("uiDraggable").originalPosition = {
              top : originalPosition.top,
              left : originalPosition.left + Pard.ColumnWidth
            }
          }
          if (position < (originalPosition.left - Pard.ColumnWidth / 2)){
            Pard.Bus.trigger('spaceDrag', {'direction': 'left', 'space': space.proposal_id});
            $(this).data("uiDraggable").originalPosition = {
              top : originalPosition.top,
              left : originalPosition.left - Pard.ColumnWidth
            }
          }
        },
        stop: function(event, ui){
          _spaceHeader.removeClass('cursor_move').addClass('cursor_grab');
          _spaceHeader.mousedown(function(){
            _spaceHeader.removeClass('cursor_grab').addClass('cursor_move');
          });
          _spaceHeader.mouseup(function(){
            _spaceHeader.removeClass('cursor_move').addClass('cursor_grab');
          });
          _spaceCol.removeClass('ui-sortable-placeholder');
        }
      });

      var _modify = function(){
        _titleText.text(Pard.Widgets.CutString((space.index + 1) + '. ' + space.space_name, 35));
        if( day != 'permanent' && space.availability && $.inArray(day, space.availability) < 0) _spaceCol.addClass('space-not-available-call-manager');
        else{_spaceCol.removeClass('space-not-available-call-manager');}
      }

      if (!space.selected) _spaceCol.hide();

      

  
      return {
        render: function(){
          return _spaceCol;
        },
        modify: _modify
      }
    }

    var SpaceDropdownMenu = function(){

      var _menu = $('<ul>').addClass('menu');
      
      if(!space.own){
        var _profileLink = $('<li>');
        var _profileCaller = $('<a>').attr({
          target: 'blank',
          href: '/profile?id=' + space.profile_id
        }).text(Pard.t.text('dictionary.profile').capitalize());
        _profileLink.append(_profileCaller);
        _menu.append(_profileLink);
      }

      var _programLink = $('<li>');
      var _programCaller = $('<a>').attr('href','#/').text(Pard.t.text('dictionary.program').capitalize());
      _programCaller.on('click', function(){
        displayer.displaySpaceProgramList(space.proposal_id);
      });
      _programLink.append(_programCaller);
      _menu.append(_programLink);
      
      var _menuContainer = $('<ul>').addClass('dropdown menu').attr({'data-dropdown-menu':true, 'data-disable-hover':true,'data-click-open':true});
      var _iconDropdownMenu = $('<li>').append(
        $('<a>').attr('href','#/').append(
          $('<span>').html('&#xE8EE').addClass('material-icons settings-icon-dropdown-menu')
          )
        ,_menu
      );

      _menuContainer.append(_iconDropdownMenu);

      return {
        render: function(){
          return _menuContainer;
        }
      }
    }

    var AlignPerformances = function(){
      var left = Pard.ColumnWidth * columnsIndex + 1;
      var permanentShows = [];
      var shows = [];
      Object.keys(program).forEach(function(performance_id_time){
        var show = program[performance_id_time].show;
         show.permanent == 'true' ? permanentShows.push(show) : shows.push(show)
      });

      var align = function(){
        shows = Pard.Widgets.ReorderProgram(shows);
        if (shows.length == 0) return;
        var firstPerformance = shows.shift();
        var showStart = [firstPerformance.time[0]];
        var showEnd = [firstPerformance.time[1]];
        program[firstPerformance.id_time].card.css({
          'width': Pard.ColumnWidth - 2,
          'left': left,
          'z-index': 0
        });
        shows.forEach(function(show){
          var _cardIndex = 0;
          showEnd.some(function(endTime, index){
            if(show.time[0] >= endTime){
              _cardIndex = index;
              return true;
            }
            _cardIndex = index + 1;
          });
          if(_cardIndex >= showEnd.length) showEnd.push(show.time[1]);
          else{ showEnd[_cardIndex] = show.time[1];}
          program[show.id_time].card.css({
            'width': (Pard.ColumnWidth - 2) - 10 * _cardIndex,
            'left': left + 10 * _cardIndex,
            'z-index': _cardIndex
          });
        });
      }

      var alignPermanent = function(){
        if (permanentShows.length == 0) return;
        var positions = {};
        var initial_position = 41;
        var shows_ids = [];
        permanentShows.forEach(function(show){
          if($.inArray(show.id, Object.keys(positions)) < 0){
            positions[show.id] = initial_position + Pard.PermanentCardHeight*Object.keys(positions).length
          }
          program[show.id_time].card.css({
            'width': (Pard.ColumnWidth - 2),
            'left': left,
            'top': positions[show.id]
          });
        });
      }
      align();
      alignPermanent();
    }
    var _loadPerformance = function(performance){
      var show = performance.show;
      if(show.permanent == 'false') _columns[show.date].append(performance.card);
      else{
        if(_columns['permanent'].find('.' + show.id).length == 0) _columns['permanent'].append(performance.card);
      }      
      program[show.id_time] = performance;
    }

    return {
      space: space,
      columns: _columns,
      program: program,
      addColumn: function(day, height, dayTime){
        columns[day] = SpaceColumn(day, height, dayTime);
        _columns[day] = columns[day].render();  
      },
      showColumns: function(){
        Object.keys(_columns).forEach(function(date){
          _columns[date].show();
        });
      },
      hideColumns: function(){
        Object.keys(_columns).forEach(function(date){
          _columns[date].hide();
        });
      },
      deleteColumns: function(){
        Object.keys(_columns).forEach(function(date){
          _columns[date].remove();
        });
      },
      modify: function(new_space){
        for(var key in new_space){
          space[key] = new_space[key];
        }
        Object.keys(_columns).forEach(function(date){
          columns[date].modify();
        });
      },
      select: function(){
        space.selected = !space.selected
        if (!space.selected) 
          this.hideColumns();
        else
          this.showColumns();
      },
      modifyParam: function(params){
        space[params['param']] = params['value'];
      },
      reorder: function(new_index){
        space.index = new_index;
        Object.keys(_columns).forEach(function(date){
          columns[date].modify();
        });
        Object.keys(program).forEach(function(performance_id){
          program[performance_id].modify({order: new_index});
        });
      },
      alignPerformances: function(new_index){
        Object.keys(_columns).forEach(function(date){
          _columns[date].css('width', Pard.ColumnWidth);
        });
        if(typeof(new_index) !== 'undefined') columnsIndex = new_index;
        AlignPerformances();
      },
      addPerformance: function(performance){
        _loadPerformance(performance);
        AlignPerformances();
      },
      deletePerformance: function(show){
        delete program[show.id_time];
        if(_columns[show.date].find('.' + show.id).length){
          _columns[show.date].find('.' + show.id).detach();
        }
        if(show.permanent == 'true'){
          if(_columns['permanent'].find('.' + show.id).length) {
            _columns['permanent'].find('.' + show.id).detach();
          }
        }
        AlignPerformances();
      },
      loadPerformance: _loadPerformance
    }
  }
}(Pard || {}));