'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};


	ns.Widgets.ProposalPopupContent = function(proposal_id, proposal){

		var proposal = proposal || Pard.CachedProfile.portfolio.proposals.find(function(proposal){return proposal.id == proposal_id});

		var _createdWidget = $('<div>').css({
			'position': 'relative',
  		'height': '100%'
		});

		var _aside = $('<div>').addClass('content-popup-aside');
		var _vLine = $('<div>').addClass('v-line-content-popup');
		var _main = $('<div>').addClass('content-popup-main');

		var _formatCatBlock = $('<div>').addClass('popup-aside-block');
		var _infoBlock = $('<div>').addClass('popup-aside-block');
		var _owner = {
      id: Pard.CachedProfile.id || proposal.profile_id,
      name: Pard.CachedProfile.name || proposal.profile_name,
      color: Pard.CachedProfile.color || proposal.profile_color,
      isProfilePage: Object.keys(Pard.CachedProfile).length > 0
    }

		var _ownerBlock = Pard.Widgets.OwnerBlock(_owner); 
		_ownerBlock.addClass('popup-aside-block');

		var _formatTag = Pard.Widgets.PrimaryTag(Pard.t.text('formats')[proposal.format])

		var _categoryTag = Pard.Widgets.CategoryTag(proposal.category)
		var _formatsBl = $('<div>')
			.append( 
				_formatTag,
				_categoryTag 
			)
	 	
		var _tagsBl = $('<div>');
		if (proposal.tags) proposal.tags.forEach(function(tag){
			_tagsBl.append(
        Pard.Widgets.SecondaryTag(tag)
			)
		})
		
		_formatCatBlock.append(
			_formatsBl, 
			_tagsBl
		);

	  var _duration = $('<div>').addClass('infoList-iconText');
		var _durationIcon = Pard.Widgets.IconManager('duration').render().addClass('information-contact-icon-column');
		var _durationText = $('<p>').addClass('information-contact-text-column type-text-info-box').css('vertical-align','-0.2rem');
		(proposal.duration == 'none' || proposal.duration == null || proposal.duration == false) ? _durationText.append(Pard.t.text('profile_page.production.noDuration')) : _durationText.append(proposal.duration+' min')
		_infoBlock.append(_duration.append(_durationIcon,_durationText));


	  var _audience = $('<div>').addClass('infoList-iconText');
		var _audienceIcon = Pard.Widgets.IconManager('children').render().addClass('information-contact-icon-column');
		var _audienceText = $('<p>').addClass('information-contact-text-column type-text-info-box').append(Pard.t.text('widget.inputChildren')[proposal.children]).css('vertical-align','-0.2rem');
		_infoBlock.append(_audience.append(_audienceIcon,_audienceText));

		var _cache = $('<div>').addClass('infoList-iconText');
		var _cacheIcon = Pard.Widgets.IconManager('cache').render().addClass('information-contact-icon-column').css('vertical-align','top');
		var _cacheText = $('<p>').addClass('information-contact-text-column type-text-info-box').css('vertical-align','-0.2rem')
		if (proposal.cache && proposal.cache.visible.is_true()){
			if (!proposal.cache.value.is_false()) _cacheText.append(proposal.cache.value +' €' + '<br>')
			_cacheText.append(proposal.cache.comment);
			_infoBlock.append(_cache.append(_cacheIcon,_cacheText));
		}
	  
		var _descriptionBlock = $('<div>').addClass('popup-main-block information-info');
	  
	  var _descriptionTitle = $('<p>').text(Pard.t.text('profile_page.production.description')).addClass('titleBlock-popup-content');
	  var _description = $('<div>').append(proposal.description);
	  var _shortDescriptionn = $('<p>').append(proposal.short_description).css('font-weight','bold');
	  _descriptionBlock.append(_descriptionTitle, _shortDescriptionn, _description);
	  
	  _aside.append(
			_formatCatBlock, 
			_infoBlock, 
			_ownerBlock
		);

		_main.append(
			_descriptionBlock
		);

  
		var _modifyMultimediasProposalCallback = function(data){
	    if (data['status']=='success'){
	      var _index = Pard.CachedProfile['portfolio']['proposals'].findIndex(function(el){
	        return el.id == data.production.id;
	      });
	      Pard.Bus.trigger('updateGallery', {'gallery': data.production.gallery, 'ids': [proposal.id]});
	      delete data.production.gallery;
	      Pard.CachedProfile['portfolio']['proposals'][_index] = data.production;
	      Pard.Bus.trigger('modifyBlock', 'portfolio');
	      _printMultimedias(data.production);
	    }
	    else{
	      console.log(data);
	    }  
	  }
   	
   	var _multimediaBlock = $('<div>').addClass('popup-main-block');

   	var _printMultimedias = function(proposal){
   		_multimediaBlock.empty();
   		_multimediaBlock.append(
				$('<p>').text(Pard.t.text('profile_page.production.multimedia')).addClass('titleBlock-popup-content')
			);

			_multimediaBlock.append(Pard.Widgets.MultimediaPopupContent(
				proposal, 
				function(formVal, callbackSent){
					var _proposal = $.extend(true, {}, proposal);
					for (var field in formVal){
						_proposal[field] = formVal[field];
					}
					if (_proposal.photos && _proposal.photos.length){
        		if ($.inArray(_proposal['main_picture'], _proposal.photos)<0) _proposal['main_picture'] = [_proposal.photos[0]];
		      }
		      else{
		        _proposal['main_picture'] = null;
		      }
					Pard.Backend.modifyProposal(_proposal, function(data){
	        	_modifyMultimediasProposalCallback(data, _proposal);
	        	callbackSent();
	      	})
	      }
			).render());
		}

		_printMultimedias(proposal);

		_main.append(_multimediaBlock);
      
	
	_createdWidget.append(
		_aside,
		_vLine,
		_main
	);

	return _createdWidget;
}


