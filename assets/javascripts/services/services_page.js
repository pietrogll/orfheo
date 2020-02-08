'use strict';

(function(ns){
     
ns.Widgets = ns.Widgets || {};

	ns.Widgets.MainServicesPage = function(){

		var _main = $('<main>').addClass('mainServicesPage');
		var _initialSection = $('<section>');
		var _eventSection = Pard.Widgets.ServiceSection();
		var _callSection = Pard.Widgets.ServiceSection();
		var _managerSection = Pard.Widgets.ServiceSection();
		var _programSection = Pard.Widgets.ServiceSection();
		var _publishSection = Pard.Widgets.ServiceSection();
		var _mobileSection = $('<section>').addClass('serviceSection mobileSectionServicePage');
		var _otherSection = Pard.Widgets.ServiceSection();
		var _priceSection = $('<section>').addClass('priceSectionServicePage');
		var _finalSection = $('<section>').addClass('finalSectionServicePage');
    
    var _uri = new URI(document.location);
			
		var _contactBtn = $('<button>')
			.attr('type','button')
			.text(Pard.t.text('services.contact'))
			.addClass('contactButton-ServicesPage')
			.css('margin-top','1rem')
			.click(function(){
         var _contactPopup = Pard.Widgets.Popup();
        _contactPopup.setContent(Pard.t.text('profile_page.createEventTitle'), Pard.Widgets.EventContact());
        _contactPopup.open();
        history.replaceState({}, 'contact_demo', _uri.hash('#'+'contact_demo'));
			});

			var _videoPopup = Pard.Widgets.VideoDemo(); 

			var _video = $('<div>')
				.append(
					$('<button>')
						.append(
							$('<span>').text(Pard.t.text('services.watchVideo')).css('margin-right','.5rem'),
							Pard.Widgets.IconManager('play_circle').render()
						)
						.addClass('abutton')
						.attr({
							'type':'button'
						})
				)
				.addClass('video-service-page')
				.click(function(){
					_videoPopup.open(); 	
				});

				var _price = $('<p>')
					.append(
						Pard.t.text('services.pricing')
					)
					.css({'margin':'0rem 0 2rem 0'});
				var _iTitle = $('<h3>')
					.text('e-Manager')
					.css({
						'font-weight':'bold'
					})

				_initialSection
				.addClass('initialSectionServicePage')
				.append(
					$('<div>')
						.addClass('pard-grid isContainer')
						.append(
								$('<div>').append(Pard.Widgets.IconManager('tools').render()).addClass('call-icon-service-page'),
								_iTitle,
								$('<h6>').html(Pard.t.text('services.subtitle')).css({'font-weight':'bold', 'margin-bottom':'2rem'}),
								$('<p>').html(Pard.t.text('services.mex')).css('margin-bottom','0'),
								_price,
								_video,
								_contactBtn
							)
						.css({
							'text-align':'center'
						})					
				);
				

		var serviceText = function(num, title, text){
			var _num = $('<span>').text(num).addClass('numberText')
			var _text = $('<div>')
				.addClass('textContainer')
				.append(
					$('<h3>').append(_num, title),
					$('<p>').text(text)
				)
			return _text;
		}

		var _eTitle = Pard.t.text('services.section1.title');
		var _eText = Pard.t.text('services.section1.mex');
		var _eventImage = $('<div>').addClass('eventImageServicePage');
		_eventSection.appendLeft(serviceText(1, _eTitle, _eText));
		_eventSection.appendRight(_eventImage);

		var _cTitle =  Pard.t.text('services.section2.title');
		var _cText = Pard.t.text('services.section2.mex');
		var _callImage = $('<div>').addClass('callImageServicePage');
		if($(window).width()<1024){
			_callSection.appendRight(_callImage);
			_callSection.appendLeft(serviceText(2, _cTitle, _cText));
		} 
		else{
			_callSection.appendLeft(_callImage);
			_callSection.appendRight(serviceText(2, _cTitle, _cText));
		}

		var _mTitle = Pard.t.text('services.section3.title');
		var _mText = Pard.t.text('services.section3.mex');
		var _mImage = $('<div>').addClass('managerImageServicePage');
		_managerSection.appendRight(_mImage);
		_managerSection.appendLeft(serviceText(3, _mTitle, _mText));



		var _pTitle = Pard.t.text('services.section4.title');
		var _pText = Pard.t.text('services.section4.mex');
		var _pImage = $('<div>').addClass('programImageServicePage');
		if($(window).width()<1024){
			_programSection.appendRight(_pImage);
			_programSection.appendLeft(serviceText(4, _pTitle, _pText));
		} 
		else{
			_programSection.appendLeft(_pImage);
			_programSection.appendRight(serviceText(4, _pTitle, _pText));
		}

		var _pshTitle = Pard.t.text('services.section5.title');
		var _pshText = Pard.t.text('services.section5.mex')
		var _pshImage = $('<div>').addClass('publishImageServicePage').append(
				$('<a>')
					.attr({'href':"https://www.freepik.com", 'target':'_blank'})
					.text('Designed by Qeaql-studio/Freepik')
					.addClass('quoteComputerImg')
				);
		_publishSection.appendRight(_pshImage);
		_publishSection.appendLeft(serviceText(5, _pshTitle, _pshText));

			var _mobileImg = $('<div>').addClass('mobileImage').append(
				$('<a>')
					.attr({'href':"https://www.freepik.com", 'target':'_blank'})
					.text('Designed by Ydlabs/Freepik')
					.addClass('quotePhoneImg')
				);
		var _mobileImg2 = $('<div>').addClass('mobileImage2');
		var _mobileImg_d = $('<div>').addClass('mobileImage_d');
		var _mobileImg_f = $('<div>').addClass('mobileImage_f');
		var _mobileTitle = Pard.t.text('services.section6.title');
		var _mobileText = Pard.t.text('services.section6.mex');
		var _mobileText = serviceText(6, _mobileTitle, _mobileText).addClass('mobileText');
		var _phonesImgs = $('<div>').append(
			_mobileImg,
			_mobileImg2,
			_mobileImg_d,
			_mobileImg_f
		) 
		if ($(window).width()>1023) 
			_mobileSection 
			.append(
				$('<div>').addClass('pard-grid')
					.append(
						_phonesImgs,
						_mobileText
					)
			);
		else _mobileSection 
			.append(
				$('<div>').addClass('pard-grid')
					.append(
						_mobileText,
						_phonesImgs.css('text-align','center')
					)
			);


		var _oLSign = $('<h3>').html('+').addClass('sign');
		var _oLTitle = $('<h3>').html(Pard.t.text('services.api.title'));
		var _oLText = $('<p>').html(Pard.t.text('services.api.mex'));
		var _oLeft = $('<div>').append(_oLSign, _oLTitle, _oLText).addClass('otherTextContainer');
		_otherSection.appendLeft(_oLeft);
		var _oRSign = $('<h3>').html('+').addClass('sign');
		var _oRTitle = $('<h3>').html(Pard.t.text('services.counseling.title'));
		var _oRText = $('<p>').html(Pard.t.text('services.counseling.mex'));
		var _oRight = $('<div>').append(_oRSign, _oRTitle, _oRText).addClass('otherTextContainer');
		_otherSection.appendRight(_oRight);


		var _contactPriceBtn = $('<button>')
			.attr('type','button')
			.text(Pard.t.text('services.contact'))
			.addClass('contactButton-ServicesPage')
			.click(function(){
         var _contactPopup = Pard.Widgets.Popup();
        _contactPopup.setContent(Pard.t.text('profile_page.createEventTitle'), Pard.Widgets.EventContact());
        _contactPopup.setCallback(function(){
          setTimeout(function(){
            _contactPopup.destroy();
          }, 500);
        });
        _contactPopup.open();
			});
		var _pack_E_manager = $('<div>').addClass('price-pack-servicePage')
			.click(function(){_contactBtn.trigger('click')});
		var _titlePackContainer = $('<div>').addClass('title-price-pack');
		var _listPackContainer = $('<div>').addClass('list-price-pack');
		var _titlePack = $('<h6>').text('e-Manager');
		var _list_E_Items = Pard.t.text('services.e_pack.list');
		var _listPack = $('<ul>');
		_list_E_Items.split('/').forEach(function(txt){
			_listPack.append($('<li>').append(Pard.Widgets.IconManager('done').render(), $('<span>').text(txt)));
			});
		var _pricePackContainer = $('<div>').html(Pard.t.text('services.e_pack.pricing')).addClass('price-price-pack');
		_listPackContainer.append(_listPack);
		_titlePackContainer.append(Pard.Widgets.IconManager('tools').render().css('font-size','20px'), _titlePack);
		_pack_E_manager.append(
			_titlePackContainer, 
			$('<div>').append(
					_pricePackContainer, 
					_listPackContainer
					).css({'padding':'0 1rem'})
			);
		var _plusPack = $('<div>').addClass('plus-pack-servicePage');
		var _plusTitlePack = $('<div>').append($('<h2>').append('+').css('display','inline'), ' €/mes');
		var _plusList = $('<ul>');
		var _list_plus_Items = Pard.t.text('services.plus_pack.list');
		_list_plus_Items.split('/').forEach(function(txt){
			_plusList.append($('<li>').append($('<span>').append('+').css('margin-right','.2rem'), $('<span>').text(txt)))
			});
		_plusPack.append(
			_plusTitlePack, 
			$('<div>').append(_plusList).addClass('plus-list-servicePack'),
			$('<div>').html(Pard.t.text('services.plus_pack.mex')).addClass('plus-additionalInfo-servicePack')
			);
		var _priceText = $('<div>')
			.addClass('text-pricingSection')
			.append(
				$('<h3>').text(Pard.t.text('services.price.title')),
				$('<p>').html(Pard.t.text('services.price.subtitle')),
				$('<div>').append(_pack_E_manager, _plusPack),
				_contactPriceBtn
			);
		_priceSection
			.append(
				$('<div>').addClass('pard-grid')
					.append(_priceText)
			);

		var _finalSectionBack = $('<div>').addClass('finalSectionBackground');
		var _finalText = $('<p>').text(Pard.t.text('services.endMex')).addClass('finalText')
		_finalSection.append(
			$('<div>').addClass('pard-grid')
					.append(
						_finalSectionBack,
						_finalText
					)
			);

		_main.append(
			_initialSection.addClass('page-section').attr('id','i'),
			_eventSection.render().addClass('eventSectionServicePage  page-section').attr('id','s'),
			_callSection.render().addClass('callSectionServicePage'),
			_managerSection.render().addClass('managerSectionServicePage '),
			_programSection.render().addClass('programSectionServicePage'),
			_publishSection.render().addClass('publishSectionServicePage'),
			_mobileSection,
			_otherSection.render().addClass('otherSectionServicePage'),
			_priceSection.addClass('page-section').attr('id','p')
			// _finalSection.addClass('page-section').attr('id','f')
		)

		$(document).ready(function(){
      var _scrollIndicator = $('.page-section').scrollIndicatorBullets();
    });   


		return _main;
	}

	ns.Widgets.ServiceSection = function(){
		
		var _section = $('<section>').addClass('serviceSection');
		var _container = $('<div>').addClass('pard-grid').css('height','100%');
		var _left = $('<div>').addClass('leftServiceSection');
		var _rigth = $('<div>').addClass('rightServiceSection'); 
		_section.append(_container.append(_left, _rigth));

		return{
			render: function(){
				return _section;
			},
			appendLeft: function(content){
				_left.append(content);
			},
			appendRight: function(content){
				_rigth.append(content);
			}
		}
	}


	ns.Widgets.VideoDemo = function(){

		var _uri = new URI(document.location);

		var _videoIframe = $('<div>')
			.addClass('video-container')
			.append(
				$('<iframe>')
					.attr({
						'src':'https://www.youtube.com/embed/pqdtWgrBeDE?rel=0&amp;showinfo=0;&autoplay=1',
						'frameborder':'0',
						'allowfullscreen':''
					})
					.css({
						'width':'inherit',
						'height':'inherit'
					})
				)

		var _popupVideoContainer = $('<div>').addClass('very-fast reveal full');
    var _outerContainer = $('<div>').addClass('vcenter-outer');
    var _container = $('<div>').addClass('vcenter-inner');
    var _popupContent = $('<div>')
   	.addClass('video-popup-container'); 

    var _videoPopup = new Foundation.Reveal(_popupVideoContainer, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out',multipleOpened:true});

    var _closeBtn = $('<button>')
	   	.addClass('close-button small-1 close-video-popup')
	   	.attr({'data-close': '', type: 'button', 'aria-label': 'Close alert'})
	   	.append($('<span>').attr('aria-hidden', true).html('&times;'))
	    .click(function(){
	      _videoPopup.close();
	      _videoIframe.remove();
	    });
    
    $(document).keyup(function(e) {
	  	if (e.keyCode === 27) _closeBtn.click();   // esc
		});

    _outerContainer.append(_container.append(_popupContent, _closeBtn));
    _popupVideoContainer.append(_outerContainer);
    $('body').append(_popupVideoContainer);

    return {
    	open: function(){
    		_popupContent.append(_videoIframe);
				_videoPopup.open();
        history.replaceState({}, 'video_demo', _uri.hash('#'+'video_demo'));

    	}
    }
	}

}(Pard || {}));