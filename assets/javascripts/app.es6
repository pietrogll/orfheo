'use strict';

Pard.UserStatus = {};
Pard.CachedEvent = [];
Pard.CachedProgram = [];
Pard.CachedProfile = {};
Pard.CachedForms = {};

Pard.ReactComponents = {}


Pard.OrfheoCategories = [
  "music", 
  "arts", 
  "visual", 
  "audiovisual", 
  "literature", 
  "street_art", 
  "craftwork", 
  "health", 
  "gastronomy", 
  "other"
];
Pard.OrfheoFormats = [
  "show",
  "concert", 
  "workshop", 
  "expo", 
  "intervention", 
  "projection", 
  "recital",  
  "talk", 
  "stand", 
  "visit", 
  "tasting", 
  "other"
];
Pard.OrfheoSpaceType = [
  "residential", 
  "theater", 
  "museum", 
  "concert_hall", 
  "dance_hall", 
  "party_hall", 
  "laboratory", 
  "cinema", 
  "health_center", 
  "social_center", 
  "gym", 
  "sport_center", 
  "bar", 
  "restaurant", 
  "gallery", 
  "office", 
  "shop", 
  "university", 
  "school", 
  "garage", 
  "lot", 
  "rooftop", 
  "multispace", 
  "other"
];
Pard.OrfheoFacets = {
  space:[
    'cultural_ass', 
    'home', 
    'open_air', 
    'commercial'
  ],
  agent:[
    'artist', 
    'creative', 
    'craftsman', 
    'manager', 
    'commissar', 
    'politician', 
    'researcher', 
    'critic', 
    'producer', 
    'collector',
    'teacher',
    'arquitect',
    'inventor'
  ],
  organization:[
    'institution',
    'ngo',
    'federation',
    'association',
    'collective',
    'foundation',
    'interprise'
  ],
  other:[
    'other'
  ]
}

Pard.OrfheoEventType = [
  'festival',
  'conference',
  'fair',
  'gala'
 // 'other'
]



Pard.Welcome = function(){


  Pard.UserStatus['status'] = 'outsider';

  var _header = Pard.Widgets.LoginHeader();
  var _main = Pard.Widgets.MainWelcomePage();

  var _footer = Pard.Widgets.Footer();
  var _whole = $('<div>').addClass('whole-container');


  _whole.append(_header.render(), _main.render().addClass('outsider-main'), _footer.render().addClass('footer-outsider'));

  $('body').append(_whole);

  $(document).ready(() =>{
    $(document).foundation();
    $(document).on('closed.zf.reveal', '[data-reveal]', function() {
      if (!($('.reveal[aria-hidden="false"]').length)){
        $('html').removeClass('overflowHidden');
      }
    });
    $(document).on('open.zf.reveal', function(){
      $('html').addClass('overflowHidden');
      setTimeout(function(){$('.reveal').scrollTop(0)},100);
    });

    // URI NAV
    if (window.location.hash == '#sign_up') {
      Pard.Widgets.SignUpButton().click();
    }
    else if(window.location.hash == '#contact'){
      Pard.Widgets.ContactPopup().open();
    }
    // END URI NAV

  });
}


Pard.Users = function(profiles){

  Pard.UserStatus['status'] = 'owner';
  Pard.CachedProfiles = profiles;

  var _header = Pard.Widgets.InsideHeader();
  var _main = Pard.Widgets.MainUserPage();

  var _footer = Pard.Widgets.Footer();
  var _whole = $('<div>').addClass('whole-container');

  _whole.append(_header.render(), _main.render(), _footer.render());

  $('body').append(_whole);

  $(document).ready(function(){
    $(document).foundation();
    $(document).on('closed.zf.reveal', '[data-reveal]', function() {
      if (!($('.reveal[aria-hidden="false"]').length)){
        $('html').removeClass('overflowHidden');
      }
    });
    $(document).on('open.zf.reveal', function(){
      $('html').addClass('overflowHidden');
      setTimeout(function(){$('.reveal').scrollTop(0)},100);
    });
  });
}


Pard.Profile = function(profile, status){

  Pard.CachedProfile = profile;
  Pard.UserStatus['status'] = status;

  var _whole = $('<div>').addClass('whole-container');

  var _display = function(){
    var _footer = Pard.Widgets.Footer();

    if(status == 'visitor' || status == 'owner' || status == 'admin')
      var _header = Pard.Widgets.InsideHeader(false, true);
    else
      var _header = Pard.Widgets.LoginHeader(false);

    var _main = Pard.Widgets.ProfileMainLayout(profile).render().attr({id: 'main-profile-page'});
    _whole.append(_header.render(), _main,  _footer.render());
    $(document).ready(function(){
      $(document).foundation();
      $(document).tooltip({tooltipClass: 'orfheo-tooltip', show:{delay:800}, position:{collision:'fit', my: 'left top+5px'}});
      $(document).on('closed.zf.reveal', '[data-reveal]', function() {
        if (!($('.reveal[aria-hidden="false"]').length)){
          $('html').removeClass('overflowHidden');
        }
      });
      $(document).on('open.zf.reveal', function(){
        $('html').addClass('overflowHidden');
      });
    });
  }

  _display();
  $('body').append(_whole);
};