ns.Widgets.SpacePopupContent = function(space_id, space){

	var space = space || Pard.CachedProfile.space.find(function(space){return space.id == space_id});

	var _createdWidget = $('<div>').css({
			'position': 'relative',
  		'height': '100%'
		});
	var _aside = $('<div>').addClass('content-popup-aside');
	var _vLine = $('<div>').addClass('v-line-content-popup');
	var _main = $('<div>').addClass('content-popup-main');

	var _formatCatBlock = $('<div>').addClass('popup-aside-block');
	var _infoBlock = $('<div>').addClass('popup-aside-block');

	var _owner = {
      id: Pard.CachedProfile.id || space.profile_id,
      name: Pard.CachedProfile.name || space.profile_name,
      color: Pard.CachedProfile.color || space.profile_color,
      isProfilePage: Object.keys(Pard.CachedProfile).length > 0
    }

	var _ownerBlock = Pard.Widgets.OwnerBlock(_owner); 
	_ownerBlock.addClass('popup-aside-block');

	var _formatCatTitle = $('<p>').text(Pard.t.text('proposal.proposal_for')).addClass('titleBlock-popup-content');
	var _formatsBl = $('<div>').append(
			$('<p>').text(Pard.t.text('dictionary.formats')).addClass('subTitleBlock-popup-content')
		);
	space.ambients = space.ambients || [];
	var _formats = space.ambients.reduce(function(initialVal, el){
		var arr_el = el.allowed_formats || [];
		return initialVal.concat(arr_el);
	},[]);
	
	if (_formats) _formats.forEach(function(format){
		_formatsBl.append(
			Pard.Widgets.SecondaryTag(Pard.t.text('formats')[format])
		)
	})
	var _catBl = $('<div>').append(
			$('<p>').text(Pard.t.text('dictionary.categories')).addClass('subTitleBlock-popup-content')
		);
	var _categories = space.ambients.reduce(function(initialVal, el){
		var arr_el = el.allowed_categories || [];
		return initialVal.concat(arr_el);
	},[]);
	if (_categories) _categories.forEach(function(cat){
		_catBl.append(
      Pard.Widgets.CategoryTag(cat)
		)
	})
	_formatCatBlock.append(_formatCatTitle, _formatsBl, _catBl);

	
  var _type = $('<div>');
	var _typeText = Pard.Widgets.PrimaryTag(Pard.t.text('space_type')[space.type].capitalize())
	_infoBlock.append(_type.append(_typeText));

	if (space.size && space.size != 'false'){
	  var _size = $('<div>');
		var _sizeIcon = Pard.Widgets.IconManager('size').render().addClass('information-contact-icon-column');
		var _sizeText = $('<p>').addClass('information-contact-text-column type-text-info-box').append(space.size+' m^2').css('vertical-align','-0.2rem');
		_infoBlock.append(_size.append(_sizeIcon,_sizeText));
	}



	if (space.plane_picture){
		var _plane = $('<div>')
		.css({
			'margin-bottom': '.8rem'
		});
		var _planeImg = $.cloudinary.image(
	    space.plane_picture[0],
	    { format: 'jpg', width: 350 , effect: 'saturation:50' }
	  )

		Pard.Widgets.PopupImage(space.plane_picture[0], _planeImg);

	  _infoBlock.append(_plane.append(_planeImg));
	}

	if (space.single_ambient == "false"){
		var _ambients = $('<div>');
		var _ambientsIcon = Pard.Widgets.IconManager('ambients').render().addClass('information-contact-icon-column');
		var _ambientsList = space.ambients.map(function(a){return a.name}).join(', ');
		var _ambientsText = $('<p>').addClass('information-contact-text-column type-text-info-box').append(space.ambients.length+' ambientes: '+_ambientsList).css('vertical-align','-0.2rem');
		_infoBlock.append(_ambients.append(_ambientsIcon,_ambientsText));
  }
  
    var _mapBlock = $('<div>').addClass('popup-main-block');
	var _descriptionBlock = $('<div>').addClass('popup-main-block information-info');

  var _address = $('<div>');
  var _location = '';
  _location += space['address']['route']+' '+space['address']['street_number']+', '+space['address']['locality'];
  var _addressText = $('<span>')
  	.text(_location);

  _address.append(
  	$('<p>').addClass('information-contact-text-column').append(_addressText)
  );

  var _map = $('<div>').attr('id', 'gmapSpace');
  var _mapTitle = $('<p>').text(Pard.t.text('profile_page.space.location')).addClass('titleBlock-popup-content');
  _mapBlock.append(_mapTitle, _address, _map);
  var _geocod = space.address.location;
  var _geolocation;
  if(_geocod) _geolocation = [{lat: _geocod.lat, lon: _geocod.lng, zoom:15}];

  var geomap = new Maplace({
    locations: _geolocation,
    map_div: '#gmapSpace',
    map_options: {
      mapTypeControl: false
    }
  })
  setTimeout(function(){
  	geomap.Load();
  }, 200) 


  var _descriptionTitle = $('<p>').text(Pard.t.text('profile_page.space.description')).addClass('titleBlock-popup-content');
  var _description = $('<div>').append(space.description);
  _descriptionBlock.append(_descriptionTitle, _description);
  
  var _rulesBlock = $('<div>').append(
		$('<p>').text(Pard.t.text('profile_page.space.rules')).addClass('titleBlock-popup-content'),
		$('<div>').append(space.rules)
		).addClass('popup-main-block');

  var _listBlock = function(item, list){
  	var _block = $	('<div>').append(
			$('<p>').text(Pard.t.text(item)['block_title']).addClass('titleBlock-popup-content')
		).addClass('popup-main-block');

  	if (list) list.forEach(function(el){
			_block.append($('<span>').text(Pard.t.text(item)[el]).addClass('column-3'));
		});
  	return _block;
  }


  _aside.append(
		_infoBlock, 
		_formatCatBlock, 
		_ownerBlock
	);
	_main.append(
		_mapBlock, 
		_descriptionBlock,
		_listBlock('materials', space.materials),
		_listBlock('human_resources', space.human_resources),
		_listBlock('accessibility', space.accessibility),
		_rulesBlock
	);

  space.ambients.forEach(function(ambient){
  	var _aBlock = $('<div>');
  	  var _aSize = $('<div>')
  	  if(ambient.size){
  	  	_aSize.append(
	  			Pard.Widgets.IconManager('size').render().addClass('information-contact-icon-column'),
					$('<p>').addClass('information-contact-text-column type-text-info-box').append('Superficie: '+ambient.size+' m^2').css('vertical-align','-0.2rem')
	  			).addClass('column-3')
  	  }
  	var _aCapacity = $('<div>')
  	if(ambient.size){
  		_aCapacity.append(
	  		Pard.Widgets.IconManager('capacity').render().addClass('information-contact-icon-column'),
				$('<p>').addClass('information-contact-text-column type-text-info-box').append('Aforo: '+ambient.capacity+' personas').css('vertical-align','-0.2rem')
	  		).addClass('column-3');
  	}
  	var _floor = '';
  	var _aFloor = $('<div>')
  	if(ambient.floor){
  		_floor = Pard.t.text('floor.title')+': '+ ambient.floor.map(function(el){return Pard.t.text('floor')[el]}).join(', ');
  		_aFloor.append(
	  		Pard.Widgets.IconManager('floor').render().addClass('information-contact-icon-column'),
				$('<p>').addClass('information-contact-text-column type-text-info-box').append(_floor).css('vertical-align','-0.2rem')
	  		);
  	}
  	var _aHeight = $('<div>')
  	if (ambient.height && ambient.height != 'false'){ 
  		_aHeight.append(
	  		$('<span>').html('&#8597;').addClass('information-contact-icon-column'),
				$('<p>').addClass('information-contact-text-column type-text-info-box').append('Altura techo: '+ambient.height+' m').css('vertical-align','-0.2rem')
	  		).addClass('column-3')
  	}

  	var _iconsD = $('<div>');

	  if (space.single_ambient == 'false'){
	  	_aBlock.addClass('ambientBlock');
	  	var _aName = $('<h4>').text(ambient.name).addClass('popup-main-block');
	  	var _aDescription = $('<div>').addClass('popup-main-block');
	  	_iconsD.append(_aSize, _aCapacity, _aHeight, _aFloor);
	  	var _textD = $('<div>').append(	space.description	).css('margin-top','.5rem');
	  	_aDescription.append(
	  		$('<p>').text(Pard.t.text('profile_page.space.description')).addClass('titleBlock-popup-content'),
	  		_iconsD,
	  		_textD
	  		)
	  	var _aFormatsCats = $('<div>').append(
	  		$('<p>').text('Apto para').addClass('titleBlock-popup-content'),
	  		$('<p>').text(Pard.t.text('dictionary.formats')).addClass('subTitleBlock-popup-content')
	  	).addClass('popup-main-block');
	  	ambient.allowed_formats.forEach(function(format){
	  		_aFormatsCats.append(
					Pard.Widgets.SecondaryTag(Pard.t.text('formats')[format])
				)
	  	});
	  	_aFormatsCats.append(
	  			$('<p>').text(Pard.t.text('dictionary.categories')).addClass('subTitleBlock-popup-content')
	  		);
	  	ambient.allowed_categories.forEach(function(cat){
	  		_aFormatsCats.append(
          Pard.Widgets.SecondaryTag(Pard.t.text('formats')[format])
				)
	  	});

 	  	_aBlock.append(
 	  		_aName, 
 	  		_aDescription, 
 	  		_aFormatsCats
 	  	);

		}
		else{
			_iconsD.append(_aCapacity, _aHeight, _aFloor);
		  _descriptionBlock.empty().append(_descriptionTitle, _iconsD,_description);
		}
			
		var _modifyMultimediasSpaceCallback = function(data, modifiedAmbient){
      if (data['status']=='success'){
        var _index = Pard.CachedProfile['space'].findIndex(function(el){
          return el.id == data.space.id;
        });

        var _ambientGallery = data.space.gallery.find(function(gallery){return gallery.id == modifiedAmbient.id});
        if (_ambientGallery) _ambientGallery = [_ambientGallery];
				delete data.space.gallery;
        Pard.CachedProfile['space'][_index] = data.space;
        
       
				Pard.Bus.trigger('updateGallery',{'gallery': _ambientGallery, 'ids': [modifiedAmbient.id]});
        _printMultimedias(modifiedAmbient);
        Pard.Bus.trigger('modifyBlock', 'space');
      }
      else{
        console.log(data);
      }  
    }
   	
   	var _aMultimedia = $('<div>').addClass('popup-main-block');

   	var _printMultimedias = function(ambient){
   		_aMultimedia.empty();
   		_aMultimedia.append(
				$('<p>').text('Multimedias').addClass('titleBlock-popup-content')
			);

			_aMultimedia.append(Pard.Widgets.MultimediaPopupContent(
				ambient, 
				function(formVal, callbackSent){
					var _space = $.extend(true, {}, space);
					var _modifiedAmbient = _space.ambients.find(function(amb){return amb.id == ambient.id});
					for (var field in formVal){
						_modifiedAmbient[field] = formVal[field];
					}
  				var _photos = _space['ambients'].reduce(function(photosArray, amb){
		        var amb_photos = amb['photos'] || [];
		        return photosArray.concat(amb_photos);
		      },[])
					if (_photos.length){
        		if ($.inArray(_space['main_picture'], _photos)<0) _space['main_picture'] = [_photos[0]];
		      }
		      else{
		        _space['main_picture'] = null;
		      }
					Pard.Backend.modifySpace(_space, function(data){
	        	_modifyMultimediasSpaceCallback(data, _modifiedAmbient);
	        	callbackSent();
	      	})
	      }
			).render());
		}

		_printMultimedias(ambient);

		_aBlock.append(
			_aMultimedia,
			_listBlock('tech_specs',ambient.tech_specs),
			_listBlock('tech_poss',ambient.tech_poss)
		)
		_main.append(_aBlock);
	})
      
	
	_createdWidget.append(
		_aside,
		_vLine,
		_main
	);

	return _createdWidget;
}


	ns.Widgets.MultimediaPopupContent = function(multimediaObj, modifyCallback){

    var _multimediaContainer = $('<div>');
    _multimediaContainer.addClass('multimedia-container'); 
    var userStatus = Pard.UserStatus['status'];

    if (userStatus == 'owner' || userStatus == 'admin'){
      var _multiMediaManager = Pard.Widgets.MultimediaManager(multimediaObj);
      _multiMediaManager.setSend(modifyCallback);
      _multimediaContainer.append(_multiMediaManager.render().addClass('manage-multimedia-btn'));
    }

    Pard.Widgets.MultimediaDisplay(multimediaObj, function(multimedia){
      if(multimedia['video'] != false){
        var _outerVideocontainer = $('<div>');
        var _videoContainer = $('<div>').addClass('video-production-container')

        var _videoTitle =  $('<div>').append(
        		$('<p>').text(Pard.t.text('profile_page.video')).addClass('subTitleBlock-popup-content')
        	)
        	.addClass('title-multimedia');   

        _multimediaContainer.append(_outerVideocontainer);
        multimedia.video.forEach(function(video){
          _videoContainer.prepend($('<div>').addClass('single-video-container').append(video))
        });
        _outerVideocontainer.append(_videoTitle, _videoContainer);
      };

      if(multimedia.audio != false){

        var _outerAudiocontainer = $('<div>');
        var _audioContainer = $('<div>').addClass('image-production-container');
       
        var _audioTitle =  $('<div>').append(
        		$('<p>').text(Pard.t.text('profile_page.audio')).addClass('subTitleBlock-popup-content')
        	)
        	.addClass('title-multimedia');    

        _multimediaContainer.append(_outerAudiocontainer);
        multimedia.audio.forEach(function(audio){
          _audioContainer.prepend($('<div>').addClass('single-image-container').append($('<div>').addClass('single-image-content').append(audio)));
        });
        _outerAudiocontainer.append(_audioTitle, _audioContainer);

      }

      if(multimedia.image != false){
        var _outerImagescontainer = $('<div>');
        var _imageContainer = $('<div>').addClass('image-production-container');
    
        var _imageTitle =  $('<div>').append(
        		$('<p>').text(Pard.t.text('profile_page.images')).addClass('subTitleBlock-popup-content')
        		)
        	.addClass('title-multimedia');      
        _multimediaContainer.append(_outerImagescontainer);
        multimedia.image.forEach(function(image){
          _imageContainer.append($('<div>').addClass('single-image-container').append($('<div>').addClass('single-image-content').append(image)));
        });
        _outerImagescontainer.append(_imageTitle, _imageContainer);
      }

    }, 306);

    return{
      render: function(){
        return _multimediaContainer;
      }
    }
  }


}(Pard || {}));