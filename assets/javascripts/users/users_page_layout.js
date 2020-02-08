'use strict';


(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.UserInitSection = function(){
    var _section = $('<section>').addClass('welcomeSection-layout');
    var _myProfileDiv = $('<div>') .addClass('myprofileDiv');
    var _myprofileOuterCont = $('<div>').addClass('outerContainer-UserPage');
    
    var _myProfileContent = $('<div>').addClass('myProfilesContainer');
    var _myprofiles = Pard.CachedProfiles;
    if (_myprofiles.length > 0){
      _myprofiles.forEach(function(profile){
        var _cardContainer = $('<div>').addClass('card-container-WelcomePage');
        var _card = Pard.Widgets.CreateCard(profile).render();
        _card.css({
          'border':'1px solid rgba(255, 255, 255)'
        });
        _card.off('mouseenter mouseleave')
          .hover(
            function(){
              _card.css({
                'box-shadow': 'rgb(255, 255, 255) 0px 0px 6px 3px'
              });
            },
            function(){
              _card.css({
                'box-shadow':''
              });
            }
          );
        _myProfileContent.append(_cardContainer.append(_card.addClass('position-profileCard-login')));
      })
    }
    var _createProfileCard = Pard.Widgets.CreateProfileCard(Pard.t.text('createProfile.text'), Pard.Widgets.CreateProfileMessage()).render();
    _createProfileCard.off('mouseenter mouseleave')
     .hover(
          function(){
            _createProfileCard.css({
              'box-shadow': 'rgb(255, 255, 255) 0px 0px 3px 1px'
            });
          },
          function(){
            _createProfileCard.css({
              'box-shadow':''
            });
          }
        )
    _myProfileContent.append($('<div>').append(_createProfileCard).addClass('createProfileCard-userPage'));
    if (_myprofiles.length<5){
      _myprofileOuterCont.css({
        'padding-top': '-moz-calc((100vh - 280px - 73px)/2)',
        'padding-top': '-webkit-calc((100vh - 280px - 73px)/2))',
        'padding-top':'calc((100vh - 280px - 73px)/2)',
        'padding-bottom': '-moz-calc((100vh - 280px - 73px)/2)',
        'padding-bottom': '-webkit-calc((100vh - 280px - 73px)/2))',
        'padding-bottom':'calc((100vh - 280px - 73px)/2)'
      });
    }
    else if (_myprofiles.length<10){
      _myprofileOuterCont.css({
        'padding-top': '-moz-calc((100vh - 516px - 73px)/2)',
        'padding-top': '-webkit-calc((100vh - 516px - 73px)/2))',
        'padding-top':'calc((100vh - 516px - 73px)/2)',
        'padding-bottom': '-moz-calc((100vh - 516px - 73px)/2)',
        'padding-bottom': '-webkit-calc((100vh - 516px - 73px)/2))',
        'padding-bottom':'calc((100vh - 516px - 73px)/2)'
      });
    }
    _myProfileDiv.append(_myprofileOuterCont.append(_myProfileContent));

    var _littleTextDiv= $('<div>')
      .append(
        $('<div>').append(
          Pard.Widgets.Button('lanza una convocatoria en orfheo').render()
        ).addClass('welcomeSection-container')
      )
      .addClass('littleTextDiv');

    _section.append(
      _myProfileDiv
      // ,_littleTextDiv
    );

    return _section;

  }


  ns.Widgets.DeleteUserMessage = function(){  
    
    var _createdWidget = $('<div>');
    var _message = $('<p>').text(Pard.t.text('popup.delete.user'));
    var _yesBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn confirm-delete-btn').text(Pard.t.text('popup.delete.confirm'));
    var _noBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn cancel-delete-btn').text(Pard.t.text('popup.delete.cancel'));

    _yesBtn.click(function(){
      Pard.Backend.deleteUser(Pard.Events.DeleteUser);
    });

    var _buttonsContainer = $('<div>').addClass('yes-no-button-container');

    _createdWidget.append(_message,  _buttonsContainer.append(_noBtn, _yesBtn));

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _noBtn.click(function(){
          callback();
        });
        _yesBtn.click(function(){
          callback();
        });
      }
    }
  }
  

  ns.Widgets.UserEvents = function(){
    var _createdWidget = $('<div>');
    var _myProfilesId = Pard.CachedProfiles.map(function(profile){
      return profile.id
    });
    Pard.Backend.events(function(data){   
      var events = data.events;
      events.forEach(function(event){
        var _myEvent = ($.inArray(event.profile_id, _myProfilesId))>-1;
        var _eventCardContainer = $('<div>').append($('<div>').append(Pard.Widgets.EventCard(event, _myEvent)).addClass('eventCard-container-userPage')).addClass('outer-eventCard-container-userPage');
        _createdWidget.prepend(_eventCardContainer);
      })
    });

    return{
      render: function(){
        return _createdWidget;
      }
    } 
  }


}(Pard || {}));
