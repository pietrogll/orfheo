'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.PrintTable = function(proposalType, form, displayer, typeTable) {
    var _form;
    if (proposalType == 'space') {
      var _spaceForm = $.extend(true, {}, Pard.Forms.SpaceCall);
      var _ambientForm = $.extend(true, {}, Pard.Forms.AmbientCall);
      if (form['ambient_info']) _ambientForm = $.extend(true, {}, form['ambient_info']);
      _form = $.extend(true, _spaceForm, form);
    }
    else _form = $.extend(true, {}, form);

    var _table = $('<table>').addClass('table-proposal stripe row-border ').attr({'cellspacing':"0"}).css({
      'margin': '0 auto',
      'width': '100%',
      'clear': 'both',
      'table-layout': 'fixed',
      'word-wrap':'break-word'
    });

    var _tbody = $('<tbody>');

    var _thead = $('<thead>');
    var _titleRow = $('<tr>');
    var _tfoot = $('<tfoot>');
    var _titleRowFoot = $('<tr>');
    // All non numeric field used by orfheo --> vector needed for ordering
    var _orfheoFields = {
      artist: ['profile_id','proposalNumber','proposal_type','selected','date','title', 'name','subcategory','other_categories','other','short_description','description','duration','availability','children','cache','phone','email','amend', 'comments'],
      space: ['profile_id','proposalNumber', 'proposal_type','selected','date','space_name', 'name', 'type', 'subcategory','other_categories','other','address', 'ambients_number', 'description','availability','phone','email','amend', 'comments']
    }
    //Fields that are not asked in forms and I want to be part of the table
    var _mandatoryFields = {
     artist: ['profile_id','proposalNumber', 'proposal_type','selected', 'date', 'name','phone', 'email', 'subcategory','amend', 'comments'],
     space: ['profile_id','proposalNumber', 'proposal_type','selected', 'date','name','ambients_number', 'phone','email', 'subcategory','amend', 'comments']
    }
    // The columns I want to see in table as default
    var _shownColumns = {
      artist: ['selected','name', 'title','short_description','duration','availability','phone','email'],
      space: ['selected','name', 'space_name', 'subcategory','address','availability', 'phone','email']
    }

    var _colPosition = 0;
    var _hiddenColumns = [];
    var _emailColumn;
    var _emailIndex = 0;
    var _subcategoryColumn, selectedColumn;
    var _subcategoryIndex = 0;
    var _tableFields = [];
    var proposalNumber = 0;
    var _checkboxColums = [];

    var _fieldPrinter = Pard.Widgets.InfoTab.printer(typeTable, displayer, form);

    var _notPrintableInputs = ['UploadPhotos', 'UploadPDF', 'LinkUploadPDF', 'NoneInput']

    var _printTitleAndFoot = function(field){

      _form[field] = _fieldPrinter[field] || _form[field];

      if ($.inArray(_form[field].input, _notPrintableInputs) < 0){
        var _label = _form[field]['label'];
        if (_label.length >20) _label = _label.substring(0, 19)+'...';
        var _colTitle = $('<th>').append(_label).addClass('column-call-manager-table');
        if(_form[field].input == 'SummableInputs'){
          var _sumBtn = $('<button>')
            .attr('type', 'button')
            .text(Pard.t.text('widget.summableInputs.btn_table'))
            .addClass('pard-btn')
            .css({
              'padding': '.2rem .5rem',
              'font-size': '12px'
            })
            .click(function(e){
              e.stopPropagation();
              var _sumPopup = Pard.Widgets.Popup();
              var t_popup = _form[field].label;
              if (t_popup.length > 20) t_popup = t_popup.substring(0,19)+'...'
              _sumPopup.setContent(t_popup, Pard.Widgets.SummableInputsTable(proposalType, typeTable, _form[field], field));
              // _sumPopup.setContentClass('alert-container-full');
              _sumPopup.open();
            });
          _colTitle.append(' ', '</br>',_sumBtn);  
        }
        if (_form[field].input == 'Text' || _form[field].input == 'Links') _colTitle.addClass('column-Inputtext');
        else _colTitle.addClass('column-'+_form[field]['input']);
        _titleRow.append(_colTitle);
        var _colFoot = $('<th>').addClass('column-call-manager-table').append(_label);
        if (_form[field].input == 'Text' || _form[field].input == 'Links') _colFoot.addClass('column-Inputtext');
        else _colFoot.addClass('column-'+_form[field]['input']);
        _titleRowFoot.append(_colFoot);
        _tableFields.push(field);
      }
    }

    var _childrenColumn;

    _orfheoFields[proposalType].forEach(function(field, index){
       
      if (_form[field] || $.inArray(field, _mandatoryFields[proposalType])>-1){
        if ($.inArray(field, _shownColumns[proposalType])<0) _hiddenColumns.push(_colPosition);
        if(form[field] && (form[field].input == 'CheckBox' || field == 'selected') ) _checkboxColums.push(_colPosition);
        if (field == 'email') _emailColumn = _colPosition;
        if (field == 'subcategory') _subcategoryColumn = _colPosition;
        if (field == 'children') _childrenColumn = _colPosition
        _colPosition += 1;
        _printTitleAndFoot(field);
      }
    });

    for (var field in _form){
      if ($.isNumeric(field) &&  $.inArray(_form[field].input, _notPrintableInputs) < 0){
        _hiddenColumns.push(_colPosition);
        if(form[field] && form[field].input == 'CheckBox') _checkboxColums.push(_colPosition);
        _colPosition += 1;
        _printTitleAndFoot(field);
      }
    }

    _table.append(_thead.append(_titleRow));
    _table.append(_tfoot.append(_titleRowFoot));

    _table.append(_tbody);

    var _proposalFieldTablePrinter = Pard.Widgets.ProposalFieldTablePrinter;

    var proposalRow = function(proposal, profile){

      proposalNumber += 1;
      var _proposal = $.extend(true, {}, proposal);
      if(profile){
        _proposal.name = profile.name;
        _proposal.phone = profile.phone;
        _proposal.email =  profile.email;
        _proposal.profile_id = profile.profile_id;
      }
      _proposal.proposal_type = proposalType;
      var _row = $('<tr>').attr('id', 'proposalRow-'+proposal.proposal_id);
      _orfheoFields[proposalType].forEach(function(field){
        if (_form[field] || $.inArray(field, _mandatoryFields[proposalType])>-1){
          var _info = '';
          if(_form[field].info) _info = _form[field].info(_proposal, proposalNumber);
          else _info = _proposal[field];
          var _col = $('<td>').addClass('column-call-manager-table');
          if (_form[field].input == 'Text' || _form[field].input == 'Links') _col.addClass('column-Inputtext');
          else _col.addClass('column-'+_form[field]['input']);

          _row.append(_col.append(_info));
        }
      });
      var dictionaryCheckBox = {
        false: Pard.t.text('dictionary.no').capitalize(),
        true: Pard.t.text('dictionary.yes').capitalize()
      }
      for (var field in _form){
        if ($.isNumeric(field)){
          if( $.inArray(_form[field].input, _notPrintableInputs) < 0){
            var _col = $('<td>').addClass('column-call-manager-table');
            if (_form[field].input == 'Text' || _form[field].input == 'Links') _col.addClass('column-Inputtext');
            else _col.addClass('column-'+_form[field]['input']);
            if (proposal[field]){
              if ($.inArray(form[field].input, Object.keys(_proposalFieldTablePrinter))>-1){
                _col.append(_proposalFieldTablePrinter[form[field].input](proposal, field, form))
              }
              else if (form[field].input == 'SummableInputs'){
                var _summableTxt = '';
                var _sInputs = form[field].args[0];
                for (var pos in proposal[field]){
                  var el =  proposal[field][pos]
                  for (var f in el){
                    if ($.inArray(_sInputs[f].input, Object.keys(_proposalFieldTablePrinter))>-1) _summableTxt += _proposalFieldTablePrinter[_sInputs[f].input](el, f, _sInputs)+ ' - '
                    else _summableTxt += el[f]+' - ';
                  }
                  _summableTxt = _summableTxt.slice(0, -2) +' // ';
                }
                _col.append(_summableTxt.slice(0, -4));

              }
              else _col.append(proposal[field]);
            }
          }

          _row.append(_col);
        }

      }

      return _row;
    }


    return {
      table: _table,
      addRow: function(proposal, profile){
        _tbody.prepend(proposalRow(proposal, profile))
      },
      proposalRow: proposalRow,
      hiddenColumns: _hiddenColumns,
      emailColumn: _emailColumn,
      subcategoryColumn: _subcategoryColumn,
      tableFields: _tableFields,
      type: proposalType,
      checkboxColums: _checkboxColums,
      childrenColumn: _childrenColumn,
      selectedColumn: _orfheoFields[proposalType].indexOf('selected')
    }
  }



  

  ns.Widgets.PrintTableAllProposal = function(displayer, typeTable){

    var _table = $('<table>').addClass('table-proposal stripe row-border ').attr({'cellspacing':"0"}).css({
      'margin': '0 auto',
      'width': '100%',
      'clear': 'both',
      'table-layout': 'fixed',
      'word-wrap':'break-word',
    });
    var _tbody = $('<tbody>');

    var _thead = $('<thead>');
    var _titleRow = $('<tr>');
    var _tfoot = $('<tfoot>');
    var _titleRowFoot = $('<tr>');

    var _orfheoFields = ['profile_id','hiddenType','proposalNumber','proposal_type','selected', 'date', 'titleAddress','name', 'subcategory', 'phone','email'];

    var _form = {}

    var _subcategoryColumn;
    var _emailColumn;
    var _tableFields = [];
    var proposalNumber = 0;
    var _listDisplayer = function(){};

    var _fieldPrinter = Pard.Widgets.InfoTab.printer(typeTable, displayer);


    _orfheoFields.forEach(function(field, index){
      if(field == 'subcategory') _subcategoryColumn = index; 
      if(field == 'email') _emailColumn = index;
      _form[field] = _fieldPrinter[field] || _form[field];
      var _label = _form[field]['label'];
      var _colTitle = $('<th>').append(_label).addClass('column-call-manager-table');
      if (_form[field].input == 'Text' || _form[field].input == 'Links') _colTitle.addClass('column-Inputtext');
      else _colTitle.addClass('column-'+_form[field]['input']);
      _titleRow.append(_colTitle);
      var _colFoot = $('<th>').addClass('column-call-manager-table').append(_label);
      if (_form[field].input == 'Text' || _form[field].input == 'Links') _colFoot.addClass('column-Inputtext');
      else _colFoot.addClass('column-'+_form[field]['input']);
      _titleRowFoot.append(_colFoot);
      _tableFields.push(field);
    });

    _table.append(_thead.append(_titleRow));
    _table.append(_tfoot.append(_titleRowFoot));
    _table.append(_tbody);

    var proposalRow = function(proposalType, proposal, profile){
      proposalNumber += 1;
      var _proposal = $.extend(true, {}, proposal);
      
      if (profile){
        _proposal.name =  profile.name;
        _proposal.phone = profile.phone;
        _proposal.email =  profile.email;
        _proposal.profile_id =  profile.profile_id;
      }

      _proposal.proposal_type = proposalType;
      
      var _row = $('<tr>');
      _row.attr('id', 'proposalRow-'+proposal.proposal_id);
      _orfheoFields.forEach(function(field){
        var _info = '';
        if(_form[field].info) _info = _form[field].info(_proposal, proposalNumber);
        else _info = _proposal[field];
        var _col = $('<td>').addClass('column-call-manager-table');
        if (_form[field].input == 'Text' || _form[field].input == 'Links') _col.addClass('column-Inputtext');
        else _col.addClass('column-'+_form[field]['input']);
        _row.append(_col);
        _col.append(_info);
      });
      return _row;
    }
    var _dataTable;
    return {
      table: _table,
      addRow: function(proposalType, proposal, profile){
        _tbody.prepend(proposalRow(proposalType, proposal, profile))
      },
      proposalRow: proposalRow,
      emailColumn: _emailColumn,
      subcategoryColumn: _subcategoryColumn,
      selectedColumn: _orfheoFields.indexOf('selected'),
      tableFields: _tableFields,
      type: typeTable,
      proposalNumber: function(){
        return proposalNumber
      },
      deleteProposal: function(){
        proposalNumber = proposalNumber - 1;
      }
    }
  }

}(Pard || {}));
