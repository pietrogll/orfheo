'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.MultimediaScripts = function(callback){
    $.getScript('//connect.facebook.net/en_US/all.js').done(function(){
      $.getScript('//platform.instagram.com/en_US/embeds.js').done(function(){
        $.getScript("//assets.pinterest.com/js/pinit_main.js").done(function(data){
          $(document).ready(function(){
            FB.init({appId: '196330040742409', status: true, cookie: true, xfbml: true});
            //FB.init({appId: '282340465430456', status: true, cookie: true, xfbml: true});
            if (callback) callback();
          });
        });
      });
    });
    
    // window.fbAsyncInit = function() {
    //   FB.init({
    //     appId      : '196330040742409',
    //     xfbml      : true,
    //     version    : 'v2.7'
    //   });
    
    //   // Get Embedded Video Player API Instance
    //   var my_video_player;
    //   FB.Event.subscribe('xfbml.ready', function(msg) {
    //     if (msg.type === 'video') {
    //       my_video_player = msg.instance;
    //     }
    //   });
    // };

    // (function(d, s, id){
    //    var js, fjs = d.getElementsByTagName(s)[0];
    //    if (d.getElementById(id)) {return;}
    //    js = d.createElement(s); js.id = id;
    //    js.src = "//connect.facebook.net/en_US/all.js";
    //    fjs.parentNode.insertBefore(js, fjs);
    //  }(document, 'script', 'facebook-jssdk'));
  }

  ns.Widgets.MultimediaPreview = function(gallery, displayer){
    // Pard.Widgets.MultimediaScripts();

    var _createdWidget = $('<div>');
    var _previewContainer = $('<div>')
      .addClass('MultimediaPreviewContainer-profilePage')
    var _coverPreview = $('<div>')
      .addClass('coverMultimediaPreview')
      .click(function(e){
          e.stopPropagation();
          displayer.displayGallery();
        });
    _previewContainer.append(_coverPreview);

    var _multimediasObj = {};
    _multimediasObj['photos'] = [];
    _multimediasObj['links'] = [];
    for(var album in gallery){
      if (gallery[album].photos) _multimediasObj['photos'] = _multimediasObj['photos'].concat(gallery[album].photos);
      if (gallery[album].links) _multimediasObj['links'] = _multimediasObj['links'].concat(Object.keys(gallery[album].links).map(function(key) {return gallery[album].links[key];}))
    }
    var _multimediasObjShort = {};
    _multimediasObjShort['photos'] = _multimediasObj['photos'].slice(0,3);
    _multimediasObjShort['links'] = _multimediasObj['links'].slice(0,3);
    Pard.Widgets.MultimediaDisplay(_multimediasObjShort, function(multimedia){
      var _thumbnailAppended = 0;
      var _multimediasArray = multimedia['image'].concat(multimedia['video'].concat(multimedia['audio']));
      for(var i=0; i<6; i++){
        if(_multimediasArray[i]){
         var _container = $('<div>')
            .addClass('single-multimedia-preview-container')
            .append(_multimediasArray[i])
            .appendTo(_previewContainer);
          $('.single-multimedia-preview-container img').off('click')
        }
      }
    })

    var _multimediaText = $('<div>')
      .addClass('multimediaTextPreview')
      .append($('<a>')
        .append(_multimediasObj['photos'].length + _multimediasObj['links'].length + ' contenidos multimedia')
        .attr('href','#gallery&gallery')
        .click(function(e){
          e.preventDefault();
          displayer.displayGallery();
        })
      );
      
      _createdWidget.append(_previewContainer,_multimediaText);

    return _createdWidget;
  
  }

 
  ns.Widgets.MultimediaDisplay = function(multimediaObj, callback, dataWidth){
    
    multimediaObj.photos = Object.keys(multimediaObj).reduce(function(photosArray, key){
        if ($.inArray(key, ['photos', 'plane_picture'])>-1){
          var _photos = multimediaObj[key] || [];
          return photosArray.concat(_photos);}
        return photosArray
      },[])

    var _width = dataWidth || 350;

    Pard.Widgets.MultimediaScripts();

    var spinner = new Spinner();
    spinner.spin();
    $('body').append(spinner.el);
    var multimedia = {};
    ['image', 'video', 'audio'].forEach(function(type){
      multimedia[type] = [];
    });

    var _done = [];
    var _links = [];
    var _linksTriedToBeDone = 0;

    if(multimediaObj.photos){
      multimediaObj.photos.forEach(function(photo){
        _links.push({
          url: photo,
          provider: 'cloudinary',
          type: 'image'
        });
      });
    }

    if(multimediaObj.links){
      Object.keys(multimediaObj.links).map(function(index){
        _links.push(multimediaObj.links[index]);
      });
    }

    var _cloudinary = function(link){
      var _img = $.cloudinary.image(
        link['url'],
        { format: 'jpg', width: _width , effect: 'saturation:50' }
      );
      multimedia[link['type']].push(_img[0]);

      // if ($(window).width()>750){    

      Pard.Widgets.PopupImage(link['url'], _img);
    
      _done.push(link);
       _linksTriedToBeDone +=1;
      _display();      
    }

      //Youtube, Vimeo, Flickr, Twitter, Soundcloud
    var _oembed = function(link){
      $.getJSON("https://noembed.com/embed?callback=?",
        {"format": "json", "url": link['url']}, function (data) {
          if (!('error' in data)){
            var _media = data.html;
            if(link['provider'] == 'flickr'){
              var _src = '';
              data.html.split('"').forEach(function(string){
                if(string.match('https://noembed.com/i/')) _src = string.replace('https://noembed.com/i/','');
              });
              _media = $('<a>').append($('<img>').attr('src',_src)).attr({'href': link['url'], 'data-flickr-embed':'true', 'target':'_blank'});
              _media.addClass('flickr-embed-image-iframe');
            }
            multimedia[link['type']].push(_media);
            _done.push(link);
             _linksTriedToBeDone +=1;
            _display();
          }
          else{
             _linksTriedToBeDone +=1;
             _display();
          }
      });
    }

    var _spotify = function(link){
      var audio_id = link['url'].split('/').pop();
      var _spotifyMedia = $('<iframe>').attr({'src': "https://open.spotify.com/embed?uri=spotify:track:" + audio_id, 'frameborder': '0', 'allowtransparency': 'true'}).css('height','5rem');
      multimedia[link['type']].push(_spotifyMedia);
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();
    }

    var _facebook = function(link){
      var _facebookMedia = $('<div>').addClass('fb-post').attr('data-href', link['url']);
      if (link['type'] == 'image'){
        if ($(window).width() > 400) {
          _facebookMedia.attr({'data-width': _width});
        }
        else{
          _width = $(window).width();
          _facebookMedia.attr({'data-width': _width});
        }
      }

      if (link['type'] == 'video') {
        _facebookMedia = $('<div>').addClass('fb-video').attr('data-href', link['url']);
        if ($(window).width() > 1024) {
          _facebookMedia.attr({'data-width': '718', 'data-allowfullscreen':'true'}); 
        }
        else if ($(window).width() > 640) {
          var _videoWidth = $(window).width()-254;
          _facebookMedia.attr({'data-width': _videoWidth , 'data-allowfullscreen':'true'}); //It won't go below 350
        }
        else { 
          var _videoWidth = $(window).width()-52;
          _facebookMedia.attr({'data-width':_videoWidth, 'data-allowfullscreen':'true'});
        }
      }
      
      multimedia[link['type']].push(_facebookMedia);
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();
    }


    var _instagram = function(link){
      var _createdWidget = $('<div>');
      var _instagramphoto = $('<a>').attr('href', link['url']);
      var _instagramMedia = $('<blockquote>').addClass('instagram-media').append(_instagramphoto);
      _createdWidget.append(_instagramMedia);
      multimedia[link['type']].push(_instagramMedia);
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();
    }

    var _pinterest = function(link){
      // var _createdWidget = $('<div>');
      if ($(window).width() > 290) {
        var _pinterestMedia = $('<a>').attr({'data-pin-do':"embedPin", 'href': link['url'], 'data-pin-width': 'medium'});
      }
      else{
        var _pinterestMedia = $('<a>').attr({'data-pin-do':"embedPin",'href': link['url'], 'data-pin-width': 'small'});
      }
      // _createdWidget.append(_pinterestMedia);
      multimedia[link['type']].push(_pinterestMedia);
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();
    }

    var _vine = function(link){
     
      if(link['url'].split('/').pop() != 'embed' && link['url'].split('/').pop() != 'simple') {
        link['url'] += '/embed/simple';
      }
      if (link['url'].split('/').pop() != 'simple'){
        link['url'] += '/simple';
      }
      var _vineMedia = $('<div>').append(
        $('<iframe>')
          .attr('src', link['url'])
          .addClass('vine-embed'),
        '<script async src=//platform.vine.co/static/scripts/embed.js></script>'
      )
      multimedia[link['type']].push(_vineMedia);
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();

    }



    var _bandCamp = function(link, id, elementClass, profiles){
      var _bandCamp_url = '';
      link['url'].split('"').forEach(function(string){
        if(string.match('EmbeddedPlayer')){
          var _bandCampMedia = $('<div>').html(link['url']);
          if(string.match('large') && !(string.match('small'))){
            _bandCampMedia.addClass('large-bandcamp-audio-player')
          };
          multimedia[link['type']].push(_bandCampMedia);
        }
      });
      _done.push(link);
      _linksTriedToBeDone +=1;
      _display();
    }

    var _providers = {
      // image
      'cloudinary': _cloudinary,
      'flickr': _oembed,
      'twitter': _oembed,
      'instagram': _instagram,
      'pinterest': _pinterest,
      //video
      'vine': _vine,
      'youtube': _oembed,
      'vimeo': _oembed,
      // audio
      'soundcloud': _oembed,
      'spotify': _spotify,
      'bandcamp': _bandCamp,
      // image and video
      'facebook': _facebook,
    }

    var _display = function(){
      // if (_done.length == _links.length)
      if (_linksTriedToBeDone == _links.length){  
        $.wait(
        '', 
        function(){
          if (window.instgrm) window.instgrm.Embeds.process();
          callback(multimedia);
        },
        function(){
          spinner.stop();
        }
        );
      }
    }

    if(_links.length == 0)  spinner.stop();
    _links.forEach(function(link){
      _providers[link['provider']](link);
    });
   
  }


  ns.Widgets.MultimediaManager = function(element){

    var _caller = $('<button>').addClass('pard-btn').attr({type: 'button'}).html(Pard.t.text('widget.multimediaManager.btn'))
      .click(function(){
        var _popup = Pard.Widgets.Popup();
        _popup.setContent(Pard.t.text('widget.multimediaManager.title'), _popupContent);
        _popupContent.empty();
        var _form = Pard.Widgets.PrintForm(Pard.Forms.MultimediaManager, submitButton);
        _form.setCallback(function(){_popup.close()});
        _form.setSend(function(callbackSent){
          _send(_form.getVal(), callbackSent);
        });
        _form.setVal(element);
        _popupContent.append(
          _message, 
          _form.render()
        );
        _popup.open();
      });


    if (element.links){
      var _array = Object.keys(element['links']).map(function(key){return element['links'][key]});
      element['links'] = _array;
    };

    var _popupContent = $('<div>');
    var _formContainer = $('<form>').addClass('popup-form');

    var _videoList = $('<ul>').addClass('clearfix');
    _videoList.append($('<li>').html(Pard.t.text('widget.multimediaManager.videoList')));

    var _imageList = $('<ul>').addClass('clearfix');
    _imageList.append($('<li>').html(Pard.t.text('widget.multimediaManager.imageList')));

    var _audioList = $('<ul>').addClass('clearfix');
    _audioList.append($('<li>').html(Pard.t.text('widget.multimediaManager.audioList')));
    
    var _message = $('<div>').append($('<p>').text(Pard.t.text('widget.multimediaManager.mex')),_videoList, _imageList, _audioList).addClass('message-form multimedia-manager-message');

    var submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');

    
    var _send = function(){};
     

    return {
      render: function(){
        return _caller;
      },
      setSend:function(send){
        _send = send
      }
    }
  }


  ns.Widgets.MultimediaAccepted = function(){
    var _caller = $('<a>').text(Pard.t.text('widget.inputMultimedia.acepted'))
      .click(function(){
        Pard.Widgets.BigAlert(Pard.t.text('widget.inputMultimedia.popup.title'), Pard.Widgets.MultimediaAcceptedMessage().render());
      });
 
    return {
      render: function(){
        return _caller;
      }
    } 
  }

  ns.Widgets.MultimediaAcceptedMessage = function(){
     var _createdWidget = $('<div>');

     var _list = $('<ul>').addClass('multimedia-accepted-list');

     var _item1 = $('<li>').html(Pard.t.text('widget.inputMultimedia.popup.item1'))

     var _sublist1 = $('<ol>').addClass('multimedia-accepted-sublist').append(
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist1_1')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist1_2')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist1_3')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist1_4'))
     	);

     var _itemTwitter = $('<li>').html(Pard.t.text('widget.inputMultimedia.popup.itemTwitter'))

     var _sublistTwitter = $('<ol>').addClass('multimedia-accepted-sublist').append(
      $('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublistTwitter_1')),
      $('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublistTwitter_2')),
      $('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublistTwitter_3')),
      $('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublistTwitter_4')),
      $('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublistTwitter_5'))
      );

      

      var _item2 = $('<li>').html(Pard.t.text('widget.inputMultimedia.popup.item2'))

      var _sublist2 = $('<ol>').addClass('multimedia-accepted-sublist').append(
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist2_1')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist2_2')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist2_3')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist2_4'))
     	);

     	var _item3 = $('<li>').html(Pard.t.text('widget.inputMultimedia.popup.item3'))

      var _sublist3 = $('<ol>').addClass('multimedia-accepted-sublist').append(
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist3_1')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist3_2')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist3_3')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist3_4')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist3_5'))
     	);

     	var _item4 = $('<li>').html(Pard.t.text('widget.inputMultimedia.popup.item4'))

      var _sublist4 = $('<ol>').addClass('multimedia-accepted-sublist').append(
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist4_1')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist4_2')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist4_3')),
     	$('<li>').text(Pard.t.text('widget.inputMultimedia.popup.sublist4_4'))
     	);

      var _finalMessage = $('<p>').text(Pard.t.text('widget.inputMultimedia.popup.finalMex')).css({'margin-top':'1rem'});

     _list.append(_item1.append(_sublist1), _itemTwitter.append(_sublistTwitter), _item2.append(_sublist2), _item3.append(_sublist3), _item4.append(_sublist4));

     _createdWidget.append(_list,_finalMessage);

     return {
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.PopupImage = function(link, _img){

    var _popupImg = $.cloudinary.image(
        link,
        { format: 'jpg',  width: 750, effect: 'saturation:50' }
      ).css({
        'max-height':'96vh',
        'width':'auto'
      });

      var _createdWidget = $('<div>').addClass('fast reveal full');    
      var _outerContainer = $('<div>').addClass('vcenter-outer');
      var _innerContainer = $('<div>')
        .addClass('vcenter-inner')
        .css({
          'text-align':'center'
        });
      

      var _closeBtn = $('<button>').addClass('close-button small-1 popup-close-btn').attr({type: 'button'});
      _closeBtn.append($('<span>').html('&times;'));

      var _popup = new Foundation.Reveal(_createdWidget, {animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true});

      _closeBtn.click(function(){
        _popup.close();
      });

      _createdWidget.click(function(e){
        if ($(e.target).hasClass('vcenter-inner')) {
          _popup.close();
        }
      })

      var _popupContent = $('<div>')
      .addClass('popup-photo-container')
      .append(_popupImg,_closeBtn)
      .css({
        'display':'inline-block'
      });

      _innerContainer.append(_popupContent);
      _createdWidget.append(_outerContainer.append(_innerContainer));

      _img.one('mouseover', function(){
        $('body').append(_createdWidget)
      });

      _img.click(function(){
        _popup.open();
      });

      // _img.css({cursor:'zoom-in'});
  }


}(Pard || {}));