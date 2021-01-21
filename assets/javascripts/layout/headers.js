'use strict';

(function(ns){

ns.Widgets = ns.Widgets || {};

  ns.Widgets.MakeCallBtn = function () {
    
    if(window.innerWidth<1024)  var btnText = Pard.t.text('header.callToActionSmallScreen');
    else var btnText = Pard.t.text('header.callToAction');

    return{
        render: function(){ 
          return $('<span>')
            .append(
              $('<a>')
                .attr('href','/services')
                .append(
                  btnText
                )
              )
            .addClass('makeCallBtn');
      }
    }
  }

  ns.Widgets.ExploreBtn = function  () {

    if(window.innerWidth<1024)  var btnText = Pard.Widgets.IconManager('search').render().css('vertical-align','middle');
    else var btnText = Pard.t.text('header.goToSearchPage');


    return{
      render: function(){
        return $('<span>')
          .append(
            $('<a>')
              .attr('href','/search/profiles')
              .append(
                btnText 
              )
          )
          .addClass('exploreBtn');
      }
    }
  }

  
  ns.Widgets.LoginHeader = function(elementOffCanvas, event_id){

    $(document).on('show.zf.dropdown', function() {
      _loginText.addClass('iconDropdown-clicked');
      $('header').css('overflow','visible');
    });
    $(document).on('hide.zf.dropdown', function(){
      _loginText.removeClass('iconDropdown-clicked');
      $('header').css('overflow','hidden');
    });   

    var _createdWidget = $('<header>').addClass('orfheoHeader');
    var _innerHeaderContainer = $('<div>').addClass('innerWrapperDiv');
    var _upperContainer = $('<div>').addClass('upperContainerHeader black fixed'); 
    var _upperBlack = $('<div>').addClass('black');
    var _upperContent = $('<div>').addClass('pard-grid contentHeader');  

    var _semicircleTop = $('<div>').addClass('semiCircleHeaderTop');
    
    var _responsiveMenu = $('<span>').addClass('clearfix displayNone-for-large');
    var _elemOffCanvas = $('<span>').addClass('menu-icon-header');
    var _iconOffCanvas = $('<span>').addClass('menu-icon');
    _elemOffCanvas.append(_iconOffCanvas).attr({'data-toggle': 'offCanvas-navBar', 'close-on-click': true}).css('cursor','pointer');
    _elemOffCanvas.click(function(){$(window).scrollTop(0);});
    _responsiveMenu.append(_elemOffCanvas);

    var _rightContainer = $('<div>');
    _rightContainer.addClass('loginContainer');
    var _loginInputs = $('<div>')
      .append(
        Pard.Widgets.Login().render()
          .addClass('login-container')
        )
        .css({
          'width':'100%', 
          'height':'100%'
        });
    var _loginText = $('<button>')
      .attr({
        'type': 'button', 
        'data-toggle':'loginDropDown'
      })
      .text('Login')
      .addClass('loginText')
      .append(
        Pard.Widgets.IconManager('arrowDropDown').render().addClass('arrowLoginDropdown')
      )
    var _loginWidget = $('<div>').append(_loginInputs)
      .addClass('dropdown-pane container-loginNavHeader').attr({'id':'loginDropDown', 'data-dropdown':'', 'data-close-on-click':true});
    _rightContainer.append(
      _loginText, 
      _loginWidget, 
      Pard.Widgets.SignUpButton(event_id).render().addClass('signUpHeader-welcomePage')
    );  
    
    var _semicircleTopContainer =  $('<div>').addClass('semiCircleHeaderTop-container fixed');

    var _leftContainer = Pard.Widgets.HeaderLeftContainer().render();
    var _logoContainer = Pard.Widgets.LogoContainer().render();

    _upperContent.append( _leftContainer, _logoContainer );
     if (elementOffCanvas){  
      _upperContent.append(_responsiveMenu);
      _leftContainer.addClass('offCanvas-leftContainer')
    }
     
     _upperContent.append(_rightContainer);

    _innerHeaderContainer.append(
      _upperContainer.append(_upperBlack.append(_upperContent)),
      _semicircleTopContainer.append(_semicircleTop)
    );
    _createdWidget.append(_innerHeaderContainer);

    _leftContainer.prepend(Pard.Widgets.MakeCallBtn().render())
      
    return {
      render: function(){
        return _createdWidget;
      },
      positionRelative: function(){
        _upperContainer.removeClass('fixed');
        _semicircleTopContainer.removeClass('fixed').addClass('semicirclePositionRelative');
      }
    }
  }

  ns.Widgets.HeaderLeftContainer = function () {
    return {
      render: function(){
        return (
          $('<div>')
            .append(Pard.Widgets.ExploreBtn().render())
            .css({
              display: 'inline-block'
            })
        )
      }
    }
  }

  ns.Widgets.LogoContainer = function () {
    var _logo = $('<a>').append($('<div>').addClass('logo-header')).attr('href','/');
    return{
      render: function(){
        return(
          $('<div>').append(_logo).addClass('logoBtn-navHeader')
        )
      }
    }
  }

  ns.Widgets.InsideHeader = function(elementOffCanvas, fixed){
    $(document).on('show.zf.dropdown', function() {
      _settingsDropdown.addClass('iconDropdown-clicked');
      $('header').css('overflow','visible');
    });
    $(document).on('hide.zf.dropdown', function(){
      _settingsDropdown.removeClass('iconDropdown-clicked');
      $('header').css('overflow','hidden');
    });   

    var _createdWidget = $('<header>').addClass('orfheoHeader');
    var _innerHeaderContainer = $('<div>').addClass('innerWrapperDiv');
    var _upperContainer = $('<div>').addClass('upperContainerHeader black'); 
    if (fixed) _upperContainer.addClass('fixed');
    var _upperBlack = $('<div>').addClass('black');
    var _upperContent = $('<div>').addClass('pard-grid contentHeader'); 


    var _semicircleTop = $('<div>').addClass('semiCircleHeaderTop');

    var _responsiveMenu = $('<span>').addClass('clearfix displayNone-for-large');
    var _elemOffCanvas = $('<span>').addClass('menu-icon-header');
    var _iconOffCanvas = $('<span>').addClass('menu-icon');
    _elemOffCanvas.append(_iconOffCanvas).attr({'data-toggle': 'offCanvas-navBar', 'close-on-click': true}).css('cursor','pointer');
    _elemOffCanvas.click(function(){$(window).scrollTop(0);});
    _responsiveMenu.append(_elemOffCanvas);

    var _rightContainer = $('<div>');
    var _rightMenu = $('<ul>').addClass('rightMenu-navHeader');
    var _init = $('<li>')
      .append($('<a>').attr('href','/')
        .text(Pard.t.text('header.home'))
      )
      .addClass('initText');
    var _menuDropdown = Pard.Widgets.InsideDropdownMenu();
    Pard.Bus.on('reloadMenuHeaderDropdown', function(){
      _menuDropdown.reload();
    });
    var _settingsDropdown = $('<li>')
      .append(_menuDropdown.render());
    _rightContainer.append(_rightMenu.append(_init, _settingsDropdown)).addClass('rightContent-insideNavMenu');  
    
    var _semicircleTopContainer =  $('<div>').addClass('semiCircleHeaderTop-container');
    if (fixed) _semicircleTopContainer.addClass('fixed');
    else _semicircleTopContainer.addClass('semicirclePositionRelative');
    
    var _leftContainer = Pard.Widgets.HeaderLeftContainer().render();
    var _logoContainer = Pard.Widgets.LogoContainer().render();

    _upperContent.append( _leftContainer, _logoContainer );

    if (elementOffCanvas) {
      _upperContent.append(_responsiveMenu);
      _leftContainer.addClass('offCanvas-leftContainer');
    }
    _upperContent.append(_rightContainer);
  
    _innerHeaderContainer.append(
      _upperContainer.append(_upperBlack.append(_upperContent)),
      _semicircleTopContainer.append(_semicircleTop)
    );
    _createdWidget.append(_innerHeaderContainer);

    _leftContainer.prepend(Pard.Widgets.MakeCallBtn().render())


    return {
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.InsideDropdownMenu = function(user){   

    var _eventManagerChoice = {};
    var _contactChoice = $('<div>');

    $(document).on('show.zf.dropdown', function() {
      _iconDropdownMenu.addClass('iconDropdown-clicked');
    });
    $(document).on('hide.zf.dropdown', function(){
      _iconDropdownMenu.removeClass('iconDropdown-clicked');
      for(var id in _eventManagerChoice){
        _eventManagerChoice[id].removeClass('showEventManagerChoice');
      }
      _contactChoice.removeClass('showEventManagerChoice');
    });

    var _createdWidget = $('<div>');       

    var _menuContainer = $('<div>').addClass('dropdown-pane container-insideMenu').attr({'id':'insideMenuDropDown', 'data-close-on-click':true, 'data-dropdown':''});  
    var _menu = $('<ul>').addClass('dropdownHeaderMenu');

    var _menuProfiles = $('<ul>').addClass('dropdownMenu menuProfiles');
    var _menuEvents = $('<ul>').addClass('dropdownMenu menuEvents');
    var _menuSettings = $('<ul>').addClass('dropdownMenu menuSettings')
    var _menuAdmin = $('<ul>').addClass('dropdownMenu')
    var _liProfiles = $('<li>');
    var _liEvents = $('<li>');
    var _liAdmin =  $('<li>');

    var _logout = $('<li>').append(Pard.Widgets.Logout().render());
    
    
    // _settingsPopup.setCallback(function(){});
    var _settingsCaller = $('<a>')
      .text(Pard.t.text('header.insideDropdown.settings'))
      .on('click', function(e){
        e.preventDefault();
        var hash = '';
        if (window.location.hash) hash = window.location.hash + '&settings';
        else hash= '#&settings';
        history.replaceState({}, 'settings',  hash);
        _menuContainer.foundation('close');
        var _settingsWidget = Pard.Widgets.SettingsPopup();
        var _settingsPopup = _settingsWidget.render();
        if (Pard.UserInfo['interests']) _settingsWidget.setVal(Pard.UserInfo['interests']);
        _settingsPopup.open();
      });
    var _settings = $('<li>').append(_settingsCaller);

    var _contact = $('<li>').append(
      $('<a>')
        .attr('href','#')
        .append(Pard.t.text('header.insideDropdown.contact'))
        .hover(
          function(){
            _contactChoice.addClass('showEventManagerChoice');
          },
          function(){
            setTimeout(function(){
              if (!(_contactChoice.hasClass('isOver'))) _contactChoice.removeClass('showEventManagerChoice');
            },200)
            
          }
        )
        .click(function(){
           if (!(_contactChoice.hasClass('showEventManagerChoice'))) _contactChoice.addClass('showEventManagerChoice');
           else _contactChoice.removeClass('showEventManagerChoice');
        })
        .css('cursor','default'),
      _contactChoice
    )

    _contactChoice
      .addClass('eventMananagerChoice')
      .append(
        $('<ul>').append(
        $('<li>').append($('<a>').text('Facebook').attr({'href':'https://www.facebook.com/orfheo.org', 'target':'_blank'}))
        .click( function(){
          _contactChoice.removeClass('showEventManagerChoice');
          _menuContainer.foundation('close');
        }),
        $('<li>').append(
        $('<a>').text('Email').attr('href','#'))
        .click( function(){
          var _contactPopup = Pard.Widgets.Popup();
          _contactPopup.setContent(Pard.t.text('contact.contactUs.title'), Pard.Widgets.ContactOrfheo());
          _contactPopup.setCallback(function(){
            setTimeout(function(){
              _contactPopup.destroy();
            }, 500);
          });
          _contactPopup.open();
          _contactChoice.removeClass('showEventManagerChoice');
          _menuContainer.foundation('close');
        })
      ))
      .hover(
        function(){
          _contactChoice.addClass('isOver');
        },
        function () {
          _contactChoice.removeClass('isOver showEventManagerChoice')
        }
      );
    
    user = user || Pard.UserStatus.status == 'owner';

    if (user){
      var _deleteUserPopup;
      var _deleteUserMex = Pard.Widgets.DeleteUserMessage();
      var _deleteCaller = $('<a>').attr('href','#').text(Pard.t.text('header.insideDropdown.delete'))
        .one('click', function(){
          _deleteUserPopup = Pard.Widgets.Popup();
          _deleteUserMex.setCallback(function(){_deleteUserPopup.close()});
          _deleteUserPopup.setContent(Pard.t.text('popup.delete.title'),_deleteUserMex.render());
          _deleteUserPopup.setCallback(function(){});
        })
        .click(function(){
          _menuContainer.foundation('close');
          _deleteUserPopup.open();
        });
      var _deleteUser = $('<li>').append(_deleteCaller).appendTo(_menuSettings);
    }

    _menuSettings.append(
      _settings, 
      _contact,  
      _logout
    );

    var _loadHeader = function(){
      Pard.Backend.header(function(data){
        var _profileList = ''
        if(data.status == 'success'){
          Pard.UserInfo['interests'] = data.interests;
          if (data.admin == true) _menuAdmin.append(
            $('<li>').append($('<a>').attr('href','/admin').text('Admin'),
             $('<li>').addClass('separatorBold') )
            )
          else _liAdmin.hide();
          data.profiles.forEach(function(profile){
            _profileList += profile.name+', '
            var _circle = $('<div>').addClass('circleProfile-MenuHeader').css('background',profile.color);
            var _profileNameTetx =  profile.name
            if (_profileNameTetx.length >28) _profileNameTetx = _profileNameTetx.substring(0,26) + '...'
            var _profileName = $('<span>').text(_profileNameTetx);
            _menuProfiles.append(
              $('<li>').append($('<a>').append(_circle, _profileName).attr('href','/profile?id='+profile.id)))
              .click( function(){
                  _menuContainer.foundation('close');
                }
              )
          });
          _profileList = _profileList.substring(0, _profileList.length - 2);
          Pard.UserInfo['userProfiles'] = _profileList;
          var _profilesSeparator = $('<li>').addClass('separatorBold');
          _menuProfiles.append(_profilesSeparator);
          if(data.profiles.length>0) _liProfiles.show();
          else _liProfiles.hide();
          data.events.forEach(function(event){
            var en = event.name;
            if (en.length>28) en = en.substring(0,26) + '...';
            var _eventName = $('<span>').html(en)
              .css({
                'border-left':'2px solid '+ event.color,
                'padding-left':'1rem'
              });
            var _toolIcon = Pard.Widgets.IconManager('tools').render().addClass('toolsIcon');  
            var _manageCallIcon = $('<span>').append(_toolIcon).addClass('manageCallIcon');
            _eventManagerChoice[event.event_id] = $('<div>')
              .addClass('eventMananagerChoice')
              .append(
                $('<ul>').append(
                $('<li>').append($('<a>').append(Pard.Widgets.IconManager('proposals').render().addClass('eventIcon'), Pard.t.text('header.insideDropdown.event')).attr('href','/event?id='+event.event_id+'&lang='+Pard.Options.language()))
                .click( function(){
                    _eventManagerChoice[event.event_id].removeClass('showEventManagerChoice');
                    _menuContainer.foundation('close');
                  }
                ),
                $('<li>').append($('<a>').append(_manageCallIcon, 'e-Manager').attr('href','/event_manager?id='+event.event_id))
                .click( function(){
                    _eventManagerChoice[event.event_id].removeClass('showEventManagerChoice');
                    _menuContainer.foundation('close');
                  }
                )
              ))
              .hover(
                function(){
                  _eventManagerChoice[event.event_id].addClass('isOver');
                },
                function () {
                  _eventManagerChoice[event.event_id].removeClass('isOver showEventManagerChoice')
                }
              );
            _menuEvents.append(
              $('<li>').addClass("")
                .append(
                  $('<a>')
                    .attr('href','#')
                    .append(_eventName)
                    .hover(
                      function(){
                        _eventManagerChoice[event.event_id].addClass('showEventManagerChoice');
                      },
                      function(){
                        setTimeout(function(){
                          if (!(_eventManagerChoice[event.event_id].hasClass('isOver'))) _eventManagerChoice[event.event_id].removeClass('showEventManagerChoice');
                        },50)
                        
                      }
                    )
                    .click(function(){
                       if (!(_eventManagerChoice[event.event_id].hasClass('showEventManagerChoice'))) _eventManagerChoice[event.event_id].addClass('showEventManagerChoice');
                       else _eventManagerChoice[event.event_id].removeClass('showEventManagerChoice');
                    })
                    .css('cursor','default'),
                  _eventManagerChoice[event.event_id]
                )  
            )
          });
          
          if(data.events.length>0){
            _profilesSeparator.removeClass('separatorBold').addClass('separator')
            _menuEvents.append($('<li>').addClass('separatorBold'));
            _liEvents.show();
          }
          else _liEvents.hide();
        }
        else{
          console.log('error')
        }

        if ($.inArray('settings', window.location.hash.split('&'))>-1){
          var _settingsWidget = Pard.Widgets.SettingsPopup();
          var _settingsPopup = _settingsWidget.render();
          if (Pard.UserInfo['interests']) _settingsWidget.setVal(Pard.UserInfo['interests']);
          _settingsPopup.open();
        };

      });    
    }

    _loadHeader();

    _menuContainer.append(_menu.append(
      _liAdmin.append(_menuAdmin),
      _liProfiles.append(_menuProfiles),
      _liEvents.append(_menuEvents),
      $('<li>').append(_menuSettings)
    ));

    var _iconDropdownMenu =  $('<button>')
      .addClass('settings-icon-dropdown-menu')
      .attr({'type': 'button', 'data-toggle':'insideMenuDropDown'})
      .append($('<span>').html('&#xE5C5;').addClass('material-icons'));

    _createdWidget.append(_iconDropdownMenu, _menuContainer);

    return {
      render: function(){
        return _createdWidget;
      },
      reload: function(){
        _menuProfiles.empty();
        _menuEvents.empty();
        _eventManagerChoice = {};
        _loadHeader();
      }
    }
  }


}(Pard || {}));
