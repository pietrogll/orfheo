'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.ProfileSectionHeader = function(){

    var profile = Pard.CachedProfile

    var owner = Pard.UserStatus['status'] == 'owner' || Pard.UserStatus['status'] == 'admin';
  
    var _sectionHeader = $('<section>').addClass('ProfileSectionHeader');
    var _photoContainer = $('<div>').addClass('section-profilePhoto-container');

    var _img;

    var _appendProfilePicture = function(profile_picture){
      _photoContainer.empty();
      _photoContainer.css({'background-color': profile.color});
      if(profile_picture && profile_picture.length){
        _img =  $.cloudinary.image(profile_picture[0],
          { 
            format: 'jpg', 
            width: 985, 
            height: 305,
            crop: 'fill', 
            effect: 'saturation:50' 
          });
        var _photoInnerContainer = $('<div>').addClass('photoInnerContainer')
        _photoContainer.append(
          _photoInnerContainer.append(_img)
        );
        var _popup;
        _img.one('mouseover', function(){
          var _popupImg = $.cloudinary.image(profile_picture[0],{ format: 'jpg',  width: 750, effect: 'saturation:50' });
          var _popupWidget = $('<div>').addClass('fast reveal full');
          var _outerContainer = $('<div>').addClass('vcenter-outer');
          var _innerContainer = $('<div>').addClass('vcenter-inner');
          var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'});
          _closeBtn.append($('<span>').html('&times'));
          _popup = new Foundation.Reveal(_popupWidget, {animationIn: 'fade-in', animationOut: 'fade-out'});
          _closeBtn.click(function(){
            _popup.close();
          })
          var _popupContent = $('<div>').addClass('popup-photo-container').append(_popupImg,_closeBtn);
          _innerContainer.append(_popupContent);
          _popupWidget.append(_outerContainer.append(_innerContainer));

          _popupWidget.click(function(e){
            if ($(e.target).hasClass('vcenter-inner')) {
              _popup.close();
            }
          });

          $('body').append(_popupWidget);
        });

        _img.click(function(){
          _popup.open();
        })

        _img.css({cursor:'pointer'});
      }
    }

    _appendProfilePicture(profile.profile_picture);
    

    $(window).load(function(){
      if (_img && !(_img[0].naturalHeight )) _photoContainer.empty();
    })

    var _circle = $('<div>').addClass('profile-header-circle').css('background-color',profile.color);
    var _circleContainer = $('<div>').css('position','relative').append(_circle);


    _sectionHeader.append(
      _photoContainer,
      _circleContainer
    );

    var _titleProfile = $('<div>').addClass('title-profile-section-container');
    var _textTitle = $('<h4>').text(profile['name']).addClass('text-title-profile-section'); 
    if(profile['name'] != null) _sectionHeader.append(
      _titleProfile.append(
        _textTitle
      )
    );

    var _buttonsContainer = $('<div>').addClass('profile-action-btn-container').appendTo(_titleProfile);

    var _appendButtons = function(buttons){
      _buttonsContainer.empty();
      if (!$.isEmptyObject(buttons)){
        _buttonsContainer.append(Pard.Widgets.RenderPersonalBtn(buttons));
      }
    }

    _appendButtons(profile.buttons);

    if (owner) _sectionHeader.append(Pard.Widgets.ModifyProfileBtn(profile).render());

    Pard.Bus.on('modifyProfile',function(){
      _appendProfilePicture(profile.profile_picture);
      _circle.css('background-color',profile.color);
      _appendButtons(profile.buttons);
      _textTitle.text(profile.name);
    })

    return _sectionHeader;

  }



  ns.Widgets.ProfileBlocksSection = function(displayer){

    var profile = Pard.CachedProfile;

    var _uri = new URI(document.location);
    var owner = Pard.UserStatus['status'] == 'owner' || Pard.UserStatus['status'] == 'admin';
    var _proposalCards = [];

// -------------- GENERAL LAYOUT  ---------------

    var _blocksSection = $('<section>').css('position','relative');

    var _navMenu = $('<nav>').addClass('profile-nav-menu');
    var _stickyNav = $('<nav>').addClass('stickyNavMenu-profile').css({'border-top-color': profile.color});
    var _aside = $('<aside>').addClass('profile-aside').attr({'id':'profileAside'});
    var _blocksContainer = $('<div>').addClass('blocks-container').attr({'id':'blocksContainer'});

    var _blocksInnerContainer = $('<div>');

    var _menu = $('<ul>');
    var _stickymenu = $('<ul>');
    var _profileNameStickyMenu = $('<span>').addClass('name-stickyMenu').text(profile.name);
    var _circleStickyMenu = $('<span>').addClass('circle-stickyMenu').css('background-color',profile.color);
    var _titleStickyMenu = $('<div>')
      .append(
        $('<h5>')
          .append(
            _circleStickyMenu, 
            _profileNameStickyMenu
          )
          .click(function(){
          $( 'html, body' )
            .animate(
              {
                'scrollTop': 0
              }, 
              200,
              '',
              function(){
                history.replaceState('','',_uri.hash(''))
              }
            )
          })
      )
      .addClass('titleStickyMenu');

    var _innerStickyNav = $('<div>')
      .append(_titleStickyMenu)
      .addClass('pard-grid')
      .appendTo(_stickyNav);
    

// ------------- MENUS AND BLOCKS --------------------
    var _mokProfile = function(){
      profile.menu.forEach(function(item){
        if (!profile['free_block']){
          profile['free_block'] = {
            name: Pard.t.text('profile_page.free_block.default_title'),
            description: "",
            links: null,
            photos: null,
            buttons: null
          }
        }
        if (!profile['space']) profile['space'] = []
        if (!profile['portfolio']) profile['portfolio'] = {
            proposals: []
          }
        })
    }

    if (owner) _mokProfile();

    var _menuDictionary = function(val){
      if(val == 'free_block'){
        if (profile.free_block) return profile.free_block.name; return '';
      }
      return Pard.t.text('profile_page.menu')[val];
     }

    var _blocksObj = {
      'menu' : {},
      'stikyMenu' : {},
      'blocks' : {},
      'itemSelected' : ''
    }

    var _selectItem = function(item){
      history.replaceState({}, item, _uri.hash('#'+item));
      $('.item-profileMenu-selected').each(function(pos, field){
          $(field).removeClass('item-profileMenu-selected');
        });
      _blocksObj.menu[item].addClass('item-profileMenu-selected');
      _blocksObj.stikyMenu[item].addClass('item-profileMenu-selected');
      _blocksObj.itemSelected = item;
    }

    var _scrollTo = function(item){
      $( 'html, body' ).animate({
        'scrollTop': $('#'+item).offset().top
      }, 200)
    }


    var _printFreeBlock = function(){
      
      var free_block = profile.free_block;

      var _modifyBlockBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('modify').render())
        .click(function(){
          Pard.Widgets.ModifyFreeBlock(profile)
        })
        .addClass('modifyBlockContentBtn');
      
      var _deleteBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          Pard.Widgets.ConfirmPopup('', _deleteFreeBlock);
        })
        .addClass('deleteBlockBtn');

      var _deleteFreeBlock = function(){
         Pard.Backend.deleteFreeBlock(free_block.id, function(data){
          if (data['status']== 'success'){
            profile['free_block'] = {
              name: "Bloque libre",
              description: "",
              links: null,
              photos: null,
              buttons: null
            } 
            Pard.Bus.trigger('modifyBlock', 'free_block');
            Pard.Bus.trigger('updateGallery', {'gallery': null, 'ids': [free_block.id]});
          }
          else{
            console.log(data)
          }
        })
      }

      var _content = $('<div>');
      if (owner && free_block.id) _content.append(_deleteBtn); 
      if (owner) _content.append(_modifyBlockBtn);
      var _descriptionContent = $('<div>')
        .addClass('information-info, freeBlock-description')
        .append(free_block.description);
      _content.append(_descriptionContent);
      if(free_block.photos){
        var _multimedias = $.cloudinary.image(free_block.photos[0],
          { 
            format: 'jpg', 
            width: 900, 
            height: 500,
            crop: 'fill', 
            effect: 'saturation:50' 
          });
        _content.append(_multimedias)
      }
      if (!$.isEmptyObject(free_block.buttons)){
        var _freeBlockBtn = $('<a>')
          .text(free_block.buttons.text)
          .addClass('profile-action-btn')
        if (free_block.buttons.link) _freeBlockBtn.attr({
           'href': free_block.buttons.link,
           'target': '_blank'
          }); 
        if (free_block.buttons.tooltip) _freeBlockBtn.attr({
            'title': free_block.buttons.tooltip
          });
        var _freeBlockBtnContainer = $('<div>').addClass('freeBlockBtn').append(_freeBlockBtn);
        _content.append(_freeBlockBtnContainer)
      }
      return _content ;
    }


    var _printDescriptionBlock = function(){

      var description = profile.description;
      var _descriptionContent = $('<div>').addClass('information-info');
      var _modifyBlockBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('modify').render())
        .click(function(){
          Pard.Widgets.ModifyDescriptionBlock(profile)
        })
        .addClass('modifyBlockContentBtn');
      
      var _deleteBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          Pard.Widgets.ConfirmPopup('', _deleteDescriptionBlock);
        })
        .addClass('deleteBlockBtn');

      var _deleteDescriptionBlock = function(){ 
        Pard.Backend.modifyProfileDescription('', profile.id, function(data){
          if (data['status']== 'success'){
            profile['description'] = '';
            Pard.Bus.trigger('modifyBlock', 'description');
          }
          else{
            console.log(data)
          }
        })
      }

      var _content = $('<div>');
      if (owner && description) _content.append(_deleteBtn);
      if (owner) _content.append(_modifyBlockBtn);
      _content.append(_descriptionContent.append(description));
      return _content ;
    }

    var _printSpaceBlock = function(){
      var _content = $('<div>');      
      var spaces = profile.space;
      var _addSpaceBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('add_circle').render())
        .click(function(){
          Pard.Widgets.AddSpace(profile)
        })
        .addClass('modifyBlockContentBtn');
      if (owner) _content.append(_addSpaceBtn);
      spaces.forEach(function(space){
        var _spaceCard = Pard.Widgets.SpaceCard(space, displayer);
        _spaceCard.setOwner(profile);
        var _spaceCardRendered = _spaceCard.render()
        _spaceCardRendered
          .click(function(e){
            e.preventDefault()
            displayer.displaySpaceList(space)
            history.replaceState({},space.id,_uri.hash('#'+'space&space='+space.id))
          })
          .css({
            'margin': '1rem 0',
            'display': 'inline-block'
          })
          .appendTo(_content);
      });
      return _content;
    }

    var _printPortfolioBlock = function(){
      var _content = $('<div>');    
      var portfolio = profile.portfolio;
      var _addPortfolioItem = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('add_circle').render())
        .click(function(){
          Pard.Widgets.AddPortfolioItem(profile)
        })
        .addClass('modifyBlockContentBtn');
      if (owner)  _content.append(_addPortfolioItem);
      portfolio.proposals.forEach(function(proposal){
        var _proposalCard = Pard.Widgets.ProposalCard(proposal);
        _proposalCards.push(_proposalCard);
        _proposalCard.setOwner(profile);
        var _proposalCardRendered = _proposalCard.render();
        _proposalCardRendered.click(function(e){
          e.preventDefault()
          displayer.displayProposalsList(proposal)
          history.replaceState({},proposal.id,_uri.hash('#'+'portfolio&proposals='+proposal.id))
        })
        .attr('href','#portfolio&proposals='+proposal.id)
        _content.append(_proposalCardRendered);
      })
      return _content;
    }

    var _printUpcomingBlock = function(){

      var upcoming = profile.upcoming;
      var _content = $('<div>');

      var _addEventBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('add_circle').render())
        .click(function(){
          Pard.Widgets.AddEventItem(profile)
        })
        .addClass('modifyBlockContentBtn');
      
      if (owner)  _content.append(_addEventBtn);
      
      var _printer = {
        activities: function(){
          return Pard.Widgets.ProgramsProfile(upcoming.activities, profile.id)
        },
        events: function(){
          return Pard.Widgets.UpcomingEvents(upcoming.events, profile.color, profile.name)
        }
      }
     
      for (var field in upcoming){
        _content.append(_printer[field]());
      }
      return _content;
    }

    var _printHistoryBlock = function(){
      var history = profile.history;
      var _content = $('<div>');
      var _printer = {      
        call_proposals: function(){
          return Pard.Widgets.MyCallProposals(history.call_proposals, profile.color).render()
        },
        events: function(){
          return Pard.Widgets.PastEvents(history.events, profile.color, displayer)
        },
        activities: function(){
          return Pard.Widgets.PastActivities(history.activities, profile.color, profile.id)
        }
      }
      
      var histrory_fields = ['call_proposals', 'events', 'activities'];
      histrory_fields.forEach(function(field){
        if (history[field]) _content.append(_printer[field]());
      });

      return _content;
    }  

    var _printBlockContent = {
      free_block: _printFreeBlock,
      upcoming: _printUpcomingBlock,
      space: _printSpaceBlock,
      history: _printHistoryBlock,
      portfolio: _printPortfolioBlock,
      description: _printDescriptionBlock
    }


    var _fillBlock = function(item){

      _blocksObj.blocks[item].empty();
      _blocksObj.menu[item].empty();
      _blocksObj.stikyMenu[item].empty();
      var _textItem = _menuDictionary(item);

      var _title = $('<div>')
          .append($('<span>').text(_textItem))
          .addClass('title-block');
      var _content = $('<div>').addClass('content-block');
      _blocksObj.blocks[item]
        .append(
          _title,
          _content.append(_printBlockContent[item]())
        );
      var _anchor = $('<div>').attr('id',item)
        .css({
          position:'absolute',
          bottom:'140px'
        })
        .appendTo(_title);

      _blocksObj.menu[item].append(
        $('<a>')
          .text(_textItem)
          .attr({'href':'#'+item})
          .click(function(e){
            e.preventDefault()
          })
      );

      _blocksObj.stikyMenu[item].append(
        $('<a>')
          .text(_textItem)
          .attr({'href':'#'+item})
          .click(function(e){
            e.preventDefault()
          })
        );

    }

    var _printedMenu = [];
    var _printedMenuLen = 0;
    var _blocksToBePrinted = [
      'free_block', 
      'upcoming', 
      'space',
      'description',
      'portfolio'
    ];

    profile.menu.forEach(function(item){
  
      if ( 
        (owner && $.inArray(item, _blocksToBePrinted)>-1) 
        || (profile[item] && !$.isEmptyObject(profile[item]) && !Object.keys(profile[item]).every(function(field){ return $.isEmptyObject(profile[item][field])}))
      ){       
        _blocksObj.menu[item] = $('<li>')
          .click(function(){
              _scrollTo(item)
            })
          .appendTo(_menu);
        _blocksObj.stikyMenu[item] = $('<li>')
          .click(function(){
            _scrollTo(item)
          })
          .appendTo(_stickymenu);

        _printedMenu.push(item);
        _printedMenuLen = _printedMenu.length;
  
        _blocksObj.blocks[item] = $('<div>').addClass('profile-block').appendTo(_blocksInnerContainer);             
        _fillBlock(item);
      
      }
    })

    var _reorderBlock = function(menu){
      menu.forEach(function(item){
        if (_blocksObj.blocks[item]) _blocksObj.blocks[item].detach().appendTo(_blocksInnerContainer);
        if (_blocksObj.menu[item]) _blocksObj.menu[item].detach().appendTo(_menu);
        if (_blocksObj.stikyMenu[item]) _blocksObj.stikyMenu[item].detach().appendTo(_stickymenu);
      })
      _printedMenu = profile.menu.filter(function(item){
        return Object.keys(_blocksObj.menu).indexOf(item)>-1;
      })
      _printedMenuLen = _printedMenu.length;
    }

    _stickyNav.css('display','none');


