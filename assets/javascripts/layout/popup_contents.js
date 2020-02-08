'use strict';

(function(ns){
     
ns.Widgets = ns.Widgets || {};

  ns.Widgets.ContactPopup = function(){
    var _content = $('<div>').addClass('very-fast reveal full');
    _content.click(function(e){
      if ($(e.target).hasClass('vcenter-inner')) {
        _contactPopup.close();
      }
    })
    $('body').append(_content);
    var _contactPopup =  new Foundation.Reveal(_content, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});
    _content.append(Pard.Widgets.ContactInfo(_contactPopup));
    
    return {
      open: function(){
        _contactPopup.open();
      }
    }
  }

  ns.Widgets.ContactInfo = function(_popup){

    var _outerContainer = $('<div>').addClass('vcenter-outer fullWidth');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>');
    _popupContent.addClass('popup-container-full contactInfo-popup-bigalert'); 
    var _sectionContainer = $('<section>').addClass('popup-content');
   
    var _closeBtn = $('<button>').addClass('close-button small-1 ')
      .attr({'data-close': '', type: 'button', 'aria-label': 'Close alert'})
      .append($('<span>').attr('aria-hidden', true).html('&times;'));

    _closeBtn.click(function(){
      _popup.close();
    });

    var _header = $('<div>').addClass('header-contactInfo');
    var _logo = $('<div>').addClass('logoOrfheo-contactInfo');
    var _menuContainer = $('<div>').addClass('menu-centered');
    var _menu = $('<ul>').addClass('menu');
    var _services = $('<li>').text(Pard.t.text('contact.servicesTab.tab')).click(function(){
      $('.selected').removeClass('selected');
      _services.addClass('selected');
      $('.shown').hide();
      _servicesCont.show().addClass('shown');
    }).addClass('selected');
    var _tecnicalSupport = $('<li>').text(Pard.t.text('contact.techTab.tab'))
    .click(function(){
      $('.selected').removeClass('selected');
      _tecnicalSupport.addClass('selected');
      $('.shown').hide();
      _tecnicalSupportCont.show().addClass('shown');
    });
    var _feedback = $('<li>').text(Pard.t.text('contact.feedBackTab.tab')).click(function(){
      $('.selected').removeClass('selected');
      _feedback.addClass('selected');
      $('.shown').hide();
      _feedbackCont.show().addClass('shown');
    });
    var _colaboration = $('<li>').text(Pard.t.text('contact.collaborateTab.tab')).click(function(){
      $('.selected').removeClass('selected');
      _colaboration.addClass('selected');
      $('.shown').hide();
      _colaborationCont.show().addClass('shown');
    });
    var _contact = $('<li>').text(Pard.t.text('contact.contactTab.tab')).click(function(){
      $('.selected').removeClass('selected');
      _contact.addClass('selected');
      $('.shown').hide();
      _contactCont.show().addClass('shown');
    });
    _menuContainer.append(_menu.append(
      _services, _tecnicalSupport, _feedback, _colaboration, 
      _contact));
    var _text = $('<div>').text(Pard.t.text('contact.logo')).addClass('textHeader-contactPopup');
    _header.append(_logo, _text, _menuContainer, _closeBtn);

    var _servicesCont = $('<div>')
      .addClass('shown services-contactInfo');
    var _tecnicalSupportCont = $('<div>')
      .hide()
      .addClass('tecnicalSupport-contactInfo');
    var _colaborationCont = $('<div>')
      .hide()
      .addClass('colaboration-contactInfo');
    var _contactCont = $('<div>')
      .hide()
      .addClass('contact-contactInfo');
    var _feedbackCont = $('<div>')
      .hide()
      .addClass('feedback-contactInfo');

    var _titleServ = $('<h5>').text(Pard.t.text('contact.servicesTab.title'));  
    _servicesCont.append(_titleServ);
     var _textColumn = $('<div>')
      .append(
        $('<p>').html(Pard.t.text('contact.servicesTab.mex1')),
        $('<h6>').append(Pard.t.text('contact.servicesTab.subtitle2')),
        $('<p>').text(Pard.t.text('contact.servicesTab.mex2')),
        $('<h6>').append(Pard.t.text('contact.servicesTab.subtitle3')),
        $('<p>').text(Pard.t.text('contact.servicesTab.mex3')),
        $('<h6>').append(Pard.t.text('contact.servicesTab.subtitle4')),
        $('<p>').text(Pard.t.text('contact.servicesTab.mex4'))
      )
      .addClass('half-col');
    var _formColumn = $('<div>').addClass('half-col');
    var _contactForm = Pard.Widgets.BusinessForm();
    var _textFormCol = $('<div>').append(
      $('<p>').html(Pard.t.text('contact.servicesTab.mex5', {link: '<a href="/services", target="_blank">' +  Pard.t.text('contact.servicesTab.servicesPage') + '</a>'})).css({'margin-bottom':'1.5rem'})
    );
    _formColumn.append(
      _textFormCol, 
      _contactForm, 
      $('<div>').append(
          $('<p>')
            .html(Pard.t.text('contact.dataPolicy'))
        ).addClass('dataPolicy-contactForm')
      );
    _servicesCont.append(_textColumn, _formColumn);

    var _titleTecn = $('<h5>').text(Pard.t.text('contact.techTab.title'));  
    _tecnicalSupportCont.append(_titleTecn);
    var _textColumn = $('<div>').append($('<p>').text(Pard.t.text('contact.techTab.mex1')), $('<p>').text(Pard.t.text('contact.techTab.mex2')), $('<p>').text(':)')).addClass('half-col');
    var _formColumn = $('<div>').append(
      Pard.Widgets.TecnicalSupportForm(),
      $('<div>').append(
        $('<p>')
          .html(Pard.t.text('contact.dataPolicy'))
      ).addClass('dataPolicy-contactForm')
      ).addClass('half-col');
    _tecnicalSupportCont.append(
      _textColumn, 
      _formColumn
    );

    var _titleContact = $('<h5>').text(Pard.t.text('contact.contactTab.title'));  
    _contactCont.append(_titleContact);
    var _textContact = $('<p>').html('<p><strong> orfheo </strong></p><p><a href="mailto:info@orfheo.org">info@orfheo.org</a></br><a href="https://www.facebook.com/orfheo.org", target="_blank">Facebook</a></p>').css({'text-align':'center'});

    _contactCont.append(_textContact);

    var _titleFeed = $('<h5>').text(Pard.t.text('contact.feedBackTab.title'));
    _feedbackCont.append(_titleFeed);
    var _textFeedColumn = $('<div>')
      .append(
        $('<p>').text(Pard.t.text('contact.feedBackTab.mex1')), 
        $('<p>').text(Pard.t.text('contact.feedBackTab.mex2')), 
        $('<p>').text(Pard.t.text('contact.feedBackTab.mex3'))
      ).addClass('half-col');

    var _formFeedColumn = $('<div>')
      .append(
        Pard.Widgets.FeedbackForm(),
        $('<div>').append(
          $('<p>')
            .html(Pard.t.text('contact.dataPolicy'))
        ).addClass('dataPolicy-contactForm')
      ).addClass('half-col');
    _feedbackCont.append(_textFeedColumn, _formFeedColumn);

    var _colaborationCont = $('<div>').addClass('colaboration-contactInfo').hide();
    var _titleColab = $('<h5>').text(Pard.t.text('contact.collaborateTab.title'));  
    _colaborationCont.append(_titleColab);
    var _textColumnColab = $('<div>')
      .append(
        $('<p>').text(Pard.t.text('contact.collaborateTab.mex1')), 
        $('<p>').text(Pard.t.text('contact.collaborateTab.mex2')), 
        $('<p>').append(Pard.t.text('contact.collaborateTab.mex3'), $('<a>').attr('href','mailto:info@orfheo.org').text('info@orfheo.org'))
      )
      .addClass('half-col');
     var _listColumnCol = $('<div>')
       .append(
          $('<p>').text(Pard.t.text('contact.collaborateTab.mex4')).css('margin-bottom','0.5rem'),
          $('<ul>').append(
            $('<li>').html(Pard.t.text('contact.collaborateTab.mex5')),
            $('<li>').html(Pard.t.text('contact.collaborateTab.mex6')),
            $('<li>').html(Pard.t.text('contact.collaborateTab.mex7')),
            $('<li>').html(Pard.t.text('contact.collaborateTab.mex8')),
            $('<li>').html(Pard.t.text('contact.collaborateTab.mex9'))
          )
        )
       .addClass('half-col list-col');
     _colaborationCont.append(_textColumnColab, _listColumnCol);


    _sectionContainer.append(
      _servicesCont, _tecnicalSupportCont, _colaborationCont, _feedbackCont, 
      _contactCont
    );

    _popupContent.append(_header, _sectionContainer);
    _outerContainer.append(_container.append(_popupContent));

    return _outerContainer;
  }

  ns.Widgets.EventContact = function(profileName){
    var _createdWidget = $('<div>').addClass('eventContactPopup');
    var _itext = $('<div>').append(
      $('<p>').html(Pard.t.text('contact.eventContact.mex1'))
    );
    var _ftext = $('<div>').append(
      $('<p>').html(Pard.t.text('contact.eventContact.mex2', { link: '<a href="/services", target="_blank">' +  Pard.t.text('contact.servicesTab.servicesPage')+ '</a>'})))
        .css('margin-top','.5rem');
    var _contactForm = Pard.Widgets.BusinessForm(profileName);
    _createdWidget.append(_ftext, _itext, _contactForm);

    _createdWidget.append(
      $('<div>').append(
        $('<p>')
          .html(Pard.t.text('contact.dataPolicy'))
      ).addClass('dataPolicy-contactForm')
    );

    return _createdWidget;
  }


  ns.Widgets.ContactOrfheo = function(){
    var _createdWidget = $('<div>').addClass('eventContactPopup');
    var _textColumn = $('<div>').append($('<p>').text(Pard.t.text('contact.contactUs.mex1')), $('<p>').text(Pard.t.text('contact.contactUs.mex2')));
    var _form = Pard.Widgets.TecnicalSupportForm();
    var _formContainer = $('<div>').append(_form);
    _createdWidget.append(_textColumn, _formContainer);

     _createdWidget.append(
      $('<div>').append(
        $('<p>')
          .html(Pard.t.text('contact.dataPolicy'))
      ).addClass('dataPolicy-contactForm')
    );

    return _createdWidget;
  }

	ns.Widgets.CoockiesPolicy = function(){
	   var _createdWidget = $('<div>').append(
		$('<p>').html(Pard.t.text('popup.termsAndConditions.cookiesMex1')),
    $('<p>').html(Pard.t.text('popup.termsAndConditions.cookiesMex2')),
    $('<p>').html(Pard.t.text('popup.termsAndConditions.cookiesMex3')),
    $('<p>').html(Pard.t.text('popup.termsAndConditions.cookiesMex4'))
		);

		return _createdWidget;
	}

	ns.Widgets.TermsAndConditionsMessage = function(popup){
    var _createdWidget = $('<div>');

    var _image = $('<div>').addClass('orfheo-symbol-popup');
    var _web = $('<p>').text('orfheo.org').addClass('orfheo-web-popup');
    var _title = $('<h4>').text(Pard.t.text('popup.termsAndConditions.title')).addClass('title-project-info');
    var _lastModify = $('<div>').append($('<p>').text(Pard.t.text('popup.termsAndConditions.date')).addClass('conditions-lastModify')).addClass('conditions-par');
    var _part1 = $('<div>').html(Pard.t.text('popup.termsAndConditions.part1')).addClass('conditions-par');

    var _subtitle3 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle3'));
    var _mex3  = Pard.t.text('popup.termsAndConditions.mex3');
    var _part3 = $('<div>').append(_subtitle3, _mex3).addClass('conditions-par');

    var _subtitle4 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle4'));
    var _mex4  = Pard.t.text('popup.termsAndConditions.mex4') 
    var _part4 = $('<div>').append(_subtitle4, _mex4).addClass('conditions-par');

    var _subtitle5 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle5'));
    var _mex5  = Pard.t.text('popup.termsAndConditions.mex5')
    var _part5 = $('<div>').append(_subtitle5, _mex5).addClass('conditions-par');

    var _subtitle5_5 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle5_5'));
    var _mex5_5  = Pard.t.text('popup.termsAndConditions.mex5_5');
    var _part5_5 = $('<div>').append(_subtitle5_5, _mex5_5).addClass('conditions-par');

    var _subtitle_coockies = $('<h5>').text(Pard.t.text('popup.termsAndConditions.cookies'));
    var _mex_coockies  = $('<p>').append(Pard.t.text('popup.termsAndConditions.cookiesMex1'),'<br>',Pard.t.text('popup.termsAndConditions.cookiesMex2'),'<br>',Pard.t.text('popup.termsAndConditions.cookiesMex3'));
    var _part_coockies = $('<div>').append(_subtitle_coockies, _mex_coockies).addClass('conditions-par');

    var _partLGDP = $('<div>').append(
      $('<h5>').text(Pard.t.text('popup.termsAndConditions.LGDPtitle')),
      Pard.t.text('popup.termsAndConditions.LGDPmex')
    ).addClass('conditions-par')


    var _subtitle6 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle6'));
    var _mex6  = $('<p>').append(Pard.t.text('popup.termsAndConditions.mex6'));
    var _part6 = $('<div>').append(_subtitle6, _mex6).addClass('conditions-par');

    var _subtitle7 = $('<h5>').text(Pard.t.text('popup.termsAndConditions.subtitle7'));
    var _finalMex = $('<div>').html(Pard.t.text('popup.termsAndConditions.finalMex'))

    var _closeBtn = Pard.Widgets.Button(Pard.t.text('dictionary.close'), function(){popup.close()})
    var _closeBtnContainer = $('<div>')
      .addClass('close-button-bottom-popup')
      .append(_closeBtn.render());

    _createdWidget.append(
      _image, 
      _web, 
      _title, 
      // _lastModify, 
      _part1, 
      _part3, 
      _part4, 
      _part5, 
      _part5_5, 
      _part_coockies, 
      _partLGDP, 
      _part6, 
      _subtitle7,
      _finalMex, 
      _closeBtnContainer
    );

    return{
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
      }
    }
  
  }
 
 

	ns.Widgets.LanguagesMessage = function (){
    var _createdWidget = $('<div>');

    var _availableLangs = $('<ul>').css({'list-style-type': 'none' });
    _createdWidget.append(_availableLangs);

     Pard.Options.availableLangs().forEach(function(lang){
      var _langItem = $('<li>')
          .append(Pard.t.text('footer.languages.'+lang))
          .click(function(){
             Pard.Options.setLanguage(lang);
          })
          .css({
            display:'block',
            padding: '0.5rem 0',
            cursor:'pointer'
          });
      if (lang == Pard.Options.language()) _langItem.css({'font-weight':'bold'})
      _availableLangs
        .append(_langItem);
    });

    // var _es = $('<p>').append($('<div>'), 'Español');
    // _es.css('cursor', 'pointer');
    // _es.on('click', function(){
    //   Pard.Options.setLanguage('es');
    // });

    // var _en = $('<p>').append($('<div>'), 'English');
    // _en.css('cursor', 'pointer');
    // _en.on('click', function(){
    //   Pard.Options.setLanguage('en');
    // });
    
    // var _val = $('<p>').append('Valencià - Català');
    // _val.css('cursor', 'pointer');
    // _val.on('click', function(){
    //   Pard.Options.setLanguage('ca');
    // });
    

    // var _ita = $('<p>').append('Italiano');
    // _ita.css('cursor', 'pointer');
    // _ita.on('click', function(){
    //   Pard.Options.setLanguage('it');
    // });

    // _createdWidget.append(_es, _val, _en);

    return {
      render: function(){ 
        return _createdWidget;
      }
    }
  }

  ns.Widgets.ProjectInfoMessage = function (popup){
    var _createdWidget = $('<div>');

    var _image = $('<div>').addClass('orfheo-symbol-popup');
    var _web = $('<p>').text('orfheo.org').addClass('orfheo-web-popup');
    var _baseline = $('<h6>').html(Pard.t.text('project.baseline') + '<br>').addClass('orfheo-baseline-popup');
    var _message = $('<div>').html(Pard.t.text('project.mex1'));
     var _subtitle = $('<p>').text(Pard.t.text('project.subtitle')).addClass('subtitle-project-info');
    var _part1 = $('<div>').append(_message, _subtitle);
   
    var _part2 = $('<div>').addClass('part2-message-project-info');
    var _list1 = $('<div>').html(Pard.t.text('project.list1'));
    var _list2 = $('<div>').html(Pard.t.text('project.list2'));
    var _list3 = $('<div>').html(Pard.t.text('project.list3'));
    var _list4 = $('<div>').html(Pard.t.text('project.list4'));
    var _list5 = $('<div>').html(Pard.t.text('project.list5'));
    // var _list6 = $('<div>').html(Pard.t.text('project.list6'));
    var _list7 = $('<div>').html(Pard.t.text('project.list7'));
    // var _thanks = $('<div>').html('<p> <strong>Gracias</strong> a Xavi para alumbrar el camino y a la gente de la Cova y la Devscola por su fundamental ayuda en el proceso.</p> ').css('margin-top','2rem');
    var _closeBtn = Pard.Widgets.Button(Pard.t.text('dictionary.close'), function(){popup.close()})
    var _closeBtnContainer = $('<div>')
      .addClass('close-button-bottom-popup')
      .append(_closeBtn.render());

    _part2.append(_list1, _list2, _list3, _list4, _list5,  _list7).hide();

    var _readMore = $('<a>').text(Pard.t.text('project.more'))
      .css({
        'text-align':'right',
        'font-size':'14px'
      })
      .click(function(){
        _readMore.remove();
        _part2.show();
      })

    _createdWidget.append(_image, _web, _baseline, _part1, _readMore,_part2, _closeBtnContainer);

    return {
      render: function(){ 
        return _createdWidget
      }
    }
  }

}(Pard || {}));