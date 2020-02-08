'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.BackColor = function(color){
    var _rgb = Pard.Widgets.IconColor(color).rgba(0.8);
    return 'rgb('+_rgb.join(',')+')';
  }

  ns.Widgets.UpdateGallery = function(gallery_elements, array_old_ids){
    
    Pard.CachedProfile['gallery'] = Pard.CachedProfile['gallery'] || [];
    Pard.CachedProfile['gallery'] = Pard.CachedProfile['gallery'].filter(function(el){
        return $.inArray(el['id'], array_old_ids) < 0
      });
    if(gallery_elements && gallery_elements.length) Pard.CachedProfile['gallery'] = Pard.CachedProfile['gallery'].concat(gallery_elements.filter(function(gal){return !$.isEmptyObject(gal)}));
  }

  ns.Widgets.OwnerBlock = function(owner){
    var   _ownerBlock = $('<div>').addClass('inner-div ellipsis');
    var _circleColor = $('<span>')
      .addClass('circle-relation')
      .css({
        'background-color': owner.color,
        'vertical-align': '-.01rem' 
      });
    var _ownerLik = $('<a>')
      .click(function(e){
        e.stopPropagation()
      })
      .text(owner.name)
      .attr({'href':'/profile?id='+owner.id})
    if(!owner.isProfilePage) _ownerLik.attr('target', '_blank');
    _ownerBlock.append(
      _circleColor,
      $('<span>').append('By ', _ownerLik)
    )
    return _ownerBlock;
  }

  ns.Widgets.PrintWebsList = function(personal_webs_obj){

    var _createdWidget = $('<div>');
    var _webArray = Object.keys(personal_webs_obj).map(function(key){return personal_webs_obj[key]});
    var _socialIcons;
    var _personalWebs = $('<div>');
    var _socials = $('<span>');

    _webArray.forEach(function(elem){
      if (elem['provider'] != 'my_web'){
        var _iconSocial = Pard.Widgets.IconManager('icon_social').render().addClass('mySocials-icon-info-box');
        var _iconImg = Pard.Widgets.IconManager(elem['provider']).render();
        _iconImg.addClass('social-icon-fa')
        var _iconA = $('<a>').attr({
          href: elem['url'],
          target: '_blank'
        }).append(_iconImg);
        _socials.append(_iconA);
        _socialIcons = $('<div>').append(
          _iconSocial.addClass('information-contact-icon-column'),
          $('<p>').addClass('information-contact-text-column').append(_socials)
        )
        .addClass('infoList-iconText');
      }
      if (elem['provider'] == 'my_web'){
        var _iconLink = Pard.Widgets.IconManager('my_web').render();
        var _url = elem['url'];
        ['http://', 'https://', 'www.'].forEach(function(string){
          if(_url.indexOf(string) > -1) {
            _url  = _url.substring(string.length);
          }
        })
        var _link = $('<a>').attr({
          href: elem['url'],
          target: '_blank'
        }).css({
          'word-wrap': 'break-word',
        });
        _url.length > 36 ? _link.text(_url.substring(0,34)+'...') : _link.text(_url);
       _personalWebs.append(
        $('<div>').append(_iconLink.addClass('information-contact-icon-column'), 
          $('<p>').addClass('information-contact-text-column').append(_link)).addClass('infoList-iconText')
        );
      }
    });

    if (_socialIcons)  _createdWidget.append(_socialIcons);
    if (_personalWebs.html()) _createdWidget.append(_personalWebs);

    return{
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.ProgramsProfile = function(program, profile_id){
    var _programsContainer = $('<div>');
    $.each(program,function(event_id, program){
      var _programBoxContainer = $('<div>').addClass('section-box-container');
      var _titleContainer = $('<div>').addClass('title-box-container').css({
        'font-size':'1rem',
        'min-height':'2rem'
      });
      var _eventName = $('<a>').html(program.event_name).attr('href','/event?id='+program.event_id+'&lang='+Pard.Options.language());
      _titleContainer.append(
        $('<div>').append(
            $('<span>').append(Pard.t.text('profile_page.upcoming.programation'), _eventName)
        )
      );
      _programBoxContainer.append(_titleContainer);
      var _programContent = $('<div>').addClass('box-content');
      var _day;
      var _permanentBlock = $('<div>');
      var _showBlock;
      var _permanentObj = {};
      Pard.Widgets.ReorderProgramCrono(program.shows).forEach(function(performance){
        if (performance.permanent == 'false'){ 
          if (!(_day) || _day != moment(performance.time[0], 'x').locale(Pard.Options.language()).format('dddd DD MMMM YYYY')) {
            _dayBlock = $('<div>');
            _showBlock = $('<div>');
            _day = moment(performance.time[0], 'x').locale(Pard.Options.language()).format('dddd DD MMMM YYYY');
            var _dayTitle = $('<h6>').append(_day).addClass('title-day-profile-programCard').css({'text-transform': 'capitalize'});
            _dayBlock.append(_dayTitle);
            _dayBlock.append(_showBlock);
            _programContent.append(_dayBlock);
          }
          _showBlock.append(Pard.Widgets.ProgramCardProfile(performance,profile_id).render());
        }
        else if (performance.permanent == 'true') {
          if (_permanentBlock.html()=='') _permanentBlock.append(
             $('<h6>').append(Pard.t.text('dictionary.permanent')).addClass('title-day-profile-programCard').css({'text-transform': 'capitalize'})
            );
          if (!_permanentObj[performance.participant_proposal_id]){
            _permanentObj[performance.participant_proposal_id] = Pard.Widgets.ProgramCardProfilePerm(performance, profile_id)
            _permanentObj[performance.participant_proposal_id].addDay(performance)
          }
          else{
            _permanentObj[performance.participant_proposal_id].addDay(performance);
          }
        }
      });
      for (var p in _permanentObj) _permanentBlock.append(_permanentObj[p].render());
      _programContent.append(_permanentBlock);
      _programBoxContainer.append(_programContent);
      _programsContainer.append(_programBoxContainer);
    })
    

    return _programsContainer;

  }

  ns.Widgets.PastActivities = function(events_activities, profileColor, profileId){
    var _createdWidget = $('<div>').addClass('history-container');

    var _title = $('<p>')
      .append(
        Pard.Widgets.IconManager('participation').render().addClass('iconTitle-history-element'),
        $('<span>').text(Pard.t.text('profile_page.historyBlock.activities')).addClass('title-history-element')
      );
    
    _createdWidget.append(_title);

    events_activities.forEach(function(event_act){
      var _itemBox = $('<div>')
        .addClass('history-element-box')
        .css({
          'border-left': '.2rem solid '+profileColor
        })
      
      var _date = $('<span>')
        .append(moment(event_act.date).locale(Pard.Options.language()).format('YYYY MMM '))
        .addClass('history-element-first');
      var _eventName = $('<span>')
        .append($('<a>').append(event_act.event_name).attr('href','/event?id='+event_act.event_id+'&lang='+Pard.Options.language()))
        .addClass('history-element-middle');
      var _block1 = $('<div>')
        .append(_date, _eventName)
        .addClass('block1-history-element');
      
      var _nShows = $('<span>');
      var _nShowsText = Pard.Widgets.UniqueArray(event_act.shows.map( function(a){return a.id})).length;
      if (_nShowsText == 1) _nShowsText += ' '+Pard.t.text('profile_page.historyBlock.activitiesElementText1');
      else _nShowsText += ' '+Pard.t.text('profile_page.historyBlock.activitiesElementText2');
      _nShows.append(_nShowsText);
      var _seeMoreBtn = $('<button>')
        .addClass('seeMoreBtn-element-history')
        .append(Pard.t.text('profile_page.historyBlock.seeBtn'))
        .attr('type','button')
        .click(function(){
          var _popup = Pard.Widgets.Popup();
          _popup.setContent('', Pard.Widgets.ProgramsProfile([event_act], profileId));
          _popup.setCallback(function(){
            setTimeout(function(){
            _popup.destroy()
          },500);
          });
          _popup.open();
        });
      var _block2 = $('<div>')
        .append(_nShows, _seeMoreBtn)
        .addClass('block2-history-element')


      _itemBox.append(_block1, _block2);
      _createdWidget.append(_itemBox);
    })


    return _createdWidget;

  }


  ns.Widgets.PastEvents = function(events, profileColor, displayer){

    var _createdWidget = $('<div>').addClass('history-container');

    var _title = $('<p>')
      .append(
         Pard.Widgets.IconManager('past_events').render().addClass('iconTitle-history-element'),
        $('<span>').text(Pard.t.text('profile_page.historyBlock.events')).addClass('title-history-element')
      );
    
    _createdWidget.append(_title);

    events.forEach(function(event){
      var _itemBox = $('<div>')
        .addClass('history-element-box')
        .css({
          'border-left': '.2rem solid '+profileColor
        });
      
      var _dates = event.eventTime.map(function(evt){
        return evt.date;
      })
      var _date = $('<span>')
        .append(moment(_dates[0]).locale(Pard.Options.language()).format('YYYY MMM '))
        .addClass('history-element-first');
      var _eventName = $('<span>')
        .append($('<a>').append(event.name).attr('href','/event?id='+event.id+'&lang='+Pard.Options.language()))
        .addClass('history-element-middle');
      var _block1 = $('<div>')
        .append(_date, _eventName)
        .addClass('block1-history-element');
      
      var _nParticipants = $('<span>');
      if (event.participants){
        var _nParticipantsText = event.participants.length;
        if (_nParticipantsText){
          if (_nParticipantsText == 1) _nParticipantsText += ' '+Pard.t.text('profile_page.historyBlock.eventsElementText1');
          else _nParticipantsText += ' '+Pard.t.text('profile_page.historyBlock.eventsElementText2');
          _nParticipants.append(_nParticipantsText);
        }
      }
      var _seeMoreBtn = $('<a>')
        .addClass('seeMoreBtn-element-history')
        .append(Pard.t.text('profile_page.historyBlock.seeBtn'));

      if (event.professional.is_true()){
        _seeMoreBtn.attr({
          'href': '/event?id='+event.id+'&lang='+Pard.Options.language(),
          'target':'_blank'
        })
      }
      else{
        _seeMoreBtn.click(function(e){
          e.preventDefault();
          displayer.displayEvent(event, 'history', true);
        })
      }
       
      var _block2 = $('<div>')
        .append(_nParticipants, _seeMoreBtn)
        .addClass('block2-history-element');


      _itemBox.append(_block1, _block2);
      _createdWidget.append(_itemBox);
    })


    return _createdWidget;

  }


  ns.Widgets.MyCallProposals = function(callProposals, profileColor){

    var _createdWidget = $('<div>').addClass('history-container');

    var _title = $('<p>')
      .append(
         Pard.Widgets.IconManager('call_proposals').render().addClass('iconTitle-history-element'),
        $('<span>').text(Pard.t.text('profile_page.historyBlock.call_proposals')).addClass('title-history-element')
      );
    
    _createdWidget.append(_title);

    var _forms = {};
    
    var _listProposals = $('<ul>');

    for(var proposalType in callProposals){
      callProposals[proposalType].forEach(function(proposal){

        var _itemBox = $('<div>')
          .addClass('history-element-box')
          .css({
            'border-left': '.2rem solid '+profileColor
          });

        var _proposalType = proposalType;
        proposal.name = Pard.CachedProfile.name;
        proposal.phone = Pard.CachedProfile.phone;
        
        var _block1 = $('<div>')
          .append(
            $('<span>').append($('<a>').append(proposal.event_name).attr('href','/event?id='+proposal.event_id+'&lang='+Pard.Options.language()))
          ) 
          .addClass('callproposal-box-block1');

        var _proposalText = proposal['title'] || proposal['space_name'];
        var _block2 = $('<div>')
          .append(
            $('<span>').append(_proposalText)
          )
          .addClass('callproposal-box-block2');
        
        var _proposalPopup;
        var _seeMoreBtn = $('<button>')
        .addClass('seeMoreBtn-element-history')
        .append(Pard.t.text('profile_page.historyBlock.seeBtn'))
        .attr('type','button')
        .one('click', function(){
            _proposalPopup = Pard.Widgets.Popup();
            _proposalPopup.setContentClass('popup-container-full proposal-popup');
            _proposalPopup.setCallback(function(){});
        })
        .on('click', function(){
          if (!(_forms[proposal.call_id])) {
            Pard.Backend.getCallForms(proposal.call_id, function(data){
              _forms[proposal.call_id] = data.forms;
              _proposalPopup.setContent(
                proposal.event_name, 
                Pard.Widgets.PrintMyProposal(
                  proposal,
                  _forms[proposal.call_id][_proposalType][proposal.form_id], 
                  _proposalType, 
                  function(){
                    _proposalPopup.close();
                  }).render());
              _proposalPopup.open();
            });
          }
          else{
            _proposalPopup.setContent(
              proposal.event_name, 
              Pard.Widgets.PrintMyProposal(
                proposal, 
                _forms[proposal.call_id][_proposalType][proposal.form_id],
                _proposalType, 
                function(){
                  _proposalPopup.close()
                }).render());
            _proposalPopup.open();
          }       
        });
        _block2.append(_seeMoreBtn);
        _itemBox.append(_block1, _block2);
        _createdWidget.append(_itemBox);
      });
    }
  
    return {
      render: function(){
        if (Pard.UserStatus['status']=='owner' || Pard.UserStatus['status'] == 'admin') return _createdWidget;
      }
    }
  }


  ns.Widgets.UpcomingActivities= function(activities){
    var _activitiesBoxContainer = $('<div>').addClass('section-box-container');

    activities.forEach(function(activity){
      _activitiesBoxContainer.append(activity.title,'<br>')
    })
    return _activitiesBoxContainer;

  }


  ns.Widgets.UpcomingEvents= function(events, color){
    var _eventsBoxContainer = $('<div>').css('text-align','left');
    events = events
      .sort(function(event1, event2){
        var _startEvent1 =parseInt(event1.eventTime[0].time[0]);
        var _startEvent2 =parseInt(event2.eventTime[0].time[0]);
        return _startEvent1 - _startEvent2;
      })
      .map(function(event){
        event.color = color;
        return event;
      })
    var isOwner = Pard.UserStatus['status']=='owner' || Pard.UserStatus['status'] == 'admin';
    Pard.ReactComponents.Mount(
      'EventsList', 
      {
        events: events, 
        listClass: 'list__profile-events',
        isOwner: isOwner,
        blockToUpdate: 'upcoming'
      }, 
      _eventsBoxContainer
    )
    return _eventsBoxContainer;

  }

  ns.Widgets.PastEventArtist = function(participation){

    var _eventName = $('<a>').attr('href','/event?id='+participation.event_id+'&lang='+Pard.Options.language()).html(participation.event_name).addClass('eventName-pastEventBlock');
    var _eventProposals = $('<ul>').css({'list-style-type':'none','margin-left':'0.5rem'});
    var _permanentShows = {};
    participation.shows.forEach(function(show, index){
      var _host;
      if (show.host_id.indexOf('own') >-1) _host = $('<span>').text(show.host_name).css('text-decoration','underline');
      else _host = $('<a>').attr('href','/profile?id='+show.host_id).text(show.host_name);
      if(show.permanent == 'true'){
        if (_permanentShows[show.participant_proposal_id]) _permanentShows[show.participant_proposal_id].push(show);
        else _permanentShows[show.participant_proposal_id] = [show];
      }
      else if (index < 1 || show.participant_proposal_id != participation.shows[index-1].participant_proposal_id || show.date != participation.shows[index-1].date){
        var _date = moment(new Date(show.date)).locale(Pard.Options.language()).format('DD MMMM YYYY');
        var _day = $('<span>').text(_date+':');
        var _title = $('<span>').text(show.title).addClass('title-pastEventBlock');
        var _category = Pard.Widgets.IconManager(show.participant_category).render().addClass('iconCat-pastEventBlock');
        var _place = $('<span>').append(Pard.Widgets.IconManager('stage').render().addClass('iconProfile-pastEventBlock'),_host);
        var _proposal = $('<li>').append(_day,' ',_category, _title, ' / ',_place).addClass('proposal-pastEventBlock');
        _eventProposals.append(_proposal);
      }
    });

    if (!($.isEmptyObject(_permanentShows))){
      for (var instalation in _permanentShows){
        var _showArray = _permanentShows[instalation];
        var show = _showArray[0];
        var _host;
        if (show.host_id.indexOf('own') >-1) _host = $('<span>').text(show.host_name).css('text-decoration','underline');
        else _host = $('<a>').attr('href','/profile?id='+show.host_id).text(show.host_name);
        var _init_date = moment(new Date(_showArray[0].date)).locale(Pard.Options.language()).format('DD MMMM YYYY');
        var _day = $('<span>').append(_init_date);
        if (_showArray.length>1) {
          var _final_date = moment(new Date(_showArray[_showArray.length -1].date)).locale(Pard.Options.language()).format('DD MMMM YYYY');
          _day.text(_init_date+' - '+_final_date+':');
        }
        else{
          _day.text(_init_date+':')
        }
        var _title = $('<span>').text(show.title).addClass('title-pastEventBlock');
        var _category = Pard.Widgets.IconManager(show.participant_category).render().addClass('iconCat-pastEventBlock');
        var _place = $('<span>').append(Pard.Widgets.IconManager('stage').render().addClass('iconProfile-pastEventBlock'), _host);
        var _proposal = $('<li>').append(_day,' ',_category, _title, ' / ',_place).addClass('proposal-pastEventBlock');
        _eventProposals.append(_proposal);
      }
    }

    var _event = $('<div>').append(_eventName,_eventProposals);

    return _event;

  }

  ns.Widgets.PastEventSpace = function(participation){

    var _eventName = $('<a>').attr('href','/event?id='+participation.event_id+'&lang='+Pard.Options.language()).html(participation.event_name).addClass('eventName-pastEventBlock');
    var _eventProposals = $('<ul>').css({'list-style-type':'none','margin-left':'0.5rem'});
    var _permanentShows = [];
    var _artistByDay = {};

    participation.shows.forEach(function(show, index){
      if(show.permanent == 'true'){
        _permanentShows.push(show);
      }
      else {
        if (_artistByDay[show.date]) _artistByDay[show.date].push(show);
        else _artistByDay[show.date] = [show];
      }
    });

    if (!($.isEmptyObject(_artistByDay))){
      for (var day in _artistByDay){
        var _artists = $('<span>').append(Pard.Widgets.IconManager('performer').render().addClass('iconProfile-pastEventBlock'));
        var _date = moment(new Date(day)).locale(Pard.Options.language()).format('DD MMMM YYYY');
        var _day = $('<span>').text(_date+':');
        var _proposal = $('<li>').append(_day,' ',_artists).addClass('proposal-pastEventBlock');
        _eventProposals.append(_proposal);
        _artistByDay[day].forEach(function(show, index){
          var _artistName;
          if (show.participant_id.indexOf('own') >-1) _artistName = $('<span>').text(show.participant_name).css('text-decoration','underline');
          else _artistName = $('<a>').attr('href','/profile?id='+show.participant_id).text(show.participant_name);
          if (index < 1){
            _artists.append(_artistName);
          }
          else if (show.participant_id != participation.shows[index-1].participant_id){
            _artists.append(' - ', _artistName);
          }
        })
      }
    }

    if (_permanentShows.length){
      var _participantsArray = [];
      var _artists = $('<span>').append(Pard.Widgets.IconManager('performer').render().addClass('iconProfile-pastEventBlock'));
      var _id = new Date(_permanentShows[0].date);
      var _fd = new Date(_permanentShows[_permanentShows.length -1].date);
      var _day = $('<span>');
      var _proposal = $('<li>').append(_day,' ',_artists).addClass('proposal-pastEventBlock');
      _eventProposals.append(_proposal);
      _permanentShows.forEach(function(show, index){
        var _nd = new Date(show.date);
        if(_nd.getTime()<_id.getTime()) _id = _nd;
        else if(_nd.getTime()>_fd.getTime()) _fd = _nd;
        var _artistName;
        if (show.participant_id.indexOf('own') >-1) _artistName = $('<span>').text(show.participant_name).css('text-decoration','underline');
        else _artistName = $('<a>').attr('href','/profile?id='+show.participant_id).text(show.participant_name);
        if (index < 1){
            _artists.append(_artistName);
            _participantsArray.push(show.participant_id);
        }
        else if ($.inArray(show.participant_id, _participantsArray)<0){
          _artists.append(' - ', _artistName);
          _participantsArray.push(show.participant_id);
        }
      })
      if (_id.getTime() == _fd.getTime()) _day.append(moment(_id).locale(Pard.Options.language()).format('DD MMMM YYYY'),':')
      else _day.append(moment(_id).locale(Pard.Options.language()).format('DD MMMM YYYY'),' - ',moment(_fd).locale(Pard.Options.language()).format('DD MMMM YYYY'),':');
    }

    var _event = $('<div>').append(_eventName,_eventProposals);

    return _event;

  }

  ns.Widgets.ProgramCardProfile = function(performance, profile_id){

    var _progCard = $('<div>').addClass('program-card-container-profile');
    var _time = $('<div>').append(moment(performance.time[0], 'x').locale(Pard.Options.language()).format('HH:mm') + ' - ' + moment(performance.time[1], 'x').format('HH:mm')).css('text-transform','capitalize');
    var _participantCatIcon = $('<span>')
      .append(
        Pard.Widgets.IconManager(performance.participant_category).render().css('font-size','1.2rem'))
      .addClass('icon-programCard-profile');
    var _orderNum = performance.order +1;

    var _title = $('<span>')
      .text(performance.title)
      .addClass('title-program-card')
      .css({
        'margin-right': '.6rem'
      });
    var _host = $('<a>').text(performance.host_name);
    if(performance.host_id.search('own')<0){
      var _hostLink =  '/profile?id=' + performance.host_id + '#space' 
      if (profile_id != performance.host_id) _hostLink += '&space=' + performance.space_id
      _host.addClass('host-program-card').attr({'href': _hostLink});
    }
    else _host.addClass('host-program-card-own').attr({'href': '#/'});
    var _participant = $('<a>')
      .text(performance.participant_name)
      .css('margin-right','0.6rem');
    if (performance.participant_id.search('own')<0) _participant.addClass('participant-program-card').attr({'href': '/profile?id=' + performance.participant_id});
    else _participant.addClass('participant-program-card-own').attr({'href': '#/'});
    var _children = '';
    if (performance.children == 'baby') _children = $('<div>').append(Pard.Widgets.IconManager('baby').render().addClass('participant- catagory-icon icon-children-program'), 'Infantil');
    var _shortDescription = performance.short_description;

    var _titleRow = $('<div>');
    var _descriptionRow = $('<div>').addClass('descriptionRow-profile-programCard');
    var _hostRow = $('<div>');
    var _participantRow = $('<div>');
    _titleRow.append(_time, _participantCatIcon, Pard.t.text('categories.' + performance.participant_category), _children);
    _descriptionRow.append($('<p>').append(_title, _participant), $('<p>').append(_shortDescription).addClass('short-description-program-card'));
    _hostRow
      .append(
        $('<p>').append(
          Pard.Widgets.IconManager('location').render().addClass('icon-programCard-profile'), 
          _host
        )
      )
      .css({
        'margin-top':'.5rem'
      });

    var _col1 = $('<div>').addClass('col1-program-card-profile');
    var _col2 = $('<div>').addClass('col2-program-card-profile');
    _col1.append(_titleRow);
    _col2.append(_descriptionRow);
    _progCard.append(_col1, _col2);

    _progCard.append(_hostRow);
    

    return {
      render: function(){
        return _progCard;
      }
    }
  }


  ns.Widgets.ProgramCardProfilePerm = function(performance, profile_id){
    var _progCard = $('<div>').addClass('programPerm-card-container-profile');
    var _time = $('<div>');
    var _participantCatIcon = $('<span>')
      .append(
        Pard.Widgets.IconManager(performance.participant_category).render()
        .css('font-size','1.2rem')
      )  
      .addClass('icon-programCard-profile')
      
    var _title = $('<span>').text(performance.title).addClass('title-program-card');
    var _participant = $('<a>').text(performance.participant_name);
    if (performance.participant_id.search('own')<0) _participant.addClass('participant-program-card').attr({'href': '/profile?id=' + performance.participant_id, 'target':'_blank'});
    else _participant.addClass('participant-program-card-own').attr({'href': '#'});
   
    var _children = '';
    if (performance.children == 'baby') _children = Pard.Widgets.IconManager('baby').render().addClass('participant- category-icon icon-children-program'); 
    var _shortDescription = $('<div>').append(performance.short_description);
  
    var _titleRow = $('<div>');
    var _performanceCategory = $('<div>').append(
      _participantCatIcon, 
      $('<span>').text(Pard.t.text('categories')[performance.participant_category]).css('vertical-align','middle')
    );
    var _iconContainer = $('<div>').append(_performanceCategory,  _children);
    var _hostName;
    if(performance.host_id.search('own')<0){ 
      var _hostLink =  '/profile?id=' + performance.host_id + '#space' 
      if (profile_id != performance.host_id) _hostLink += '&space=' + performance.space_id
      _hostName = $('<a>').addClass('host-program-card').attr({'href': _hostLink});
    }
    else _hostName = $('<span>'); 
    var _host = $('<div>').append(
      Pard.Widgets.IconManager('location').render()
        .addClass('icon-programCard-profile'),
      _hostName.html(performance.host_name)
        .css({
          'vertical-align':'middle'
        })
    )
    _titleRow.append( _title, _participant);
    _progCard.append(
      _time, 
      _iconContainer.css('margin-bottom','.5rem'), 
      _titleRow, 
      _shortDescription.css('margin-bottom','.5rem'),
      _host
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
        // if (_time.html()) _time.append(' / ');
        // _time.append(moment(new Date(parseInt(performance.time))).locale(Pard.Options.language()).format('dddd D').capitalize()+', '+moment(performance.time[0], 'x').format('HH:mm') + ' - ' + moment(performance.time[1], 'x').format('HH:mm'));
      }
    }
  }



}(Pard || {}));

