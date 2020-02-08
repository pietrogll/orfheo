'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.EventTitle = function(){
    var _createdWidget = $('<div>').addClass('title-infoTab-event-page-container');

    var _title = $('<h3>').html(Pard.CachedEvent.name).addClass('title-infoTab-event-page');

    var _opening = new Date(parseInt(Pard.CachedEvent.start));
    var _closing = new Date(parseInt(Pard.CachedEvent.deadline));
    var _now = new Date();
    if(Pard.CachedEvent.call_id && ((_opening.getTime()<_now.getTime() && _now.getTime()<_closing.getTime()) || Pard.UserStatus['status']=='owner' || Pard.UserStatus['status'] == 'admin' || Pard.CachedEvent.whitelisted)){
      $(document).ready(
        function(){
          $('.signUpHeader-welcomePage').remove();
        }
      );
      var _callToAction = $('<button>').attr({'type':'button', 'id':'callToActio-eventHeader'}).html(Pard.t.text('event_page.infoTab.signupCall')).addClass(' button-event-header');
      _callToAction.on('click',function(){
        if (Pard.UserStatus['status'] == 'outsider'){
          var _loginPopup = Pard.Widgets.Popup();
          var _loginMex = Pard.Widgets.LoginEvent(Pard.CachedEvent.id);
          _loginMex.setCallback(function(){
            _loginPopup.close();
          });
          _loginPopup.setContent(Pard.t.text('login.eventPage.loginTitle'), _loginMex.render());
          _loginPopup.open();
        }
        else{
          Pard.Backend.listProfiles(Pard.Widgets.ListProfiles(Pard.CachedEvent).render);
        }
      });
      var _btnContainer = $('<div>').append(_callToAction).addClass('btn-container-header-event');
      var _titleContainer = $('<div>').append(_title).addClass('title-container-header-event');
      _createdWidget.append(_titleContainer, _btnContainer);
    }
    else{
      _createdWidget.append(_title);
    }

    return _createdWidget;
  }

   ns.Widgets.EventInfo = function(){

    var the_event = Pard.CachedEvent;
    var _texts = Pard.UserInfo['texts'];

    var _createdWidget = $('<div>');
    var _header = $('<div>').addClass('borderTop-eventInfoTitle');
    var _daysArray = [];
    var _dateEvent = "";

    if (the_event.call_id){
      var _callText = $('<div>').addClass('info-text-header-infoTab-event');
      var _callIcon = $('<div>').append(Pard.Widgets.IconManager('open_call').render().addClass('bullhorn-icon-event-page')).addClass('iconContainer-infoHeader-event-page');
      var _opening = new Date(parseInt(the_event.start));
      var _closing = new Date(parseInt(the_event.deadline));
      var _now = new Date();
      if(_now.getTime()<_opening.getTime()){
        _callText.append($('<p>').html(Pard.t.text('event_page.infoTab.callOpening')+moment(_opening).locale(Pard.Options.language()).format('dddd DD MMMM')));
      }
      else if(_opening.getTime()<_now.getTime()&& _now.getTime()<_closing.getTime()){
        var _callopened = $('<a>').text(Pard.t.text('event_page.infoTab.callOpened'));
        _callopened.click(function(){
            $('#callToActio-eventHeader').trigger('click');
        });
        _callText.append($('<p>').append(
          _callopened,Pard.t.text('event_page.infoTab.till'),
          moment(_closing).locale(Pard.Options.language()).format('DD/MM - HH:mm'),
          'h' 
        ));
      }
      else if(_now.getTime()>_closing.getTime()){
        _callText.append($('<p>').html(Pard.t.text('event_page.infoTab.callClosed')+ moment(_closing).locale(Pard.Options.language()).format('DD MMM YYYY')+')' ));
      }
      var _callStatus = $('<div>')
        .append(_callIcon, _callText)
        .addClass('element-headerTitle-infoTab-event')
        .css({'border-left': '1px solid #bebebe'});
    }


    var _location = $('<a>').text(the_event.place);
    if (!($.isEmptyObject(the_event.address))){
      var _aStr = '';
      if (the_event['address']['route'] && the_event['address']['street_number']) _aStr += the_event['address']['route']+' '+the_event['address']['street_number']+', ';
      _aStr += the_event['address']['locality']+' '+the_event['address']['postal_code'];
      _location.attr({
        href: 'https://maps.google.com/maps?q='+_aStr,
        target: '_blank'
      });
    }
    else{
      _location.attr({
        href: 'https://www.google.es/maps/place/'+the_event.place,
        target: '_blank'
      });
    }
    var _whereText = $('<div>').append($('<p>').append(_location)).addClass('info-text-header-infoTab-event');
    var _where = $('<div>').append($('<div>').append(Pard.Widgets.IconManager('location').render()).addClass('iconContainer-infoHeader-event-page'), _whereText).addClass('element-headerTitle-infoTab-event');
    _where.css({'border-left': '1px solid #bebebe'});

    var _organizerText =  Pard.Widgets.FitInBox(
      $('<p>').append(
        'Organiza ', 
        the_event.organizer
      ),
      181,
      55
    )
    .render()
    .text()
    .substring(9)
    var _organizer;
    if(the_event.profile_id.indexOf('-own')<0){ 
      _organizer= $('<a>').append(
        _organizerText
      );
      _organizer.attr({
        href: '/profile?id=' + the_event.profile_id,
        target: '_blank'
      });
    }
    else {
      _organizer = $('<span>').append(_organizerText);
    }
    var _whoText = $('<div>').addClass('info-text-header-infoTab-event').append($('<p>').append(Pard.t.text('event_page.infoTab.organize'), _organizer));
    var _organzerIcon = $('<div>').addClass('icon-container')
      .append($('<span>').css({
          'background': the_event.color,
          'border-radius': '50%',
          'width': '1.1rem',
          'height': '1.1rem',
          'display': 'inline-block'
        })
    );
    var _who = $('<div>').append(_organzerIcon.addClass('iconContainer-infoHeader-event-page'), _whoText).addClass('element-headerTitle-infoTab-event');
    // _who.css({'border-right': '1px solid #bebebe'});

    var _h1 = $('<div>').append(
      _who, 
      _where
    );

    if (_callStatus) _h1.append(_callStatus);

    
    var _timeContent= $('<div>').addClass('timeContent-infoTab-event');
    var _count = 0;
    var _printAll = false;
    var _h2 = $('<div>').addClass('h2-event-page');
    _h2.append(
      $('<div>').append(
        Pard.Widgets.IconManager('calendar').render()
          .addClass('iconContainer-infoHeader-event-page')
          .css('margin-top',0), _timeContent)
          .addClass('timeContainer-infoTab-event')
      );

    var _printDaysCalendar = function(){
      _timeContent.empty();
        the_event.eventTime.forEach(function(evt){
          _count += 1;
          if (_count < 4 || _printAll == true) {
            var _dateCont = $('<div>').addClass('single-date-container-event-page');
            var _dayCont = $('<div>').append(moment(evt.date).locale(Pard.Options.language()).format('D MMM YYYY')).addClass('date-calendar-box');
            var _daydateI = new Date(parseInt(evt.time[0]));
            var _daydateF = new Date(parseInt(evt.time[1]));
            var _timeCont = $('<div>').append($('<p>').text(moment(_daydateI).locale(Pard.Options.language()).format('HH:mm')+' -'),$('<p>').text('- '+moment(_daydateF).locale(Pard.Options.language()).format('HH:mm')+' h')).addClass('time-calendar-box');
            _dateCont.append(_dayCont,_timeCont);
            _timeContent.append(_dateCont);
          }
          else if (_count==4 && _printAll == false){
            var _seeAll = $('<a>').attr('href','#').text(Pard.t.text('event_page.infoTab.seeAll'));
            var _seeAllContainer = $('<div>').append('... ',_seeAll).css('margin','-0.4rem 0 -0.2rem 0').addClass('see-all-event-page');
            _timeContent.append(_seeAllContainer);
            _seeAll.click(function(){
              _printAll = true;
              _seeAllContainer.remove();
              _printDaysCalendar();
            });
            return false;
          }
      })
    }

    _printDaysCalendar();

    if (the_event.call_id){
      var _conditionsText = $('<div>').addClass('info-text-header-infoTab-event');
      if (the_event.conditions) _conditionsText.append($('<a>').attr({'href':the_event.conditions,'target':'_blank'}).append(Pard.t.text('event_page.infoTab.conditions')));
      else _conditionsText.append($('<p>').text(Pard.t.text('event_page.infoTab.noConditions')));
      var _callConditions = $('<div>').append(
        $('<div>')
          .append(
            Pard.Widgets.IconManager('conditions').render()).addClass('iconContainer-infoHeader-event-page'), 
          _conditionsText)
        .addClass('callConditions-infoTab-event')
        .css({'border-left': '1px solid #bebebe'});
      _h2.append(_callConditions);
    }

    _header.append(_h1, _h2);

    var _content = $('<div>').addClass('content-event-page');
    var _textContainer = $('<div>').addClass('textContainer-infoTab-event-page');
    var _baseline = $('<p>').text(_texts['baseline']).addClass('baseline-infoTab-event-page');
    // var _textTitle = $('<h4>').text('Características básicas:').addClass('title-program-event-page');
    var _text = $('<div>').append(
      $('<p>').html(_texts.description).addClass('text-event-page-info'));
    var _image = $('<div>').addClass('image-evet-page-info');
    if (the_event.img && the_event.img[0]) _image.append($.cloudinary.image(the_event.img[0],{ format: 'png', width: 330,  effect: 'saturation:50' }).addClass('img-event-info-p'));
    else _image.append($('<div>').addClass('img-event-info-p').css({
      'background':the_event.color,
      'width':330,
      'height':450
    }))
    if ($(window).width() < 640) {
      var _infoContent = $('<div>').append(_text.prepend(_baseline), _image);
    }
    else{
      var _infoContent = $('<div>').append( _image, _text.prepend(_baseline));
    }
    _content.append(_textContainer.append(_infoContent));

    _createdWidget.append(_header, _content);

    return{
      render: function(){
        return _createdWidget;
      }
    }
  }


  ns.Widgets.PartnerTab = function(partners){
    var partners = Pard.CachedEvent.partners;
    var _partnerTab = $('<div>').css('margin-top','2.5rem');
    for(var partnerType in partners){
      if (partners[partnerType].length) _partnerTab.append(
        $('<h4>')
          .append(Pard.t.text('partner_type.' + partnerType).capitalize())
          .css({
            'color': 'rgb(111, 111, 111)',
            'margin-top':'1rem'
          })
      );
      partners[partnerType].forEach(function(partner){
        _partnerTab.append(Pard.Widgets.PartnerCard(partner));
      });
    }
    return _partnerTab;

  }

  ns.Widgets.PartnerCard = function(partner){
    var _partnerCard = $('<div>').addClass('partnerCard-event-page');
    var _image = $('<div>').addClass('partnerImage-event-page');
    var _logo = $('<a>');
    if (partner.img && partner.img[0]) _logo.append($.cloudinary.image(partner.img[0],{ format: 'png', width: 170 , effect: 'saturation:50' }));
    // else _logo = 
    _image.append(_logo);
    if (partner.link) {
      var _name = $('<div>').append($('<p>').append($('<a>').text(partner.name).attr({'href': partner.link, 'target':'_blank'})).addClass('partnerName-event-page'));
      _logo.attr({'href': partner.link, 'target':'_blank'});
    }
    else {
      var _name = $('<div>').append($('<p>').text(partner.name).addClass('partnerName-event-page'));
      _logo.css('cursor','default');
    }
    _partnerCard.append(_image, _name);
    return _partnerCard;
  }


  ns.Widgets.ParticipantEventPage = function(event_id){

    var _createdWidget = $('<div>');
    var _searchEngine = Pard.Widgets.SearchEngine(event_id);

    var _goUpBtn = Pard.Widgets.goUpBtn();

    _createdWidget.append( 
      _searchEngine.render(), 
      _goUpBtn.render()
    );

    return{
      render: function(){
        return _createdWidget;
      },
      activate: function(){
        _searchEngine.activate();
      },
      deactivate: function(){
        _searchEngine.deactivate();
      }
    }
  }




}(Pard || {}));
