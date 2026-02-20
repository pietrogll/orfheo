'use strict';

(function(ns){

	
	ns.Performance = function(displayer, _tables,  performance){

		var the_event = Pard.CachedEvent;
  	var artists = the_event.artists;
  	var spaces = the_event.spaces;
  	var eventTime = the_event.eventTime;
 	 	var _sendForm = function(shows){
    		return Pard.Widgets.PerformancesSubmitted(the_event, shows);
    	} 
		var checkConflicts = function(performance_to_check){
			Pard.Widgets.CheckConflicts(displayer, performance_to_check);
  	}

  	var _participant = artists[performance.participant_id];
    var _proposalObject = _participant.proposals[performance.participant_proposal_id]
  	var _proposal = performance.participant_proposal_id && _proposalObject ? _proposalObject.proposal :	{profile_id: performance.participant_id, name: _participant.name()}
    var _artistName = performance.participant_name;
    var _performanceTitle = performance.title || _proposal.title;
		var _short_description = performance.short_description || _proposal.short_description;
		var titleBox, shortDescription;

	  // SET BY DEFAULT THE PRICE OF THE PARTICIPANT SUBCAT===========
		if(the_event.subcategories_price && the_event.subcategories_price[_proposal.subcategory]) {
		  	performance.price = performance.price || the_event.subcategories_price[_proposal.subcategory];
		}
	  //===================================================

	  
	  var _title = $('<p>')
	    .addClass('proposal-title-card-call-manager');
	  var _confirmationCheckContainer = $('<span>')
	    .addClass('checker');
	  var _titleText =  $('<button>')
	  	.attr('type','button')
	  	.on('click', function(e){
	    	_displayManager(true);
	  	});
	  var _commentIconContainer = $('<span>')
	    .addClass('commentIcon');
	  var _priceIconContainer = $('<span>')
	    .addClass('priceIcon');
	  var _titleTextLong;

	  _title.append(
	    $('<span>').append(_titleText),
	    _confirmationCheckContainer, 
	    _commentIconContainer,
	    _priceIconContainer
	  );
	  var _performaceTitlePopup = $('<span>');

	  var _displayManager = function(check_conflicts){
	    var _content = $('<div>').addClass('very-fast reveal full').css('z-index','99');
	    _content.empty();
	    $('body').append(_content);
	    var _popup = new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});
	    _popup.open();
	    _performaceTitlePopup
	      .text(_artistName)
	      .click(function(){
	          if (_proposal.profile_id) _proposal.form_id ? displayer.displayProposal(_proposal, 'artist') : displayer.displayParticipant(_proposal);
	        })
	      .addClass('performanceManagerTitle');
	    var _message = Pard.Widgets.PopupContent(_performaceTitlePopup, manager(check_conflicts));
	    _message.setCallback(function(){
	      _popup.close();          
	      setTimeout(function(){
	        _content.remove();
	      },500);
	    });

	    _content.click(function(e){
	      if ($(e.target).hasClass('vcenter-inner')) {
	        _popup.close();
	        setTimeout(function(){
	          _content.remove()            
	        },500);
	      }
	    })

	    _content.append(_message.render());
	  }

	  var card =$('<div>')
	  	.addClass('programHelper dragged-card-call-manager')
	  	.append(_title.css({'position': 'absolute'}));

	  card.addClass(performance.id);

	  
    if(!Pard.CachedEvent.finished){

      card.addClass('cursor_grab');
		  card.mousedown(function(){
		    card.removeClass('cursor_grab').addClass('cursor_move');
		  });
		  card.mouseup(function(){
		    card.removeClass('cursor_move').addClass('cursor_grab');
		  });


		  var dragOptions = Pard.Widgets.DragPerformanceOptions;
		  
		  if(performance.permanent && performance.permanent.is_true()){
		  	dragOptions =  Pard.Widgets.DragPermanentsOptions;
		  } 

		  card.draggable(dragOptions(card, performance, _sendForm));
		}



	  var fillCard = function(performance){
	  	var participant_subcategory = performance.participant_subcategory || _proposal.subcategory;
	    var color = Pard.Widgets.CategoryColor(participant_subcategory);
	    _performanceTitle = performance.title || _proposal.title;
	    _short_description = performance.short_description || _proposal.short_description;
      var _artistName = artists[performance.participant_id].name();
  	    _performaceTitlePopup.text(_artistName);
	    var performanceEventTime = eventTime.find(function(evt){
        return evt.date == performance.date
      }) 
      if (!performanceEventTime) {
      	performance.date = eventTime[0].date
      	performanceEventTime = eventTime[0]
      }
	    var dayStartingTime = parseInt(performanceEventTime.time[0]) 
	    var height = _tables[performance.date].height() - 42;
	    performance.time[0] = parseInt(performance.time[0]);
	    performance.time[1] = parseInt(performance.time[1]);
	    //10 pixels = 10 min
	    var start = (performance.time[0] - dayStartingTime) / (Pard.HourHeight * 1000);
	    var end = (performance.time[1] - dayStartingTime) / (Pard.HourHeight * 1000);
	    performance.position = start + 41;
	    performance.duration = (end - start);
	    performance.maxHeight = height - performance.position + 41;

	    var cardHeight = performance.duration;
	     if(performance.permanent && performance.permanent.is_true()){
		  	cardHeight = Pard.PermanentCardHeight;
		  } 

	    card.css({
	      'position': 'absolute',
	      'display': 'inline-block',
	      'width': Pard.ColumnWidth - 2,
	      'top': performance.position,
	      'height': cardHeight,
	      'background': color,
	      'white-space': 'normal',
	      'box-shadow': 'inset 0 0 1px '
	    });

	    
	    if(_proposal.availability && $.inArray(performance.date, _proposal.availability) < 0){
 	      card.addClass('artist-not-available-call-manager');}
	    else{
	      	card.removeClass('artist-not-available-call-manager');
	     }

	    _titleTextLong = _artistName + ' - ' + _performanceTitle;
	    _titleText.text(Pard.Widgets.CutString(_titleTextLong, 35));
	    _commentIconContainer.empty();
	    _confirmationCheckContainer.empty();
	    _priceIconContainer.empty();
	    if (performance.confirmed && performance.confirmed.is_true()) _confirmationCheckContainer.append(Pard.Widgets.IconManager('done').render());
	    if (performance.comments && (!Pard.Widgets.IsBlank(performance.comments.comments) || !Pard.Widgets.IsBlank(performance.comments.needs))) _commentIconContainer.append(Pard.Widgets.IconManager('comments').render());
	    if (performance.price 
	    	&& (!Pard.Widgets.IsBlank(performance.price.price)||!Pard.Widgets.IsBlank(performance.price.ticket_url) )
	    	) _priceIconContainer.append(Pard.Widgets.IconManager('price').render());

	    	// NOT PERMANENT===============

    	if(!Pard.CachedEvent.finished && (!performance.permanent || !performance.permanent.is_true())){

		    card.resizable({
		      resize: function(event, ui) {
		        ui.size.width = ui.originalSize.width;
		      },
		      maxHeight: performance.maxHeight,
		      grid: 5,
		      stop: function(event, ui){
		        var duration = new Date(performance.time[0]);
		        duration.setMinutes(duration.getMinutes() + ui.size.height);
		        performance.time[1] = duration.getTime();
		        Pard.Backend.modifyPerformances(_sendForm([performance]), function(data){
		          Pard.Bus.trigger(data.event, data.model);
		          checkConflicts(performance);
		        });
		      }
		    });

	  	}

	    delete performance.position;
	    delete performance.duration;
	    delete performance.maxHeight;
	  }

	    	// ===============

	  var manager = function(check_conflicts){
	    var _performanceManager = Pard.Widgets.PerformanceManager(performance,_proposal, check_conflicts);
	    _performanceManager.setElement(card);
	    return {
	      render: function(){
	        return _performanceManager.render();
	      },
	      setCallback: function(callback){
	        _performanceManager.setCallback(callback);
	      }
	    }
	  }

	  var _destroy = function(){
	  	Pard.Programations.remove(performance.id, performance.id_time);
      if (Pard.Programations.get(performance.id).length == 0){
      	Pard.Programations.delete(performance.id);
	    }
	    card.remove();
	  }

	  var _modify = function(show){
	    for(var key in show){
	      performance[key] = show[key];  
	    }
	    performance.time[0] = parseInt(performance.time[0]);
	    performance.time[1] = parseInt(performance.time[1]);
	    fillCard(performance);
	  }

	  fillCard(performance);

	  Pard.Programations.add(performance.id, {date: performance.date, time:performance.time, id_time: performance.id_time});

	  return {
	    show: performance,
	    card: card,
	    manager: manager,
	    displayManager: _displayManager,
	    modify: _modify,
	    destroy: _destroy
	  }
	}

	ns.Widgets.DragPermanentsOptions = function(card, performance,_sendForm){
		return {
      revert: false,
      helper: 'clone',
      grid: [ 10, 10 ],
      start: function(event, ui){
        card.removeClass('cursor_grab').addClass('cursor_move');
        card.css({'opacity': '0.4'});
        ui.helper.data('dropped', false);
        Pard.Bus.trigger('drag', performance);
        Pard.Bus.trigger('dragPermanents', Pard.Widgets.ArtistShows(performance));
      },
      stop:function(event, ui){
        card.removeClass('cursor_move').addClass('cursor_grab');
        card.css({'opacity': '1'});
        if(ui.helper.data('dropped') == false){
          Pard.Backend.deletePerformances(_sendForm(Pard.Widgets.ArtistShows(performance)), function(data){
            Pard.Bus.trigger(data.event, data.model);
          });
        }
        Pard.Bus.trigger('stop', performance);
      }
    }
	}

	ns.Widgets.DragPerformanceOptions = function(card, performance,_sendForm){
		return {
			revert: false,
	    helper: 'clone',
	    grid: [ 15, 15 ],
	    start: function(event, ui){
	      card.removeClass('cursor_grab').addClass('cursor_move');
	      card.css({'opacity': '0.4'});
	      ui.helper.data('dropped', false);
	      Pard.Bus.trigger('drag', performance);
	    },
	    stop:function(event, ui){
	      card.removeClass('cursor_move').addClass('cursor_grab');
	      if (card.hasClass('artist-not-available-call-manager')) card.removeAttr('opacity');
	      else card.css({'opacity': '1'});
	      if(ui.helper.data('dropped') == false){
	        Pard.Backend.deletePerformances(_sendForm([performance]), function(data){
	          Pard.Bus.trigger(data.event, data.model);
	        });
	      }
	      Pard.Bus.trigger('stop', performance);
	    }
	  }
	}

	

}(Pard || {}));