// ------------------   SCROLL BEHAVIOUR   ----------------------


    $(window).scroll(function(){
      if (_navMenu.offset().top-$(window).scrollTop()<50 && !_stickyNav.hasClass('navShown')) {
        _stickyNav.addClass('navShown');
        _stickyNav.slideDown(150);
      }
      else if (_navMenu.offset().top-$(window).scrollTop()>50 && _stickyNav.hasClass('navShown')) {
        _stickyNav.slideUp(150);
        _stickyNav.removeClass('navShown');
      }
      
      var i = _printedMenu.indexOf(_blocksObj.itemSelected);
      if (i>0) var previous = _printedMenu[(i+_printedMenuLen-1)%_printedMenuLen];
      if (i<_printedMenuLen-1 ) var next = _printedMenu[(i+1)];

      if (previous && $('#'+_blocksObj.itemSelected).offset().top - $(window).scrollTop()>50){
        _selectItem(previous);
      }
      else if (next && $('#'+next).offset().top - $(window).scrollTop()<50){
        _selectItem(next);
      }

    })

// ----------------------  ASIDE    ---------------

    var _asideContent = $('<div>');
    var _infoBlock = $('<div>').addClass('aside-block-item');
    var _multimediaBlockContainer = $('<div>');

    _asideContent.append(_infoBlock);

    var _printAsideInfo = function(profile){
      _infoBlock.empty();
      _infoBlock.append(
        $('<p>').text(Pard.t.text('dictionary.info').capitalize()).addClass('aside-block-title')
      );

      var _facets = $('<div>');
      profile.facets.forEach(function(facet){
        _facets.append(
          Pard.Widgets.PrimaryTag(Pard.t.text('facets.'+facet))
        )
      });
      _infoBlock.append(_facets);
      
      if (profile.tags && profile.tags.length){
        var _tags = $('<div>').css('margin-bottom','.5rem');
        profile.tags.forEach(function(tag){
        _tags.append(Pard.Widgets.SecondaryTag(tag))
        });
        _infoBlock.append(_tags);
      }

      if (profile.short_description){
        var _shortDescription = $('<p>');
        _infoBlock.append(_shortDescription.html(profile.short_description));
      }

      var _address = $('<div>').addClass('infoList-iconText');
      var _location = '';
      if (profile['address']['neighborhood']) _location += profile['address']['neighborhood']+' - ';
      _location += profile['address']['locality'];
      var _addressText = $('<a>').attr({
        href: 'https://maps.google.com/maps?q='+profile['address']['locality']+' '+profile['address']['postal_code'],
        target: '_blank'
        }).text(_location);
      _address.append(Pard.Widgets.IconManager('location').render().addClass('information-contact-icon-column'), $('<p>').addClass('information-contact-text-column').append(_addressText));
      _infoBlock.append(_address);
      if(profile.phone && profile.phone.visible.is_true() && profile.phone.value){
        var _phone = $('<div>').addClass('infoList-iconText');
        var _phoneIcon = Pard.Widgets.IconManager('phone').render().addClass('information-contact-icon-column');
        var _phoneText = $('<p>').addClass('information-contact-text-column type-text-info-box').append(profile.phone.value).css('vertical-align','-0.2rem');
        _infoBlock.append(_phone.append(_phoneIcon, _phoneText));
      }

     if(profile.email && profile.email.visible.is_true() && profile.email.value){
        var _email = $('<div>').addClass('infoList-iconText');
        var _emailIcon = Pard.Widgets.IconManager('email').render().addClass('information-contact-icon-column').css('font-size','24px');
        var _emailText = $('<a>').addClass('information-contact-text-column type-text-info-box').append(profile.email.value).css('vertical-align','-0.2rem').attr('href','mailto:'+profile.email.value);
        _infoBlock.append(_email.append(_emailIcon, _emailText));
      }

      if (profile.personal_web){
        _infoBlock.append(Pard.Widgets.PrintWebsList(profile.personal_web).render());
      }
    }

    _printAsideInfo(profile);
    

    _asideContent.append(_multimediaBlockContainer);

    var _printGalleryBlock = function(gallery){
      _multimediaBlockContainer.empty();
      if(gallery && gallery.length){
        var _multimediaBlock = $('<div>').addClass('aside-block-item multimediaAside').append(
          $('<p>').text(Pard.t.text('profile_page.aside.gallery')).addClass('aside-block-title')
        ); 
        var _multimedia = $('<div>').append(Pard.Widgets.MultimediaPreview(gallery, displayer));
        _multimediaBlock.append(_multimedia);
        _multimediaBlockContainer.append(_multimediaBlock);
      }
    }

    _printGalleryBlock(profile.gallery);


    if (profile.relations && profile.relations.length){
      var _relationsBlock = $('<div>').addClass('aside-block-item').append(
        $('<p>').text(Pard.t.text('profile_page.aside.relations')).addClass('aside-block-title')
      );
      profile.relations.forEach(function(relation){
        var _circleColor = $('<span>').addClass('circle-relation').css('background-color',relation.color); 
        _relationsBlock.append(
          $('<div>').append(
            $('<a>')
              .append(
                _circleColor,
                $('<span>').text(relation.name).css('vertical-align','middle')
              )
              .attr({'href':'/profile?id='+relation.id})
            )
        );
      })
      _asideContent.append(_relationsBlock);
    }
  
    _aside.append(_asideContent);


