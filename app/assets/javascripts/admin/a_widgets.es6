'use strict';

(function(ns){
     
ns.Widgets = ns.Widgets || {};

	ns.Widgets.AdminDeleteUser = function(){
		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('Delete');

		var _popup = Pard.Widgets.Popup();
		var form = {
			email: {
					'type':'mandatory',
					'label': 'Email of the user to delete',
					"input" : "InputEmail",
		      "args" : [],
		      'helptext':''
				}
			}
		var _formWidget = Pard.Widgets.PrintForm(form, _submitButton);


		_formWidget.setSend(function(stopSpinner){
			stopSpinner();
			Pard.Widgets.ConfirmPopup(
				'',
				function(){
					Pard.Backend.adminDeleteUser(_formWidget.getVal(), function(data){
						if (data['status'] == 'success'){
							Pard.Widgets.Alert('User data deleted')
				    }
		  			else{
							Pard.Widgets.Alert('Error', data['reason']);
		  			}
					})
				}	
			)
		})

		_popup.setContent('Delete User', _formWidget.render());
    _popup.setCallback(function(){
      setTimeout(function(){
      	_popup.destroy();
    	},500);
     });
    _popup.open();
	}

	ns.Widgets.OpenCallMail = function(){

		var _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('Ok');
		var _formWidget;
		var _popup = Pard.Widgets.Popup();
		var	_formWidget = Pard.Widgets.PrintForm(Pard.Forms.OpenCallMail, _submitButton);
		_formWidget.setSend(function(stopSpinner){

			Pard.Backend.openCallMail(_formWidget.getVal()['event_selected'], function(data){
				if (data['status'] == 'success'){
					Pard.Widgets.TextMail(data);
					stopSpinner();
				}
				else {
					stopSpinner();
					Pard.Widgets.Alert('Error', data['reason'])
				}
			})
		});
		
		_popup.setContent('', _formWidget.render());
    _popup.setCallback(function(){
      setTimeout(function(){
      	_popup.destroy();
    	},500);
     });
    _popup.open();

	}


	ns.Widgets.TextMail = function(data){

		
		const _submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('Send');

		const _popup = Pard.Widgets.Popup();
		const _formWidget = Pard.Widgets.PrintForm(Pard.Forms.TextMail, _submitButton);

		let stopSpinner, _formValues, loading_bar;

		function _callBackend() {
			const valToSend = $.extend(true, _formValues, {})
			Pard.Backend.textMail(valToSend, data => {

				if (data['status'] == 'success'){

					stopSpinner();
    			Pard.Bus.trigger('updateDeliveryStatus')
    			_popup.close()
    			setTimeout(function(){
		      	_popup.destroy();
		    	},500);

				}
				else {
					stopSpinner();
					
				}
			})
		}
		_formWidget.setSend(function(_stopSpinner){
			_formValues = _getSubmittedForm();
			stopSpinner = _stopSpinner;
			_callBackend();
		});





		const _getSubmittedForm = function(){
			const _formVal =  _formWidget.getVal();
			return {
				receivers: _formVal['receivers'],
				es: { 
					subject: _formVal['subject_es'],
					body: _formVal['body_es']
				},
				ca: {
					subject: _formVal['subject_ca'],
					body:_formVal['body_ca']
				},
				en: {
					subject: _formVal['subject_en'],
					body: _formVal['body_en']
				}, 
				email_type: _formVal['email_type'],
				target: {
					categories: _formVal['categories']
				}
			}
		}

		if (data){
			_formWidget.setVal({
				body_es: data.text.es.body,
				body_en: data.text.en.body,
				body_ca: data.text.ca.body,
				subject_es: data.text.es.subject,
				subject_en: data.text.en.subject,
				subject_ca: data.text.ca.subject,
				email_type: data.email_type,
				categories: data.categories
			})
		}

		var _printDraft = function(){
			const _draftText = _getSubmittedForm();
			const _draft = $('<div>');
			_draft.append(
				$('<div>').append(
					$('<div>').append($('<p>').html('Subject default (ES):').css('color','#6f6f6f'), $('<p>').html(_draftText.es.subject)),
					$('<div>').append($('<p>').html('Body default (ES):').css('color','#6f6f6f'), $('<div>').html(_draftText.es.body))
				).css({
					'margin-bottom':'1.5rem',
					'padding-bottom':'1.5rem',
					'border-bottom': '1px solid #6f6f6f'
				}),
				$('<div>').append(
					$('<div>').append($('<p>').html('Subject CA:').css('color','#6f6f6f'), $('<p>').html(_draftText.ca.subject)),
					$('<div>').append($('<p>').html('Body CA:').css('color','#6f6f6f'), $('<div>').html(_draftText.ca.body))
				).css({
					'margin-bottom':'1.5rem',
					'padding-bottom':'1.5rem',
					'border-bottom': '1px solid #6f6f6f'
				}),
				$('<div>').append(
					$('<div>').append($('<p>').html('Subject EN:').css('color','#6f6f6f'), $('<p>').html(_draftText.en.subject)),
					$('<div>').append($('<p>').html('Body EN:').css('color','#6f6f6f'), $('<div>').html(_draftText.en.body))
				).css({
					'margin-bottom':'1.5rem',
					'padding-bottom':'1.5rem',
					'border-bottom': '1px solid #6f6f6f'
				})
			)
			return _draft;
		}

		const _content = $('<div>');
		const _draftBtn = Pard.Widgets.Button('See draft', () => {Pard.Widgets.BigAlert('', _printDraft(), 'multimedia-popup-bigalert')})

		_content.append(_formWidget.render(), _draftBtn.render());

		_popup.setContent('', _content);
	    _popup.setCallback(function(){
	      setTimeout(function(){
	      	_popup.destroy();
	    	},500);
	     });
	    _popup.open();

	}

	
	
	ns.Widgets.EmailsLoadingBar = function(){

		const loadingBarContainer = $('<div>').addClass('loadingbar--admin-emails');
		const loadingBar = $('<div>');
		const closeBntContainer = $('<div>');
		const progressLabel = $('<div>').text('starting...');

		loadingBar.append(progressLabel);
		loadingBarContainer.append(loadingBar, closeBntContainer);

		function appendCloseBtn(){
		 	const closeBnt = $('<button>')
			 	.text('close')
			 	.click(()=>loadingBarContainer.remove());
			closeBntContainer.empty().append(closeBnt);
		}

		function progress(doneProportion = 0) {
			doneProportion *= 100
      loadingBar.progressbar( "value", doneProportion );
    }

    let _total, _done, _status;
		
		return{
			start(){
				$('body').append(loadingBarContainer);
				loadingBar.progressbar({
		      value: false,
		      change: function() {
		        if(_status == 'working') progressLabel.text( `Emails sent: ${_done} of ${_total} (${Math.round(loadingBar.progressbar( "value" ))}%)` );
		        else{
		        	progressLabel.text(`process ${_status}`);
		        	appendCloseBtn();
		        }
		      },
		      complete: function() {
		        progressLabel.text( `Complete! Sent ${_done} emails` );
		      }
		    });
			},
			update({done, total, status}){
				_done = done
				_total = total;
				_status = status;
      	let _doneProportion = 0
      	if (_total>0) _doneProportion = _done / _total;
				progress(_doneProportion)
			}
		}
	}

}(Pard || {}));