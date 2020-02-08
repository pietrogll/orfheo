'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};

  ns.Widgets.FeedbackForm = function(){
    var _nameInput = Pard.Widgets.Input(Pard.t.text('contact.forms.name'),'text');
    var _emailInput = Pard.Widgets.InputEmail(Pard.t.text('contact.forms.email'));
    var _mexInput = Pard.Widgets.TextArea(Pard.t.text('contact.forms.mex'),6);
    var _feedbackErrorBox = $('<p>');
    var _feedbackSubmitBtnContainer= $('<div>');
    var _feedBackSubmitBtn = Pard.Widgets.Button(Pard.t.text('contact.send'), function(){
      _feedBackSubmitBtn.disable();
      _feedBackSubmitBtn.setClass('disabled-button');
      _feedbackErrorBox.empty();
      var spinner = new Spinner();
      spinner.spin();
      $('body').append(spinner.el);
      var feedbackFormFilled = true;
      [_nameInput, _emailInput, _mexInput].forEach(function(input){
        if (!(input.getVal())){
          input.addWarning();
          feedbackFormFilled = false;
        }
      });
      if (feedbackFormFilled){
        Pard.Backend.feedback(_nameInput.getVal(), _emailInput.getVal(), _mexInput.getVal(), function(data){
          spinner.stop();
          if (data['status'] == 'success'){
           _feedbackSubmitBtnContainer.remove();
            _feedbackErrorBox
              .empty()
              .css('text-align','right')
              .append(
                Pard.Widgets.IconManager('done').render().addClass('success-icon-check-messageSent'),
                $('<span>').text(Pard.t.text('contact.correct')).css('color','#4cb632'),
                $('<span>').html('<br>' + Pard.t.text('contact.thankFeedback'))
                  .css({
                    'color':'black',
                    'margin-bottom':'1.5rem'
                  })
              )
              .removeClass('error-text');
          }
          else{
            _feedBackSubmitBtn.enable();
            _feedBackSubmitBtn.deleteClass('disabled-button');
            _feedbackErrorBox
              .empty()
              .append(
                Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
                $('<span>').html(Pard.t.text('contact.noSend') + '<br>' + data.reason) 
              ).addClass('error-text')
          }
        });
      }
      else{
        _feedBackSubmitBtn.enable();
        _feedBackSubmitBtn.deleteClass('disabled-button');
        spinner.stop()
        _feedbackErrorBox
        .empty()
        .append(
          Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
          $('<span>').html(Pard.t.text('contact.noSend') + '<br>' +  Pard.t.text('error.incomplete'))
        ).addClass('error-text');
      }
    });
    _feedbackSubmitBtnContainer
      .append(
        _feedBackSubmitBtn.render().addClass('submit-button')
      )
    var _submitContainer = $('<div>')
      .css({
        'min-height':'3.2rem',
        'position':'relative'
      })
      .append(_feedbackErrorBox, _feedbackSubmitBtnContainer)
    var _formFeed = $('<div>')
      .addClass('contactForm-container')
      .append(
        $('<form>').append(_nameInput.render(), _emailInput.render(), _mexInput.render()), 
        _submitContainer.append(_feedbackErrorBox, _submitContainer)
      )

    return _formFeed;
  }


  ns.Widgets.TecnicalSupportForm = function(){
    var _errorBox = $('<p>');
    var _nameInput = Pard.Widgets.Input(Pard.t.text('contact.forms.name'),'text');
    var _emailInput = Pard.Widgets.InputEmail(Pard.t.text('contact.forms.email'));
    var _subjectInput = Pard.Widgets.Input(Pard.t.text('contact.forms.subject'),'text');
    var _profileInput = Pard.Widgets.Input(Pard.t.text('contact.forms.profileName'), 'text');
    // var _browserInput = Pard.Widgets.Input('Navegador que utilizas', 'text');
    var _mexInput = Pard.Widgets.TextArea(Pard.t.text('contact.forms.mex'),6);
    var _submitBtn = Pard.Widgets.Button(Pard.t.text('contact.send'), function(){
      _submitBtn.disable();
      _submitBtn.setClass('disabled-button');
      _errorBox.empty();
      var spinner = new Spinner();
      spinner.spin();
      $('body').append(spinner.el);
      var filled = true;
      [_nameInput, _emailInput,_mexInput].forEach(function(input){
        if (!(input.getVal())){
          input.addWarning();
          filled = false;
        }
      });
      if (filled){
        var _profileName = Pard.UserInfo['userProfiles'] || _profileInput.getVal();
        Pard.Backend.techSupport(_nameInput.getVal(), _emailInput.getVal(), _subjectInput.getVal(), _profileName, Pard.UserInfo['browser'], _mexInput.getVal(), function(data){
          spinner.stop();
          if (data['status'] == 'success'){
            _submitBtnContainer.remove();
            _errorBox
              .empty()
              .css('text-align','right')
              .append(
                Pard.Widgets.IconManager('done').render().addClass('success-icon-check-messageSent'),
                $('<span>').text(Pard.t.text('contact.correct')).css('color','#4cb632'),
                $('<span>').html(Pard.t.text('contact.thanks'))
                  .css({
                    'color':'black',
                    'margin-bottom':'1.5rem'
                  })
              )
              .removeClass('error-text');
          }
          else{
            _submitBtn.enable();
            _submitBtn.deleteClass('disabled-button');
            _errorBox
              .empty()
              .append(
                Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
                $('<span>').html(Pard.t.text('contact.noSend') + '<br>' + data.reason)
              ).addClass('error-text')
          }
        });
      }
      else{
        _submitBtn.enable();
        _submitBtn.deleteClass('disabled-button');
        spinner.stop()
        _errorBox
        .empty()
        .append(
          Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
          $('<span>').html(Pard.t.text('contact.noSend') + '<br>' +  Pard.t.text('error.incomplete'))
        ).addClass('error-text');
      }
    });
    var _submitBtnContainer = $('<span>')
      .append(
        _submitBtn.render().addClass('submit-button')
      )
    var _submitContainer = $('<div>')
      .css({
        'min-height':'3.2rem',
        'position':'relative'
      });
    var _form = $('<form>').append(_nameInput.render(), _emailInput.render());
    if (!Pard.UserInfo['userProfiles']) _form.append(_profileInput.render());
    _form.append(_subjectInput.render(), _mexInput.render()); 
    var _formSupport = $('<div>').addClass('contactForm-container').append(
      _form,
      _submitContainer.append(_errorBox, _submitBtnContainer) 
    )

    return _formSupport;

  }

  ns.Widgets.BusinessForm = function(profileName){
    var _contactForm = $('<div>').addClass('contactForm-container');
    var _form = $('<form>');
    var _errorBox = $('<p>');
    var _errorBoxCont = $('<div>').append(_errorBox);
    var _nameInput = Pard.Widgets.Input(Pard.t.text('contact.forms.name'),'text');
    var _emailInput = Pard.Widgets.InputEmail(Pard.t.text('contact.forms.email'));
    var _phoneInput = Pard.Widgets.InputTelContactForm(Pard.t.text('contact.forms.phone')+ '*','text');
    var _phoneDayAvailabilty = Pard.Widgets.MultipleSelector(
      Pard.t.text('contact.forms.days')
      );
      _phoneDayAvailabilty.setOptions({
        placeholder:  Pard.t.text('contact.forms.daysPlaceholder'),
        selectAllText: Pard.t.text('contact.forms.everyday'),
        countSelected: false,
        allSelected: Pard.t.text('contact.forms.always')
      });
    var _phonePeriodAvailabilty = Pard.Widgets.MultipleSelector(
      Pard.t.text('contact.forms.periods'));
    _phonePeriodAvailabilty.setOptions({
        placeholder: Pard.t.text('contact.forms.periodsPlaceholder'),
        selectAllText: Pard.t.text('contact.forms.everyperiod'),
        countSelected: false,
        allSelected: Pard.t.text('contact.sforms.anytime')
      });
    var _phoneDayAvailabilityCont  = $('<div>').append(_phoneDayAvailabilty.render()).hide().addClass('availabilityContainer');
    var _phonePeriodAvailabiltyCont = $('<div>').append(_phonePeriodAvailabilty.render()).hide().addClass('availabilityContainer');
    var _showHideAvailability = function(){
      if (_checkPhone.getVal() || _checkHangout.getVal()){
        _phoneDayAvailabilityCont.show();
        _phonePeriodAvailabiltyCont.show();
      }else{
        _phoneDayAvailabilty.deselectAll();
        _phonePeriodAvailabilty.deselectAll();
        _phoneDayAvailabilityCont.hide();
        _phonePeriodAvailabiltyCont.hide();
      }
    }
    var _projectWebInput = Pard.Widgets.Input(Pard.t.text('contact.forms.links'),'text');
    var _subjectInput = Pard.Widgets.Input(Pard.t.text('contact.forms.subject') + '*','text');
    var _checkPhone = Pard.Widgets.CheckBox(
      Pard.t.text('contact.forms.call_me'),
      'call_me_please', 
      function(){
      _showHideAvailability();
      }
    );
    var _checkHangout = Pard.Widgets.CheckBox(
      Pard.t.text('contact.forms.hangout_me'),
      'hangout_me_please',
      function(){
        _showHideAvailability();
      }
    );
    var _mexInput = Pard.Widgets.TextArea(Pard.t.text('contact.forms.mex'),6);
    var businessInputs = {
      'name': _nameInput,
      'email': _emailInput,
      'subject': _subjectInput,
      'contactPhone': _checkPhone,
      'contactHangout': _checkHangout,
      'phone': _phoneInput,
      'dayAvailabilty': _phoneDayAvailabilty,
      'periodAvailabilty': _phonePeriodAvailabilty,
      'message': _mexInput,
      'links': _projectWebInput
    }
    var _submitBtn = Pard.Widgets.Button(Pard.t.text('contact.send'), function(){
      _submitBtn.disable();
      _submitBtn.setClass('disabled-button');
      _errorBox.empty();
      var spinner = new Spinner();
      spinner.spin();
      $('body').append(spinner.el);
      var businessForm = {};
      for (var key in businessInputs){
        businessForm[key] = businessInputs[key].getVal();
      }
      if (businessForm['dayAvailabilty']) businessForm['dayAvailabilty'] = businessForm['dayAvailabilty'].join();
      if (businessForm['periodAvailabilty']) businessForm['periodAvailabilty'] = businessForm['periodAvailabilty'].join();
      var filled = true;
      ['name', 'email','phone','subject','message'].forEach(function(field){
        if (!(businessForm[field])){
          businessInputs[field].addWarning();
          filled = false;
        }
      });

      if (filled){
        if (profileName) businessForm['name'] = businessForm['name'] + ' | '+profileName;
        Pard.Backend.business(businessForm, function(data){
          console.log(data)
          spinner.stop();
          if (data['status'] == 'success'){
            _submitBtnContainer.remove();
            _errorBox
              .empty()
              .css('text-align','right')
              .append(
                Pard.Widgets.IconManager('done').render().addClass('success-icon-check-messageSent'),
                $('<span>').text(Pard.t.text('contact.correct')).css('color','#4cb632'),
                $('<span>').html(Pard.t.text('contact.thanks'))
                  .css({
                    'color':'black',
                    'margin-bottom':'1.5rem'
                  })
              )
              .removeClass('error-text');
          }
          else{
            _submitBtn.enable();
            _submitBtn.deleteClass('disabled-button');
            _errorBox
              .empty()
              .append(
                Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
                $('<span>').html(Pard.t.text('contact.noSend') + '<br>' + data.reason)
              ).addClass('error-text')
          }
        });
      }
      else{
        _submitBtn.enable();
        _submitBtn.deleteClass('disabled-button');
        spinner.stop()
        _errorBox
        .empty()
        .append(
          Pard.Widgets.IconManager('attention').render().css({'font-size':'22px','vertical-align':'-.1rem'}),
          $('<span>').html(Pard.t.text('contact.noSend') + '<br>' +  Pard.t.text('error.incomplete'))
        ).addClass('error-text');
      }
    });
    var _submitBtnContainer = $('<span>')
    	.append(
      	_submitBtn.render().addClass('submit-button')
    	)
    var _submitContainer = $('<div>')
    	.css({
    		'min-height':'3.2rem',
    		'position':'relative'
    	});
    _form.append(
      _nameInput.render(), 
      _emailInput.render(), 
      _phoneInput.render(), 
      _checkPhone.render().addClass('checkBox-contactForm'),
      _checkHangout.render().addClass('checkBox-contactForm'),
      _phoneDayAvailabilityCont, 
      _phonePeriodAvailabiltyCont,
      _projectWebInput.render(),
      _subjectInput.render(), 
      _mexInput.render()
    );
    _contactForm.append(_form, _submitContainer.append(_errorBox, _submitBtnContainer));

    return _contactForm;
  }



}(Pard || {}));