// --------------------URI NAV Y ONLOAD DEF   -----------------

    $(document).ready(function() {
      if ($(window).width() >640 && _printedMenu.length){
        $('#profileAside').stick_in_parent({offset_top: 100, offset_bottom:100});
        var _paddingBottom = $(window).height() - _blocksObj.blocks[_printedMenu[_printedMenu.length-1]].height()-88 ;
        if (_paddingBottom>0) $(_blocksContainer).css({
          'padding-bottom': _paddingBottom+'px'
        });
      }

      if (window.location.hash) { 
        var hash = _uri.fragment().split('&');
        var _hashBlock = hash[0];
        var _hashPopup = hash[1];
        var _blockSelected;
        var _popupSelected;

        if (_hashBlock.length && _hashBlock != 'gallery') {
          _blockSelected = $('#'+_hashBlock);
        }
        
        if (_blockSelected && $.inArray(_hashBlock,_printedMenu)>-1) {
          window.scrollTo(0, _blockSelected.offset().top);
          _blocksObj.menu[_hashBlock].addClass('item-profileMenu-selected');
          _blocksObj.stikyMenu[_hashBlock].addClass('item-profileMenu-selected');
          _blocksObj.itemSelected = _hashBlock;
        }
        else{
          history.replaceState({},'',_uri.hash('#'))
        }

        if(_hashPopup && _hashPopup.length) {
          var _openSelectedPopup = {
            portfolio: function(){
              var _typeOfItem = _hashPopup.split('=')[0];
              var _itemId = _hashPopup.split('=')[1];
              var _toBeDisplayed;
              if(profile.portfolio) _toBeDisplayed = profile.portfolio[_typeOfItem].find(function(el){return _itemId == el.id});
              if (_toBeDisplayed) displayer.displayProposalsList(_toBeDisplayed);
            },
            space: function(){
              var _spaceId = _hashPopup.split('=')[1];
              var _toBeDisplayed;
              if (profile.space) _toBeDisplayed = profile.space.find(function(el){return _spaceId == el.id});
              if (_toBeDisplayed) displayer.displaySpaceList(_toBeDisplayed);
            },
            gallery: function(){
              $(window).load(function(){
                displayer.displayGallery();
              })
            }
          }
          _openSelectedPopup[_hashBlock]();
        }
        if (_popupSelected){
          _popupSelected.open();
        }

      }
      else{
          $(window).scrollTop(0);
          if (_printedMenu.length){
            _blocksObj.itemSelected = _printedMenu[0];
            _blocksObj.menu[_blocksObj.itemSelected].addClass('item-profileMenu-selected');
            _blocksObj.stikyMenu[_blocksObj.itemSelected].addClass('item-profileMenu-selected');
          }
        }
    })

// ----------------  APPEND ELEMENT OF THE PAGE   ---------------

if (_printedMenu.length>1) {
      _innerStickyNav.append(_stickymenu);
      _navMenu.append(_menu);
    }

    _blocksSection.append(
      _stickyNav,
      _navMenu,
      _aside,
      _blocksContainer.append(_blocksInnerContainer)
    );


// ------------------------    BUS   ---------------------

    Pard.Bus.on('modifyProfile',function(){
      _printAsideInfo(profile);
      _reorderBlock(profile.menu);
      _stickyNav.css({'border-top-color': profile.color});
      _profileNameStickyMenu.text(profile.name);
      _circleStickyMenu.css('background-color',profile.color);
      _proposalCards.forEach(function(card){
        card.setOwner(profile);
      });
      Pard.Bus.trigger('reloadMenuHeaderDropdown');
      if (_blocksObj.blocks['history']) _fillBlock('history');
    })

    Pard.Bus.on('modifyBlock', function(item){
      _fillBlock(item);
    })

    Pard.Bus.on('updateGallery', function(element){
      Pard.Widgets.UpdateGallery(element.gallery, element.ids);
      _printGalleryBlock(Pard.CachedProfile.gallery);
    })



    return _blocksSection;

  }




}(Pard || {}));

