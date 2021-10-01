'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.ToolsDropdownMenu = function(the_event, displayer){

    var artists = the_event.artists;
    var spaces = the_event.spaces;

    var _menu = $('<ul>').addClass('menu').css({'min-width': '13rem'});

    var _outOfprogramBtn = $('<li>').text(Pard.t.text('manager.program.menu.artistsnoProgram'));
    _outOfprogramBtn.on('click', function(){
      _btn.trigger('click');
      var _artistOutOfProgram = Pard.Widgets.ArtistOutOfProgram(artists, displayer);
      var _popup = Pard.Widgets.Popup();
      _popup.setContent(Pard.t.text('manager.program.menu.artistsnoProgram'), _artistOutOfProgram.render());
      _popup.setZindex(999);
      var _open = true;
      _popup.setCallback(function(){
        _open = false;
        setTimeout(function(){
        _popup.destroy(); 
        },500);
      });
      Pard.Bus.on('selectArtist', function(){
        if(_open) {
          _artistOutOfProgram.reloadTable();
        }
      });
      _popup.open();
    });

    var _spaceOutOfprogramBtn = $('<li>').text(Pard.t.text('manager.program.menu.spacesnoProgram'));
    _spaceOutOfprogramBtn.on('click', function(){
      _btn.trigger('click');
      var _spaceOutOfProgram = Pard.Widgets.SpaceOutOfProgram(spaces, displayer);
      var _popup = Pard.Widgets.Popup();
      _popup.setContent(Pard.t.text('manager.program.menu.spacesnoProgram'), _spaceOutOfProgram.render()); 
      _popup.setZindex(999);
      var _open = true;
      _popup.setCallback(function(){
        _open = false;
        setTimeout(function(){
        _popup.destroy(); 
        },500);
      });
      Pard.Bus.on('selectSpace', function(){
        if(_open) {
          _spaceOutOfProgram.reloadTable();
        }
      });
      _popup.open(); 
    });
    
    var _orderSpaceBtn = $('<li>').text(Pard.t.text('manager.program.menu.orderSpaces'));
    var _orderSpaceWidget = Pard.Widgets.OrderSpace(the_event);
    _orderSpaceBtn.on('click', function(){
      _btn.trigger('click');
      var _popup = Pard.Widgets.Popup();
      _popup.setContent(
        Pard.t.text('manager.program.menu.orderSpaces'),
         _orderSpaceWidget.render()
      );
      _popup.open();
    });

    var _priceManagerBtn = $('<li>').text(Pard.t.text('manager.program.menu.priceManager'));

    _priceManagerBtn.on('click', function(){
      _btn.trigger('click');
      var _popup = Pard.Widgets.Popup();
      _popup.setContent(
        Pard.t.text('manager.program.menu.priceManager'),
        Pard.Widgets.PriceManager(the_event).render()
      );
      _popup.open();
    });

    var _permanentsManagerBtn = $('<li>').text(Pard.t.text('manager.program.menu.permanentsManager'));

    _permanentsManagerBtn.on('click', function(){
      _btn.trigger('click');
      var _popup = Pard.Widgets.Popup();
      _popup.setContent(
        Pard.t.text('manager.program.menu.permanentsManager'),
        Pard.Widgets.PermanentsTimeManager(the_event).render()
      );
      _popup.open();
    });


    var _publishProgramCallback =  {
      publish: function(data){
      console.log(data)

        if(data['status'] == 'success') {
          var _mex = $('<div>').html(Pard.t.text('manager.program.publishmex'));
          Pard.Widgets.TimeOutAlert('',_mex);
        }
        else{
          console.log('error');
          Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.t.text('error.nonExecuted'), function(){location.reload();});
        }
      },
      unpublish: function(data){
        if(data['status'] == 'success') {
          var _mex = $('<div>').html(Pard.t.text('manager.program.unpublishmex'));
          Pard.Widgets.TimeOutAlert('',_mex);
        }
        else{
          console.log('error');
          Pard.Widgets.Alert(Pard.t.text('error.alert'), Pard.t.text('error.nonExecuted'), function(){location.reload();});
        }
      }
    }

    var _publishedBtn = $('<li>');
    // var _rgb = Pard.Widgets.IconColor(the_event.color).rgb();
    // var _backColor = 'rgba('+_rgb[0]+','+_rgb[1]+','+_rgb[2]+','+0.2+')';
    var _publishStatus;
    var _setPublishStatus = function(){
      if(the_event.published == true || the_event.published == 'true'){
        _publishStatus = 'unpublish';
        _publishedBtn.text(Pard.t.text('manager.program.unpublish'));
        // $('main').css({'background': _backColor});
      }
      else{         
        _publishStatus = 'publish';
        _publishedBtn.text(Pard.t.text('manager.program.publish'));
        // $('main').css('background','#f6f6f6');
      }
    }

    _setPublishStatus();

    Pard.Bus.on('setPublishStatus', function(){
      _setPublishStatus();
    });
      
    Pard.Bus.on('publishEvent', function(status){
      if(the_event.published != status){
        the_event.published = status;
       _setPublishStatus();
      }
    });

    _publishedBtn.on('click', function(){
      _btn.trigger('click');
      Pard.Backend.publish(the_event.program_id, the_event.id, _publishProgramCallback[_publishStatus]);
    });



    _menu.append(
      _outOfprogramBtn, 
      _spaceOutOfprogramBtn, 
      _orderSpaceBtn,
      _priceManagerBtn,
      _permanentsManagerBtn, 
      _publishedBtn
    );

    var _menuContainer = $('<ul>').addClass('dropdown menu tools-btn').attr({'data-dropdown-menu':true, 'data-disable-hover':true,'data-click-open':true});
    var _btn = $('<button>')
      .attr({'type':'button', 'title':Pard.t.text('manager.program.menu.helper')})
      .append(
        Pard.Widgets.IconManager('menu').render()
      );
    var _iconDropdownMenu = $('<li>').append(
      _btn
      ,_menu
    );
    _menuContainer.append(_iconDropdownMenu);

    return {
      render: function(){
        return _menuContainer;
      },
      setOrder: function(order){
        _orderSpaceWidget.setOrder(order);
      }
      // setOrderCallback: function(callback){
        // _orderSpaceWidget.setOrderCallback(callback);
      // }
    }
  }


  ns.Widgets.ArtistOutOfProgram = function(artists, displayer){
    
    var _createdWidget = $('<div>').addClass('artist-out-of-program-popup-content');

    var _fieldPrinter = Pard.Widgets.InfoTab.printer('', displayer);

    var columns = [
      'title', 
      'name',  
      'subcategory', 
      'selected', 
      'email'
    ];

    var _printTable = function(){
      _createdWidget.empty();
      var _tableCreated = $('<table>')
        .addClass('table-proposal stripe row-border artist-out-of-program-table')
        .attr({'cellspacing':"0"})
        .css({
            'margin': '0 auto',
            'width': '100%',
            'clear': 'both',
            'table-layout': 'fixed',
            'word-wrap':'break-word',
          });
    
      var _thead = $('<thead>');
      var _titleRow = $('<tr>')
      var _tfoot = $('<tfoot>');
      var _titleRowFoot = $('<tr>');
      columns.forEach(function(field){
        var _text; 
        _fieldPrinter[field] ? _text = _fieldPrinter[field].label.capitalize() : _text = Pard.t.text('dictionary.' + field).capitalize();
        var _titleCol = $('<th>').text(_text);
        var _titleFoot = $('<th>').text(_text);
        _titleRow.append(_titleCol);
        _titleRowFoot.append(_titleFoot);
      });
      _tableCreated.append(_thead.append(_titleRow));
      _tableCreated.append(_tfoot.append(_titleRowFoot));

      var _tbody = $('<tbody>');
      Object.keys(artists).forEach(function(profile_id){
        var proposals = artists[profile_id].artist.proposals;
        var artistProgram = artists[profile_id].program;
        var program = Object.keys(artistProgram).map(function(performance_id){
          return artistProgram[performance_id].show;
        });
        var noSelected = (proposals || []).filter(function(proposal){
          return program.every(function(show){
            return show.participant_proposal_id != proposal.proposal_id;
          });
        });
        noSelected.forEach(function(proposal, index){
          proposal.proposal_type = 'artist';
          var _row = $('<tr>');
          columns.forEach(function(field){
            if (field == 'title'){
              _info = $('<a>').attr({'href':'#/'}).append(proposal.title).on('click', function(){displayer.displayProposal(proposal, proposal.proposal_type)});
            }
            else if (field == 'email') _info = proposal[field];
            else  _info = _fieldPrinter[field].info(proposal);
            var _col = $('<td>').append(_info);
            _row.append(_col);
            _tbody.append(_row);
          });
        });
      });
  
      _tableCreated.append(_tbody);
      _createdWidget.append(_tableCreated);

      var _dataTable;
      _dataTable = _tableCreated.DataTable({
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
          "search": "_INPUT_",
          "searchPlaceholder": Pard.t.text('dictionary.search').capitalize()
        },
        fixedHeader: {
          header: true
        },
        "columnDefs": [
          { "visible": false, "targets":[4]}
        ],
        "order": [],
        "scrollY": "75vh",
        "bAutoWidth": false,
        "paging": false,
        "scrollCollapse": true,
        aaSorting: [],
        dom: 'Bfrtip',
        buttons: [
          {
            text: Pard.Widgets.IconManager('mailinglist').render().attr('title', Pard.t.text('manager.copy.helper')),
            className: 'mailinglistBtn mailNoProgram',
            action: function(){
              var columnData = _dataTable.column(4, { search:'applied' }).data().unique();
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
        ],
        initComplete: function () {
          var _this = this;
          Pard.Widgets.SelectorTableColumn(_this.api().column(columns.indexOf('subcategory')));
          // Pard.Widgets.SelectorTableColumn(_this.api().column(columns.indexOf('selected')));
          _createdWidget.prepend(
            Pard.Widgets.CheckBoxFilter(
              _this.api().column(columns.indexOf('selected')), 
              Pard.t.text('manager.program.menu.onlyProposalsSelected')
            ).css({'margin-bottom': '1rem'})
          );
        }
      });
    }

    _printTable();

    return {
      render: function(){
        setTimeout(function(){
          $('.mailNoProgram').attr('title', Pard.t.text('manager.copy.helper')); 
        },500)
        return _createdWidget;
      },
      setCallback: function(callback){
        callback;
      },
      reloadTable: function(){
        _printTable();
      } 
    }
  }

  ns.Widgets.SpaceOutOfProgram = function(spaces, displayer){
    var _createdWidget = $('<div>').addClass('artist-out-of-program-popup-content');
  
    var _fieldPrinter = Pard.Widgets.InfoTab.printer('', displayer);

    var columns = [
      'space_name', 
      'name', 
      'subcategory', 
      'selected',
      'email'
    ];

    var _printTable = function(){
      _createdWidget.empty();
      var _tableCreated = $('<table>').addClass('table-proposal stripe row-border artist-out-of-program-table').attr({'cellspacing':"0"}).css({
        'margin': '0 auto',
        'width': '100%',
        'clear': 'both',
        'table-layout': 'fixed',
        'word-wrap':'break-word'
      });

      var _thead = $('<thead>');
      var _titleRow = $('<tr>')
      var _tfoot = $('<tfoot>');
      var _titleRowFoot = $('<tr>');
      columns.forEach(function(field){
        var _text; 
        _fieldPrinter[field] ? _text = _fieldPrinter[field].label.capitalize() : _text = Pard.t.text('dictionary.' + field).capitalize();
        var _titleCol = $('<th>').text(_text);
        var _titleFoot = $('<th>').text(_text);
        _titleRow.append(_titleCol);
        _titleRowFoot.append(_titleFoot);
      });
      _tableCreated.append(_thead.append(_titleRow));
      _tableCreated.append(_tfoot.append(_titleRowFoot));


      var _tbody = $('<tbody>');
      Object.keys(spaces).forEach(function(proposal_id){
        var spaceProgram = spaces[proposal_id].program;
        var noSelected = [];
        if(Object.keys(spaceProgram).length == 0) noSelected.push(spaces[proposal_id].space);
          
        noSelected.forEach(function(proposal){
          proposal.proposal_type = 'space';
          var _row = $('<tr>');
          columns.forEach(function(field){
            var _info;
            if (field == 'space_name') _info = $('<a>').attr({'href':'#/'}).append(proposal.space_name).on('click', function(){displayer.displayProposal(proposal, proposal.proposal_type)});
            else if (field == 'email') _info = proposal[field];
            else  _info = _fieldPrinter[field].info(proposal);
            var _col = $('<td>').append(_info);
            _row.append(_col);
            _tbody.append(_row);
          });
        });
      });

      _tableCreated.append(_tbody);
      _createdWidget.append(_tableCreated);


      var _dataTable;
      _dataTable = _tableCreated.DataTable({
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
          "searchPlaceholder": Pard.t.text('dictionary.search').capitalize()
        },
        fixedHeader: {
          header: true
        },
        "columnDefs": [
          { "visible": false, "targets":[4]}
        ],
        "order": [],
        "scrollY": "75vh",
        "bAutoWidth": false,
        "paging": false,
        "scrollCollapse": true,
        aaSorting: [],
        dom: 'Bfrtip',
        buttons: [
          {
            text: Pard.Widgets.IconManager('mailinglist').render(),
            className: 'mailinglistBtn mailNoProgram',
            action: function(){
              var columnData = _dataTable.column(3, { search:'applied' }).data().unique();
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
        ],
        initComplete: function () {
          var _this = this;
          Pard.Widgets.SelectorTableColumn(_this.api().column(columns.indexOf('subcategory')));
          // Pard.Widgets.SelectorTableColumn(_this.api().column(columns.indexOf('selected')));
          _createdWidget.prepend(
            Pard.Widgets.CheckBoxFilter(
              _this.api().column(columns.indexOf('selected')),
              Pard.t.text('manager.program.menu.onlySpacesSelected')
            ).css({'margin-bottom': '1rem'})
          );
        }
      });
    }

    _printTable();

    return {
      render: function(){
        setTimeout(function(){
          $('.mailNoProgram').attr('title', Pard.t.text('manager.copy.helper')); 
        },500)
        return _createdWidget;
      },
      setCallback: function(callback){
        callback;
      },
      reloadTable: function(){
        _printTable();
      }
    }
  }


  ns.Widgets.OrderSpace = function(the_event){

    var _createdWidget = $('<div>');
    var _order;

    var _dictionaryColor = Pard.Widgets.DictionaryColor(the_event);

    var _spaceCards = {};

    var _printSpaceCard = function(space, index){
      var _spaceNum = index + 1;
      var _spaceCard = $('<li>').text(_spaceNum + '. ' + space.space_name)
        .addClass('ui-state-default sortable-space-card cursor_grab')
        .css('background', _dictionaryColor[space.subcategory])
        .attr('id', space.proposal_id)
        .mousedown(function(){
          _spaceCard.removeClass('cursor_grab').addClass('cursor_move');
        })
        .mouseup(function(){
          _spaceCard.removeClass('cursor_move').addClass('cursor_grab');
        });
      return {
        render: function(){
          return _spaceCard;
        },
        index: function(index){
          _spaceCard.text((index + 1) + '. ' + space.space_name);
        }
      }
    }

    var _printOrderableList = function(){ 

      _spaceCards = {};
      _createdWidget.empty();

      var _listSortable = $('<ul>');
      var _orderButtonsContainer = $('<div>').addClass('order-buttons-container');
      var _orderText = $('<span>').text(Pard.t.text('manager.program.menu.orderby'));

      _listSortable.sortable({
        cursor: "move",
        update: function(){
          _listSortable.sortable('toArray').forEach(function(space_id, index){
            _spaceCards[space_id].index(index);
          });
        }
      });
      _listSortable.disableSelection();


      var spaces = _order.map(function(proposal_id){
        return the_event.spaces[proposal_id].space;
      });
      var _catArrays = {};

      spaces.forEach(function(space, index){
        var _spaceCard = _printSpaceCard(space, index);
        _spaceCards[space.proposal_id] = _spaceCard;
        _listSortable.append(_spaceCard.render());
        if (!(_catArrays[space.subcategory])) _catArrays[space.subcategory] = [space];
        else _catArrays[space.subcategory].push(space);
      });

      var _alphaBtn = Pard.Widgets.Button('A --> Z', function(){
        _listSortable.empty();
        spaces.sort(function(s1, s2){
          return s1.space_name.localeCompare(s2.space_name);
        });
        spaces.forEach(function(space, index){
          _spaceCards[space.proposal_id].index(index);
          _listSortable.append(_spaceCards[space.proposal_id].render());
        });
      });

      var _catOrderBtn = Pard.Widgets.Button(Pard.t.text('dictionary.category').capitalize(), function(){
        _listSortable.empty();
        spaces = [];
        for (var cat in _catArrays){
          spaces = spaces.concat(_catArrays[cat]);
        }
        spaces.forEach(function(space, index){
          _spaceCards[space.proposal_id].index(index);
          _listSortable.append(_spaceCards[space.proposal_id].render());
        });
      });

      var _saveBtn = Pard.Widgets.Button(
        Pard.Widgets.IconManager('save').render(),
        function(){
          var _orderSpaceSpinner = new Spinner().spin();
          $('body').append(_orderSpaceSpinner.el);
          _order = _listSortable.sortable('toArray');
          Pard.Backend.saveOrder(
            the_event.program_id,
            the_event.id, 
            _order, 
            function(data){
              _orderSpaceSpinner.stop();
            }
          );
        }
      ) 

      var _saveBtnRendered = _saveBtn.render()
        .addClass('saveBtn-orderSpaces')
        .attr({
          'title': Pard.t.text('manager.program.menu.save')
        });

      _orderButtonsContainer.append(_orderText, _alphaBtn.render(), _catOrderBtn.render());

      _createdWidget.append(_orderButtonsContainer, _saveBtnRendered, _listSortable);
      
      return _createdWidget;

    }

    return {
      render: function(){
        return _printOrderableList();
      },
      setCallback: function(callback){
        _closePopup = callback
      },
      setOrder: function(order){
        _order = order;
      }
    }
  }

  ns.Widgets.PermanentsTimeManager = function(the_event){
    var _createdWidget = $('<div>');

    var _inputCont = $('<div>');
    var _inputs = Pard.Widgets.DateTimeArray(the_event.eventTime.map(function(evt){return evt.date}));
    _inputs.setVal(the_event.permanents);
    _inputCont.append(_inputs.render());

    var _saveBtn = Pard.Widgets.Button(
      Pard.Widgets.IconManager('save').render(),
      function(){
        var _spinner = new Spinner().spin();
        $('body').append(_spinner.el);
        var _values = _inputs.getVal();
        Pard.Backend.setPermanentsTime(
          the_event.program_id,
          the_event.id,
          _values,
          function(data){
            _spinner.stop();
            if (data.status == 'fail') Pard.Widgets.Alert('Error', data.reason)
          }
        );
      }
    )

    var _saveBtnContainer = $('<div>')
      .append(
        _saveBtn.render()
          .addClass('saveBtn')
          .attr({'title': Pard.t.text('manager.program.menu.save')})
      ).css({
        'position':'relative',
        'text-align':'right'
      });

    _createdWidget.append(
      _inputCont, 
      _saveBtnContainer
    );
    
    return{
      render: function(){
        return _createdWidget
      }
    }
  }


  ns.Widgets.PriceManager = function(the_event){
    var _createdWidget = $('<div>');

    var _artistTicketTxt = $('<p>').text(Pard.t.text('manager.program.menu.subcatPrices_itxt'));

    var _subCatList = $('<div>');
    var _aSubCat = Pard.UserInfo['texts'].subcategories['artist'];
    var _prices = {};
    var _modifyIcon = {}

    Object.keys(_aSubCat).forEach(function(cat){
      var _listItem = $('<div>').css({'margin-bottom':'2rem'});
      var _catTxt = $('<div>')
        .html(_aSubCat[cat])
        .css({
          'font-size': '14px',
          'font-weight': 'bold'
        });
      var _priceWidget = Pard.Widgets.PerformancePriceInput();
      if(the_event.subcategories_price && the_event.subcategories_price[cat]) _priceWidget.setVal(the_event.subcategories_price[cat]);
      _priceWidget.disable();
      _prices[cat] = _priceWidget; 
      
      var _modifybtn = $('<button>')
        .attr('type','button')
        .append(Pard.Widgets.IconManager('modify').render().css({'font-size': '1.2rem'}))
        .click(function(){
          if(!_modifybtn.hasClass('activated')){
            _priceWidget.enable();
            _modifybtn.addClass('activated');
            _modifybtn.empty().append($('<span>').text(Pard.t.text('dictionary.back')).css({'font-size': '12px'}));
          }
          else{ 
            _modifybtn.removeClass('activated');
            if(the_event.subcategories_price && the_event.subcategories_price[cat]) _priceWidget.setVal(the_event.subcategories_price[cat]);
            else _priceWidget.setVal({'price': '', 'ticket_url':''});
            _priceWidget.disable();
            _modifybtn.empty().append(Pard.Widgets.IconManager('modify').render().css({'font-size': '1.2rem'}));
          }
        })
        .addClass('button_a');

      var _btnContainer = $('<div>')
        .css({
          'text-align': 'right',
          'margin': '-.5rem 0'
        });

      _modifyIcon[cat] = _modifybtn;
      
      _listItem.append(
        _catTxt,
        _btnContainer.append(_modifybtn),
        _priceWidget.render()
      )
      _subCatList.append(_listItem);
    });

    var _saveBtn = Pard.Widgets.Button(
      Pard.Widgets.IconManager('save').render(),
      function(){
        var _spinner = new Spinner().spin();
        $('body').append(_spinner.el);
        var _values = {};
        for(var cat in _prices){
          var valcat = _prices[cat].getVal();
          if (_modifyIcon[cat].hasClass('activated')) _values[cat] = valcat;   
        }
        if (!$.isEmptyObject(_values)) Pard.Backend.artistSubcategoriesPrice(
          the_event.program_id,
          the_event.id,
          _values,
          function(data){
            for(var cat in _prices){
              _prices[cat].disable();
              _modifyIcon[cat].empty().append(Pard.Widgets.IconManager('modify').render().css({'font-size': '1.2rem'}));
              _spinner.stop();
            }
          }
        );
        else _spinner.stop();
      }
    )


    var _saveBtnContainer = $('<div>')
      .append(
        _saveBtn.render()
          .addClass('saveBtn')
          .attr({'title': Pard.t.text('manager.program.menu.save')})
      ).css({
        'position':'relative',
        'text-align':'right'
      });

    _createdWidget.append(
      _artistTicketTxt, 
      _subCatList, 
      _saveBtnContainer
    );
    
    return{
      render: function(){
        return _createdWidget
      }
    }
  }



}(Pard || {}));
