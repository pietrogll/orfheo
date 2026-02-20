'use strict';

(function(ns){
     
ns.Widgets = ns.Widgets || {};

	ns.Widgets.MainAdminPage = function(){

		let loading_bar;

		Pard.Bus.on('updateDeliveryStatus', function(data){
			if (!loading_bar || !data){
				loading_bar = Pard.Widgets.EmailsLoadingBar()
				loading_bar.start()
			}
			if (data) loading_bar.update(data)
    });


		var _main = $('<main>').addClass('mainServicesPage');
		var _section = $('<section>');
		var _openCallMailButton = Pard.Widgets.Button('Open call mail', function(){Pard.Widgets.OpenCallMail()});
		var _openCallMail = $('<div>').append(_openCallMailButton.render());
		var _textMailbutton = Pard.Widgets.Button('Text mail', function(){Pard.Widgets.TextMail()});
		var _textMail = $('<div>').append(_textMailbutton.render());
		var _createEventbutton = Pard.Widgets.Button('Create event', function(){Pard.Widgets.AdminCreateEvent()});
		var _createEvent = $('<div>').append(_createEventbutton.render());
		var _createProgrambutton = Pard.Widgets.Button('Create Program', function(){Pard.Widgets.CreateProgram()});
		var _createProgram = $('<div>').append(_createProgrambutton.render());
		var _createCallbutton = Pard.Widgets.Button('Create Call', function(){Pard.Widgets.CreateCall()});
		var _createCall = $('<div>').append(_createCallbutton.render());
		var _deleteUserbutton = Pard.Widgets.Button('Delete User', function(){Pard.Widgets.AdminDeleteUser()});
		var _deleteUser = $('<div>').append(_deleteUserbutton.render());

		_main.append(_section.append(
				_deleteUser,
				_openCallMail,
				_textMail,
				_createEvent,
				_createProgram,
				_createCall
			)
		);

		return _main;
	}


}(Pard || {}));