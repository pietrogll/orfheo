'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.SearchEngine = function(event_id) {

    var _createdWidget = $('<div>').addClass('search-engine-container');
    var _searchResult = $('<div>').addClass('search-results');
    var _searchWidget = $('<select>');


    function formatResource (resource) {
      if(!resource.id) return resource.text;
      var _label = $('<span>').text(resource.text);
      if(resource.type == 'city') var _icon = Pard.Widgets.IconManager('city_artist').render();
      else { var _icon = Pard.Widgets.IconManager(resource.icon).render();}
      _label.append(_icon);
      _icon.css({
        position: 'relative',
        left: '5px',
        top: '5px',
      });
      return _label;
    };
 
    var _shown = [];
    var tags = [];
    var _toBeShown = [];
    var _noMoreResults = false;

    Pard.Backend.searchProfiles([], [], event_id, function(data){
      _toBeShown = [];
      data.profiles.forEach(function(profile){
        if ($.inArray(profile.id, _shown) == -1) {
          _shown.push(profile.id);
          _toBeShown.push(profile);
        }      
      });
      Pard.Widgets.ProfileCards(_toBeShown).render().forEach(function(profileCard){
        _searchResult.append(profileCard);
      });

      var  _initialDistanceFromTop = $('.search-engine-container').offset().top;

      $(window).scroll(function(){

        if ($('.search-engine-container').height() - _initialDistanceFromTop - $(window).height() - $(window).scrollTop() <= 50 ){
          if(!_searchWidget.hasClass('active')){
            _searchWidget.addClass('active');
            var spinner =  new Spinner({top: _searchResult.height()}).spin();
            $.wait(
              '', 
              function(){
              if (!(_noMoreResults)) _searchResult.append(spinner.el); 
              }, 
              function(){
                tags = [];
                _searchWidget.select2('data').forEach(function(tag){
                  tags.push(tag.text);
                });
                Pard.Backend.searchProfiles(tags, _shown, event_id, function(data){
                  _toBeShown = [];
                  data.profiles.forEach(function(profile){
                    if ($.inArray(profile.id, _shown) == -1) {
                      _shown.push(profile.id);
                      _toBeShown.push(profile);
                    }      
                  });
                  if (_toBeShown.length) {
                    Pard.Widgets.ProfileCards(_toBeShown).render().forEach(function(profileCard){
                      _searchResult.append(profileCard);
                    });
                  }
                  else{
                    _noMoreResults = true;
                  }
                  spinner.stop();
                  _searchWidget.removeClass('active');
                });
              }
            );
          }
        }
      });
    });

    var _cleanIcon = $('<div>')
      .append($('<button>')
        .attr('type','button')
        .addClass('cleanIcon-searchWidget')
        .html('&times;'))
        .click(function(){
          //ATT! Very important to reset the select2 to empty by this method -->problem with duplicated tag if .val('') in place of .empty()
          if (_searchWidget.val()) _searchWidget.empty().trigger('change');
        })  
      .addClass('cleanIcon-searchWidget-container');

    var _searchInput = $('<div>').addClass('search-input');
    _searchInput.append(_searchWidget, _cleanIcon);

    var _searchTagsBoxContainer = $('<div>').addClass('searchTagBox-containerEventPage')
    var _searchTagsBox = $('<div>').addClass('search-tag-box');

    var _artisticCatObj = {
      'arts': {},
      'audiovisual': {},
      'craftwork': {},
      'gastronomy': {},
      'health': {},
      'literature': {},
      'music': {},
      'other': {},
      'street_art': {},
      'visual': {}
    };

    var _spaceCatObj = {
      'cultural_ass':{},
      'commercial':{},
      'home':{}, 
      'open_air':{}
    };

    var _organizationCatObj = {
      'festival':{},
      'association':{},
      'institution':{},
      'ngo':{},
      'collective':{},
      'interprise':{},
      'foundation':{}
    }

    var _typeObj = {
      'artist': _artisticCatObj, 
      'space': _spaceCatObj, 
      'organization': _organizationCatObj
    };
    
    var _objDictionary = function(data, obj){
      for (var field in obj) {
        var translation = Pard.t.text('dictionary.' + field) || Pard.t.text('categories.' + field);
        if (data.toUpperCase() == translation.toUpperCase()) {return obj[field];}
        else _objDictionary(translation, obj[field]);
      }
    }

    var _printTagFromObj = function(obj, field){
      var _typeTag = $('<div>').addClass('suggested-tag-search-engine');
      var _text = Pard.t.text('dictionary.' + field) || Pard.t.text('categories.' + field);
      _typeTag.click(function(){
        var option = new Option(_text, _text, true, true);
        _searchWidget.append(option);
        _searchWidget.trigger('change');
        _printTags(obj[field]);
      });
      var _icon = Pard.Widgets.IconManager(field).render();
      _icon.addClass('search-tag-icon');
      var _tagSpan = $('<span>').css('vertical-align','middle');
      _typeTag.append(_tagSpan.append(_icon, _text));
      _searchTagsBox.append(_typeTag);
    };
    
    var _printTags = function(obj){   
      _searchTagsBox.empty();   
      for (var field in obj){
        _printTagFromObj(obj, field);
      }
    }

    _printTags(_typeObj);
    _createdWidget.append(
      // _searchInput, 
      _searchResult
      );

    _searchWidget.select2({
      placeholder: Pard.t.text('widget.search.placeholder'),
      ajax: {
        url: '/search/suggest',
        type: 'POST',
        dataType: 'json',
        delay: 250,
        data: function (params) {
          var _query = [];
          _searchWidget.select2('data').forEach(function(element){
            _query.push(element.id);
          });
          _query.push(params.term);
          return {
            query: _query,
            page: params.page,
            event_id: event_id,
            lang: Pard.Options.language()
          };
        },
        processResults: function (data, params) {
          params.page = params.page || 1;
          return {
            results: data.items,
            pagination: {
              more: (params.page * 30) < data.total_count
            }
          };
        }
      },
      multiple: true,
      tags: true,
      tokenSeparators: [',', ' '],   
      templateResult: formatResource
    }).on("select2:select", function(e) {
      if(_searchWidget.select2('data') != false){
        if(e.params.data.isNew){
          $(this).find('[value="'+e.params.data.id+'"]').replaceWith('<option selected value="'+e.params.data.id+'">'+e.params.data.text+'</option>');
        }
      }
    })
    .on('change',function(){
      if(_searchWidget.select2('data').length==0){
        _searchWidget.empty();
      }
    });

    
    var _search = function(){

      var spinner =  new Spinner().spin();
      $.wait(
        '', 
        function(){
          _searchResult.empty();  
          if (!(_noMoreResults)) _searchResult.append(spinner.el); 
        }, 
        function(){
          _shown = [];
          tags = [];

          var _dataArray = _searchWidget.select2('data'); 
          _dataArray.forEach(function(tag){
            tags.push(tag.text);
          });
          Pard.Backend.searchProfiles(tags, _shown, event_id, function(data){
            _toBeShown = [];
            data.profiles.forEach(function(profile){
              if ($.inArray(profile.id, _shown) == -1) {
                _shown.push(profile.id);
                _toBeShown.push(profile);
              }      
            });
            if(_shown.length && _toBeShown.length){
              Pard.Widgets.ProfileCards(_toBeShown).render().forEach(
                function(profileCard){
                  _searchResult.append(profileCard);
                }
              )
            }
            else {
              var _message = $('<h6>').text(Pard.t.text('widget.search.noResults')).css('color','#6f6f6f');
              _searchResult.append(_message);
              _noMoreResults = true;
            }
          });
          if (_dataArray.length) _printTags(_objDictionary(_dataArray[_dataArray.length-1]['text'], _typeObj));
          else _printTags(_typeObj);
          spinner.stop();
        }
      );
    }


    _searchWidget.on('change', function(){
      _noMoreResults = false;
      _search();
    });


    return{
      render: function(){
        return _createdWidget;
      },
      activate: function(){
        if(_searchWidget.hasClass('active')) _searchWidget.removeClass('active');
      },
      deactivate: function(){
        if(!_searchWidget.hasClass('active')) _searchWidget.addClass('active');
      },
    }
  }

  ns.Widgets.ProfileCards = function (profiles) {
    var _createdWidget =  [];

    profiles.forEach(function(profile){
      _createdWidget.push(
        $('<div>')
          .addClass('card-container')
          .append(Pard.Widgets.CreateCard(profile).render()
            .addClass('position-profileCard-login')
            .attr({
              target: '_blank'
            })
          )
        );
    });

    return{
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.CreateCard = function(profile){
    var _card =$('<a>').attr({
      href: '/profile?id=' + profile['id']
    }).addClass('profileCard');
    Pard.Widgets.AddHoverShadow(_card, profile.color);
    
    var _photoContainer = $('<div>').addClass('photo-container-card');
    _photoContainer.css({background: profile.color});  

    if (profile.type == 'space' && !(profile.profile_picture)){ 
      if (profile.photos) profile.profile_picture = [profile.photos[0]];
    } 

    if(profile.profile_picture && profile.profile_picture.length){
      var _photo = $.cloudinary.image(profile['profile_picture'][0],
        { format: 'jpg', width: 174, height: 112,
          crop: 'fill', effect: 'saturation:50' });
      _photoContainer.append(_photo);
    };

    var _circle = $('<div>').addClass('circleProfile position-circleProfile-card').css({background: profile.color});
    var _icon = $('<div>').addClass('icon-profileCircle').html(Pard.Widgets.IconManager(profile.type).render());
    var _colorIcon = Pard.Widgets.IconColor(profile.color).render();
    _icon.css({color: _colorIcon});
    var _profilename = $('<span>').text(profile.name);
    var _name = Pard.Widgets.FitInBox(_profilename, 165, 45).render();
    _name.addClass('name-profileCard');
    var _profilecity;
    if (profile.city) _profilecity = profile.city;
    else _profilecity = profile.address.locality; 
  
    var _city = $('<div>').addClass('locality-profileCard').html(_profilecity);
    var _hline = $('<hr>').addClass('hline-profileCard');
    var _category = $('<div>').addClass('category-profileCard');
    var _facets = profile.facets.map(function(facet){
      return Pard.t.text('facets')[facet]
    })
    var _categories = _facets.join(','); 

    if (_categories.length>28)  _categories = _categories.substring(0,25)+'...';
    _category.html(_categories);
    _circle.append(_icon);

    var _tags = $('<div>').addClass('container--tag__profile-card');
    if (profile.tags){
      profile.tags.forEach(function(tag){
        _tags.append(Pard.Widgets.SecondaryTag(tag, 'small'))
      })
    }

    _card.append(
      _photoContainer, 
      _circle, 
      _name,
      _tags,
      _hline, 
      _city, 
      _category
    );
    
    return {
      render: function(){
        return _card;
      }
    }
  }

  ns.Widgets.EventCard = function(event){

    var lang = Pard.Options.language();
    var isProfessional = event.professional && event.professional.is_true()
    if (isProfessional){
      var _card = $('<a>').addClass('eventCard')
        .attr({
          'href':'/event?id='+ event.id+'&lang='+Pard.Options.language()
        });
    }
    else{
      var _card = $('<div>').addClass('eventCard')
    }

    Pard.Widgets.AddHoverShadow(_card, event.color);
   
    var _eventName = $('<h6>')
      .text(event.name)
      .addClass('name-eventCard ellipsis');
    
    
    var _imgContainer = $('<div>').addClass('imgContainer-eventCard');
    if (event.img && event.img[0]){
      var _pictureUrl = event['img'][0];
      var _img = $.cloudinary.image(_pictureUrl,
          { format: 'jpg', width: 152, height: 200,
            crop: 'fill', effect: 'saturation:50' });

      _imgContainer.append(_img);
    }
    else {
      _imgContainer.css({
        'background':event.color
      })
    }
    
    var _infoContainer = $('<div>').addClass('info-eventCard');
   
    var _placeIcon = $('<div>').addClass('icon-container').append(Pard.Widgets.IconManager('location').render());
    var _placeText = $('<div>').append(
      $('<a>')
        .attr({
          href: 'https://maps.google.com/maps?q='+event['address']['locality']+' '+event['address']['postal_code'],
          target: '_blank'
        })
        .text(event['address']['locality'])
        .click(function(e){
          e.stopPropagation();
        })
      )
      .addClass('text-container ellipsis');
    var _place = $('<div>').append(_placeIcon, _placeText).addClass('info-element-eventCard');
   
    var _dateIcon = $('<div>').addClass('icon-container').append(Pard.Widgets.IconManager('calendar').render());
    var _eventDays = event.eventTime.map(function(evt){ return evt.date})
    var _endDate;
    var _startDate = new Date(_eventDays[0]);
    
    var _eventDate = moment(_startDate).locale(lang).format('DD');
    if (_eventDays.length > 1){ 
      _endDate = new Date(_eventDays[_eventDays.length-1]);
      if (_startDate.getMonth() != _endDate.getMonth()) _eventDate += ' ' + moment(_startDate).locale(lang).format('MMMM');
      _eventDate += ' - '+moment(_endDate).locale(lang).format('DD MMMM YYYY');
    }
    else{
      _eventDate = moment(_startDate).locale(lang).format('DD MMMM YYYY');
    }
    var _dateText =  $('<div>').append($('<span>').text(_eventDate)).addClass('text-container');
    var _date = $('<div>')
      .append(_dateIcon, _dateText)
      .addClass('info-element-eventCard')
      .css({
        'margin-top': '2px'
      });
    
    _infoContainer.append(
      _eventName,
      _place, 
      _date
    );

    if (isProfessional){
  
      var _triangle = $('<div>')
        .addClass('triangle-eventCard')
        .css({
          'border-top-color': '#fff'
        })
      var _proText = $('<div>')
        .append('Professional')
        .addClass('diagonal-text')
      var _whiteTringle = $('<div>')
        .addClass('white-triangle-eventCard')
      _card.append(_triangle.append(_proText), _whiteTringle);
    
      
    }

    var _categories = $('<div>')
      .addClass('info-element-eventCard')
      .append(
        Pard.Widgets.PrimaryTag(Pard.t.text('event_type.' + event.type), 'small')
      )
    event.categories['artist'].forEach(function(cat){
      _categories.append(
        Pard.Widgets.CategoryTag(cat, 'small')
      )
      })
    _infoContainer.append(_categories);


   
    _card.append(
      _imgContainer, 
      _infoContainer
    );

    return _card;  
  }

  ns.Widgets.ProposalCard = function(proposal){

    var _proposalCard = $('<a>')
      .addClass('portfolio-proposalCard');
    var _titleContainer = $('<div>').addClass('header-proposalCard');
    var _titleBox = $('<div>')
      .append(
        $('<span>').text(proposal.title).addClass('text-title-proposalCard')
      )
      .addClass('titleBox-proposalCard ellipsis');
    var _imgBox = $('<div>').addClass('imgBox-proposalCard');
    if (proposal['main_picture'] && proposal['main_picture'].length){var _img = $.cloudinary.image(
        proposal['main_picture'][0],
        { 
          format: 'jpg', 
          height: 200,
          width: 320, 
          crop: 'fill', 
          effect: 'saturation:50' 
        }
      );
      _imgBox.append(_img);
    }
    var _cacheBox = $('<div>').addClass('cacheBox-proposalCard');
    var _cache = $('<div>').addClass('cache');
    var _formatTag = Pard.Widgets.PrimaryTag(Pard.t.text('formats')[proposal.format], 'small');
    var _categoryTag = Pard.Widgets.CategoryTag(proposal.category, 'small')
    var _infoBox = $('<div>')
      .addClass('infoBox-proposalCard')
      .append(
        _formatTag,  
        _categoryTag
      );
    var _tagsBox = $('<div>')
      .addClass('tagsBox-proposalCard');
    if (proposal.tags) var proposalTags = proposal.tags.map(function(tag){
      return Pard.Widgets.SecondaryTag(tag, 'small')
    })
    _tagsBox.append(proposalTags)
     
    var _ownerBox = $('<div>');
    _owner = Pard.Widgets.OwnerBlock(proposal); 
    _ownerBox.append(_owner).addClass('ownerBox-proposalCard');
    if (proposal.cache && 
      proposal.cache.value && 
      !proposal.cache.value.is_false() &&
      proposal.cache.visible && 
      proposal.cache.visible.is_true()){
      _cache.append(proposal.cache.value+' €');
    }
    _cacheBox.append(_cache);
    _proposalCard.append(
      _titleContainer.append(_imgBox, _titleBox), 
      _infoBox,
      _tagsBox, 
      _cacheBox, 
      _ownerBox
    );


    var setOwner = function(owner){
      _ownerBox.empty();
      _ownerBox.append(Pard.Widgets.OwnerBlock(owner));
      Pard.Widgets.AddHoverShadow(_proposalCard, owner.color);
      if (proposalTags) proposalTags.forEach(function(proposalTag){
        proposalTag.css({
          "border-width": "1px"
        })
      })
    }

    if (proposal.profile_color && proposal.profile_name) setOwner({
      color: proposal.profile_color,
      name: proposal.profile_name,
      id: proposal.profile_id
    });

    return {
      render: function(){return _proposalCard;},
      setOwner: function(owner){ setOwner(owner) }
    }
  }

  ns.Widgets.FormatTag = function(){

  }

  ns.Widgets.SpaceCard = function(space){

    var _spaceCard =  $('<a>')
      .attr('href','#space&space='+space.id)
      .addClass('spaceCard');
    Pard.Widgets.AddHoverShadow(_spaceCard, space.profile_color);

    var _imgContainer = $('<div>')
      .addClass('spaceCard-imgContainer')
      .css('background-color',space.color);
    var _infoContainer = $('<div>').addClass('spaceCard-infoContainer');

    if (space.main_picture && space.main_picture[0]){
      var _img = $.cloudinary.image(
        space.main_picture[0],
        { 
          format: 'jpg', 
          height: 200,
          width: 200, 
          crop: 'fill', 
          effect: 'saturation:50' 
        }
      );
      _imgContainer.append(_img)
    }
    
    var _spaceName = $('<h6>').html(space.name).addClass('spaceName-spaceCard'); 
    
    var _address = $('<div>')
    var _location = '';
    _location += space['address']['route']+' '+space['address']['street_number']+', '+space['address']['locality'];
    var _addressText = $('<p>').text(_location).addClass('address-spaceCard ellipsis');
    _address.append(_addressText)
    
    var _icons = $('<div>')
    var _spaceType = Pard.Widgets.PrimaryTag(Pard.t.text('space_type')[space.type].capitalize(), 'small')
      .css({
        'margin': 0,
      })

    var _type = $('<div>')
      .addClass('icon-info-spaceCard')
      .append(
        $('<span>')
          .append(_spaceType)
          .addClass('ellipsis')
          .css({
            'display':'inline-block',
            'width': '78%' 
          })
      );
    var _dimension = $('<div>')
      .addClass('icon-info-spaceCard dimension')
      .append(
        Pard.Widgets.IconManager('size').render().addClass('icon-spaceCard'),
        $('<span>').append(space.size+' m^2')
      );
    _icons.append(_type);
    if (space.size && space.size != 'false') _icons.append(_dimension);

    var _descriptionText = space.description;
    if (_descriptionText.length > 100) _descriptionText = Pard.Widgets.CutString(_descriptionText, 100)
    var _description = $('<div>')
      .html(_descriptionText)
      .addClass('description-spaceCard');

    var _ownerBox = $('<div>')

    _infoContainer.append(
      _spaceName, 
      _address, 
      _icons, 
      _description, 
      _ownerBox
    );
    _spaceCard.append(_imgContainer, _infoContainer)
    
    var _setOwner = function(owner){
      _imgContainer.css({
        'background-color': owner.color
      } );
      _ownerBox.empty().append(Pard.Widgets.OwnerBlock(owner));
    }
   
    if(space.profile_color){
      var _owner = {
        name: space.profile_name, 
        id: space.profile_id, 
        color: space.profile_color
      }
      _setOwner(_owner);
    }
    
    return {
      render: function(){
        return _spaceCard;
      },
      setOwner: function(owner){
        _setOwner(owner);
      }
    }
  }

  ns.Widgets.AddHoverShadow = function(card, color){
    card.hover(
      function(){
        card.css({
          'border': '1px solid '+color,
          'box-shadow': '0 1px 2px 1px '+ color
        });
      },
      function(){
        card.css({
          'box-shadow': 'none',
          'border': '1px solid #dedede'
        });
      }
    );;
  }


}(Pard || {}));