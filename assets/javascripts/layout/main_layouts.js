'use strict';

(function(ns){

     
ns.Widgets = ns.Widgets || {};

  ns.Widgets.MainWelcomePage = function(){
    var _main = $('<main>').addClass('mainWelcomePage');

    var _innerMainContainer = $('<div>').addClass('innerWrapperDiv');

    var _welcomeSection = $('<section>')
    .addClass('welcomeSection-layout')
    .attr('id','welcomeSection').append(Pard.Widgets.WelcomeSection());
    
    _main.append(_innerMainContainer.append(_welcomeSection));


    return {
      render: function(){
        return _main;
      }
    }
  }


  ns.Widgets.MainUserPage = function(profilesSection){
    var _main = $('<main>').addClass('mainUserPage');

    var _innerMainContainer = $('<div>').addClass('innerWrapperDiv');

    var _initSection = Pard.Widgets.UserInitSection().attr('id','welcomeSection');

    _main.append(_innerMainContainer.append(_initSection));

    return {
      render: function(){
        return _main;
      }
    }
  }


  ns.Widgets.ProfileMainLayout = function(profile){

    var _displayer = Pard.ProfileDisplayer(profile);
    var _headerSection = Pard.Widgets.ProfileSectionHeader(profile);
    var _blocksSection = Pard.Widgets.ProfileBlocksSection(_displayer);

    var _main = $('<main>');
    var _innerMainContainer = $('<div>').addClass('innerWrapperDiv');
    var _pardGrid = $('<div>').addClass('pard-grid');

    var _colorMainBackground = function(profileColor){ 
      var _rgb = Pard.Widgets.IconColor(profileColor).rgb();
      var _backColor = 'rgba('+_rgb[0]+','+_rgb[1]+','+_rgb[2]+','+0.2+')';
      _main.css({'background': _backColor});
    }

    Pard.Bus.on('modifyProfile',function(){
      _colorMainBackground(profile.color);
    })

    _colorMainBackground(profile.color);

    _pardGrid.append(_headerSection, _blocksSection);
    _main.append(_innerMainContainer.append(_pardGrid));

    if ( Pard.UserStatus['status'] == 'outsider') {
      _main.addClass('outsider-main');
    }
    else{
      _main.addClass('main-fixedHeader');
    }

    return {
      render: function(){
        return _main;
      }
    }
  }


  ns.Widgets.MainOffCanvasLayout = function(asideContent, sectionContent){

    var _main = $('<main>').attr('id','main-welcome-page');
    var _innerMainContainer = $('<div>').addClass('innerWrapperDiv');

    var _offCanvasWrapper = $('<div>').addClass('off-canvas-wrapper');
    var _offCanvasInner = $('<div>').addClass('off-canvas-wrapper-inner').attr({'data-off-canvas-wrapper': ''});
    var _offCanvasAside = $('<div>').addClass('off-canvas-grid-aside position-left-grid-aside').attr({id: 'offCanvas-navBar', 'data-off-canvas': ''});

    var _offCanvasSection = $('<div>').addClass('off-canvas-content').attr({'data-off-canvas-content': ''});

    var _mainLarge = $('<section>').addClass('pard-grid');
    var _gridSpacing = $('<div>').addClass('grid-spacing');


    var _aside = $('<nav>').addClass('grid-aside');
    var _section = $('<section>').addClass('grid-section');
    var _sectionContainer = $('<div>');

    _offCanvasSection.append(sectionContent(_sectionContainer).render());

    _offCanvasAside.append(asideContent(_sectionContainer).render());

    _aside.append(_offCanvasAside);
    _section.append(_offCanvasSection);
    _offCanvasInner.append(_aside, _gridSpacing, _section);

    _mainLarge.append(_offCanvasWrapper.append(_offCanvasInner));
    _main.append(_innerMainContainer.append(_mainLarge));

    if (Pard.UserStatus['status'] == 'outsider') {
        _main.addClass('outsider-main');
    }

    return {
      render: function(){
        return _main;
      }
    }
  }


}(Pard || {}));
