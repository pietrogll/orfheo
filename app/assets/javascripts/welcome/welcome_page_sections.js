'use strict';

(function(ns){
     
ns.Widgets = ns.Widgets || {};

  // ns.Widgets.NewsWelcomeSection = function(){
  //   var _createdWidget = $('<div>')
  //   var _cards = $('<div>').addClass('welcomeSection-container');
  //   var _searchResult = $('<div>').addClass('search-results-WelcomePage');

  //   Pard.NewsArray[Pard.Options.language()].forEach(function(news){
  //     var _nwcard = Pard.Widgets.NewsCard(news);
  //     _searchResult.append(
  //       $('<div>').append(_nwcard)
  //         .addClass('newsCard-welcomePage-container')
  //     );
  //   });

  //   _cards.append(_searchResult);

  //   _createdWidget.append(_cards);

  //   return{
  //     render: function(){
  //       return _createdWidget;
  //     }
  //   }
  // }

  // ns.Widgets.EventsWelcomeSection = function(){
  //   var _createdWidget = $('<div>')
  //   var _cards = $('<div>').addClass('welcomeSection-container');
  //   var _searchResult = $('<div>').addClass('search-results-WelcomePage');

  //   var _createdWidget = $('<div>');
  //   if (Pard.UserStatus['status'] == 'owner') var _myProfilesId = Pard.CachedProfiles.map(function(profile){
  //     return profile.id
  //   })
  //   else var _myProfilesId = [];
  //   Pard.Backend.events(function(data){   
  //     var events = data.events;
  //     events.forEach(function(event){
  //       var _myEvent = ($.inArray(event.profile_id, _myProfilesId))>-1;
  //       var _eventCardContainer = $('<div>').append($('<div>').append(Pard.Widgets.EventCard(event, _myEvent)).addClass('eventCard-container-welcomePage')).addClass('outer-eventCard-container-welcomePage');
  //       _searchResult.prepend(_eventCardContainer);
  //     })
  //   }); 

  //   var _titleEventText = $('<h5>')
  //     .text(Pard.t.text('eventsTab.contact'))
  //     .css({
  //       'display':'inline-block',
  //       'margin-bottom':0
  //     });
  //   var _eventText = $('<button>').attr('type','button')
  //     .append(
  //       _titleEventText, 
  //       Pard.Widgets.IconManager('navigation_right').render()
  //       .addClass('navigationIcon-findOutMore'))
  //     .on('click', function(){
  //       var _contactPopup = Pard.Widgets.Popup();
  //       _contactPopup.setContent(Pard.t.text('contact.eventContact.title'), Pard.Widgets.EventContact());
  //       _contactPopup.setCallback(function(){
  //         setTimeout(function(){
  //           _contactPopup.destroy();
  //         }, 500);
  //       });
  //       _contactPopup.open();
  //     })
  //     .addClass('callText-WelcomePage').css('margin-top','0');
  //   var _textDiv = $('<div>')
  //     .addClass('littleTextDiv')
  //     .append(
  //       $('<div>')
  //         .append(_eventText)
  //         .addClass('welcomeSection-container')
  //         .css('padding','2.5rem .5rem')
  //     );
  //   _searchResult.css({
  //     'min-height': 'calc(100vh - 4.5rem - 1.8rem - 7.7rem)'
  //   })
  //   _createdWidget.append(_cards.append(_searchResult), _textDiv);

  //   return{
  //     render: function(){
  //       return _createdWidget;
  //     }
  //   }
  // }

  // ns.Widgets.ProfilesWelcomeSection = function(){
  //   var _createdWidget = $('<div>')
  //   var _cards = $('<div>').addClass('welcomeSection-container');
  //   var _searchResult = $('<div>').addClass('search-results-WelcomePage');

  //   var _searchWidget = $('<input>')
  //     .attr({type: 'text', placeholder: Pard.t.text('widget.search.byName')})
  //     .css({padding: '0 3rem'})
 
  //   var _noMoreResults = false;
  //   var _pull_params = null

  //   Pard.Backend.loadResults(_pull_params, 'profiles', null, function(data){
  //     _pull_params = data.pull_params;
  //     data.profiles.forEach(function(profile){
  //       _searchResult.append(
  //         $('<div>').addClass('card-container-WelcomePage')
  //           .append(
  //             Pard.Widgets.CreateCard(profile).render()
  //               .addClass('position-profileCard-login')
  //               .attr({
  //               })
  //           )
  //       );
  //     });

  //     $(window).scroll(function(){
  //       if ($('.search-results-WelcomePage').height() + 84 +130 - $(window).height() - $(window).scrollTop() <= 100 ){
  //         if(!_searchWidget.hasClass('active')){
  //           _searchWidget.addClass('active');
  //           var spinner =  new Spinner({top: _searchResult.height()}).spin();
  //           $.wait(
  //             '', 
  //             function(){
  //             if (!(_noMoreResults)) _searchResult.append(spinner.el); 
  //             }, 
  //             function(){
  //               var query = {}
  //               if(_searchWidget.val()) query = {name: _searchWidget.val().trim()}
  //               Pard.Backend.loadResults(_pull_params, 'profiles', query, function(data){
  //                 console.log(data)
  //                 _pull_params = data.pull_params
  //                 if (data.profiles.length) {
  //                    data.profiles.forEach(function(profile){
  //                     _searchResult.append(
  //                       $('<div>').addClass('card-container-WelcomePage')
  //                         .append(Pard.Widgets.CreateCard(profile).render().addClass('position-profileCard-login')
  //                         .attr({
  //                         })
  //                       )
  //                     );
  //                   });
  //                 }
  //                 else{
  //                   _noMoreResults = true;
  //                 }
  //                 spinner.stop();
  //                 _searchWidget.removeClass('active');
  //               });
  //             }
  //           );
  //         }
  //       }
  //     });
  //   });

  //   var _searchInputContainer = $('<div>').addClass('search-input-WelcomePage-Container');
  //   var _searchIcon = $('<div>').append(Pard.Widgets.IconManager('search').render()).addClass('searchIcon-searchWidget-container');
  //   var _cleanIcon = $('<div>')
  //     .append($('<button>')
  //       .attr('type','button')
  //       .addClass('cleanIcon-searchWidget')
  //       .html('&times;'))
  //       .click(function(){
  //         if (_searchWidget.val()) _searchWidget.val('').trigger('change');
  //       })  
  //     .addClass('cleanIcon-searchWidget-container');
  //   var _searchInput = $('<div>').append(_searchWidget, _searchIcon, _cleanIcon).addClass('search-input-WelcomePage');
    
  //   _searchInputContainer.append(_searchInput);
    
  //   _cards.append(_searchResult);

  //   _searchWidget
  //   .on('change',function(){
  //     if(_searchWidget.val() == ''){
  //       _searchWidget.empty();
  //     }
  //   });

    
  //   var _search = function(){

  //     var spinner =  new Spinner().spin();
  //     $.wait(
  //       '', 
  //       function(){
  //         _searchResult.empty();  
  //         if (!(_noMoreResults)) _searchResult.append(spinner.el); 
  //       }, 
  //       function(){
  //         var query = {}
  //         if(_searchWidget.val().trim().length) query = {name: _searchWidget.val().trim()}
  //         Pard.Backend.loadResults(null, 'profiles', query, function(data){
  //           _pull_params = data.pull_params

  //           if(data.profiles.length){
  //             data.profiles.forEach(function(profile){
  //               _searchResult.append(
  //                 $('<div>').addClass('card-container-WelcomePage')
  //                   .append(Pard.Widgets.CreateCard(profile).render().addClass('position-profileCard-login')
  //                   .attr({
  //                     // target: '_blank'
  //                   })
  //                 )
  //               );
  //             });
  //           }
  //           else {
  //             var _message = $('<h6>').text(Pard.t.text('widget.search.noResults')).css('color','#6f6f6f');
  //             _searchResult.append(_message);
  //             _noMoreResults = true;
  //           }
  //         });
  //         spinner.stop();
  //       }
  //     );
  //   }


  //   _searchWidget.on('change', function(){
  //     _noMoreResults = false;
  //     _search();
  //   });

  //   var _goUpBtn = Pard.Widgets.goUpBtn().render();

  //   _createdWidget.append(_searchInputContainer, _cards, _goUpBtn);

  //   return{
  //     render: function(){
  //       return _createdWidget;
  //     },
  //     activate: function(){
  //       if(_searchWidget.hasClass('active')) _searchWidget.removeClass('active');
  //     },
  //     deactivate: function(){
  //       if(!_searchWidget.hasClass('active')) _searchWidget.addClass('active');
  //     },
  //   }

  // }


  ns.Widgets.WelcomeSection = function(){

    var _section = $('<div>');

    var _entryDiv = $('<div>').addClass('entryDiv');
    var _entryContentContainer = $('<div>').addClass('welcomeSection-container');
    var _entryContent = $('<div>').addClass('entryDiv-content');
    var _logo = $('<span>').append($('<div>').addClass('mainLogo-welcomePage'));
    var _logoBaseline = $('<div>').append($('<p>').text('your cultural community')).addClass('logoBaseline-welcomePage');
    var _logoContainer = $('<div>')
      .append($('<div>')
        .append(_logo, _logoBaseline).addClass('entryLogoContainer')
      )
      .css({
        'position': 'relative',
        'height': '100px',
        'margin-top':'2rem'
      });

    var _signUpBtn = Pard.Widgets.SignUpButton().render().addClass('signUpBtnWelcomePage');

    var printBackground = function (color) {
      var _rgb = Pard.Widgets.IconColor(color).rgb();
      var _backColor = 'rgba('+_rgb[0]+','+_rgb[1]+','+_rgb[2]+','+0.2+')';
      _entryDiv.css({'background':_backColor});
    }

    Pard.Backend.loadResults(null, 'profiles', null, function(data){
      printBackground(data.profiles[0].color);
    })

   
    _entryContent.append(
      _logoContainer, 
      _signUpBtn  
    );
    _entryDiv.append(_entryContentContainer.append(_entryContent));


// ===================================================
//  Section: "Entra en orfheo como:"
// ===================================================

    
    var _profilesDiv = $('<div>').addClass('actionDiv');
    var _titleProfiles = $('<h4>').html(Pard.t.text('welcome.profilesSection.title')).addClass('title-welcome');
    var _profilesContainer = $('<div>').addClass('welcomeSection-container');
    var _artist = $('<div>').addClass('i-container');
    var _iconArtist = $('<div>').append(Pard.Widgets.IconManager('artist').render());
    var _artistTitle = $('<h4>').text(Pard.t.text('dictionary.artist').capitalize());
    var _artistTxt = $('<p>').html(Pard.t.text('welcome.profilesSection.artist'));
    _artist.append($('<div>').append(_iconArtist, _artistTitle,_artistTxt).addClass('callServices-innerCont'));
    var _space = $('<div>').addClass('i-container');
    var _iconSpace = $('<div>').append(Pard.Widgets.IconManager('space').render());
    var _spaceTitle = $('<h4>').text(Pard.t.text('dictionary.space').capitalize());
    var _spaceTxt = $('<p>').html(Pard.t.text('welcome.profilesSection.space'));
    _space.append($('<div>').append(_iconSpace, _spaceTitle, _spaceTxt).addClass('consulingService-innerCont'));
    var _organization = $('<div>').addClass('i-container');
    var _iconOrganization = $('<div>').append(Pard.Widgets.IconManager('organization').render());
    var _organizationTitle = $('<h4>').text(Pard.t.text('dictionary.organization').capitalize());
    var _organizationTxt = $('<p>').html(Pard.t.text('welcome.profilesSection.organization'));
    _organization.append($('<div>').append(_iconOrganization, _organizationTitle, _organizationTxt).addClass('apiService-innerCont'));
    var _profilesBtn = Pard.Widgets.SignUpButton().render()
      .text(Pard.t.text('welcome.profilesSection.create'))
      .addClass('profilesBtn-welcomePage');
    var _profilesBtnContainer = $('<div>').append(_profilesBtn);
    var _profileTypeBox = $('<div>').append(_artist,_space,_organization).addClass('profileTypeBox-welcomePage');;
    _profilesContainer.append(_titleProfiles, _profileTypeBox, _profilesBtnContainer);
    
    _profilesDiv.append(_profilesContainer);


// ===================================================
//  Section: "CREA EN RED..."
// ===================================================

    var _actionDiv = $('<div>').addClass('actionDiv');
    var _actionContainer = $('<div>').addClass('welcomeSection-container');
    var _info1 = $('<div>').addClass('i-container');
    var _info2 = $('<div>').addClass('i-container');
    var _info3 = $('<div>').addClass('i-container');
    var _img1 = $('<div>').addClass('img1Box');
    var _img2 = $('<div>').addClass('img2Box');
    var _img3 = $('<div>').addClass('img3Box');
    var _text1 = $('<div>').addClass('txtBox').append($('<h4>').text(Pard.t.text('welcome.networkSection.subtitle1')), $('<p>').html(Pard.t.text('welcome.networkSection.section1')).addClass('txt_grey'));
    var _text2 = $('<div>').addClass('txtBox').append($('<h4>').text(Pard.t.text('welcome.networkSection.subtitle2')), $('<p>').html(Pard.t.text('welcome.networkSection.section2')).addClass('txt_grey'));
    var _text3 = $('<div>').addClass('txtBox').append($('<h4>').text(Pard.t.text('welcome.networkSection.subtitle3')), $('<p>').html(Pard.t.text('welcome.networkSection.section3')).addClass('txt_grey'));
    _info1.append($('<div>').addClass('innerCont1').append(_img1, _text1));
    _info2.append(_img2, _text2);
    _info3.append($('<div>').addClass('innerCont3').append(_img3, _text3));

    var _titleLongText = $('<h4>').html(Pard.t.text('welcome.networkSection.title')).addClass('title-welcome');
    var _callLongText = $('<a>').attr('href','/services')
      .text(Pard.t.text('welcome.networkSection.link'))
      .append(Pard.Widgets.IconManager('navigation_right').render()
        .addClass('navigationIcon-findOutMore'))
      .addClass('callText-WelcomePage');

    var _titleContainer = $('<div>').append(_titleLongText).css('margin-bottom','4.5rem');
    var _infoContainer = $('<div>').append(_info1, _info2, _info3)
    _actionDiv.append(_actionContainer.append(
      _titleContainer, 
      _infoContainer
      , _callLongText.css('margin-top','2.5rem')
    ));

// ===================================================
//  Section: "EL FUTURO ESTÁ AQUÍ"
// ===================================================


    var _titleLittleText = $('<h4>').html(Pard.t.text('welcome.inspireSection.title')).addClass('title-welcome').css('margin-bottom','1rem');
    var _littleText = $('<h6>')
      .html(Pard.t.text('welcome.inspireSection.section'))
      .css('margin-bottom','0')
    var _callLittleText = $('<button>').attr('type','button')
      .text(Pard.t.text('welcome.inspireSection.link'))
      .append(Pard.Widgets.IconManager('navigation_right').render()
        .addClass('navigationIcon-findOutMore'))
      .click(function(){
        $('#projectPopupBtn').trigger('click');
      })
      .css('margin-top','2rem')
      .addClass('callText-WelcomePage');
    // var _ibackground = $('<div>').addClass('background-initialSection');
    var _littleTextcontent = $('<div>')
          .addClass('pard-grid isContainer')
          .append(
      $('<div>').append(
        _titleLittleText, 
        _littleText, 
        _callLittleText)
      .addClass('welcomeSection-container')
    );
    var _littleTextDiv= $('<div>').append(_littleTextcontent).addClass('littleTextDiv');

// ===================================================
//  Section: "ORFHEO SERVICES"
// ===================================================



    var _servicesDiv = $('<div>').addClass('servicesDiv');
    var _logoServices = $('<div>').addClass('logo-services');
    var _servicesInfoContainer = $('<div>').addClass('welcomeSection-container');
    var _callService = $('<div>').addClass('i-container');
    var _iconCallService = $('<div>')
      .append(
        Pard.Widgets.IconManager('tools').render().addClass('servicesWelcome-icon')
          .css({
            'font-size': '3rem',
            'padding': '.25rem 0'
          })
        );
    var _callTitle = $('<h4>').text(Pard.t.text('welcome.servicesSection.subtitle1'));
    var _callTxt = $('<p>').html(Pard.t.text('welcome.servicesSection.section1'));
    _callService.append($('<div>').append(_iconCallService, _callTitle, _callTxt).addClass('callServices-innerCont'));
    var _consulingService = $('<div>').addClass('i-container');
    var _iconConsulingService = $('<div>').append(Pard.Widgets.IconManager('chat_bubble').render().addClass('servicesWelcome-icon'));
    var _consulingTitle = $('<h4>').text(Pard.t.text('welcome.servicesSection.subtitle2'));
    var _consulingTxt = $('<p>').html(Pard.t.text('welcome.servicesSection.section2'));
    _consulingService.append($('<div>').append(_iconConsulingService, _consulingTitle, _consulingTxt).addClass('consulingService-innerCont'));
    var _apiService = $('<div>').addClass('i-container');
    var _iconApiService = $('<div>').append(Pard.Widgets.IconManager('sincro').render().addClass('servicesWelcome-icon'));
    var _apiTitle = $('<h4>').text(Pard.t.text('welcome.servicesSection.subtitle3'));
    var _apiTxt = $('<p>').text(Pard.t.text('welcome.servicesSection.section3'));
    _apiService.append($('<div>').append(_iconApiService, _apiTitle, _apiTxt).addClass('apiService-innerCont'));

    var _findOutMoreIcon = Pard.Widgets.IconManager('navigation_right').render().addClass('navigationIcon-findOutMore');
    var _findOutMore = $('<div>')
      .append(
        $('<a>')
          .text(Pard.t.text('welcome.servicesSection.link'))
          .attr('href','/services')  
          .click(function(){
            $('#toServicesPage').trigger('click');
          })
          .append(_findOutMoreIcon)
      )
      .css({
        'text-align':'center',
        'margin':'2.5rem'
      })
    _servicesInfoContainer.append(
      _callService,
      _consulingService,
      _apiService
      , _findOutMore
    ); 
    var _textLogo = $('<div>').text(Pard.t.text('welcome.servicesSection.logo')).addClass('textLogo');
    _servicesDiv.append(_logoServices, _textLogo, _servicesInfoContainer);

    _section.append(
      _entryDiv
      // _profilesDiv.addClass('page-section').attr('id','p'),
      // _actionDiv.addClass('page-section').attr('id','c'),  
      // _littleTextDiv.addClass('page-section').attr('id','in'), 
      // _servicesDiv.addClass('page-section').attr('id','s')
    );

    return _section;

  }


}(Pard || {}));