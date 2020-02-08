'use strict';


(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.MyProfiles = function(profiles){

    var _createdWidget = $('<div>');
    profiles.forEach(function(profile){
      _createdWidget.append($('<div>').addClass('myprofile-card-position').append(Pard.Widgets.CreateCard(profile).render()))});

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.CreateProfileCard = function(popupTitle, popupContent){


    var _createProfileCard =$('<a>').attr({href: '#'}).addClass('profileCard');
    var _upperBox = $('<div>').addClass('upperBox-cerateProfileCard');
    var _downBox = $('<div>').addClass('downBox-cerateProfileCard');
    var _color = '#6f6f6f';
    _createProfileCard.css({
      border:'1px solid rgb(206, 206, 206)'
    });
    _createProfileCard.hover(
      function(){
        $(this).css({
        'box-shadow': '0 0 2px 1px'+ _color
      });
      },
      function(){
        $(this).css({
          'box-shadow': '0px 1px 2px 1px rgba(10, 10, 10, 0.2)'
        });
      }
    );

    var _addCircle = Pard.Widgets.IconManager('add_circle').render().addClass('addCircle-create-profile-card');
    var _text = $('<p>').text(Pard.t.text('createProfile.text')).addClass('create-profile-card-text');
    _createProfileCard.append(_upperBox.append(_addCircle), _downBox.append(_text));

    var _createProfilePopup;
    _createProfileCard  
    .one('click',function(){
      _createProfilePopup = Pard.Widgets.Popup();
      popupContent.setCallback(
        function(){
          _createProfilePopup.close();
        });
      _createProfilePopup.setContent(popupTitle, popupContent.render());
      _createProfilePopup.setCallback(function(){});
    })
      .click(function(){      
        _createProfilePopup.open();
      });
    _createProfileCard;

    return {
      render: function(){
        return _createProfileCard;
      }
    }
  }


  ns.Widgets.CreateProfileMessage = function(callback){
    var _createdWidget = $('<div>').addClass('createProfilePopup createProfilePopup-');

    var _message = $('<div>').text(Pard.t.text('createProfile.introA'));
    _createdWidget.append(_message);

    var _createProfileFields = [ 'name', 'facets', 'address', 'profile_picture', 
    'tags', 
    'short_description', 
    // 'description',  
    'personal_web', 'email', 'phone', 'color'];
    var _form = {};
    var _profileForm = Pard.Forms.Profile;
    _createProfileFields.forEach(function(field){
      _form[field] = _profileForm[field];
    })
    var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html(Pard.t.text('createProfile.submit'));
    var _formWidget = Pard.Widgets.PrintForm(_form, _submitButton);

    // if (callback) _formWidget.setCallback(callback);


    var _closepopup = function(){};
   
    var _send = function(){
      var _submittedForm;
      _submittedForm = _formWidget.getVal();
      if (_submittedForm.photos){
        _submittedForm['profile_picture'] = [_submittedForm['photos'][0]];
        _submittedForm['photos'].shift();
      }
      if (_submittedForm['address']['location'] && _submittedForm['address']['location']['lat'] && _submittedForm['address']['location']['lng']){
          // _formWidget.stopSpinner();
          Pard.Backend.createProfile(_submittedForm, function(data){
            if (callback) callback(data);
            else Pard.Events.CreateProfile(data);
            _formWidget.stopSpinner();
            _submitButton.attr('disabled',false);
            _closepopup();
          });
      }
      else{
        _formWidget.stopSpinner();
        _submitButton.attr('disabled',false);
        var _content = $('<div>').addClass('very-fast reveal full');
        _content.empty();
        $('body').append(_content);
        var _popup = new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});
        var _closepopupAlert = function(){
          _popup.close();
        }
        var _message = Pard.Widgets.PopupContent(Pard.t.text('popup.noMapLocation.title'), Pard.Widgets.AlertNoMapLocation(_submittedForm, _closepopupAlert, function(){
                _formWidget.stopSpinner();
          }));
        _message.setCallback(function(){
          _content.remove();
          _popup.close();
        }); 

        _content.click(function(e){
          if ($(e.target).hasClass('vcenter-inner')) {
            _content.remove();
            _popup.close();
          }
        });

        _content.append(_message.render());
        _popup.open();
      }
    }

    _formWidget.setSend(_send);

    return {
      render: function(){
        Pard.Backend.getUserEmail(function(data){
          _formWidget.setVal({email: {value: data.user_email}});
          _createdWidget.append(_formWidget.render());
        }) 
        return  _createdWidget;       
      },
      setCallback: function(callback){
        _closepopup = callback;
      }
    }
  }

}(Pard || {}));
