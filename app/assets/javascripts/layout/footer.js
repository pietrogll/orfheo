'use strict';

(function(ns){

     
ns.Widgets = ns.Widgets || {};  

  ns.Widgets.Footer = function(){
    var _createdWidget = $('<footer>');
    var _footer = $('<div>').addClass('footer-bar');
    var userStatus = Pard.UserStatus['status'];
    var _innerFooterContainer = $('<div>').addClass('innerWrapperDiv');

    var _uri = new URI(document.location);

    if (userStatus == 'outsider') _createdWidget.addClass('footer-outsider');

    var _grid = $('<div>').addClass('pard-grid');
    var _container= $('<div>').addClass('pard-container-relative');
    var _leftContent = $('<div>').addClass('footer-left');
    var _rightContent = $('<div>').addClass('footer-right');

    var _leftMenu = $('<ul>').addClass('leftFooter-menu');

    
    var _languages = $('<button>').attr({'type':'button'})
      .html(Pard.t.text('footer.languages.'+Pard.Options.language()));
      
    if($(window).width()>1024) _languages
      .hover(
        function(){
          _languagesList.addClass('showLangMenu');
          setTimeout(function(){
            if (!_languagesList.hasClass('showLangMenu'))_languagesList.addClass('showLangMenu');
          },500)
        },
        function(){
           setTimeout(function(){
              _languagesList.removeClass('showLangMenu');
            },500)
        }
      )
    else _languages
      .on('click',function(){
        var _langMessage = Pard.Widgets.LanguagesMessage().render();
        var _langPopup = Pard.Widgets.Popup();
        _langPopup.setContent('', _langMessage);
        _langPopup.open();
      });

    
    var _languagesList = $('<div>')
      .addClass('languagesList-footer')
      .mouseover(
        function(){
          _languagesList.addClass('isOverMenu');
        })
      .mouseleave(
        function(){
           setTimeout(function(){
              _languagesList.removeClass('isOverMenu');
            },500)
        }
      );

    var _availableLangs = $('<ul>').addClass('menu');
    _languagesList.append(_availableLangs);

    Pard.Options.availableLangs().forEach(function(lang){
      var _langItem = $('<li>').append(Pard.t.text('footer.languages.'+lang))
          .click(function(){
             Pard.Options.setLanguage(lang);
          });
      if (lang == Pard.Options.language()) _langItem.css({'font-weight':'bold'})
      _availableLangs
        .append(_langItem);
    });
    
    var _languagesWidget = $('<ul>')
        .append(_languages
        )
        .addClass('dropdown menu')
        .attr({
          'data-dropdown-menu':true,
          // 'data-disable-hover':true,
          'data-click-open':true
        });


    var _termsAndConditionsPopup;
    var _termsAndConditions = $('<button>').attr({'type':'button'})
      .html(Pard.t.text('footer.conditions'))
      .addClass('footer-text-link')
      .one('click',function(){
        _termsAndConditionsPopup = Pard.Widgets.Popup();
        var _termsAndConditionsMessage = Pard.Widgets.TermsAndConditionsMessage(_termsAndConditionsPopup).render();
        _termsAndConditionsPopup.setContent('', _termsAndConditionsMessage);
        _termsAndConditionsPopup.setCallback(function(){history.replaceState({}, '', _uri.hash(''))});
      })
      .on('click',function(){
        history.replaceState({}, 'conditions', _uri.hash('#'+'conditions'));
        _termsAndConditionsPopup.open();
      });


       
    var _infoPopup;
    var _information = $('<button>').attr({'type':'button', 'id':'projectPopupBtn'})
      .html(Pard.t.text('footer.project'))
      .addClass('footer-text-link')
      .one('click',function(){
        _infoPopup = Pard.Widgets.Popup();
        var _infoMessage =  Pard.Widgets.ProjectInfoMessage(_infoPopup).render();
        _infoPopup.setContent('', _infoMessage);
        _infoPopup.setCallback(function(){history.replaceState({}, '', _uri.hash(''))});
      })
      .on('click',function(){
        _infoPopup.open();
        history.replaceState({}, 'project', _uri.hash('#'+'project'))
      });

    _leftContent.append(
      _leftMenu.append(
        $('<li>').append(_languages) .addClass('footer-languages-btn'),
        $('<li>').append(_information), 
        $('<li>').append(_termsAndConditions)
      )
    );

    // var _project = $('<span>').text('orfheo proyecto comunitario');
    // var _place = $('<span>').text('Benimaclet, Valencia 2016');
    var _content = $('<div>').addClass('very-fast reveal full');
   
    $(document).ready(function(){
      $('body').append(_content);
      if(window.location.hash == '#conditions') _termsAndConditions.trigger('click');
      else if(window.location.hash == '#project') _information.trigger('click');
      
    });

    var _rightMenu = $('<ul>').addClass('rightFooter-menu');

    var _contactPopup;
    var _contactaOrfheo = $('<li>')
      .append($('<button>').text(Pard.t.text('footer.contact'))
        .attr({'type':'button','id':'contactPopupBtn'})
        .one('click',function(){
          _contactPopup =  new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});
        })
        .on('click',function(){
          _content.empty().append(Pard.Widgets.ContactInfo(_contactPopup));
          _contactPopup.open();
          history.replaceState({}, 'contact', _uri.hash('#'+'contact'));

        })
      );

     _content.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _contactPopup.close();
        }
      })


    var _servicesPopup;
    var _servicesInfo;
    var _servicesOrfheo = $('<li>').append($('<a>').text(Pard.t.text('footer.services'))
      .attr({
        'href':'/services',
        'id':'toServicesPage'
      }))

    var _logoFooter = $('<div>').addClass('logoFooter');
    _rightContent.append(
      _rightMenu.append(
        _servicesOrfheo,
        _contactaOrfheo
      )
    );

    var _langWidget = $('<div>')
      .append(
        $('<div>').addClass('pard-grid').append(_languagesList)
      )
      .css({
        'width':'100vw'
      });

    _container.append(_leftContent.prepend(_logoFooter), _rightContent);
    _grid.append(_container);
    _footer.append(_innerFooterContainer.append(_grid));
    _createdWidget.append(_langWidget, _footer);

    return{
      render: function(){
        return _createdWidget;
      }
    }
  }

  

}(Pard || {}));
