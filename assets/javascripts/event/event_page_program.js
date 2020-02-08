'use strict';

(function(ns){


  ns.PrintProgram = function(program, host, gmap, dataSpaces){
    var _searchResult = $('#searchResult');
    var _windowSize; 
    if ($(window).width() > 1024) _windowSize = 'big';
    else _windowSize = 'small';
    var _printedProgram = $('<div>');
    var _dayBlock = {};
    var _checkPermanent = {};
    var _permanentPerformances = {};
    var indexStore = 0;
    var windowHeigth = $(window).height();
    var performanceCardNumberTreshold = Math.round(windowHeigth / 130 * 1.5) ; // 130 is the heig of the perfonceCard
    performanceCardNumberTreshold = Math.min(performanceCardNumberTreshold, program.length)
    var  _initialDistanceFromTop = $('#searchResult').offset().top;
    var _printOnScroll = function(){
      if (program.length <= indexStore) return ;
      if ($('#searchResult').height() - _initialDistanceFromTop - windowHeigth - $(window).scrollTop() <= 50 ){
        _printer();
      }
    }

    Pard.Bus.off('printOnScroll')
    Pard.Bus.on('printOnScroll', _printOnScroll)
    $(window).scroll(function(){ Pard.Bus.trigger('printOnScroll') })

    var _printer = function(){
      var counter = 0;
      for (var i = indexStore; i < program.length; i++) {
        var performance = program[i]      
        if((host &&  (Pard.Widgets.RemoveAccents(performance.host_name) == host || performance.host_name == host)) || !host){
          if (!_dayBlock[performance.date]) {
            _dayBlock[performance.date] = $('<div>');
            _printedProgram.append(_dayBlock[performance.date]);
            var _day = $('<h4>')
              .text(moment(new Date(parseInt(performance.time))).locale(Pard.Options.language()).format('dddd D'))
              .css({
                'textTransform':'capitalize',
                'color':'#6f6f6f'
              });
            _dayBlock[performance.date].append(_day);
            _checkPermanent[performance.date] = true;
          }
          if (performance.permanent == 'true' && _checkPermanent[performance.date]) {
            var _permanentTitle = $('<div>').append($('<h5>').append(Pard.t.text('event_page.program.permanents'))).addClass('title-program-event-page').css('margin-bottom','1.5rem');
            _checkPermanent[performance.date] = false;
            _dayBlock[performance.date].append(_permanentTitle);
            
          }
          if (_permanentPerformances[performance.id+performance.date]){
            _permanentPerformances[performance.id+performance.date].addTime(performance);
          }
          else{
            var _performanceCard = Pard.Widgets.ProgramCard(performance, host, _windowSize);
          _performanceCard.setNumberClickCallback(
            function(){
              var _index;
              dataSpaces.some(function(space, pos){
                if (space.order == performance.order) {
                  _index = pos;
                  return true;
                }
              });
              gmap.ViewOnMap(_index+1);
              if ($(window).width()>640) $(window).scrollTop(200);
              else $(window).scrollTop(110);
              Pard.PrintProgram(program, dataSpaces[_index].title, gmap, dataSpaces);
            },
            function(){
              gmap.CloseInfoWindow();
              Pard.PrintProgram(program, '', gmap, dataSpaces);
            });
            if(performance.permanent == 'true') _permanentPerformances[performance.id+performance.date] = _performanceCard;
            _dayBlock[performance.date].append(_performanceCard.render());
          }
        }
        counter += 1;
        indexStore = i + 1;
        if (counter >= performanceCardNumberTreshold) {
          break ;
        }
      }
    }
    _printer();

    if(program.length == 0) {
      var _message = $('<h6>').text(Pard.t.text('event_page.program.noResults')).css('color','#6f6f6f');
    _searchResult.empty().append(_message);
    }
    else{
      _searchResult.empty().append(_printedProgram);
    }

    return _printedProgram;

  }

  ns.PrintProgramSpaces = function(program, host, gmap, dataSpaces){
    var _searchResult = $('#searchResult');
    _searchResult.empty();
    var _blocksContainer = $('<div>').addClass('blocks-container-prograByspace');
    _searchResult.append(_blocksContainer);

    var _programObj = Pard.Widgets.ReorderProgramBySpace(program);
    var _space = '';
    var _spaceCatCheck = {};

    var _catBlockObj = {};
    Object.keys(Pard.CachedEvent.subcategories.space).forEach(function(cat){
      var _block = $('<div>').addClass('category-block-program');
      _catBlockObj[cat] = _block;
      _blocksContainer.append(_block);
      _spaceCatCheck[cat] = true;
    })

    var _windowSize; 
    if ($(window).width() > 1024) _windowSize = 'big';
    else _windowSize = 'small';

    for (var hostSpace in _programObj){
      var _spaceBlock = $('<div>');
      var _showBlock = $('<div>');
      var _permanentBlock = $('<div>');
      var _permanentObj={};
      var _showObj = {};
      Pard.Widgets.ReorderProgramCrono(_programObj[hostSpace]).forEach(function(performance){
        if((host &&  (Pard.Widgets.RemoveAccents(performance.host_name) == host || performance.host_name == host)) || !host){
          if (_spaceCatCheck[performance.host_subcategory]){
            var _spaceCat =  performance.host_subcategory;
            _catBlockObj[performance.host_subcategory].append($('<div>').append($('<h4>').append(Pard.UserInfo['texts']['subcategories']['space'][_spaceCat])).addClass('title-program-event-page'));
            _spaceCatCheck[performance.host_subcategory] = false;
          }
          if (performance.host_name != _space || !_space){
            _space =  performance.host_name;
            var _orderNum = performance.order + 1;
           
            var _hostNum = $('<a>').attr('href','#').append(
              $('<img>').attr('src', 'http://www.googlemapsmarkers.com/v1/'+_orderNum+'/FE7569/').css('width','1.4rem')
              );
          
            _hostNum.addClass('host-number-program-card');
           
            var _hostNumX = $('<a>').attr('href','#').append($('<img>').attr('src', 'http://www.googlemapsmarkers.com/v1/'+_orderNum+'/9933FF/'),$('<span>').html('&#xE888').addClass('material-icons x-host-number-simbol-programByspace')).css('position','relative');            
            var numberClick1Callback = function(){
              var _index;
              dataSpaces.some(function(space, pos){
                if (space.order == performance.order) {
                  _index = pos;
                  return true;
                }
              });
              gmap.ViewOnMap(_index + 1);
              if ($(window).width()>640) $(window).scrollTop(200);
              else $(window).scrollTop(110);
              Pard.PrintProgramSpaces(program, dataSpaces[_index].title, gmap, dataSpaces);
            };
            var numberClick2Callback = function(){
              gmap.CloseInfoWindow();
              Pard.PrintProgramSpaces(program, '', gmap, dataSpaces);
            };
            _hostNum.click(function(){
              numberClick1Callback();
            });
            _hostNumX.click(function(){
              numberClick2Callback();
            })
            var _nameNumCont = $('<div>').addClass('nameNum-container-program');
            if (host) _nameNumCont.append($('<span>').append(_hostNumX).css('position', 'relative'));
            else _nameNumCont.append($('<span>').append(_hostNum));
            var _spaceName = $('<a>').append($('<h5>').append(_space)).addClass('space-name-title-program');
            if(performance.host_id.search('own')<0) _spaceName.attr({'href': '/profile?id=' + performance.host_id + '#space&space=' + performance.space_id, 'target':'_blank'});
            else _spaceName.attr('href','#').css({'color':'black', 'text-decoration':'underline','cursor':'default'});
            _spaceBlock.append(_nameNumCont.append(_spaceName));
          }
          var _storingObject;
          if (performance.permanent == 'true') _storingObject = _permanentObj;
          else _storingObject = _showObj;
          if (!_storingObject[performance.id]){
            _storingObject[performance.id] = Pard.Widgets.ProgramBySpaceCard(performance, _windowSize)
            _storingObject[performance.id].addDay(performance)
          }
          else{
            _storingObject[performance.id].addDay(performance);
          }
        }
      });

      _catBlockObj[_programObj[hostSpace][0].host_subcategory].append(_spaceBlock);
      for (var show in _showObj){
        _showBlock.append(_showObj[show].render())
      }
      for (var permanent in _permanentObj){
        _permanentBlock.append(_permanentObj[permanent].render())
      }
      _spaceBlock.append(_showBlock, _permanentBlock);
    }

    if(program.length == 0) {
      var _message = $('<h6>').text(Pard.t.text('event_page.program.noResults')).css('color','#6f6f6f');
      _searchResult.append(_message);
    }

  }

  ns.Widgets.ReorderProgramBySpace= function(program){
    var _prObj = {};
    program.forEach(function(performance){
      if(!(_prObj[performance.order])) _prObj[performance.order] = [performance];
      else _prObj[performance.order].push(performance);
    });
    return _prObj;
  }

  ns.Widgets.ProgramBySpaceCard = function(performance, size){
    var _progCard = $('<div>').addClass('programBySpace-card-container');
    var _time = $('<span>');
    var _participantCatIcon = Pard.Widgets.IconManager(performance.participant_category).render().addClass('participant-category-icon').css({'margin':'0rem .3rem 0rem 0rem'});
   
    var _title = $('<span>').text(performance.title).addClass('title-program-card');
    var _participant = $('<a>').text(performance.participant_name);
    if (performance.participant_id.search('own')<0) _participant.addClass('participant-program-card').attr({'href': '/profile?id=' + performance.participant_id, 'target':'_blank'});
    else _participant.addClass('participant-program-card-own').attr({'href': '#'});
   
    var _iconType = 'children';
    if (performance.children == 'baby') _iconType = 'baby'
    var _childrenIcon = $('<div>').append(
      Pard.Widgets.IconManager(_iconType).render().addClass('participant-catagory-icon icon-children-program')
    )
    .addClass('col1-program-card')
    .css({'width':'auto'});
    var _childrenText = $('<div>').append(Pard.t.text('widget.inputChildren')[performance.children]).addClass('col2-program-card'); 
    var _childrenR = $('<div>').append(
      _childrenIcon,
      _childrenText
    )
    var _shortDescription =$('<div>').append(performance.short_description);
    var _iconContainer = $('<span>').append(_participantCatIcon);
  
    
    var _timePlaceContainer = $('<div>').append(
      _time
    );
      
    var _titleHostContainer = $('<div>').append(
      _iconContainer,
      _title, 
      ' ',
      _participant
    );
    _progCard.append(
      _timePlaceContainer.css({'margin-bottom':'.3rem'}),
      _titleHostContainer, 
      _shortDescription,
      _childrenR.css({'margin-top':'.3rem'})
    );

    var _daysContainers = {};

    return {
      render: function(){
        return _progCard;
      },
      addDay:function(performance){
        var _timeKey = performance.date;
        if (!_daysContainers[_timeKey]){
          _daysContainers[_timeKey] = $('<span>').append(moment(new Date(parseInt(performance.time[0]))).locale(Pard.Options.language()).format('dddd D').capitalize()+': ');
          if(_time.html()) _time.append(' / ');
          _time.append(_daysContainers[_timeKey]);
        }
        else {
          _daysContainers[_timeKey].append(', ');
        }
        _daysContainers[_timeKey].append(moment(performance.time[0], 'x').format('HH:mm') + ' - ' + moment(performance.time[1], 'x').format('HH:mm'));
      }
    }
  }

 
  ns.Widgets.ProgramCard = function(performance, host, size){
    var _progCard = $('<div>').addClass('program-card-container');
    var _time = $('<div>').append(moment(performance.time[0], 'x').format('HH:mm') + ' - ' + moment(performance.time[1], 'x').format('HH:mm'));
    var _participantCatIcon = Pard.Widgets.IconManager(performance.participant_category).render().addClass('participant-category-icon');
    var _orderNum = performance.order +1;
    // var _hostNum = $('<a>').attr('href','#').append($('<img>').attr('src', 'http://www.googlemapsmarkers.com/v1/'+_orderNum+'/FE7569/'));
    var _hostNum = $('<button>')
      .attr('type','button')
      .append(
        $('<img>').attr('src', 'https://maps.google.com/mapfiles/ms/icons/red.png'), 
        $('<span>').text(_orderNum).addClass('orderNum-location-icon')
      )
      .css('position','relative');
   
    _hostNum.addClass('host-number-program-card');
    var _X = $('<span>').html('&#xE888').addClass('material-icons');
    var _hostNumX = $('<button>')
      .attr('type','button')
      .append(
        $('<img>').attr('src', 'https://maps.google.com/mapfiles/ms/icons/purple.png'), 
        $('<span>').text(_orderNum).addClass('orderNum-location-icon'),
        _X
      )
      .css('position','relative')
      .addClass('host-number-program-card');

    var numberClick1Callback;
    var numberClick2Callback;
    _hostNum.click(function(){
      numberClick1Callback();
    });
    _hostNumX.click(function(){
      numberClick2Callback();
    })
    var _title = $('<span>').text(performance.title).addClass('title-program-card');
    var _participant = $('<a>').text(performance.participant_name);
    if (performance.participant_id.search('own')<0) _participant.addClass('participant-program-card').attr({'href': '/profile?id=' + performance.participant_id, 'target':'_blank'});
    else _participant.addClass('participant-program-card-own').attr({'href': '#'});
    var _host = $('<a>').text(performance.host_name);
    if(performance.host_id.search('own')<0) _host.addClass('host-program-card').attr({'href': '/profile?id=' + performance.host_id + '#space&space=' + performance.space_id, 'target':'_blank'});
    else _host.addClass('host-program-card-own').attr({'href': '#'});
    var _iconType = 'children';
    if (performance.children == 'baby') _iconType = 'baby'
    var _childrenIcon = $('<div>').append(
      Pard.Widgets.IconManager(_iconType).render().addClass('participant-catagory-icon icon-children-program')
    )
    .addClass('col1-program-card');
    var _childrenText = $('<div>').append(Pard.t.text('widget.inputChildren')[performance.children]).addClass('col2-program-card'); 
    var _childrenR = $('<div>').append(
      _childrenIcon,
      _childrenText
    )

    var _shortDescription = performance.short_description;
    var _priceIcon, _priceR;
    var _performancePrice = performance.price || {};
    var _price = _performancePrice.price;
    var _ticket_url = _performancePrice.ticket_url;
    if(!Pard.Widgets.IsBlank(_price) || !Pard.Widgets.IsBlank(_ticket_url)){
      _priceIcon = Pard.Widgets.IconManager('price').render().addClass('price-icon-progam-card');
      _priceR = $('<div>').append(_priceIcon);
      if (!Pard.Widgets.IsBlank(_price)){ 
        var _priceInfo = $('<span>').append(_price,' €');
        _priceR.append(_priceInfo); 
      }
      if (!Pard.Widgets.IsBlank(_ticket_url)){
        var _buyBtn = $('<a>')
          .attr({
            'href': _ticket_url,
            'target': '_blank'
          })
          .addClass('buy-ticket-performance-btn')
          .text(Pard.t.text('event_page.program')[_performancePrice.transition_type]);
        _priceR.append(_buyBtn);
      }
    }

    var _spaceRow = $('<div>').addClass('col2-program-card');
    if (host) {
      _iconLocation = $('<div>')
        .append(
          _hostNumX.addClass('hostNumX-icon')
        ).css('height','1.6rem');
        _spaceRow.css({'padding-left':'.7rem'})
    }
    else {
      _iconLocation = $('<div>')
        .append(
          _hostNum.addClass('hostNum-icon')
        )
        .css('height','1.6rem')    
    }
    _spaceRow.append(_host)
    var _spaceR = $('<div>').append(
      _iconLocation, 
      _spaceRow
    )
    _iconLocation.addClass('col1-program-card');


    if(size == 'big'){
      var _titleRow = $('<div>').addClass('col2-program-card');
      var _descriptionRow = $('<div>').addClass('col2-program-card');
      var _iconContainer = $('<div>').append(
          _participantCatIcon
        )
        .css('height','1.6rem')
        .addClass('col1-program-card');
      _descriptionRow.append(
        $('<p>').append(_title, _participant.css('margin-left','0.3rem')),
        $('<p>').append(_shortDescription)
      );
      var _timeIcon = $('<div>')
        .text('h:')
        .addClass('col1-program-card')

      _X.addClass('x-host-number-simbol');
      _spaceRow.append(_host);
      _iconLocation.addClass('col1-program-card');
      _titleRow.append(_time);
      var _timeR = $('<div>').append(
        _timeIcon,
        _titleRow
      );
      var _iconDescriptionR = $('<div>').append(
        _iconContainer,
        _descriptionRow
      )
      var _spaceR = $('<div>').append(
        _iconLocation, 
        _spaceRow
      )
      _progCard.append(
        $('<div>').append(
          _timeR.addClass('column-1_2'), 
          _childrenR.addClass('column-1_2')
        ).css('margin-bottom','.5rem'),
        _iconDescriptionR.css('margin-bottom','.5rem'),
        _spaceR.css({'line-height':'1.2rem'})
      );
      if (_priceR) _progCard.append(_priceR.css({'text-align':'right'}));

    }
    else{
      var _timeRow = $('<div>').append('h:',' ',_time.addClass('time-smallScreen-program'));
      _X.addClass('x-host-number-simbol-small');
      _timeRow.append($('<div>').append(_participantCatIcon).addClass('icons-smallScreen-program'));
      var _titleRow = $('<div>').append($('<div>').append(_participantCatIcon).addClass('icons-smallScreen-program'),' ',_title, ' ',_participant);
      _progCard.append(
        _timeRow.css({'margin-bottom':'.3rem'}),
        _titleRow, 
        _shortDescription,
        _childrenR.css({'margin':'.3rem 0rem'}),
        _spaceR
      );
      if(_priceR) _progCard.append(_priceR.css({'text-align':'right'}));
    }

  

    return {
      render: function(){
        return _progCard;
      },
      setNumberClickCallback: function(callback1, callback2){
        numberClick1Callback = callback1;
        numberClick2Callback = callback2;
      },
      addTime: function(performanceToAdd){
        _time.append(', '+moment(performanceToAdd.time[0], 'x').format('HH:mm') + ' - ' + moment(performanceToAdd.time[1], 'x').format('HH:mm'))
      }
    }
  }

}(Pard || {}));
