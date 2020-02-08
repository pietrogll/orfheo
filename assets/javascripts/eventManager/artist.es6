'use strict';

(function(ns){

	ns.Artist = function(artist, displayer){
    var program = {};
    var proposals = {};
    var _proposalSelected = [];

    var Accordion = function(){  // It is the block with artist name that once clicked displays its proposals' cards
      var container = $('<div>').css({'padding': 0});
      var accordionNav = $('<li>').addClass('accordion-item');
      var artistName = $('<a>').attr('href','#/').text(artist.name);
      var aHref = $('<div>').append(artistName).addClass('accordion-title');
      var _artistMenuDropdown = $('<div>').append(ArtistDropdownMenu().render());
      _artistMenuDropdown.addClass('artists-dropdown-icon-call-manager');
      var content = $('<div>').addClass('accordion-content').css({'padding': 0});

      if (artist.proposals) artist.proposals.forEach(function(proposal){
        proposals[proposal.proposal_id] = new ProposalCard(proposal);
        if (proposal.selected) {
          content.append(proposals[proposal.proposal_id].render());
          _proposalSelected.push(proposal.proposal_id);
        }
      });


      accordionNav.append(aHref,_artistMenuDropdown);
      if (_proposalSelected.length) container.append(accordionNav, content);

      function setContainer(){
        if (!container.html()){
          content.slideUp();
          accordionNav.removeClass('selected-accordionItem');
          content.removeClass('is-active');
          container.append(accordionNav, content);
          container.foundation();
        }
      }

      return{
        render: function(){
          return container;
        },
        addProposal: function(proposalCard){
          content.append(proposalCard.render());
          setContainer();
        },
        modify: function(new_artist){
          artistName.text(new_artist.name);
          Object.keys(proposals).forEach(function(proposal_id){
            proposals[proposal_id].modify(new_artist);
          });
        },
        selectProposal: function(proposalCard){
          _proposalSelected.push(proposalCard.proposal.proposal_id)
          this.addProposal(proposalCard)
        },
        deselectProposal: function(proposalCard){
          proposalCard.render().detach();
          var index = _proposalSelected.indexOf(proposalCard.proposal.proposal_id);
          if (index > -1) _proposalSelected.splice(index, 1);
          if (_proposalSelected.length == 0){
            content.slideUp();
            accordionNav.removeClass('selected-accordionItem');
            content.removeClass('is-active');
            accordionNav.detach();
            content.detach();
          }
        }
      }
    }

    var ProposalCard = function(proposal){
      var card = $('<div>').addClass('proposalCard');
      var color, rgb, colorIcon;

      card.addClass('proposal-card-container-call-manager');
      

      var circleColumn = $('<div>').addClass('icon-column');
      var profileCircle = $('<div>').addClass('profile-nav-circle-selected');
      var titleColumn = $('<div>').addClass('name-column profile-name-column');
      var title = $('<p>').addClass('proposal-title-card-call-manager');
      var titleText = $('<a>').attr('href','#/');
      var _icon = '';
      var icon = $('<div>');
      circleColumn.append($('<div>').addClass('nav-icon-production-container').append(profileCircle.append(icon)));
      titleColumn.append(title.append(titleText));

      if(!Pard.CachedEvent.finished){

        card.addClass('cursor_grab');
        card.mouseover(function(){
          if (card.hasClass('cursor_move')) card.removeClass('cursor_move').addClass('cursor_grab');
        });
        card.mousedown(function(){
          card.removeClass('cursor_grab').addClass('cursor_move');
        });
        card.mouseup(function(){
          card.removeClass('cursor_move').addClass('cursor_grab');
        });
        
        card.draggable({
          revert: 'invalid',
          helper: function(){
            return Pard.Widgets.CardHelper(proposal).render();
          },
          appendTo: '.tableContainer',
          snap: '.spaceTime',
          snapMode: 'inner',
          snapTolerance: 5,
          grid: [ 15, 15 ],
          cursor: 'move',
          start: function(event, ui){
            var _performance =  {
              program_id: Pard.CachedEvent.program_id,
              event_id: Pard.CachedEvent.id,
              participant_id: artist.profile_id,
              participant_proposal_id: proposal.proposal_id
            }
            Pard.Bus.trigger('drag', _performance);
          },
          stop:function(){
            Pard.Bus.trigger('stop');
          }
        });

      }
     
      // if(Pard.CachedEvent.finished){
      //   card.draggable('disable')
      // }

      card.append(circleColumn, titleColumn);

      //Needed for displaying info
      proposal.name = artist.name;
      proposal.email = artist.email;
      proposal.profile_id = artist.profile_id;

      titleText.on('click', function(){
      	displayer.displayProposal(proposal, 'artist');
      });

      var _fillCard = function(proposal){
        color = Pard.Widgets.CategoryColor(proposal.subcategory);
        
        profileCircle.css({'background-color': color});
        titleText.text(Pard.Widgets.CutString(proposal.title, 35));

        _icon = Pard.Widgets.IconManager(proposal.category).render().addClass('profile-nav-element-icon');
        icon.empty();
        icon.append(_icon);

        colorIcon = Pard.Widgets.IconColor(color).render();
        icon.css({color: colorIcon});

        rgb = Pard.Widgets.IconColor(color).rgb();
        card.css({border: 'solid 2px' + color});
        card.hover(
          function(){
            $(this).css({'box-shadow': '0 0 2px 1px'+ color});
          },
          function(){
            $(this).css({'box-shadow': '0px 1px 2px 1px rgba(10, 10, 10, 0.2)'});
          }
        );
      }

      var _modify = function(new_artist){
        proposal.name = new_artist.name;
        proposal.phone = new_artist.phone;
        proposal.email = new_artist.email;
        proposal.profile_id = new_artist.profile_id;
        
        if(new_artist.proposals){
          var new_proposal = new_artist.proposals[0];
          if(new_proposal.proposal_id == proposal.proposal_id){
            for(var key in new_proposal) proposal[key] = new_proposal[key];
            _fillCard(proposal);
          }
        }
      }

      _fillCard(proposal);

      var _hideCard = function(){
        card.hide();
      }

      var _showCard = function(){
        card.show();
      }

      return {
        proposal,
        render: function(){
          return card;
        },
        setDay: function(day){
          if(day == 'permanent'){
            card.removeClass('artist-not-available-call-manager');
          }
          else if(proposal.availability && $.inArray(day, proposal.availability) < 0){
            card.addClass('artist-not-available-call-manager');
          }
          else{

            card.removeClass('artist-not-available-call-manager');
          }
        },
        modify: _modify
      }
    }

    var ArtistDropdownMenu = function(){
      var _menu = $('<ul>').addClass('menu');
      if (!artist.own){
        var _profileLink = $('<li>');
        var _profileCaller = $('<a>').attr({
          target: 'blank',
          href: '/profile?id=' + artist.profile_id
        }).text(Pard.t.text('dictionary.profile').capitalize());
        _profileLink.append(_profileCaller);
        _profileLink.click(function(event){
          event.stopImmediatePropagation();
        });
        _menu.append(_profileLink);
      }

      var _programLink = $('<li>');
      var _programCaller = $('<a>').attr('href','#/').text(Pard.t.text('dictionary.program').capitalize());

      _programCaller.on('click', function(){
        displayer.displayArtistProgram(artist.profile_id);
      });
      
      _programCaller.click(function(event){
        event.stopImmediatePropagation();
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

    var _accordion = Accordion();


    return{
      artist,
      proposals,
      program,
      accordion: _accordion.render(),
      name: () => artist.name,
      hasNoProgramNorProposals: () => Object.keys(proposals).is_empty() && Object.keys(program).is_empty(),
      setDay: day =>  Object.keys(proposals).forEach(proposal_id =>
          proposals[proposal_id].setDay(day)),
      addPerformance: performance => program[performance.show.id_time] = performance,
      deletePerformance: performance => delete program[performance.id_time],
      addProposal: proposal => {
        artist.proposals = artist.proposals || [];
        artist.proposals.push(proposal);
        proposals[proposal.proposal_id] = new ProposalCard(proposal);
        _accordion.addProposal(proposals[proposal.proposal_id]);
      },
      deleteProposal(proposal_id){
        if(proposal_id in proposals){
          proposals[proposal_id].render().remove();
          delete proposals[proposal_id];
          if(Object.keys(proposals) == 0){
            _accordion.render().remove();
          }
          artist.proposals = artist.proposals.filter(proposal => proposal.proposal_id != proposal_id);
        }
      },
      modify(new_artist){
        for(var key in new_artist){
          if (key != 'proposals') artist[key] = new_artist[key]
        }

        if (!new_artist['proposals']) new_artist['proposals'] = artist['proposals']

        if(new_artist.proposals && !new_artist.proposals.is_empty){
          new_artist.proposals[0].name = artist.name;
          new_artist.proposals[0].email = artist.email;
          new_artist.proposals[0].profile_id = artist.profile_id;

          artist.proposals = artist.proposals.filter(function(proposal){
            return proposal.proposal_id != new_artist.proposals[0].proposal_id;
          });
          artist.proposals.push(new_artist.proposals[0]);
        }
        _accordion.modify(new_artist);
      },
      select(proposal_id){
        const proposal = artist.proposals.find(p => p.proposal_id == proposal_id);
        proposal.selected = !proposal.selected;
        if (proposal.selected){
          _accordion.selectProposal(proposals[proposal_id]);
        }
        else {
          if(proposal_id in proposals){
            _accordion.deselectProposal(proposals[proposal_id]);
          }        
        }
      },
      modifyParam(params){
        const proposal = artist.proposals.find(p => p.proposal_id == params.proposal_id);
        proposal[params['param']] = params['value'];
      }
    }
  }
}(Pard || {}));