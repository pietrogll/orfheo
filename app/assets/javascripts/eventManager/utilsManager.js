
(function(ns){

  ns.utilsManager = function(the_event) {

    
    var _createdWidget = $('<div>');    
    var _utilLeft = $('<div>').addClass('utilLeft');
    var _utilRight = $('<div>').addClass('utilRight');
   
    var _whiteListBox = $('<div>')
      .addClass('white-list-box utilBox')
      .append(Pard.Widgets.IconManager('play_arrow').render().addClass('arrow-util-box'));
    var _whiteList = Pard.Widgets.WhiteList(the_event).render();
    var _whiteListText = $('<p>').text(Pard.t.text('manager.tools.whitelist.title')).addClass('utilText');
    var _whiteListTitle = $('<p>').text('White List').addClass('utilTitle');
    _whiteListBox.append(_whiteListTitle, _whiteListText, _whiteList);
    // _createdWidget.append(_whiteListBox);
    _utilLeft.append(_whiteListBox);


    if (the_event.qr && the_event.qr.length){
      var _qr = $.cloudinary.image(the_event.qr,{ format: 'png', width: 70 , effect: 'saturation:50' })
      var _qrimg = $('<div>')
        .append(
          _qr
        )
        .css({
          'display':'inline-block',
          'width':'19%',
          'vertical-align':'top',
          'margin': '0 0 -.2rem -.2rem'
        });

      var _downloadBtn = $('<a>').append(Pard.Widgets.IconManager('export').render())
        .attr({
          'href':_qr[0].src,
          'download':'qrCode.png',
          'target':'_blank',
          'title':Pard.t.text('manager.tools.qr.download')
        })
        .addClass('iconButton-CallPage dowloadQR-btn');

      var _qrText = $('<div>')
        .append(
          $('<p>').text(Pard.t.text('manager.tools.qr.title')).addClass('utilText'),
          _downloadBtn
        )
        .css({
          'display':'inline-block',
          'width':'81%',
          'vertical-align':'top'
        });

      var _qrBox = $('<div>').addClass('qr-box utilBox').append(Pard.Widgets.IconManager('play_arrow').render().addClass('arrow-util-box'));
      var _qrTitle = $('<p>').text('QR code').addClass('utilTitle');
      _qrBox.append(_qrTitle, _qrimg, _qrText);
      _utilRight.append(_qrBox); 
    }


    var _slug = Pard.Widgets.Slug(the_event.id, the_event.slug);
    _utilRight.append(_slug.render());

    _createdWidget.append(_utilLeft, _utilRight);

    

     Pard.Bus.on('addWhitelist', function(whitelist){
      the_event.whitelist = whitelist;
      _whiteList.remove();
      _whiteList = Pard.Widgets.WhiteList(the_event).render();
      _whiteListBox.append(_whiteList);
     });

    return {
      render: function(){
        return _createdWidget;
      }
    }
  }

  ns.Widgets.Slug = function(event_id, slug){
    var _createdWidget = $('<div>').addClass('utilBox slug-box').append(Pard.Widgets.IconManager('play_arrow').render().addClass('arrow-util-box'));

    var _slugTitle = $('<p>').text(Pard.t.text('manager.tools.slug.title')).addClass('utilTitle')

    var _messageYesSlug = Pard.t.text('manager.tools.slug.created');
    var _messageNoSlug = Pard.t.text('manager.tools.slug.create');
    var _content = $('<div>').append(
      $('<p>').text(_messageNoSlug).addClass('utilText')
    )
    
    var _slugInput = $('<div>')
    var _domain = $('<p>').text('www.orfheo.org/event/')
      .css({
        'margin-bottom':'0',
        'margin-left':'.5rem',
        'display': 'inline'
      })
    var _slug = $('<input>')
      .attr({type: 'text'})
      .addClass('slug-input')


    var _addInputButton = $('<button>')
      .attr('type','button')
      .addClass('material-icons add-multimedia-input-button')
      .html('&#xE86C')

    var _errorText = $('<p>')
    var _initTxt =  Pard.t.text('manager.tools.slug.regexMex')
    var _unavailabletext = Pard.t.text('manager.tools.slug.unavailable')
    var _regExError = Pard.t.text('manager.tools.slug.regexError')
    var _lengthError = Pard.t.text('manager.tools.slug.lengthError')
    var _availableTxt = Pard.t.text('manager.tools.slug.available')

    var regEx = /^[a-z0-9_-]*$/
    var _error = $('<div>')
        .append(_errorText
          .text(_initTxt)
          .css({
          'font-size':'12px',
          'line-height':'.9rem'
        }))
        .css({
          'margin-bottom':'-.8rem',
        })

    _slug.on('input', function(){
      _slug.removeClass('warning')
      if(_slug.val().length<1){
        _cancelBtn.trigger('click')
      }
      else if(_slug.val().length < 3){
        _slug.addClass('warning').removeClass('available')
        _addInputButton.removeClass('add-input-button-enlighted')
        _errorText.text(_lengthError).addClass('warningText')
      }
      else if(!regEx.test(_slug.val())){
        _slug.addClass('warning').removeClass('available')
        _addInputButton.removeClass('add-input-button-enlighted')
        _errorText.text(_regExError).addClass('warningText')
        // _error.show()
      }
      else{
        _cancelBtn.addClass('add-input-button-enlighted')
        Pard.Backend.checkSlug(_slug.val(), function(data){
          if(data.available == false) {
            _slug.addClass('warning').removeClass('available')
            _addInputButton.removeClass('add-input-button-enlighted')
            _errorText.text(_unavailabletext).addClass('warningText')
          };
          if(data.available == true) {
            if(_slug.val().length<1){
              _cancelBtn.trigger('click')
            }
            else{
              _slug.removeClass('warning').addClass('available')
              _addInputButton.addClass('add-input-button-enlighted')
              _errorText.text(_availableTxt).removeClass('warningText')
            }
          }
        })
      }
    })

    _addInputButton.on('click', function(){
      if(_addInputButton.hasClass('add-input-button-enlighted')){
        var _confirmation = $('<div>').addClass('very-fast reveal full')
        _confirmation.empty()
        $('body').append(_confirmation)
        var _confirmPopup = new Foundation.Reveal(_confirmation, {closeOnClick: true, animationIn: 'fade-in', animationOut: 'fade-out', multipleOpened:true})
        var _message = Pard.Widgets.PopupContent(Pard.t.text('popup.delete.title'),  confirmPopupContent())
        _message.setCallback(function(){
          _confirmPopup.close()
          setTimeout(
            function(){
              _confirmation.remove()
            },500)
        })

        _confirmation.click(function(e){
          if ($(e.target).hasClass('vcenter-inner')) {
            _confirmPopup.close()
            setTimeout(
              function(){
                _confirmation.remove()
              },500)
          }
        })

        _confirmation.append(_message.render())
        _confirmPopup.open()
      }
    })

    var _cancelBtn = $('<button>')
      .attr('type','button')
      .click(
        function(){
          _addInputButton.removeClass('add-input-button-enlighted')
          _cancelBtn.removeClass('add-input-button-enlighted')
          _slug
            .val('')
            .removeClass('warning available')
          _errorText
            .text(_initTxt)
            .removeClass('warningText')
      })
      // $('<span>')
      .addClass('material-icons add-multimedia-input-button')
      .html('&#xE5C9')
      .css({
        'margin-left':'0.1rem'
      })

    _slugInput.append(_domain, _slug)
    _createdWidget.append(_slugTitle, _content.append(_slugInput))

    var _slugSucces = function(){
      _slug.val(slug)
      _slug.attr('disabled', true)
      _content.empty();
      var _personalLink = 'www.orfheo.org/event/' + _slug.val()
      _content.append(
        $('<p>').text(_messageYesSlug).addClass('utilText'),
        $('<p>').append(
          $('<a>')
            .text(_personalLink)
              .attr({
                'href': '/event/'+_slug.val(), 
                'target':'_blank'})
            )
      )
      _error.remove()
      _copyBtn = $('<button>')
        .attr({
          'type':'button',
          'title':'Copia dirección'
        })
        .append(
          Pard.Widgets.IconManager('copy').render()
          )
        .addClass('iconButton-CallPage copyBtn')
        .tooltip({
          tooltipClass: 'orfheo-tooltip', 
          show:{delay:800}, 
          position:{collision:'fit', my: 'left top+5px'},
        })
        .click(function(){
          Pard.Widgets.CopyToClipboard(_personalLink)
            _copyBtn.tooltip('destroy')
            _copyBtn
            .attr({
              'type':'button',
              'title':'Dirección copiada'
            })
            .tooltip({
              tooltipClass: 'orfheo-tooltip-success', 
              show:{delay:1}, 
              position:{collision:'fit', 
              my: 'left top+5px'
            }})
            .tooltip('open')

            _copyBtn.one('mouseleave',function(){
              setTimeout(function(){
                _copyBtn.tooltip('destroy')
                  _copyBtn
                    .attr({
                      'type':'button',
                      'title':'Copia dirección'
                    })
                    .tooltip({
                      tooltipClass: 'orfheo-tooltip', 
                      show:{delay:800}, 
                      position:{collision:'fit', my: 'left top+5px'}
                    })
                }, 500)
            })         
        })
      _createdWidget.append(
        $('<div>')
          .append(_copyBtn)
          .css({
            'position':'relative',
            'height':'1.5rem',
            'margin-top':'-1rem'
          })
      )
    }

    if(slug){
      _slugSucces()
    }
    else{
      _slugInput.append(_addInputButton, _cancelBtn)
      _createdWidget.append(_error)
    }

    var confirmPopupContent = function(){
      var _createdWidget = $('<div>')
      var _mex = $('<p>')
        .append(
          Pard.t.text('manager.tools.slug.popupMex')
        ) 
      var _link = $('<p>')
        .text('www.orfheo.org/event/'+ _slug.val())
        .addClass('newLinkTxt')

      var _yesBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn confirm-delete-btn').text(Pard.t.text('dictionary.confirm').capitalize())
      var _noBtn = $('<button>').attr({'type':'button'}).addClass('pard-btn cancel-delete-btn').text(Pard.t.text('dictionary.cancel').capitalize())

      var _warning = $('<p>')
        .text(Pard.t.text('manager.tools.slug.popupWarning'))

      // 'Esta nueva dirección funcionará paralelamente a la ya existente y no podrá ser eliminada o modificada una vez creada'

      var spinnerSlug =  new Spinner().spin()
      var _buttonsContainer = $('<div>').addClass('yes-no-button-container')

      _createdWidget.append(_mex, _link, _warning)
      _createdWidget.append(_buttonsContainer.append(_noBtn, _yesBtn))

      return {
        render: function(){
          return _createdWidget
        },
        setCallback: function(callback){
          _noBtn.click(function(){
            callback()
          })
          _yesBtn.click(function(){
            $('body').append(spinnerSlug.el);
            Pard.Backend.createSlug(_slug.val(), event_id, function(data){
              spinnerSlug.stop()
              callback()
              if(data.status == 'success'){
                slug = _slug.val()
                _slugSucces()
              }
              else{
                Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.ErrorHandler(data.reason), function(){
                  console.log(data.reason)
                })
              }
            })
          })
        }
      }
    }

    return {
      render: function(){
        return _createdWidget
      }
    }
  }

  ns.Widgets.WhiteList = function(the_event){

    var _createdWidget = $('<div>');
    var _emailsNames = [{id:'', text:''}];
    var _namesList = [];
    var _emailsList = [];

    var _makeList = function(proposal){
      var email = {id: proposal.email, text: proposal.email};
      if($.inArray(proposal.email, _emailsList) < 0) {
        _emailsNames.push(email);
        _emailsList.push(proposal.email);
      }
      var name = {id: proposal.email, text: proposal['name']};
      if($.inArray(proposal['name'], _namesList) < 0){
        _emailsNames.push(name);
        _namesList.push(proposal['name']);
      }
    }

    Object.keys(the_event.artists).forEach(function(profile_id){
      _makeList(the_event.artists[profile_id].artist);
    });

    Object.keys(the_event.spaces).forEach(function(profile_id){
      _makeList(the_event.spaces[profile_id].space);
    });

    var _inputNameEmail = $('<select>');
    var _inputContainer = $('<div>').addClass('input-whiteList-container');

    var _addInputButton = $('<span>')
      .addClass('material-icons add-multimedia-input-button')
      .html('&#xE86C');
    _addInputButton.addClass('add-input-button-enlighted');

    var _outerListContainer = $('<div>')
      .addClass('whiteListedContainer-call-page');
    var _inputAddedContainer = $('<div>')
      .addClass('innerWhitelistedCont');


    var _whiteEmails = [];
    var _addInput = function(item){
      _whiteEmails.push(item.email);
      var _container = $('<div>'); 
      var _newInput = Pard.Widgets.Input('','text');
      _newInput.setVal([item['name_email']]);      
      _newInput.setClass('add-whiteList-input-field');
      _newInput.disable();      
      var _removeInputButton = $('<span>').addClass('material-icons add-multimedia-input-button-delete').html('&#xE888');

      _container.append(_newInput.render(),  _removeInputButton);
      _inputAddedContainer.prepend(_container);
      if (!Pard.CachedEvent.finished){
        _removeInputButton.on('click', function(){
          Pard.Backend.deleteWhitelist(
            the_event.call_id,
            the_event.id, 
            item.email, 
            function(){}
          );
        });
      }
      else{
        _removeInputButton.css({
          'color':'#6f6f6f',
          'cursor':'default'
        })
      }
    }

    if (the_event.whitelist) the_event.whitelist.forEach(function(whitelisted){
      _addInput(whitelisted);
    });

    _addInputButton.on('click', function(){
      if (_inputNameEmail.val()){
        var _data = _inputNameEmail.select2('data');
        var name_email = _data[0].text;
        var email = _data[0].id;
        if ($.inArray(email, _whiteEmails) >= 0 ){
          Pard.Widgets.Alert('',Pard.t.text('manager.tools.whitelist.ontheList'));
          return false;
        }
        Pard.Backend.addWhitelist(
          the_event.call_id,
          the_event.id, 
          name_email, 
          email, 
          function(){ }
        );
      }
    });

    var _emptyEmail = $('<option>');
    _inputNameEmail.append(_emptyEmail);
    _inputContainer.append(_inputNameEmail),_outerListContainer.append(_inputAddedContainer);

    _inputNameEmail.select2({
      dropdownCssClass:'orfheoTableSelector',
      placeholder: Pard.t.text('manager.tools.whitelist.placeholder'),
      data: _emailsNames,
      allowClear: true,
      tags: true
    });

    _inputNameEmail.on('select2:select',function(){
      if (_inputNameEmail.select2('data')) _addInputButton.trigger('click');
    });

    _inputNameEmail.on('select2:open',function(){
      $('input.select2-search__field').val('');
      _inputNameEmail.val('val','');
      $('span.select2-search.select2-search--dropdown').click(function(){
        $('input.select2-search__field').focus();
      });
      setTimeout(function() {$('input.select2-search__field').focus()},500);
    });

    _inputContainer.append(_inputNameEmail);
    _outerListContainer.append(_inputAddedContainer);
    _createdWidget.append($('<label>').append(_inputContainer, _outerListContainer));

    if (Pard.CachedEvent.finished) _inputNameEmail.attr('disabled', true);


    return {
      render: function(){
        return _createdWidget;
      }
    }
  }

}(Pard || {}));
