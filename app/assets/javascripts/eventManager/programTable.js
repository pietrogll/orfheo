'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};


  ns.Widgets.ProgramTable = function(infoProgram, the_event){

    var _createdWidget = $('<div>').attr('id','container_programTable');
    var _table = $('<table>').addClass('table-program stripe row-border ').attr({'cellspacing':"0"}).css({
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

    //REMEMBER children ---> publico del espectacúlo

    var _columns = [
      'cronoOrder',
      'date',
      'time',
      'participant_name',
      'participant_email',
      'participant_phone',
      'participant_subcategory',
      'participant_other_categories',
      'participant_other',
      'title',
      'short_description',
      'order',
      'host_name',
      'host_email',
      'host_phone',
      'host_subcategory',
      'host_other_categories',
      'host_other',
      'children',
      'price',
      'needs',
      'comments',
      'confirmed'
    ];
    var _shownColumns = ['date','time','participant_name','participant_subcategory','title','host_name', 'host_subcategory'];
    var _hiddenColumns = [];
    var _outerTableContainer = $('<div>').css('margin-top','1.85rem');
    var _tableBox = $('<div>').addClass('table-box-call-manager-page generalProgramTable');

    _table.append(_thead.append(_titleRow));
    _table.append(_tfoot.append(_titleRowFoot));
    _table.append(_tbody);

    _columns.forEach(function(field, index){
      if ($.inArray(field, _shownColumns) == -1) _hiddenColumns.push(index);
      var _titleCol = $('<th>').addClass('column-call-manager-table column-'+field);
      var _footCol = $('<th>') .addClass('column-call-manager-table column-'+field);
      _titleCol.text(infoProgram[field].label);
      _footCol.text(infoProgram[field].label);
      _titleRow.append(_titleCol);     
      _titleRowFoot.append(_footCol);
    });

    var _proposalFields = ['title', 'short_description', 'children'];

    var showRow = function(show){
      return Pard.Widgets.ShowRow(show, _columns, infoProgram, the_event)
    }
    
    _outerTableContainer.append(_tableBox.append(_table)).css('position','relative');
    _createdWidget.append(_outerTableContainer);

    var _colSelectors = {};

    var _loadSelector = function (colSelector, col) {
      var _colCategry = colSelector.column;
      var _ival = colSelector.select.val();
      colSelector.select = $('<select>').append($('<option>').attr('value','').text(''));
      var _options = [];
      $(_colCategry.header()).empty().text(infoProgram[col].label);
      if (_colCategry.data().unique().length>1){
        var _selectContainer = $('<div>').addClass('select-container-datatableColumn');
        colSelector.select.appendTo(_selectContainer.appendTo($(_colCategry.header())))
          .on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(colSelector.select.val());
            _colCategry.search( val ? '^'+val+'$' : '', true, false ).draw();
          });
        _colCategry.data().unique().each( function ( d, j ) {
            colSelector.select.append( '<option value="'+d+'">'+d+'</option>' );
            _options.push(d);
            if (d == _ival) colSelector.select.val(d);
        } );
        colSelector.select.click(function(e){
          e.stopPropagation();
        });
      }
      colSelector.options = _options;
      colSelector.select.trigger('change');
    }

    var _reloadSelectors = function(){
      Object.keys(_colSelectors).forEach(function(col){
        var _columnData = [];
        _colSelectors[col].column.data().unique().each(function(value){
            typeof value === 'string' ? _columnData.push(value) : false
        });
        if (_columnData.sort().toString() != _colSelectors[col].options.sort().toString()){
          _loadSelector(_colSelectors[col], col);
        }
      })
    }


    //============= FILL THE TABLE ==========

    for (var id in the_event.program){
      _tbody.append(showRow(the_event.program[id].show))
    }

    //=======================================


    var _filtersWidgets = function(colTosearch) {
      var _showCheckbox = $('<input>').attr({ type: 'checkbox', 'value': true})
        .on('change', function(){
          var val = '';
          if (_permanentCheckbox.is(":checked")) _permanentCheckbox.prop("checked", false);
          if(_showCheckbox.is(":checked")) val = 'false';
         colTosearch.search(val).draw(); 
        });
      var _labelShow = $('<label>').html(Pard.t.text('manager.program.punctuals')).css({'display':'inline', 'cursor':'pointer'})
        .on('click', function(){
          _showCheckbox.prop("checked", !_showCheckbox.prop("checked"));
          _showCheckbox.trigger('change');
        });
      var _permanentCheckbox = $('<input>').attr({ type: 'checkbox', 'value': true})
        .on('change', function(){
          var val = '';
          if(_showCheckbox.is(":checked")) _showCheckbox.prop("checked", false);
          if(_permanentCheckbox.is(':checked')) val = 'true';
          colTosearch.search(val).draw();
        });
      var _labelPermanent = $('<label>').html(Pard.t.text('manager.program.permanents')).css({'display':'inline', 'cursor':'pointer'})
        .on('click', function(){
          _permanentCheckbox.prop("checked", !_permanentCheckbox.prop("checked"));
          _permanentCheckbox.trigger('change');
        });
      var _filtersContainer = $('<div>').append(
        $('<span>').append(_showCheckbox, _labelShow), 
        $('<span>').append(_permanentCheckbox, _labelPermanent))
        .addClass('permanetFilters-call-page');
      _outerTableContainer.prepend($('<div>').append(_filtersContainer).css({'position':'relative', 'margin-left':'0.5rem'}));
    }

    var _dataTable = _table.DataTable({
      "language":{
        buttons: {
            copyTitle: Pard.t.text('manager.copy.table'),
            copyKeys: Pard.t.text('manager.copy.keys'),
            copySuccess: {
                _: Pard.t.text('manager.copy.success'),
                1: Pard.t.text('manager.copy.success1')
            }
        },
        "lengthMenu": Pard.t.text('manager.copy.results'),
        "zeroRecords": Pard.t.text('manager.zeroRecords'),
        "info": "",
        "infoEmpty": Pard.t.text('manager.infoEmpty'),
        "infoFiltered": "(filtered from _MAX_ total records)",
        "search": "_INPUT_",
        "searchPlaceholder": Pard.t.text('dictionary.search').capitalize(),
        "paginate": {
          "first": Pard.t.text('dictionary.first').capitalize(),
          "last": Pard.t.text('dictionary.last').capitalize(),
          "next": Pard.t.text('dictionary.next').capitalize(),
          "previous": Pard.t.text('dictionary.previous').capitalize()
        }
      },
      fixedHeader: {
        header: true
      },
      "autoWidth": false,
      "bAutoWidth": false,
      "scrollX": true,
      "scrollY": "75vh",
      "paging": false,
      "scrollCollapse": true,
      // 'responsive': true,
      // 'colReorder': true,
      "columnDefs": [
        { "visible": false, "targets": _hiddenColumns},
        {'orderable':false, 'targets':[1,2,4,5,7,10,11,13]}
      ],
      "order": [0,'asc'],
      // keys: true,
      dom: 'Bfrtip',
      buttons: [
      {
        extend: 'colvis',
        columns: ':gt(0)',
        text: Pard.Widgets.IconManager('visibility').render().attr('title', Pard.t.text('manager.proposals.hideShowCol.helper')),
        className: 'changeColumnsBtn',
        collectionLayout: 'fixed big_layout',
        fade: 200,
        prefixButtons: [
          {
            extend: 'colvisGroup',
            text: Pard.t.text('manager.proposals.hideShowCol.selectAll'),
            show: ':gt(1)'
          },
          {
            extend: 'colvisGroup',
            text: Pard.t.text('manager.proposals.hideShowCol.unselect'),
            hide: ':visible'
          },
          {
            extend: 'colvisRestore',
            text: Pard.t.text('manager.proposals.hideShowCol.initial'),
            show: ':hidden'
          }
        ]
      },
      {
        text: Pard.Widgets.IconManager('mailinglist').render().attr('title', Pard.t.text('manager.copy.helper')),
        className: 'mailinglistBtn',
        extend: 'collection',
        collectionLayout: 'button-list',
        autoClose: true,
        fade: 200,
        buttons: [
          {
            text: Pard.t.text('manager.copy.artistEmails'),
            action: function(){
              var columnData = _dataTable.column(_columns.indexOf('participant_email'), { search:'applied' }).data().unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          },
          {
            text: Pard.t.text('manager.copy.spaceEmails'),
            action: function(){
              var columnData = _dataTable.column(_columns.indexOf('host_email'), { search:'applied' }).data().unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          },
          {
            text: Pard.t.text('manager.copy.allEmails'),
            action: function(){
              var columnArtData = _dataTable.column(_columns.indexOf('participant_email'), { search:'applied' }).data().unique();
              var columnEspData = _dataTable.column(_columns.indexOf('host_email'), { search:'applied' }).data().unique();
              var columnData = $.merge(columnArtData, columnEspData).unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          }
        ]
      },    
      {
        extend: 'collection',
        text:  Pard.Widgets.IconManager('export').render().attr('title', Pard.t.text('manager.export')),
        className: 'ExportCollectionBtn',
        collectionLayout: 'button-list',
        // backgroundClassName: 'ExportCollection-background',
        autoClose: true,
        fade: 200,
        // background: false,
        buttons: [
          {
            extend: 'excel',
            text:'Excel',
            customizeData: function(doc) {
              doc.header.forEach(function(t, i){
                if (t.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) doc.header[i] = Pard.t.text('dictionary.category').capitalize()
              });
            },
            exportOptions: {
                columns: [':visible :lt(1)',':visible :gt(0)']
            },
            filename: Pard.t.text('dictionary.program').capitalize()
          },
          {
            extend: 'pdf',
            text:'PDF',
            customize: function(doc) {
              doc.content[1].table.body[0].forEach(function(colTitle){
                if (colTitle.text.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) colTitle.text = Pard.t.text('dictionary.category').capitalize();
                else if (colTitle.text.indexOf(Pard.t.text('dictionary.day').capitalize())>-1) colTitle.text = Pard.t.text('dictionary.day').capitalize();
                colTitle.alignment = 'left';
                colTitle.margin = [2,2,2,2];
              }) 
            },
            exportOptions: {
              columns:  [':visible :lt(1)',':visible :gt(0)'],
            },
            orientation: 'landscape',
            filename: Pard.t.text('dictionary.program').capitalize()
          },
          {
            extend: 'copy',
            text: Pard.t.text('dictionary.copy').capitalize(),
            header: false,
            exportOptions: {
              columns:   [':visible :lt(1)',':visible :gt(0)'],
            }
          }
        ]
      }
    ],
    initComplete: function () {
      _filtersWidgets(this.api().column(0, { search:'applied' }));
      //SETSCROLLER ON CHANGING COLUMN VISIBILITY
      this.api().on( 'column-visibility.dt', function ( e, settings, column, state ) {
        _tableViewSecondScroller.setScroller();
      })
    }
    });

    _colSelectors = {
      confirmed: {
        column: _dataTable.column(_columns.indexOf('confirmed')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      participant_subcategory: {
        column: _dataTable.column(_columns.indexOf('participant_subcategory')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      host_subcategory: {
        column: _dataTable.column(_columns.indexOf('host_subcategory')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      date:{
        column: _dataTable.column(_columns.indexOf('date')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      children:{
        column: _dataTable.column(_columns.indexOf('children')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      }
    }

    Object.keys(_colSelectors).forEach(function(col){
      _loadSelector(_colSelectors[col], col);
    });

    var _sortIcon = Pard.Widgets.IconManager('sort').render().addClass('sortIcon');
    var _timeIcon = Pard.Widgets.IconManager('time').render().addClass('timeIcon');
    var _reorderIcon = $('<span>').append(_timeIcon, _sortIcon).addClass('reorderIcon');
    var orderBtn = $('<button>').attr({
      'type':'button',
      'title': Pard.t.text('manager.program.chronoOrder')
      })
      .append(_reorderIcon)
      .click(function(){
        _dataTable.order([0,'asc']).draw();
      })
    var _orderBtnContainer = $('<div>')
      .addClass('orderBtn-programTable-container')
      .append(orderBtn);
    _outerTableContainer.prepend(
      $('<div>')
        .append(_orderBtnContainer)
        .css('position','relative')
    );

   var selector = '#container_programTable div.dataTables_scrollBody';
    var innerSelector = '#container_programTable  tbody';
    var _tableViewSecondScroller = Pard.Widgets.SecondScroller(selector,0,innerSelector);

    _createdWidget.append(
      _tableViewSecondScroller.render()
    )

    

   
    return {
      table: _table,
      render: _createdWidget,
      showRow: showRow,
      secondScroller: _tableViewSecondScroller,
      save: function(show){
        _dataTable.row('#programTable-' + show.id_time).remove();
        _dataTable.row.add(showRow(show)).order([0,'asc']).draw();
        _reloadSelectors();
      },
      modify: function(show){
        _dataTable.row('#programTable-' + show.id_time).remove();
        _dataTable.row.add(showRow(show));
      },
      draw: function(){
        _dataTable.order([0,'asc']).draw();
        orderBtn.trigger('click')
        _reloadSelectors();
      },
      destroy: function(performance_id_time){
        _dataTable.row('#programTable-' + performance_id_time).remove();
      },
      deleteArtistperformances: function(performancesToDelete){
        performancesToDelete.forEach(function(performance_id_time){
          _dataTable.row('#programTable-' + performance_id_time).remove();
        });
        _dataTable.draw(); 
      },
      modifyArtist:function(performancesToModify){
        performancesToModify.forEach(function(performance_id_time){
          var _show = the_event.program[performance_id_time].show;
          _dataTable.row('#programTable-' + performance_id_time).remove();
          _dataTable.row.add(showRow(_show))
        });
        _dataTable.draw();
      },
      modifySpace: function(performancesToModify){
        performancesToModify.forEach(function(performance_id_time){
          var _show = the_event.program[performance_id_time].show;
          _dataTable.row('#programTable-' + performance_id_time).remove();
          _dataTable.row.add(showRow(_show))
        });
        _dataTable.draw();

      },
      orderSpaces: function(new_order){
        _dataTable.clear();
        for (var id in the_event.program){
          var show = the_event.program[id].show
          show.order = new_order.indexOf(show.host_proposal_id);
          _dataTable.row.add(showRow(show)); 
        }
        _dataTable.draw();
      },
      assignPrices: function(subcategories_price){
        _dataTable.clear();
        for (var id in the_event.program){
          var card = the_event.program[id].card;
          var show = the_event.program[id].show;
          var participant_subcategory =  the_event.artists[show.participant_id].proposals[show.participant_proposal_id].proposal.subcategory
          if (subcategories_price[participant_subcategory]){
            show.price = {
              price: subcategories_price[participant_subcategory]['price'],
              ticket_url: subcategories_price[participant_subcategory]['ticket_url'],
              transition_type: subcategories_price[participant_subcategory]['transition_type']
            };
            var _priceIcon = card.find('.priceIcon');
            _priceIcon.empty();
            if (show['price'] && !Pard.Widgets.IsBlank(show.price.price)) _priceIcon.append(Pard.Widgets.IconManager('price').render());
          }
          _dataTable.row.add(showRow(show));
        }
        _dataTable.draw();
      }
    }
  }



  ns.Widgets.PermanentTable = function(the_event){
    var _createdWidget = $('<div>');
    var _table = $('<table>').addClass('table-program stripe row-border ').attr({'cellspacing':"0"}).css({
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

    //REMEMBER children ---> publico del espectacúlo

    var _columns = [
      'date',
      // 'time',
      'participant_name',
      'participant_email',
      'participant_phone',
      'participant_subcategory',
      'participant_other_categories',
      'participant_other',
      'title',
      'short_description',
      'order',
      'host_name',
      'host_email',
      'host_phone',
      'host_subcategory',
      'host_other_categories',
      'host_other',
      'children',
      'price',
      'needs',
      'comments',
      'confirmed'
    ];
    var _shownColumns = [
      'date',
      // 'time',
      'participant_name',
      'participant_subcategory',
      'title',
      'host_name', 
      'host_subcategory'
    ];
    var _hiddenColumns = [];
    var _outerTableContainer = $('<div>').css('margin-top','1.85rem');
    var _tableBox = $('<div>').addClass('table-box-call-manager-page permanentTable');

    _table.append(_thead.append(_titleRow));
    _table.append(_tfoot.append(_titleRowFoot));
    _table.append(_tbody);

    var infoProgram = $.extend(true, {}, Pard.Widgets.ProgramTableInfo(the_event));
    delete infoProgram.participant_name.info;
    delete infoProgram.host_name.info;
    delete infoProgram.title.info;
    infoProgram.date.info = function(show){
      var _days = Pard.Widgets.UniqueArray(show['dateTime'].map(function(dt){
        return dt.date;
      }))
        .sort()
        .map(function(date){ return moment(new Date(date)).format('DD-MM-YYYY');});        
      return _days.join(', ');
    }


    var showRow = function(show){
      return Pard.Widgets.ShowRow(show, _columns, infoProgram, the_event)
    }

    _columns.forEach(function(field, index){
      if ($.inArray(field, _shownColumns) == -1) _hiddenColumns.push(index);
      var _titleCol = $('<th>').addClass('column-call-manager-table column-'+field);
      var _footCol = $('<th>') .addClass('column-call-manager-table column-'+field);
      _titleCol.text(infoProgram[field].label);
      _footCol.text(infoProgram[field].label);
      _titleRow.append(_titleCol);     
      _titleRowFoot.append(_footCol);
    });
    
    _outerTableContainer.append(_tableBox.append(_table)).css('position','relative');
    _createdWidget.append(_outerTableContainer);

    var _colSelectors = {};

    var _loadSelector = function (colSelector, col) {
      var _colCategry = colSelector.column;
      var _ival = colSelector.select.val();
      colSelector.select = $('<select>').append($('<option>').attr('value','').text(''));
      var _options = [];
      $(_colCategry.header()).empty().text(infoProgram[col].label);
      if (_colCategry.data().unique().length>1){
        var _selectContainer = $('<div>').addClass('select-container-datatableColumn');
        colSelector.select.appendTo(_selectContainer.appendTo($(_colCategry.header())))
          .on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(colSelector.select.val());
            _colCategry.search( val ? '^'+val+'$' : '', true, false ).draw();
          });
        _colCategry.data().unique().each( function ( d, j ) {
            colSelector.select.append( '<option value="'+d+'">'+d+'</option>' );
            _options.push(d);
            if (d == _ival) colSelector.select.val(d);
        } );
        colSelector.select.click(function(e){
          e.stopPropagation();
        });
      }
      colSelector.options = _options;
      colSelector.select.trigger('change');
    }

    var _reloadSelectors = function(){
      Object.keys(_colSelectors).forEach(function(col){
        var _columnData = [];
        _colSelectors[col].column.data().unique().each(function(value){
            typeof value === 'string' ? _columnData.push(value) : false
        });
        if (_columnData.sort().toString() != _colSelectors[col].options.sort().toString()){
          _loadSelector(_colSelectors[col], col);
        }
      })
    }


    var _permanentPerformances = {};

    //============= FILL THE TABLE ==========

    for (var id_time in the_event.program){
      if (the_event.program[id_time].show.permanent && the_event.program[id_time].show.permanent == 'true'){
        if (!_permanentPerformances[the_event.program[id_time].show.id]){
          _permanentPerformances[the_event.program[id_time].show.id] = the_event.program[id_time];
          _tbody.append(showRow(the_event.program[id_time].show))
        }
      }
    }

    //=======================================


    var _dataTable = _table.DataTable({
      "language":{
        buttons: {
            copyTitle: Pard.t.text('manager.copy.table'),
            copyKeys: Pard.t.text('manager.copy.keys'),
            copySuccess: {
                _: Pard.t.text('manager.copy.success'),
                1: Pard.t.text('manager.copy.success1')
            }
        },
        "lengthMenu": Pard.t.text('manager.copy.results'),
        "zeroRecords": Pard.t.text('manager.zeroRecords'),
        "info": "",
        "infoEmpty": Pard.t.text('manager.infoEmpty'),
        "infoFiltered": "(filtered from _MAX_ total records)",
        "search": "_INPUT_",
        "searchPlaceholder": Pard.t.text('dictionary.search').capitalize(),
        "paginate": {
          "first": Pard.t.text('dictionary.first').capitalize(),
          "last": Pard.t.text('dictionary.last').capitalize(),
          "next": Pard.t.text('dictionary.next').capitalize(),
          "previous": Pard.t.text('dictionary.previous').capitalize()
        }
      },
      fixedHeader: {
        header: true
      },
      "autoWidth": false,
      "bAutoWidth": false,
      "scrollX": true,
      "scrollY": "75vh",
      "paging": false,
      "scrollCollapse": true,
      "columnDefs": [
        { "visible": false, "targets": _hiddenColumns},
        {'orderable':false, 'targets':[1,2,4,5,7,10,11,13]}
      ],
      "order": [0,'asc'],
      dom: 'Bfrtip',
      buttons: [
      {
        extend: 'colvis',
        columns: ':gt(0)',
        text: Pard.Widgets.IconManager('visibility').render().attr('title', Pard.t.text('manager.proposals.hideShowCol.helper')),
        className: 'changeColumnsBtn',
        collectionLayout: 'fixed big_layout',
        fade: 200,
        prefixButtons: [
          {
            extend: 'colvisGroup',
            text: Pard.t.text('manager.proposals.hideShowCol.selectAll'),
            show: ':gt(1)'
          },
          {
            extend: 'colvisGroup',
            text: Pard.t.text('manager.proposals.hideShowCol.unselect'),
            hide: ':visible'
          },
          {
            extend: 'colvisRestore',
            text: Pard.t.text('manager.proposals.hideShowCol.initial'),
            show: ':hidden'
          }
        ]
      },
      {
        text: Pard.Widgets.IconManager('mailinglist').render().attr('title', Pard.t.text('manager.copy.helper')),
        className: 'mailinglistBtn',
        extend: 'collection',
        collectionLayout: 'button-list',
        autoClose: true,
        fade: 200,
        buttons: [
          {
            text: Pard.t.text('manager.copy.artistEmails'),
            action: function(){
              var columnData = _dataTable.column(_columns.indexOf('participant_email'), { search:'applied' }).data().unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          },
          {
            text: Pard.t.text('manager.copy.spaceEmails'),
            action: function(){
              var columnData = _dataTable.column(_columns.indexOf('host_email'), { search:'applied' }).data().unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          },
          {
            text: Pard.t.text('manager.copy.allEmails'),
            action: function(){
              var columnArtData = _dataTable.column(_columns.indexOf('participant_email'), { search:'applied' }).data().unique();
              var columnEspData = _dataTable.column(_columns.indexOf('host_email'), { search:'applied' }).data().unique();
              var columnData = $.merge(columnArtData, columnEspData).unique();
              var _emailList = '';
              columnData.each(function(email){
                _emailList += email+', ';
              });
              _emailList = _emailList.substring(0,_emailList.length-2)
              Pard.Widgets.CopyToClipboard(_emailList);
              var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
              Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
            }
          }
        ]
      },    
      {
        extend: 'collection',
        text:  Pard.Widgets.IconManager('export').render().attr('title', Pard.t.text('manager.export')),
        className: 'ExportCollectionBtn',
        collectionLayout: 'button-list',
        autoClose: true,
        fade: 200,
        buttons: [
          {
            extend: 'excel',
            text:'Excel',
            customizeData: function(doc) {
              doc.header.forEach(function(t, i){
                if (t.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) doc.header[i] = Pard.t.text('dictionary.category').capitalize()
              });
            },
            exportOptions: {
                columns: [':visible :lt(1)',':visible :gt(0)']
            },
            filename: Pard.t.text('dictionary.program').capitalize()+'_'+Pard.t.text('dictionary.permanent')
          },
          {
            extend: 'pdf',
            text:'PDF',
            customize: function(doc) {
              doc.content[1].table.body[0].forEach(function(colTitle){
                if (colTitle.text.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) colTitle.text = Pard.t.text('dictionary.category').capitalize();
                else if (colTitle.text.indexOf(Pard.t.text('dictionary.day').capitalize())>-1) colTitle.text = Pard.t.text('dictionary.day').capitalize();
                colTitle.alignment = 'left';
                colTitle.margin = [2,2,2,2];
              }) 
            },
            exportOptions: {
              columns:  [':visible :lt(1)',':visible :gt(0)'],
            },
            orientation: 'landscape',
            filename: Pard.t.text('dictionary.program').capitalize()+'_'+Pard.t.text('dictionary.permanent')
          },
          {
            extend: 'copy',
            text: Pard.t.text('dictionary.copy').capitalize(),
            header: false,
            exportOptions: {
              columns:   [':visible :lt(1)',':visible :gt(0)'],
            }
          }
        ]
      }
    ]
  
    });

    _colSelectors = {
      confirmed: {
        column: _dataTable.column(_columns.indexOf('confirmed')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      participant_subcategory: {
        column: _dataTable.column(_columns.indexOf('participant_subcategory')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      host_subcategory: {
        column: _dataTable.column(_columns.indexOf('host_subcategory')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      date:{
        column: _dataTable.column(_columns.indexOf('date')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      },
      children:{
        column: _dataTable.column(_columns.indexOf('children')),
        select: $('<select>').append($('<option>').attr('value','').text('')),
        options: []
      }
    }

    Object.keys(_colSelectors).forEach(function(col){
      _loadSelector(_colSelectors[col], col);
    });



  

    return {
      table: _table,
      render: function(){
        return _createdWidget;
      }
    }
  }

  

  

}(Pard || {}));
