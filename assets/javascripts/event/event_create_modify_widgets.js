'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.AdminCreateEvent = function(){
		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html(Pard.t.text('dictionary.create').capitalize());
		var _popup = Pard.Widgets.Popup();
		var _formWidget = Pard.Widgets.PrintForm(Pard.Forms.Event, _submitButton);

		_formWidget.setSend(function(stopSpinner){
			var _submittedForm = _formWidget.getVal();
			_submittedForm['categories'] = {artist: _submittedForm['categories']};
			if(_submittedForm['texts']) _submittedForm['texts'] = _submittedForm['texts'].reduce(function(texts, t){	
				texts[t['lang']] = {};
				for (var field in t){
					if(field != 'lang') texts[t['lang']][field] = t[field];
				}
				return texts;
			},{});  
			Pard.Backend.createEvent(_submittedForm, function(data){
				if (data['status'] == 'success'){
					stopSpinner();
					_popup.close();
				}
				else{
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})

		});

		var _content = $('<div>');
		_content.append(_formWidget.render());
		_popup.setContent('', _content);
    	_popup.open();
	}


	ns.Widgets.ModifyEvent = function(the_event){

		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
		var _popup = Pard.Widgets.Popup();
		var _modifyEventForm = Pard.Forms.Event;

    var _now = Date.now();
    var _callStart, _callEnd, call_begun;
    if(the_event.call_id){
    	_callStart = parseInt(the_event.start);
    	_callEnd = parseInt(the_event.deadline);
    	call_begun = _callStart < _now;
    } 

		delete _modifyEventForm.profile_id;
		if (Pard.UserStatus['status'] !== 'admin') delete _modifyEventForm.professional;
		if (call_begun) delete _modifyEventForm.eventTime;
		var _formWidget = Pard.Widgets.PrintForm(Pard.Forms.Event, _submitButton);
		var _eventCopy = $.extend(true, {}, the_event);
		_eventCopy['categories'] = _eventCopy['categories']['artist'];
		_eventCopy['texts'] = Object.keys(_eventCopy['texts']).map(function(l){
			return Object.keys(_eventCopy['texts'][l]).reduce(function(obj, key){
				obj[key] = _eventCopy['texts'][l][key];
				return obj;
			},
			{lang: l})
		}); 
		_formWidget.setVal(_eventCopy);

		_formWidget.setSend(function(stopSpinner){
			var _submittedForm = _formWidget.getVal();
			_submittedForm['id'] = the_event.id;
      _submittedForm['profile_id'] = the_event.profile_id;
			_submittedForm['categories'] = {artist: _submittedForm['categories']};
			_submittedForm['texts'] = _submittedForm['texts'].reduce(function(texts, t){	
				texts[t['lang']] = {};
				for (var f in t){
					if(f != 'lang') texts[t['lang']][f] = t[f];
				}
				return texts;
			},{});
			if (call_begun) _submittedForm['eventTime'] = the_event['eventTime'];  
			Pard.Backend.modifyEvent(_submittedForm, function(data){
				if (data['status'] == 'success'){

          for (var field in data.event){
						Pard.CachedEvent[field] = data.event[field];
					}
					Pard.UserInfo['texts'] = Pard.CachedEvent.texts[Pard.Options.language()] || Pard.CachedEvent.texts[Object.keys(Pard.CachedEvent.texts)[0]];
					Pard.Bus.trigger('modifyEvent');
					stopSpinner();
					_popup.close();
					setTimeout(function(){
		        _popup.destroy();
		      },500);
				}
				else {
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})

		})

		var _gTextContainer = $('<p>').html(Pard.t.text('forms.event.gInitText'));
		var _callWarningContainer = $('<p>').html(Pard.t.text('forms.event.callWarningText'));
		var _txts = $('<div>').append(_gTextContainer);
		if(the_event.call_id) _txts.append(_callWarningContainer);


		var _content = $('<div>')
			.append(
				_txts,
				_formWidget.render()
			);

		if (Pard.UserStatus['status'] == 'admin'){
			var _delete = $('<div>');
			var _deleteEventBnt = Pard.Widgets.Button(
				'deleteEvent', 
				function(){
					Pard.Widgets.ConfirmPopup(
						'', 
						function(){
							Pard.Backend.deleteEvent(the_event.id, function(data){
								if (data['status'] == 'success'){
						      location.href = '/users/';
						    }
			    			else{
									Pard.Widgets.Alert('Error', data['reason'])
			    			}
							})
						}
					)
				}
			);
			_content.append(_delete.append(_deleteEventBnt.render()));
		}

		_popup.setContent(
			Pard.t.text('dictionary.modify').capitalize(), 
			_content
		);

   	_popup.open();

	}


	ns.Widgets.UpdatePartners = function(event){
		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
		var _popup = Pard.Widgets.Popup();
		var _formWidget = Pard.Widgets.PrintForm(Pard.Forms.Partners, _submitButton);
		if(event.partners && Object.keys(event.partners).length){
			var _partners = event.partners;
			var _partnersArray = Object.keys(_partners).reduce(function(array, k){
				_partners[k].forEach(function(p){
					p['type'] = k;
					array.push(p);
				});
				return array;
			}, []);
			_formWidget.setVal({partners: _partnersArray});
		}
		_formWidget.setSend(function(stopSpinner){
			var _submittedForm = _formWidget.getVal();
			_submittedForm['id'] = event.id;
			if(_submittedForm['partners']) _submittedForm['partners'] = _submittedForm['partners'].reduce(function(partners, p){	
				partners[p['type']] = partners[p['type']] || [];
				if (p['name'] || p['img']) partners[p['type']].push({
					'name': p['name'],
					'img': p['img'],
					'link' : p['link']
				});
				return partners;
			},{});
			Pard.Backend.updatePartners(_submittedForm, function(data){
				if (data['status'] == 'success'){
					Pard.CachedEvent['partners'] = _submittedForm.partners;
					Pard.Bus.trigger('updatePartners');
					stopSpinner();
					_popup.close();
					setTimeout(function(){
		        _popup.destroy();
		      },500);
				}
				else {
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})

		})
		var _content = $('<div>');
		_content.append(_formWidget.render());
		_popup.setContent(Pard.t.text('dictionary.modify').capitalize(), _content);
    	_popup.open();
	}


	ns.Widgets.CreateCall = function(){
		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html(Pard.t.text('dictionary.create'));
		var _popup = Pard.Widgets.Popup();

		var _content = $('<div>');
		_popup.setContent('create call', _content);
    	_popup.open();

		var _formWidget = Pard.Widgets.PrintForm(Pard.Forms.Call, _submitButton);
		_formWidget.setSend(function(stopSpinner){
			var _submittedForm = _formWidget.getVal();
			if (_submittedForm['event_selected']['call_id']){
				Pard.Widgets.Alert('ATT!!','event has already a call');
				stopSpinner();
				return;
			} 
			_submittedForm['event_id'] = _submittedForm['event_selected']['event_id']
			_submittedForm['profile_id'] = _submittedForm['event_selected']['profile_id'];
			delete _submittedForm['event_selected']
			_submittedForm['deadline'] += 24*60*60*1000 - 1000;
			Pard.Backend.createCall(_submittedForm, function(data){
				if (data['status'] == 'success'){
					stopSpinner();
					_popup.close();
					setTimeout(function(){
		        _popup.destroy();
		      },500);
				}
				else {
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})
		})


		_content.append(
			_formWidget.render()
			);


	}


	ns.Widgets.CreateProgram = function(){
		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html(Pard.t.text('dictionary.create'));
		var _popup = Pard.Widgets.Popup();
		var _formWidget = Pard.Widgets.PrintForm(Pard.Forms.Program, _submitButton);
		_formWidget.setSend(function(stopSpinner){
			var _submittedForm = _formWidget.getVal();
				if (_submittedForm['event_selected']['program_id']){
				Pard.Widgets.Alert('ATT!!','event has already a program');
				stopSpinner();
				return;
			} 
			_submittedForm['texts'] = $.extend(true, {}, _submittedForm['subcategories']['texts']);
			_submittedForm['subcategories'] = _submittedForm['subcategories']['subcategories'];
			_submittedForm['event_id'] = _submittedForm['event_selected']['event_id'];
			delete _submittedForm['event_selected'];
			Pard.Backend.createProgram(_submittedForm, function(data){
				if (data['status'] == 'success'){
					stopSpinner();
					_popup.close();
					setTimeout(function(){
		        _popup.destroy();
		      },500);
				}
				else {
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})

		})
		var _content = $('<div>');
		_content.append(_formWidget.render());
		_popup.setContent('create program', _content);
    _popup.open();
	}


	ns.Widgets.ModifyCall = function(call_id){

		var spinner = new Spinner();
	    spinner.spin();
	    $('body').append(spinner.el);

		var _popup = Pard.Widgets.Popup();
		var _content = $('<div>');
		_popup.setContent('Modify Call', _content);


		Pard.Backend.getCall(call_id, function(data){
			var call = data.call;

		  var _formBuilderBtn = Pard.Widgets.Button('formBuilder',function(){
				Pard.Widgets.FormBuilder(call);
			});

			_content.append(_formBuilderBtn.render());
			
			var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
			var form = Pard.Forms.Call;
			delete form.event_selected;
			var _formWidget = Pard.Widgets.PrintForm(form, _submitButton);
			_formWidget.setVal(call);
			
			_formWidget.setSend(function(stopSpinner){
				var _submittedForm = _formWidget.getVal();
				_submittedForm['deadline'] += 24*60*60*1000 - 1000;
				_submittedForm['id'] = call.id;
				_submittedForm['event_id'] = call.event_id;
				_submittedForm['profile_id'] = call.profile_id;
				Pard.Backend.modifyCall(_submittedForm, function(data){
					if (data['status'] == 'success'){
						stopSpinner();
						_popup.close();
						setTimeout(function(){
			        _popup.destroy();
			      },500);
			      location.reload();
					}
					else {
						stopSpinner();
						Pard.Widgets.Alert('Error', data['reason'])
					}
				})

			})

			_content.append(_formWidget.render());

			if (Pard.UserStatus['status'] == 'admin'){
				var _delete = $('<div>');
				var _deleteCall = function(){
					Pard.Backend.deleteCall(call.id, function(data){
						if (data['status'] == 'success'){
							location.reload();
				    }
	    			else{
							Pard.Widgets.Alert('Error', data['reason'])
	    			}
					})
				}
				var _deleteBnt = Pard.Widgets.Button('deleteCall', function(){
					Pard.Widgets.ConfirmPopup('', _deleteCall);
				});
				_content.append(_delete.append(_deleteBnt.render()));
			}

    	_popup.open();
    	spinner.stop();

		})

	}


	ns.Widgets.ModifyProgram = function(program_id){
		var spinner = new Spinner();
	    spinner.spin();
	    $('body').append(spinner.el);

		var _popup = Pard.Widgets.Popup();
		var _content = $('<div>');
		var is_admin = Pard.UserStatus['status'] == 'admin';
		
		Pard.Backend.getProgram(program_id, function(data){
			var program = data.program;

			var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');
			var form = Pard.Forms.Program;
			delete form.event_selected;
			delete form.permanents;
			if (!is_admin) delete form.subcategories;
			var _formWidget = Pard.Widgets.PrintForm(form, _submitButton);
			program['subcategories'] = {
				subcategories: program['subcategories'],
				texts: program['texts']
			}
			_formWidget.setVal(program);

			_formWidget.setSend(function(stopSpinner){
				var _submittedForm = _formWidget.getVal();
				_submittedForm['id'] = program.id;
				_submittedForm['event_id'] = program.event_id;
				if(_submittedForm['subcategories']) {
					_submittedForm['texts'] = $.extend(true, {}, _submittedForm['subcategories']['texts']);
					_submittedForm['subcategories'] = _submittedForm['subcategories']['subcategories'];
				}
				
				Pard.Backend.modifyProgram(_submittedForm, function(data){

					if (data['status'] == 'success'){
						stopSpinner();
						_popup.close();
						setTimeout(function(){
			        _popup.destroy();
			      },500);
			      location.reload();
					}
					else {
						stopSpinner();
						Pard.Widgets.Alert('Error', data['reason'])
					}
				})

			})

			_content.append(_formWidget.render());
			_popup.setContent(Pard.t.text('dictionary.modify').capitalize(), _content);


			if (Pard.UserStatus['status'] == 'admin'){
				var _delete = $('<div>');
				var _deleteProgram = function(){
					Pard.Backend.deleteProgram(program_id, function(data){
						if (data['status'] == 'success'){
							location.reload();
				    }
	    			else{
							Pard.Widgets.Alert('Error', data['reason'])
	    			}
					})	
				}
				var _deleteBnt = Pard.Widgets.Button('deleteProgram', function(){
					Pard.Widgets.ConfirmPopup('', _deleteProgram);
				});
				_content.append(_delete.append(_deleteBnt.render()));
			}
			
	  	_popup.open();
	  	spinner.stop();

		})
		
	}


}(Pard || {}));