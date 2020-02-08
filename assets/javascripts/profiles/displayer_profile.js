'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.ProfileDisplayer = function(profile){

    console.log(profile)

    var owner = Pard.UserStatus['status'] == 'owner' || Pard.UserStatus['status'] == 'admin';

    var _content = $('<div>').addClass('very-fast reveal full');
    var _popup =  new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true, closeOnEsc:false});
    $(document).ready(function(){
      $('body').append(_content);
    })

    var _uri = new URI(document.location);

    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>').addClass('popup-container-full-large');
    var _sectionContainer = $('<section>').addClass('popup-content');
    var _header = $('<div>').addClass('content-popup-header');
    var _title = $('<h4>').addClass('small-11');
    var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'})
      .append($('<span>').html('&times;'));
    _header.append(_title, _closeBtn);
    _popupContent.append(_header, _sectionContainer);
    _container.append(_popupContent)
    _outerContainer.append(_container);

    var _closePopup = function(){

      _header.css({
        'background-color': '',
        'padding': '',
        'border-bottom': ''
      });
      _content.empty();
      _sectionContainer.empty();
      _title.empty();
      _container.empty().append(_popupContent.removeClass('proposal-popup'));
      _outerContainer.removeClass('displayNone-for-large');
      _popup.close();
    }
    
    _content.click(function(e){
      if ($(e.target).hasClass('vcenter-inner')) {
        _closePopup()
      }
    });

    var _displayList = function(type, item){
      var _dictionary = { }
      if (profile.space) _dictionary['space'] = {
          'list': profile.space,
          'display': _displaySpace
        }
      if (profile.portfolio)  _dictionary['proposals'] = {
          'list': profile.portfolio.proposals,
          'display': _displayProposal
        } 
      var _list = _dictionary[type]['list'];
      var _itemIndex = _list.findIndex(function(el, index){return el.id == item.id });
      var _display = function(itemIndex){
        var _nextItem = _list[itemIndex];
        _dictionary[type]['display'](_nextItem);
      };

      var _leftBtn = $('<div>')
        .append(
          $('<div>').append(Pard.Widgets.IconManager('navigation_left').render()).css('position','relative')
        )
        .addClass('leftBtn-listProgramSpace')
        .click(function(){
          _itemIndex = _itemIndex - 1
          if (_itemIndex < 0) _itemIndex = _list.length-1; 
         _display(_itemIndex);
        });
      var _rightBtn = $('<div>')
        .append(
          $('<div>').append(Pard.Widgets.IconManager('navigation_right').render().css('position','relative'))
        )
        .addClass('rightBtn-listProgramSpace')
        .click(function(){
          _itemIndex = _itemIndex + 1
          if(_itemIndex == _list.length) _itemIndex = 0;
          _display(_itemIndex);         
        });
      _container.append(_leftBtn, _rightBtn);
    }   

    var _displayProposalsList = function(proposal){
      if (profile.portfolio.proposals.length>1){
        _displayList('proposals', proposal);
      }
      _displayProposal(proposal);
    }


    var _displayEvent = function(event, profileBlock, pastEvent){
      
        _header.css({
          'padding': '0',
          'border-bottom': 'none'
        })
        _title.empty();
      
        _sectionContainer.empty();
        var _eventPopupContent = $('<div>');
        _sectionContainer.append(_eventPopupContent)
        
        event.color = event.color || profile.color 
        event.profile_name = event.profile_name || profile.name
        Pard.ReactComponents.Mount(
          'EventPopupContent', 
          {
            event: event, 
            isOwner: owner,
            blockToUpdate: profileBlock,
            pastEvent: pastEvent
          }, 
          _eventPopupContent
        );
       
        _closeBtn.click(function(){
          _closePopup()
        });
        
        if (!_content.html()) {
          _content.append(_outerContainer);
          _popup.open();
        }  
  
    }

    var _displayProposal = function(proposal){

      _header.css('background-color', Pard.Widgets.BackColor(profile.color));

      _sectionContainer.empty();
      _title.empty();
      history.replaceState({},proposal.id,_uri.hash('#'+'portfolio&proposals='+proposal.id));

      var _proposalContent = $('<div>');
      var _modifyBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('modify').render())
        .click(function(){
          var _proposal = Pard.CachedProfile['portfolio']['proposals'].find(function(prop){
            return prop.id == proposal.id;
          })
          Pard.Widgets.ModifyPortfolioProposal(_proposal, profile)
        })
        .addClass('modifyProfileComponentsBtn');
      var _deleteBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          Pard.Widgets.ConfirmPopup('', _deleteProposal)
        })
        .addClass('deleteProfileComponentBtn');

      var _headerBtnContainer = $('<div>').append(_deleteBtn, _modifyBtn).addClass('header-popup-btns');

      var _deleteProposal = function(){
        Pard.Backend.deleteProposal(proposal.id, function(data){
          if (data['status']== 'success'){
            var _index = profile['portfolio']['proposals'].findIndex(function(el) {return el.id == proposal.id})
            profile.portfolio.proposals.splice(_index,1);
            Pard.Bus.trigger('updateGallery', {'gallery': null, 'ids': [proposal.id]});
            Pard.Bus.trigger('modifyBlock', 'portfolio');
            _closePopup();
          }
          else{
            console.log(data)
          }
        })
      }

      var _sectionContent = Pard.Widgets.ProposalPopupContent(proposal.id);

      _proposalContent.append(_sectionContent)


      if(owner) _proposalContent.append(_headerBtnContainer);

      
      _sectionContainer.append(_proposalContent);
      _title.append(
        $('<span>').text(proposal.title)
      )
      _closeBtn.click(function(){
        _closePopup()
      });
      
      if (!_content.html()) {
        _content.append(_outerContainer);
        _popup.open();
      }  

    }

    var _displaySpaceList = function(space){
      if (profile['space'].length>1){
        _displayList('space', space);
      }
      _displaySpace(space);
    }    


    var _displaySpace = function(space){

      _header.css('background-color', Pard.Widgets.BackColor(profile.color));
      _sectionContainer.empty();
      _title.empty();
      history.replaceState({},space.id,_uri.hash('#'+'space&space='+space.id));

      var _spaceContent = $('<div>');
      var _modifyBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('modify').render())
        .click(function(){
          var _space = Pard.CachedProfile['space'].find(function(sp){
            return sp.id == space.id;
          })
          Pard.Widgets.ModifySpace(_space, profile)
        })
        .addClass('modifyProfileComponentsBtn');
      var _deleteBtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('delete').render())
        .click(function(){
          Pard.Widgets.ConfirmPopup('', _deleteSpace)
        })
        .addClass('deleteProfileComponentBtn');
      var _headerBtnContainer = $('<div>').append(_deleteBtn, _modifyBtn).addClass('header-popup-btns');

      var _deleteSpace = function(){
         Pard.Backend.deleteSpace(space.id, function(data){
          if (data['status']== 'success'){
            var space_ambients_ids =  space.ambients.reduce(function(arr_ids, amb){return arr_ids.concat(amb.id)},  [space.id])
            var _index = profile['space'].findIndex(function(el) {return el.id == space.id})
            profile.space.splice(_index,1);
            Pard.Bus.trigger('updateGallery', {'gallery': null, 'ids': space_ambients_ids});
            Pard.Bus.trigger('modifyBlock', 'space');
            _closePopup();
          }
          else{
            console.log(data)
          }
        })
      }

      var _sectionContent = Pard.Widgets.SpacePopupContent(space.id);

      _spaceContent.append(_sectionContent);

      if(owner) _spaceContent.append(_headerBtnContainer);
          
      _sectionContainer.append(_spaceContent);
      _title.append(
        $('<span>').text(space.name).css('vertical-align','middle')
      );
      _closeBtn.click(function(){
        _closePopup()
      });

      if (!_content.html()) {
        _content.append(_outerContainer);
        _popup.open();
      }  
      
    }

    var _galleryPopup;
    var _uri = new URI(document.location);

    var _displayGallery = function(){
     
      if (!_galleryPopup){

        var _content = $('<div>').addClass('very-fast reveal full');
        _galleryPopup =  new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true, closeOnEsc:false});
        $('body').append(_content);

        var _galleryContent = $('<div>');
        var _outerContainer = $('<div>').addClass('vcenter-outer');
        var _container = $('<div>').addClass('vcenter-inner');
        var _popupContent = $('<div>').addClass('popup-container-full');
        var _sectionContainer = $('<section>').addClass('popup-content');
        var _header = $('<div>').addClass('row popup-header');
        var _title = $('<h4>').addClass('small-11 popup-title');
        var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'})
          .append($('<span>').html('&times;'));
        _header.append(_title, _closeBtn);
        _popupContent.append(_header, _sectionContainer);
        _container.append(_popupContent)
        _outerContainer.append(_container);
        _sectionContainer.append(_galleryContent);
        _title.text('Gallery');
        _content.append(_outerContainer);

        _closeBtn.click(function(){
          _galleryPopup.close();
        });

        _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
            _galleryPopup.close();
          }
        });

        var _gallery = profile.gallery;
        
        var _addMultimediaBtn = Pard.Widgets.Button('AÑADE ELEMENTOS A LA GALERÍA',function(){_addMultimedia()});
          var _addMultimedia = function(){
            var _addMultimediaPopup = Pard.Widgets.Popup();
            var _addMultimediaTitle = 'NUEVOS MULTIMEDIAS';
            var _addMultimediaContent = $('<div>').append(Pard.Widgets.AddMultimediaMessage().render());
            _addMultimediaPopup.setContent(_addMultimediaTitle, _addMultimediaContent);
            _addMultimediaPopup.setCallback(function(){
                setTimeout(function(){
                  _addMultimediaPopup.destroy();
                },500)
              });      
            _addMultimediaPopup.open();
        }
        
        // _galleryContent.append(_addMultimediaBtn.render());

        var _multimediasObj = {};
        _multimediasObj['photos'] = [];
        _multimediasObj['links'] = [];
       
        for(var album in profile.gallery){
          if (profile.gallery[album].photos) _multimediasObj['photos'] = _multimediasObj['photos'].concat(profile.gallery[album].photos);
          if (profile.gallery[album].links) _multimediasObj['links'] = _multimediasObj['links'].concat(Object.keys(profile.gallery[album].links).map(function(key) {return profile.gallery[album].links[key];}))
        }

        var _spinner = new Spinner();
        _spinner.spin();
        $('body').append(_spinner.el); 
        Pard.Widgets.MultimediaDisplay(_multimediasObj, function(multimedias){
          for (var type in multimedias){
            var _multimediasContainer = $('<div>')
              .addClass('gallery-multimediasContainer-'+type);
            multimedias[type].forEach(function(media){
              _multimediasContainer.append(
                $('<div>').append(media).addClass('media-'+type)
              );  
            })
            _galleryContent.append(_multimediasContainer);        
          }
          _spinner.stop();    
        })

      }    

      history.replaceState({},'gallery',_uri.hash('#gallery&gallery'));
      _galleryPopup.open();

      Pard.Bus.on('updateGallery', function(){
        if (_galleryPopup) _galleryPopup.destroy();
        _galleryPopup = null;
      })
      
    }

    Pard.Bus.on('modifyProposal', function(proposal){_displayProposalsList(proposal)});
    Pard.Bus.on('modifySpace', function(space){
      _displaySpaceList(space)
    });


    return {
      displaySpace: _displaySpace,
      displayProposal: _displayProposal,
      displayProposalsList: _displayProposalsList,
      displaySpaceList: _displaySpaceList,
      displayGallery: _displayGallery,
      displayEvent: _displayEvent,
      close: function(){
        _popup.close();
      }
    }
  }

  Pard.Widgets.BackColor = function(color){
    var _rgb = Pard.Widgets.IconColor(color).rgb();
    return 'rgba('+_rgb[0]+','+_rgb[1]+','+_rgb[2]+','+0.2+')';
  }


}(Pard || {}));