Pard.EventManager = function(event_id, status){
  var spinner = new Spinner();
  spinner.spin();
  $('body').append(spinner.el);
  Pard.UserStatus['status'] = status;

  Pard.Backend.eventManager(event_id, function(data){
    var the_event = data.the_event;
    var forms = data.forms;

    Pard.CachedEvent = the_event;
    Pard.CachedForms = forms;

    console.log({the_event, forms})
    
    Pard.UserInfo['texts'] = the_event.texts;

    var _whole = $('<div>').addClass('whole-container');
    var _header = Pard.Widgets.InsideHeader(false);
    var _main = Pard.Widgets.Manager(the_event, forms);
    var _footer = Pard.Widgets.Footer();

    $(_whole).append(
      _header.render(), 
      _main.render(), 
      _footer.render()
    );

    $(window).ready(function(){      
      $('body').append(_whole);
      $(document).foundation();
      $(document).tooltip({tooltipClass: 'orfheo-tooltip', show:{delay:800}, position:{collision:'fit', my: 'left top+5px'}});
      $(document).on('closed.zf.reveal', '[data-reveal]', function() {
        if (!($('.reveal[aria-hidden="false"]').length)){
          $('html').removeClass('overflowHidden');
        }
      });
      $(document).on('open.zf.reveal', function(){
        $('html').addClass('overflowHidden');
      });
      Pard.Bus.trigger('setPublishStatus');
      var _arraySections = ['#proposals','#program','#utils'];
      var _uri = new URI(document.location);
      if ($.inArray(_uri.hash(), _arraySections)>-1){
         $(_uri.hash()+'Btn').trigger('click');
      }
      spinner.stop();

      // set programManagerScroller

    });
  });
}


Pard.Event = function(the_event, status, lang){
  var _dir;
  if (the_event.slug){
    _dir = /event/+the_event.slug;
    if(lang != Pard.Options.defaultLanguage()) _dir += '?lang='+lang;
    window.history.replaceState( {} , the_event.slug, _dir );
  }

  if(lang != Pard.Options.language()) Pard.Options.storeLanguage(lang);
  

  Pard.UserStatus['status'] = status;
  Pard.CachedProgram = the_event.program;
  Pard.CachedEvent = the_event;

  Pard.UserInfo['texts'] = the_event.texts[Pard.Options.language()] || the_event.texts[Object.keys(the_event.texts)[0]];
  Pard.UserInfo['texts']['subcategories'] = the_event['subcategories'];
  var _whole = $('<div>').addClass('whole-container');

  var _footer = Pard.Widgets.Footer();
  if(status == 'visitor' || status == 'owner' || status == 'admin')
    var _header = Pard.Widgets.InsideHeader(true);
  else{
    var _header = Pard.Widgets.LoginHeader(true);
    _header.positionRelative();
  }
  var _main = Pard.Widgets.MainOffCanvasLayout(Pard.Widgets.EventAside, Pard.Widgets.EventSection);
  _whole.append(
    _header.render(), 
    _main.render().removeClass('outsider-main').addClass('inside-main').css('background','#f6f6f6'),
    _footer.render()
  );

  $('body').append(_whole);

  $(document).ready(function(){
    $(document).foundation();
    $(document).tooltip({tooltipClass: 'orfheo-tooltip', show:{delay:800}, position:{collision:'fit', my: 'left top+5px'}});
    $(document).on('closed.zf.reveal', '[data-reveal]', function() {
      if (!($('.reveal[aria-hidden="false"]').length)){
        $('html').removeClass('overflowHidden');
      }
    });
    $(document).on('open.zf.reveal', function(){
      $('html').addClass('overflowHidden');
    });
  });
}

Pard.Services = function(status){

  var _main = Pard.Widgets.MainServicesPage();
  var _footer = Pard.Widgets.Footer().render();

  Pard.UserStatus['status'] = status;
  if(status == 'outsider'){ 
    var _header = Pard.Widgets.LoginHeader();
    _main.addClass('outsider-main');
    _footer.css({
      position:'fixed',
      bottom:'0'
    });
  }
  else{
    var _header = Pard.Widgets.InsideHeader(false);
  }

  var _whole = $('<div>').addClass('whole-container');

  _whole.append(_header.render(), _main, _footer);

  $('body').append(_whole);

  $(document).ready(function(){
    $(document).foundation();
    $(document).on('closed.zf.reveal', '[data-reveal]', function() {
      if (!($('.reveal[aria-hidden="false"]').length)){
        $('html').removeClass('overflowHidden');
      }
    });
    $(document).on('open.zf.reveal', function(){
      $('html').addClass('overflowHidden');
      setTimeout(function(){$('.reveal').scrollTop(0)},100);
    });

     // URI NAV
    if (window.location.hash == '#contact_demo') {
      var _contactPopup = Pard.Widgets.Popup();
      _contactPopup.setContent(Pard.t.text('profile_page.createEventTitle'), Pard.Widgets.EventContact());
      _contactPopup.open();
    }
    else if (window.location.hash == '#video_demo'){
      Pard.Widgets.VideoDemo().open();
    }
    else if (window.location.hash == '#contact'){
      Pard.Widgets.ContactPopup().open();
    }

  });

}


Pard.Admin = function(status, admin_id){

  Pard.EventSourceManager(admin_id)

  var _main = Pard.Widgets.MainAdminPage();
  var _footer = Pard.Widgets.Footer().render(); 
  
  var _header = Pard.Widgets.InsideHeader(false);
  
  var _whole = $('<div>').addClass('whole-container');

  _whole.append(_header.render(), _main, _footer);

  $('body').append(_whole);

  $(document).ready(function(){
    $(document).foundation();
    $(document).on('closed.zf.reveal', '[data-reveal]', function() {
      if (!($('.reveal[aria-hidden="false"]').length)){
        $('html').removeClass('overflowHidden');
      }
    });
    $(document).on('open.zf.reveal', function(){
      $('html').addClass('overflowHidden');
      setTimeout(function(){$('.reveal').scrollTop(0)},100);
    });
  });
}