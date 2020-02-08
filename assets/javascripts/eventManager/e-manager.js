'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};

  ns.Widgets.Manager = function(the_event, forms){

    var _eventDays = the_event.eventTime
      .map(function(evt){
        var d = new Date(parseInt(evt.time[1]));
        return d.getTime();
      })
      .sort();
    var _now = Date.now();
    var _endEvent = _eventDays[_eventDays.length -1];
    the_event['finished'] = _now > _endEvent;
    if (Pard.UserStatus['status'] == 'admin') the_event['finished'] = false;

    var _main = $('<main>').addClass('main-call-page');
    var _rgb = Pard.Widgets.IconColor(the_event.color).rgb();
    var _backColor = 'rgba('+_rgb[0]+','+_rgb[1]+','+_rgb[2]+','+0.2+')';
    if (the_event.published == 'true') _main.css({'background': _backColor});
    var _innerMainContainer = $('<div>').css('width','100vw');
    var _mainLarge = $('<section>').addClass('pard-grid call-section');
    var _navigationContainer = $('<div>').addClass('navigation-container-call-page');
    var _goToEventBtn = $('<h6>').append(
      $('<span>').text('e-Manager: '),
      $('<a>').attr('href','/event?id='+ the_event.id+'&lang='+Pard.Options.language()).html(the_event.name)
      ).css('margin',0);
    _goToEventBtn.addClass('toEventPage-btn-callPage');
    var _tabs = $('<ul>').addClass('menu simple tabs-menu switcher-menu-call-page');
    var _title = $('<span>');
    var _panels = $('<div>').css('padding', 0);

    var _displayer = Pard.Displayer(the_event, forms);
    Pard.EManagerDisplayer = _displayer;

    var artists = {}
    the_event.artists.forEach(function(artist){
      artists[artist.profile_id] = new Pard.Artist(artist, _displayer);
    });

    var spaces = {}
    the_event.spaces.forEach(function(space, index){
      space.event_id = the_event.id;
      if (the_event.order) space.index = the_event.order.indexOf(space.proposal_id);
      else space.index = index;
      spaces[space.proposal_id] = new Pard.Space(space, _displayer);
      if(!artists[space.profile_id]) artists[space.profile_id] = new Pard.Artist(space, _displayer);
    });

    the_event.artists = artists;
    the_event.spaces = spaces;


    var _tableTabTitle =  $('<a>').attr({href: "#proposals"}).text(Pard.t.text('manager.proposals.tab'));
    var _tableTab = $('<li>')
      .append(_tableTabTitle)
      .attr({id:"proposalsBtn"})
      .on('click', function(){
        if(_lastSelectedPanel != _tableManager){
          $('.tab-selected').removeClass('tab-selected');
          _tableTab.addClass('tab-selected');
          _lastSelectedPanel.render().hide();
          _tableManager.render().show();
          _lastSelectedPanel = _tableManager;
        }
      });

    var _utilsTabTitle =  $('<a>').attr({href: "#utils", id:"#utilsBtn"}).text(Pard.t.text('manager.tools.tab'));
    var _utilsTab = $('<li>')
      .append(_utilsTabTitle)
      .attr({id:"utilsBtn"})
      .on('click', function(){
        if(_lastSelectedPanel != _utilsManager){
          $('.tab-selected').removeClass('tab-selected');
          _utilsTab.addClass('tab-selected');
          _lastSelectedPanel.render().hide();
          _utilsManager.render().show();
          _lastSelectedPanel = _utilsManager;
        }
      });

    var _programManager;
    if(the_event.program_id
    ){
      var _programTabTitle = $('<a>').attr({href: "#program"}).text(Pard.t.text('manager.program.tab'));
      var _programTab = $('<li>')
        .append(_programTabTitle)
        .attr({id:"programBtn"})
        .on('click', function(){
          if(_lastSelectedPanel != _programManager){
            $('.tab-selected').removeClass('tab-selected');
            _programTab.addClass('tab-selected');
            _lastSelectedPanel.render().hide();
            _programManager.render().show();
            _lastSelectedPanel = _programManager;
          }
        });
      _programManager = Pard.ProgramManager(the_event, _displayer);
    }
    
    var _tableManager = Pard.Widgets.TableManager(the_event, forms, _displayer);
    var _utilsManager = Pard.utilsManager(the_event);

    var _lastSelectedPanel = _tableManager;
    _tableTab.addClass('tab-selected');
    

    _tabs.append(_tableTab, _programTab, _utilsTab);
    _navigationContainer.append(_goToEventBtn, _title, _tabs);
    if (_programManager){
      _panels.append(_programManager.render().hide());
      _tabs.append(_programTab);
    } 
    _panels.append(
      _tableManager.render(), 
      _utilsManager.render().hide()
    );
    _tabs.append(_utilsTab);

    _mainLarge.append(_navigationContainer, _panels);
    _main.append(_innerMainContainer.append(_mainLarge));

    Pard.Bus.on('addArtist', function(artist){
      if(the_event.artists[artist.profile_id]) the_event.artists[artist.profile_id].addProposal(artist.proposals[0]);
      else the_event.artists[artist.profile_id] = new Pard.Artist(artist, _displayer);
      if(_programManager) _programManager.addArtist(artist);
      _tableManager.addArtist(artist);
    });

    Pard.Bus.on('addSpace', function(space){
      var index = Object.keys(the_event.spaces).length;
      space.event_id = the_event.id;
      space.index = index;
      the_event.spaces[space.proposal_id] = new Pard.Space(space, _displayer);
      if(!the_event.artists[space.profile_id]) the_event.artists[space.profile_id] = new Pard.Artist(space, _displayer);
      if(_programManager) _programManager.addSpace(space);
      _tableManager.addSpace(space);
    });

    Pard.Bus.on('deleteArtist', function(artist){
      if(the_event.artists[artist.profile_id]){
        the_event.artists[artist.profile_id].deleteProposal(artist.proposal_id);
        if(_programManager) _programManager.deleteArtistproposal(artist);
        _tableManager.deleteArtistproposal(artist);
        if(the_event.artists[artist.profile_id] && the_event.artists[artist.profile_id].hasNoProgramNorProposals()) delete the_event.artists[artist.profile_id];
      }
    });

    Pard.Bus.on('deleteSpace', function(space){
      if(the_event.spaces[space.proposal_id]){
        the_event.spaces[space.proposal_id].deleteColumns();
        if(_programManager) _programManager.deleteSpace(space);
        _tableManager.deleteSpace(space);
        delete the_event.spaces[space.proposal_id];
        if(the_event.artists[space.profile_id] && the_event.artists[space.profile_id].hasNoProgramNorProposals()) delete the_event.artists[artist.profile_id];
      }
    });

    Pard.Bus.on('modifyArtist', function(artist){
      if(the_event.artists[artist.profile_id]) the_event.artists[artist.profile_id].modify(artist); // modify the Artist (proposals and graphical elements related) --> artist.js
      if(_programManager) _programManager.modifyArtist(artist); // modify the Program --> programManager.js
      _tableManager.modifyArtist(artist);
      if(the_event.spaces[artist.profile_id]){
        var modifiable = {
          email: artist.email,
          name: artist.name,
          phone: artist.phone,
          address: artist.address,
        }
        the_event.spaces[artist.profile_id].modify(modifiable);
        var space = the_event.spaces[artist.profile_id].space;
        if(_programManager) _programManager.modifySpace(space);
        _tableManager.modifySpace(space);
      }
    });

    Pard.Bus.on('modifySpace', function(space){
      if(the_event.spaces[space.proposal_id]) the_event.spaces[space.proposal_id].modify(space);
      if(_programManager) _programManager.modifySpace(space);
      _tableManager.modifySpace(space);
      if(the_event.artists[space.profile_id]){
        var modifiable = {
          email: space.email,
          name: space.name,
          phone: space.phone
        }
        the_event.artists[space.profile_id].modify(modifiable);
        var artist = the_event.artists[space.profile_id].artist;
        if(_programManager) _programManager.modifyArtist(artist);
        _tableManager.modifyArtist(artist);
      }
    });


    Pard.Bus.on('selectArtist', function(artist){
      the_event.artists[artist.profile_id].select(artist.proposal_id);
      _tableManager.modifyArtist(artist);
      if(_programManager) _programManager.selectArtist(artist);
    });

    Pard.Bus.on('selectSpace', function(space){
      the_event.spaces[space.proposal_id].select();
      _tableManager.modifySpace(space);
      if(_programManager) _programManager.selectSpace(space);
    });

    Pard.Bus.on('orderSpaces', function(new_order){
      if(_programManager) _programManager.orderSpaces(new_order);
    })

    Pard.Bus.on('assignPrices', function(subcategories_price){
      if (Pard.CachedEvent.subcategories_price){
        for (var cat in subcategories_price){
          Pard.CachedEvent.subcategories_price[cat] = subcategories_price[cat]
        }
      }
      else Pard.CachedEvent.subcategories_price = subcategories_price;
      if(_programManager) _programManager.assignPrices(subcategories_price);
    })

    Pard.Bus.on('assignPermanentsTime', function(params){
      Pard.CachedEvent.permanents = params.permanents;
      if(_programManager) _programManager.assignPermanentsTime(params.permanents, params.activities);
    })

    Pard.Bus.on('modifyParamProposal', function(params){
      if(params['type'] == 'artist'){
         the_event.artists[params.profile_id].modifyParam(params);
        _tableManager.modifyArtistParam(params);
      }
      else if (params['type'] == 'space'){
        the_event.spaces[params.proposal_id].modifyParam(params);
        _tableManager.modifySpaceParam(params);
      }
    })


    Pard.Bus.on('modifyParticipant', function(artistParticipant){
      var eventArtistParticipant = the_event.artists[artistParticipant.profile_id]
      if(eventArtistParticipant) eventArtistParticipant.modify(artistParticipant); // modify the Artist (proposals and graphical elements related) --> artist.js
      if(_programManager) _programManager.modifyArtist(artistParticipant); // modify the Program --> programManager.js
      _tableManager.modifyArtist(artistParticipant);
    });

    Pard.WebSocketManager(the_event.id);

    return {
      render: function(){
        return _main;
      }
    }
  }
}(Pard || {}));
