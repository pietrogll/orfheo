'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};

  ns.Widgets.FormBuilder = function(call){

		var _popup = Pard.Widgets.Popup({closeOnEsc:false}, true);
		
		var _spinner = new Spinner();

		var _formType = ['artist', 'space']

		var _container = $('<div>').addClass('container-form-builder');

		var _aside = $('<aside>').addClass('aside-form-builder');
		var _btnContainer = $('<div>');
		var _createdFormsContainer = $('<div>');
		_aside.append(_btnContainer, _createdFormsContainer);

		var _section = $('<section>').addClass('section-form-builder');
		var _formCreatorContainer = $('<div>');
		_section.append(
			_formCreatorContainer
		);

		var _createFormBtn = Pard.Widgets.Button(
			'create new form', 
			function(){
				_formCreatorContainer.empty().append(Pard.Widgets.FormCreator(call).render())
		});

		var _importFormsBtn = Pard.Widgets.Button(
			'import forms', 
			function(){
				var _importer = $('<div>');
				var _eSelector = Pard.Widgets.EventsSelector();
				var _okBtn = Pard.Widgets.Button(
					'import',
					function(){
						var _eSelected = _eSelector.getVal();
						if (!_eSelected) return ;						 
						_spinner.spin();
						$('body').append(_spinner.el); 
						for (var t in _typeFormContainer) _typeFormContainer[t]['imported'].empty();
						if (_eSelected){
							Pard.Backend.getFormsByCallId(
								_eSelected.call_id, 
								function(data){
									if (data['status'] == 'success'){
										var _importedForms = data.forms.map(function(form){
											form['call_id'] = call.id;
											delete form['user_id'];
											delete form['id']
											return form;
										});
									_importedForms
							 		  	.sort(function(form1, form2){
							 		  		var l1 = form1['texts'][Object.keys(form1['texts'])[0]]['label']
							 		  		var l2 = form2['texts'][Object.keys(form2['texts'])[0]]['label'] 
							 		  		if (l1 > l2) return 1
							 		  	})
							 		  	.forEach(function(form){
							 		  		_appendFormBtn(form, 'imported');
							 		  	})
							 		  var _saveForm  = function(i){
							 		  	var _submittedForm = _importedForms[i];
							 		  	if (_submittedForm){	
								 		  	Pard.Backend.createForm(
												 	_submittedForm, 
												 	function(data){
												 		if (data.status == 'success'){
												 			var form = data.form;
												 			_appendFormBtn(form, 'existing');
												 			// _createdFormsBtn[form_id].remove();
	  													// delete _createdFormsBtn[form_id];
															_saveForm(i+1);
														}
														else{
															console.log('error')
															console.log(data)
														}
													}
												)
								 		  }
								 		  else {
								 		  	_spinner.stop();
								 		  }
							 		  }
							 		  var _saveAllBtn = Pard.Widgets.Button(
							 		  	'save_all_imported', 
							 		  	function(){
							 		  		// var i = 0
							 		  		for (var type in _typeFormContainer) _typeFormContainer[type]['imported'].empty();
							 		  		_spinner.spin();
												$('body').append(_spinner.el); 
							 		  		_saveForm(0);
							 		  	}
							 		  )
							 		  _saveAllBtnContainer.empty().append(_saveAllBtn.render());
							 		  _spinner.stop();
							 		}
							 		else{
							 			console.log('error');
							 			console.log(data)
							 			_spinner.stop();
							 		}					
								}
							)
						}
					}
				)
				var _saveAllBtnContainer = $('<div>');
				_formCreatorContainer.empty().append(
					_eSelector.render(), 
					_okBtn.render(), 
					_saveAllBtnContainer
				);
		});

		_btnContainer.append(
			_importFormsBtn.render().css('margin-bottom','1.5rem'), 
			_createFormBtn.render()
		);

		var _createdFormsBtn = {};
 		var _typeFormContainer = {};

		var _fbtn = function(form){
			var _lang = Object.keys(form['texts'])[0];
  		var _label = Pard.Widgets.CutString(form['texts'][_lang].label, 33);
			var _btn =  $('<button>')
  			.attr('type','button')
  			.text(_label)
  			.click(function(){
  				var _formCreator = Pard.Widgets.FormCreator(call, form);
  				_formCreatorContainer.empty();
  				_formCreatorContainer.append(_formCreator.render());
  				$('.ftbn_selected').removeClass('ftbn_selected');
  				$(this).addClass('ftbn_selected');
  			})
  			.addClass('createdFormBtn');
  		return _btn;
 		}

 		var _appendFormBtn = function(form, origin){
 			var type = form.type;
 			if (!_typeFormContainer[type]['container'].html()){
 				_typeFormContainer[type]['container']
		 			.append(
		 				$('<h6>').text(form.type),
		 				_typeFormContainer[type]['imported'],
		 				_typeFormContainer[type]['existing']
		 			)
 					.addClass('typeFormContainer-formBuilder');
 			}
 			var btn_class = origin+'_form_btn';
 			var _formbtn = _fbtn(form).addClass(btn_class);
  		if(form.id) _createdFormsBtn[form.id] = _formbtn;
  		else _formbtn.attr('disabled',true);
  		_typeFormContainer[form.type][origin].append(
  			_formbtn
  		)
 		}

 		_formType.forEach(function(type){
 			_typeFormContainer[type] = {
 				container: $('<div>'),
 				existing: $('<div>'),
 				imported: $('<div>') 
 			}
  		_createdFormsContainer.append(_typeFormContainer[type]['container']);
 		})

 		_spinner.spin();
		$('body').append(_spinner.el); 

		Pard.Backend.getFormsByCallId(call.id, function(data){
			if (data.status == 'success'){
	 		  var forms = data.forms;
	 		  forms
	 		  	.sort(function(form1, form2){
	 		  		var l1 = form1['texts'][Object.keys(form1['texts'])[0]]['label']
	 		  		var l2 = form2['texts'][Object.keys(form2['texts'])[0]]['label'] 
	 		  		if (l1 > l2) return 1
	 		  		else return -1
	 		  	})
	 		  	.forEach(function(form){
	 		  		_appendFormBtn(form, 'existing');
	 		  	})
	 		  _spinner.stop();
	 		 }
	 		 else{
	 		 	console.log('error');
	 		 	console.log(data);
	 		  _spinner.stop();
	 		 }

		})

		_container.append(
			_aside,
			_section
		)

		_popup.setContent('<div style="padding: 1rem">Form Manager</div>', _container);
		_popup.setContentClass('popup-container-full-large');
	  _popup.open();


	  Pard.Bus.on('createForm', function(form){
	  	_formCreatorContainer.empty();
	  	_appendFormBtn(form, 'existing');
	  })

	  Pard.Bus.on('modifyForm', function(form){
	  	_formCreatorContainer.empty();
	  	var fbtn = _fbtn(form);
	  	_createdFormsBtn[form.id].replaceWith(fbtn);
	  	_createdFormsBtn[form.id] = fbtn;
	  })

		
	  Pard.Bus.on('deleteForm', function(form_id){
	  	_formCreatorContainer.empty();
	  	_createdFormsBtn[form_id].remove();
	  	delete _createdFormsBtn[form_id];
	  })


	}




	ns.Widgets.FormCreator = function(call, savedForm){
		// ====================
		// DEFINITIONS

		var spinner =  new Spinner();

		var _content = $('<div>');

		var _textsContent = $('<div>');
		var _blocksContent = $('<div>');
		var _language = $('<div>');

		var _textsInputs = $('<div>');
		var _blocksInputs = $('<div>');
		
		var type_form, _blocksFormWidget, callForm_II, _defaultLang, _defaultForm, _newTranslationFormContainer;


		var _formInputsContainer = $('<div>');
		var _formInputsContainers = {};
		var _translatorsObj = {};
		var _langsForms = {};
		var _translationBtnsObj = {};
		
	  var _invalidInput = $('<div>').addClass('not-filled-text');

		var _upperBtnContent = $('<div>').addClass('upperBtnContent-formBuilder');
		var _langButtons = $('<div>').addClass('langButtons-formBuilder');;
		var _widgetsButtons = $('<div>').addClass('upperBtnContent-formBuilder');
		var _translationBtnsContainer = $('<div>').addClass('translationBtnsContainer-formBuilder');
		var _addNewTranslationBtnContainer = $('<div>').css('display','inline-block');

		_upperBtnContent.append(
			_langButtons
		);

		// ====================
		// BUTTONS HEADER --> _upperBtnContent

		var _defaultFormBtn = $('<button>')
			.attr('type','button')
			.text('default_form')
			.addClass('abutton btn_selected')
			.click(function(){
				$('.btn_selected').removeClass('btn_selected');
				$(this).addClass('btn_selected');
				$('.visible_form').removeClass('visible_form').hide();
				_formInputsContainers[_defaultLang].addClass('visible_form').show();
				if (_newTranslationFormContainer) _newTranslationFormContainer.remove();
			})

		if (savedForm){
			var _deleteBnt = $('<button>')
				.attr('type','button')
				.text('delete')
				.addClass('abutton')
				.click(function(){
					Pard.Widgets.ConfirmPopup(
						'', 
						function(){
							Pard.Backend.deleteForm(
							savedForm.id, 
							function(data){
								if(data.status == 'success'){
									Pard.Bus.trigger('deleteForm', savedForm.id);
								}
								else{
									console.log('error')
									console.log(data)
								}
							})
						}
					)
				})

			

			if (!((Pard.Options.availableLangs().length == Object.keys(savedForm['texts']).length) && Pard.Options.availableLangs().every(function(element, index) {return element === Object.keys(savedForm['texts'])[index];}))){

				var _addNewTranslationBtn = $('<button>')
					.attr('type','button')
					.text('add_translation')
					.addClass('abutton')
					.click(function(){
						$('.btn_selected').removeClass('btn_selected');
						$(this).addClass('btn_selected');
						$('.visible_form').removeClass('visible_form').hide();
						_newTranslationFormContainer = $('<div>');
						var _btnTcont = $('<div>').addClass('lowerBtnContent-formBuilder');
	   				var _tFcontent = $('<div>');
						var _saveTranslationBnt = $('<button>')
							.attr('type','button')
							.text('save_translation')
							.addClass('abutton')
							.click(function(){
								var _translation = _translator.getVal();
								if (_translation){
									_newTranslationFormContainer.remove();
									_appendFormLangBtn(_translation, _translation.lang);
									$('.btn_selected').removeClass('btn_selected');
								} 
							});
						_btnTcont.append(
							_saveTranslationBnt
						);
						_defaultForm['blocks'] = _blocksFormWidget.getVal()['blocks'];
						_defaultForm['widgets'] = _textsFormWidget.getVal()['widgets'];
						var _translator = Pard.Widgets.FormTranslator(_defaultForm);
						_translator.setAvailableLanguage(Object.keys(_langsForms));
						_tFcontent.append(_translator.render());

						_formInputsContainer.append(
							_newTranslationFormContainer.append(_tFcontent, _btnTcont)
						);
					})

				_addNewTranslationBtnContainer.append(_addNewTranslationBtn);
			}
			_widgetsButtons.append(_deleteBnt);
		}



		var _seeFormBtn = function(lang){
			return $('<button>')
			.attr('type','button')
			.text('see_form')
			.addClass('abutton')
			.click(function(){
				var _builtForm = _getSubmittedForm();
				var selectedLang = lang || _langSelector.getVal();
				_builtForm.texts = _builtForm['texts'][selectedLang];
				_builtForm.blocks = _builtForm['blocks'][selectedLang];
				_builtForm.widgets = _builtForm['widgets'][selectedLang];
				var popup = Pard.Widgets.Popup();
				popup.setContent(_builtForm.texts.label, Pard.Widgets.CallForm(_builtForm).render());
				popup.open();
			})
		}

		var _orderFieldsBtn = $('<button>')
			.attr('type','button')
			.text('order_fields')
			.addClass('abutton')
			.click(function(){
				var _builtForm = _getSubmittedForm();
				var _blocksFields = _builtForm['blocks'][_langSelector.getVal()];
				var popup = Pard.Widgets.Popup();
				var _orderPopupContent = $('<div>');
				var _notOrderableFields = [];
				var _blocksDictionary = Object.keys(_blocksFields).reduce(function(dictionaryObj, k){
					dictionaryObj[k] = k +': '+ _blocksFields[k].label;
					if (!$.isNumeric(k))  _notOrderableFields.push(k);
					return dictionaryObj;
				}, {})
				var _orderableList = Pard.Widgets.SortableList(_blocksDictionary);
				_orderableList.setVal(Object.keys(_blocksDictionary), _notOrderableFields);
				_orderableList.disable();
				var _orderBtnContainer = $('<div>');
				var _orderBtn = $('<button>')
					.attr('type','button')
					.text('OK')
					.click(function(){
						var newOrder = _orderableList.getVal();
						_blocksFormWidget = Pard.Widgets.FormPrinter(callForm_II);
						
						var _orderedBlocksFields = $.extend(true, {}, _blocksFields); 
						newOrder.forEach(function(field, index){
							if ($.isNumeric(field)) _orderedBlocksFields[index] = _blocksFields[field];
							else _orderedBlocksFields[field] = _blocksFields[field];
						});
						_defaultForm['blocks'] = _orderedBlocksFields;
						_blocksFormWidget.setVal({blocks: _orderedBlocksFields});
						
						_translationBtnsContainer.empty();
						$.each(_langsForms, function(lang, langForm){
							if (lang == _langSelector.getVal()) return;
							var _orderedBlocksFields = {}; 
							newOrder.forEach(function(field, index){
								if ($.isNumeric(field)) _orderedBlocksFields[index] = langForm['blocks'][field];
								else _orderedBlocksFields[field] = langForm['blocks'][field];
							});
							langForm['blocks'] = _orderedBlocksFields;
							_appendFormLangBtn(langForm, lang);
						})

						_blocksInputs.empty().append(_blocksFormWidget.render());
						popup.close();
					})
				_orderPopupContent.append(
					_orderableList.render().addClass('blockFieldsOrderableList-formBuilder'), 
					_orderBtnContainer.append(_orderBtn)
				);
				popup.setContent('', _orderPopupContent);
				popup.open();
			})

			_langButtons.append(
				_defaultFormBtn, 
				_translationBtnsContainer, 
				_addNewTranslationBtnContainer
			)

		// ====================
		// WIDGETS FOR DEFAULT FORM 


		var _langSelector = Pard.Widgets.ArraySelector(Pard.Options.availableLangs().map(function(lang){return Pard.t.text('footer.languages')[lang]}), Pard.Options.availableLangs());
		_language.append(_langSelector.render());

		var _typeSelector = Pard.Widgets.ArraySelector(
			['artist', 'space'], 
			['artist', 'space'], 
			function(form){
				type_form = _typeSelector.getVal();
				callForm_II = {
					blocks:{
			      "type" : "mandatory",
			      "label" : 'Blocks',
			      "input" : "FormFieldCreatorInputs",
			      "args" : [type_form],
			      "helptext" : ""
			    }
				}
				_blocksFormWidget = Pard.Widgets.FormPrinter(callForm_II);
				if (form) {
					_blocksFormWidget.setVal(form);
					_typeSelector.disable();	
				}
				_blocksInputs.empty().append(_blocksFormWidget.render());
				_widgetsButtons.append(
					_seeFormBtn(), 
					_orderFieldsBtn
				);
			},
			'select form type'
		);
		var _type = $('<div>')
			.append(_typeSelector.render());

		var submitButton = $('<button>').addClass('submit-button').attr({type: 'button'}).html('OK');

		var _submitBtnContainer = $('<div>')
			.addClass('submit-btn-container')
			.append(submitButton);

	
		var _textsFormWidget =  Pard.Widgets.FormPrinter(Pard.Forms.CallForm_I);


		// ====================
		// PRINT FORMS

		var _translationGetter =  Pard.Widgets.TranslationFormBuilderGetter;
 

		var _printTranslatedFormContainer = function(translatedForm, lang, defaultForm){
			if(_formInputsContainers[lang]) _formInputsContainers[lang].remove();
			var _translatedFormContainer = $('<div>').hide();
			
			var _tFcontent = $('<div>');
			var _btnTcont = $('<div>').addClass('upperBtnContent-formBuilder');

			if (!defaultForm){
			 	_defaultForm['blocks'] = _blocksFormWidget.getVal()['blocks'];
			}

			var _translator = Pard.Widgets.FormTranslator(_defaultForm, _translationGetter);
			_translator.setVal(translatedForm, lang);
			_tFcontent.append(_translator.render());

			_formInputsContainers[lang] = _translatedFormContainer;
			_translatorsObj[lang] = _translator;

			var _deleteTranslationBtn = $('<button>')
				.attr('type','button')
				.text('delete_translation')
				.addClass('abutton')
				.click(function(){
					_formInputsContainers[lang].remove();
					_translationBtnsObj[lang].remove();
					delete _formInputsContainers[lang];
					delete _translatorsObj[lang];
					delete _translationBtnsObj[lang];

				});

			var _makeDefaultBtn = function(lang){
				return $('<button>')
				.attr('type','button')
				.text('make_default')
				.addClass('abutton')
				.click(function(){
					submitButton.trigger('click', [lang]);	
				})
			}

			_btnTcont.append(
				_deleteTranslationBtn, 
				_makeDefaultBtn(lang)
			);

			_formInputsContainer.append(
				_translatedFormContainer.append(
					_btnTcont,
					_tFcontent
				)
			);

		}

		var _appendFormLangBtn = function(_form, lang){
			_printTranslatedFormContainer(_form, lang, _defaultForm);
			var _langFormBtn = $('<button>')
				.attr('type','button')
				.text(lang+'_form')
				.addClass('abutton')
				.click(function(){
					if (_newTranslationFormContainer) _newTranslationFormContainer.remove()
					_printTranslatedFormContainer(_form, lang);
					$('.btn_selected').removeClass('btn_selected');
					$(this).addClass('btn_selected');
					$('.visible_form').removeClass('visible_form').hide();
					_formInputsContainers[lang].addClass('visible_form').show();

				})
			_translationBtnsObj[lang] = _langFormBtn;
			_translationBtnsContainer.append(_langFormBtn);
		}

		var _printAndFillForms = function(form){
			_formInputsContainers = {};
			_langsForms = {};
			_translatorsObj = {};
			_translationBtnsContainer.empty();
			var _languages = Object.keys(form.texts);
			_languages.forEach(function(lang, index){
				var _form = $.extend(true, {}, form);
				_form.texts = _form.texts[lang];
				_form.blocks = _form.blocks[lang];
				if (_form.widgets) _form.widgets = _form.widgets[lang];
				_langsForms[lang] = _form;
				if (index == 0){
					_defaultLang = lang;
					_defaultForm = _form;
					_langSelector.setVal(_defaultLang);
					if (_languages.length > 1) _langSelector.disable();
					_textsFormWidget.setVal(_form);
					_typeSelector.setVal(_form.type);
					_typeSelector.triggerChange(_form);
					_formInputsContainers[_defaultLang] = $('<div>')
						.append(
							_widgetsButtons, 
							_language, 
							_textsContent, 
							_blocksContent
							)
						.addClass('visible_form'); 
				}
				else{
					_appendFormLangBtn(_form, lang);
				}
			});
		}

		if (savedForm) _printAndFillForms(savedForm);
		else _formInputsContainers['new_lang'] = $('<div>').append(
				_widgetsButtons, 
				_language, 
				_textsContent, 
				_blocksContent
			).addClass('visible_form'); 



		// ====================
		// SUBMIT



		var _getSubmittedForm = function(
			){
			var _defaultLang = _langSelector.getVal();
      var _submittedForm = {};
			var _defaultTextsFormValues = _textsFormWidget.getVal();
      var _defaultBlocksValues = _blocksFormWidget.getVal();
      var _defaultSubmittedForm = $.extend(true, _defaultBlocksValues, _defaultTextsFormValues)
			_submittedForm['call_id'] = call.id;
			_submittedForm['type'] = _typeSelector.getVal();
			_submittedForm['blocks'] = {};
			_submittedForm['blocks'][_defaultLang] = _defaultBlocksValues['blocks'];
			_submittedForm['texts'] = {};
			_submittedForm['widgets'] = {};
			for (var k in _defaultTextsFormValues){
				if (k == 'texts' || k == 'widgets'){ 
					if (!$.isEmptyObject(_defaultTextsFormValues[k])) _submittedForm[k][_defaultLang] = _defaultTextsFormValues[k];
				}
				else _submittedForm[k] = _defaultTextsFormValues[k];
			}

			for (var lang in _translatorsObj){
				var _translation = _translatorsObj[lang].getVal();
				_submittedForm['texts'][lang] = _translation.texts;
				var _translatedVal = _translationGetter(_translation, _defaultSubmittedForm);
				if (!$.isEmptyObject(_translatedVal.translatedWidgets))_submittedForm['widgets'][lang] = _translatedVal.translatedWidgets;
				_submittedForm['blocks'][lang] = _translatedVal.translatedBlocks;
			}
			return _submittedForm;
		}

		submitButton.on('click', function(e, new_default_lang){
      spinner.spin();
      $('body').append(spinner.el);
      submitButton.attr('disabled',true);
      if(_textsFormWidget.filled() == true || _blocksFormWidget.filled() == true){
	      var _submittedForm = _getSubmittedForm();
	      if(new_default_lang){ 
	      	var reorderedTexts = {};
	      	reorderedTexts[new_default_lang] =  _submittedForm['texts'][new_default_lang];
	      	var reorderedBlocks = {};
	      	reorderedBlocks[new_default_lang] = _submittedForm['blocks'][new_default_lang];
	      	Object.keys(_submittedForm['texts']).forEach(function(lang){
	      		if (lang != new_default_lang){ 
	      			reorderedTexts[lang] = _submittedForm['texts'][lang];
	      			reorderedBlocks[lang] = _submittedForm['blocks'][lang];
	      		}
	      	})
	      	_submittedForm['blocks'] = reorderedBlocks;
	      	_submittedForm['texts'] = reorderedTexts;
	      };

								
				if (savedForm){
					_submittedForm['id'] = savedForm.id;
					Pard.Backend.modifyForm(
						_submittedForm, 
						function(data){
							if (data.status == 'success'){
								Pard.Bus.trigger('modifyForm', data.form);
							}
							else{
								console.log('error')
								console.log(data)
							}
						}
					)
				}
				else{
					Pard.Backend.createForm(
					 	_submittedForm, 
					 	function(data){
					 		if (data.status == 'success'){
								Pard.Bus.trigger('createForm', data.form);
							}
							else{
								console.log('error')
								console.log(data)
							}
						}
					)
				}

				spinner.stop();
      }
      else{
	      _invalidInput.text(Pard.t.text('error.incomplete'));
        spinner.stop();
        submitButton.attr('disabled',false);
      }
    });

    // ====================
		// APPEND TO CONTENT

    _textsInputs.append(_textsFormWidget.render());
		_textsContent.append(
			_textsInputs
		);

		_blocksContent.append(
			_type,
			_blocksInputs
		)

		for(var lang in _formInputsContainers){
			_formInputsContainer.append(_formInputsContainers[lang]);
		}

		_content.append(
			_upperBtnContent, 
			_formInputsContainer, 
			_invalidInput, 
			_submitBtnContainer
		)

		return {
			render: function(){
				return _content;
			}
		}			

	}

	ns.Widgets.TranslationFormBuilderGetter = function(translatedForm, defaultForm){
		var _translatedBlocks = {};
			var _untranslatableArgsFields = ['children', 'availability', 'category', 'format'];
			var _uploadTypeInputs = ['UploadPhotos', 'UploadPDF'];
			var _selectorTypeInputs = ['MultipleSelector','Duration', 'Selector', 'SummableInputs', 'SelectorOther'] 
			Object.keys(defaultForm['blocks']).forEach(function(k){
				_translatedBlocks[k] = translatedForm['blocks'][k] || $.extend(true, {},defaultForm['blocks'][k]);
				var _defaultInput = defaultForm['blocks'][k]['input'];
				var _defaultArgs = defaultForm['blocks'][k]['args'] || [];
				if (defaultForm['blocks'][k]['type']) _translatedBlocks[k]['type'] = defaultForm['blocks'][k]['type']
				if (_translatedBlocks[k]['input'] != _defaultInput || $.inArray(k, _untranslatableArgsFields)>-1 || $.inArray(_defaultInput, _uploadTypeInputs)>-1) {
					_translatedBlocks[k]['input'] = _defaultInput;
					_translatedBlocks[k]['args'] = _defaultArgs;
				}
			  else if(k=='subcategory' || $.inArray(_defaultInput, _selectorTypeInputs)>-1){
			  	if (_defaultArgs[0]){
			  		_translatedBlocks[k]['args'][0] = _translatedBlocks[k]['args'][0] || {};
			  		var _translatedArgs = $.extend(true, {},_translatedBlocks[k]['args'][0]);
			  		_translatedBlocks[k]['args'][0] = {};
			  		for (var key in _defaultArgs[0]){
				  		_translatedBlocks[k]['args'][0][key] = _translatedArgs[key] || _defaultArgs[0][key];
				  	}
			  	}
			  	else{
			  		_translatedBlocks[k]['args'][0] = '';
			  	}
				}
			});
			var _translatedWidgets = {};
			for (var k in defaultForm['widgets']){
				_translatedWidgets[k] = translatedForm['widgets'][k] || defaultForm['widgets'][k];
			}
			return {
				translatedBlocks: _translatedBlocks,
				translatedWidgets: _translatedWidgets
			}
	}

	ns.Widgets.FormTranslator = function(form, translationGetter){

		var _createdWidget = $('<div>');

		var _langSelectorContainer = $('<div>');

		var _langSelector = Pard.Widgets.ArraySelector(
			Pard.Options.availableLangs().map(function(lang){return Pard.t.text('footer.languages')[lang]}), 
			Pard.Options.availableLangs(),
			'',
			'select language'
		);

		var callForm_I = {
			texts: Pard.Forms.CallForm_I.texts,
			widgets: Pard.Forms.CallForm_I.widgets
		}
		var _textsFormWidget = Pard.Widgets.FormPrinter(callForm_I);
		var callForm_II = {
			blocks:{
	      "type" : "mandatory",
	      "label" : 'Blocks',
	      "input" : "FormFieldCreatorInputs",
	      "args" : [form.type],
	      "helptext" : ""
	    }
	  }
		var _blocksFormWidget = Pard.Widgets.FormPrinter(callForm_II);

		_textsFormWidget.setVal(form);
		_blocksFormWidget.setVal(form);

		var activateTranslationSetting = function(){
			$.each(_blocksFormWidget.getForm(), function(field, formInput){
				formInput.input.activateTranslationSetting();
			})
			_textsFormWidget.getForm()['widgets'].input.activateTranslationSetting();
		};

		activateTranslationSetting();

		_createdWidget.append(
			_langSelectorContainer.append(_langSelector.render()),
			_textsFormWidget.render(),
			_blocksFormWidget.render()
		)

		var _filled = function(){
			return _langSelector.getVal() && _textsFormWidget.filled() && _blocksFormWidget.filled();
		}

		
		return{
			render: function(callback){
				if (callback) callback();
				return _createdWidget;
			},
			setAvailableLanguage: function(taken_languages){
				_langSelectorContainer.empty();
				var _availableLanguages = Pard.Options.availableLangs().filter(function(lang){
					return $.inArray(lang, taken_languages) < 0;
				});
				_langSelector = Pard.Widgets.ArraySelector(
					_availableLanguages.map(function(lang){return Pard.t.text('footer.languages')[lang]}), 
					_availableLanguages,
					'',
					'select language'
				);
				_langSelectorContainer.append(_langSelector.render());
			},
			getVal:function(){
				var _lang = _langSelector.getVal();
				if (_filled()) return {
					lang: _langSelector.getVal(),
					texts: _textsFormWidget.getVal().texts,
					blocks: _blocksFormWidget.getVal().blocks,
					widgets: _textsFormWidget.getVal().widgets
				}
				else return false;
			},
			setVal: function(translatedForm, lang){

				var _translatedVal = translationGetter(translatedForm, form);
				form['widgets'] = _translatedVal.translatedWidgets;
				form['blocks'] = _translatedVal.translatedBlocks;
				form['texts'] = translatedForm['texts'];
				_langSelector.setVal(lang);
				_textsFormWidget.setVal(form);
				_blocksFormWidget.setVal(form);
				activateTranslationSetting();
				_langSelector.disable();
			}		
		}
	}




}(Pard || {}));