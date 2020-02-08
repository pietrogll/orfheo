 'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {}; 
   'use strict';

  ns.Widgets.SpaceProgram = function(proposal_id,  the_event, spaceProgramPopupTitleContainer){

    var space = the_event.spaces[proposal_id].space;
    var spaceProgram = the_event.spaces[proposal_id].program;
    var artists = the_event.artists 
    var eventProgram = the_event.program;

    var _printSpaceInfo = function(){
      spaceProgramPopupTitleContainer.empty().append(space.space_name + ' ('+Pard.UserInfo['texts'].subcategories['space'][space.subcategory]+')');
    }

    var _closepopup = {};
    var _createdWidget = $('<div>');

    var _columnsHeaders = ['schedule','artist','category','title','short_description', 'phone', 'email']

    var _infoSpace = space.address.route+ ' ' + space.address.street_number + ' - tel. ' + space.phone.value +' - email: '+ space.email;
    var _spaceName = space.space_name + ' (' + Pard.UserInfo['texts'].subcategories['space'][space.subcategory] + ')';
    var _infoSpaceBox = $('<div>').addClass('info-box-popup-program');
    _infoSpaceBox.append($('<p>').append(_infoSpace));


    var _printSpaceProgram = function(space){
      var _rowPosition = 1;
      var _dayRowPos = [];
      var _permanentRowPos = [];
      _createdWidget.empty();

      var myPerformances = Object.keys(spaceProgram).map(function(performance_id){
        return spaceProgram[performance_id].show;
      });

      if (myPerformances) myPerformances = Pard.Widgets.ReorderProgramCrono(myPerformances);

      var _spaceTable = $('<table>').addClass('table_display table-proposal row-border').attr({'cellspacing':"0", 'width':'100%'});
      var _tableBox = $('<div>').addClass('table-space-program');
      var _thead = $('<thead>');
      var _titleRow = $('<tr>');
      var _tfoot = $('<tfoot>');
      var _footRow = $('<tr>');

      _columnsHeaders.forEach(function(field){
        var _titleCol = $('<th>').text(Pard.t.text('dictionary.' + field).capitalize());
        var _footCol = $('<th>');
        if (field == 'email') _footCol.text('Powered by Orfheo');
        else{_footCol.text('');}
        _titleRow.append(_titleCol);
        _footRow.append(_footCol);
      });

      _spaceTable.append(_thead.append(_titleRow));
      _spaceTable.append(_tfoot.append(_footRow));

      var _tbody = $('<tbody>');
      var lastDate;
      var lastType = 'false';

      var _dayRow = function(performance, permanent){
        var _row= $('<tr>');
        var _timeCol = $('<td>').addClass('column-artist-program-call-manager column-time');
        var _nameCol = $('<td>').addClass('column-artist-program-call-manager column-name');
        var _categoryCol = $('<td>').addClass('column-artist-program-call-manager column-category');
        var _titleCol = $('<td>').addClass('column-artist-program-call-manager column-title');
        var _shortDCol = $('<td>').addClass('column-artist-program-call-manager column-short_description');
        var _phoneCol = $('<td>').addClass('column-artist-program-call-manager column-phone');
        var _emailCol = $('<td>').addClass('column-artist-program-call-manager column-email');

        if(permanent){
          _timeCol.append(Pard.t.text('dictionary.permanent').capitalize());
          _nameCol.append(moment(performance.date).locale(Pard.Options.language()).format('dddd'));
          _row.addClass('permanent-row-program-table-call-manager');
           _permanentRowPos.push(_rowPosition);
        }
        else{
          _timeCol.append(moment(performance.date).locale(Pard.Options.language()).format('dddd').toUpperCase());
          _nameCol.append(moment(performance.date).format('DD-MM-YYYY'));
          _row.addClass('day-row-program-table-call-manager');
          _dayRowPos.push(_rowPosition);
        }
        
        _titleCol.html('');
        _categoryCol.html('');
        _shortDCol.html('');
        _phoneCol.html('');
        _emailCol.html('');

        _row.append(_timeCol, _nameCol, _categoryCol, _titleCol, _shortDCol, _phoneCol, _emailCol);

        _rowPosition = _rowPosition + 1;

        return _row
      }
      
      var printed = {};

      var _printRow = function(show){
        if (printed[show.id] && printed[show.id][show.date]) return ;

        var _proposal = {};
        var proposalObj = artists[show.participant_id].proposals[show.participant_proposal_id]
        if(proposalObj) _proposal = artists[show.participant_id].proposals[show.participant_proposal_id].proposal;
        var _title = show.title || _proposal.title;
        var _short_description = show.short_description || _proposal.short_description;
        var _row = $('<tr>');

        var _timeCol = $('<td>').addClass('column-artist-program-call-manager column-time');
        var _schedule = Pard.Programations.get(show.id).reduce(function(timeArr, dt){
          if (show.date == dt.date) timeArr.push(moment(parseInt(dt.time[0])).format('HH:mm') + '-' + moment(parseInt(dt.time[1])).format('HH:mm'));
          return timeArr;
        }, []).join(', ');

        var _nameCol = $('<td>').addClass('column-artist-program-call-manager column-name');
        var _categoryCol = $('<td>').addClass('column-artist-program-call-manager column-category');
        var _titleCol = $('<td>').addClass('column-artist-program-call-manager column-title');
        var _namePopupCaller = $('<a>').attr({'href':'#/'}).text(_title);
        var _shortDCol = $('<td>').addClass('column-artist-program-call-manager column-short_description');
        var _phoneCol = $('<td>').addClass('column-artist-program-call-manager column-phone');
        var _emailCol = $('<td>').addClass('column-artist-program-call-manager column-email');

        var _subcat = show.participant_subcategory || _proposal.subcategory;

        _timeCol.append(_schedule);
        _titleCol.append(_namePopupCaller);
        _nameCol.html(artists[show.participant_id].name);
        var _participant_subcat = _proposal.subcategory || show.participant_subcategory;
        _categoryCol.html(Pard.UserInfo['texts'].subcategories['artist'][_participant_subcat]);
        _shortDCol.html(_short_description);
        _phoneCol.html(artists[show.participant_id].artist.phone.value);
        _emailCol.html(artists[show.participant_id].artist.email);

        _namePopupCaller.on('click', function(){
          
          var _externalPerformancesBox = $('<div>').css('padding', 0).addClass('noselect');
          var _performancesPopup = Pard.Widgets.Popup();

          var newDisplayer = new Pard.Displayer(Pard.CachedEvent, Pard.CachedForms);
          newDisplayer.setCloseCallback(function(){
            _titleManagerPopup.text(artists[show.participant_id].name())
          });

          var _titleManagerPopup = $('<span>')
            .text(artists[show.participant_id].name())
            .addClass('performanceManagerTitle');
          _titleManagerPopup.click(function(){
            if(show.participant_proposal_id) newDisplayer.displayProposal(artists[show.participant_id].proposals[eventProgram[show.id_time].show.participant_proposal_id].proposal, 'artist');              
            else newDisplayer.displayParticipant(artists[show.participant_id].artist);
          })
          _performancesPopup.setContent(
            _titleManagerPopup, 
            _externalPerformancesBox
          );
          var _content = eventProgram[show.id_time].manager(false);
          var _performanceManagerCloseCallback = function(){
            newDisplayer.destroy();
            _printSpaceInfo();
            _printSpaceProgram(space);
            setTimeout(function(){                
              _performancesPopup.destroy();                
            },500)
          }
          _content.setCallback(function(){
            _performancesPopup.close();
            _performanceManagerCloseCallback();
          });
          _externalPerformancesBox.append(_content.render());
          _performancesPopup.setCallback(function(){
            _performanceManagerCloseCallback();
          });
          _performancesPopup.open();
    
        });

        _row.append(_timeCol,  _nameCol, _categoryCol, _titleCol,_shortDCol, _phoneCol, _emailCol);

        printed[show.id] =  printed[show.id] || {};
        printed[show.id][show.date] = true;

        _rowPosition = _rowPosition + 1;

        return _row;
      }


      myPerformances.forEach(function(performance){
        if(performance.date != lastDate){
          lastType = 'false';
          _tbody.append(_dayRow(performance));
          
        }

        if(performance.permanent == 'true' && lastType == 'false'){
          lastType = 'true';
          _tbody.append(_dayRow(performance, true));
        }

        var _row = _printRow(performance);
        _tbody.append(_row);
        lastDate = performance.date;
      });

      _spaceTable.append(_tbody);
      _spaceTable.addClass('program-table-popup');
      _createdWidget.append(_infoSpaceBox, _tableBox.append(_spaceTable));

      _spaceTable.DataTable({
        "language":{
          "zeroRecords": Pard.t.text('manager.zeroRecords'),
          "info": "",
          "infoEmpty": Pard.t.text('manager.infoEmpty'),
          "searchPlaceholder": Pard.t.text('dictionary.search').capitalize()
        },
        fixedHeader: { 
          header: true
        },
        aaSorting: [],
        "paging": false,
        "scrollCollapse": true,
        dom: 'Bfrtip',
        "searching": false,
        "bSort": false,
        buttons: [
        {
          extend: 'colvis',
          text: Pard.Widgets.IconManager('visibility').render().attr('title', Pard.t.text('manager.proposals.hideShowCol.helper')),
          className: 'changeColumnsBtn',
          collectionLayout: 'fixed big_layout',
          fade: 200
        },
        {
          text: Pard.Widgets.IconManager('mailinglist').render().attr('title',Pard.t.text('manager.copy.helper')),
          className: 'mailinglistBtn',
          extend: 'collection',
          collectionLayout: 'button-list',
          autoClose: true,
          fade: 200,
          buttons: [
            {
              text: Pard.t.text('manager.copy.artistEmails'),
              action: function(){
                var columnData = Object.keys(spaceProgram).map(function(performance_id){
                    return artists[spaceProgram[performance_id].show.participant_id].artist.email;
                  });
                columnData = Pard.Widgets.UniqueArray(columnData);
                var _emailList = columnData.join(',');
                Pard.Widgets.CopyToClipboard(_emailList);
                var _copyPopupContent = $('<div>').append($('<div>').html(Pard.t.text('manager.copy.mex1', {amount: columnData.length})), $('<div>').html(Pard.t.text('manager.copy.mex2')));
                Pard.Widgets.CopyPopup(Pard.t.text('manager.copy.title'), _copyPopupContent);
              }
            },
            {
              text: Pard.t.text('manager.copy.allEmails'),
              action: function(){
                var columnData = Object.keys(spaceProgram).map(function(performance_id){
                    return artists[spaceProgram[performance_id].show.participant_id].artist.email;
                  });
                columnData = Pard.Widgets.UniqueArray($.merge([space.email],columnData));
                var _emailList = columnData.join(',');
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
              exportOptions: {
                  columns: [':visible :lt(1)',':visible :gt(0)']
              },
              filename: Pard.t.text('dictionary.program') + ' ' + space.space_name
            },
            {
              extend: 'pdf',
              exportOptions: {
                  columns: [':visible :lt(1)',':visible :gt(0)']
              },
              // download: 'open',
              orientation: 'landscape',
              filename: Pard.t.text('dictionary.program') + ' ' + space.space_name,
              title: _spaceName,
              message: '__MESSAGE__',
              footer: true,
              customize: function ( doc ) {
                // doc.styles['table-row'] = {
                //   'font-size': '16px',
                //   'padding': '4px',
                //   'border-top': '1px solid #dedede'
                // }
                doc.content.forEach(function(content) {
                if (content.style == 'message') {
                  content.text = _infoSpace;
                  content.fontSize = 14;
                  content.margin = [0, 0, 0, 20];
                }
                if (content.style == 'title'){
                  content.fontSize = 16;
                  content.alignment= 'left';
                }
                });
                doc.content[2].layout= 'lightHorizontalLines';
                doc.content[2].table.widths = [ '9%', '15%', '10%', '16%', '25%','10%','15%'];
                doc.content[2].table.body.forEach(function(row, rowNumber){
                  if (rowNumber == 0) {
                    row.forEach(function(cell, index){
                      cell.alignment = 'left';
                      cell.bold = true;
                      cell.fillColor = '#ffffff';
                      cell.color = '#000000';
                      cell.margin = [2,2,2,2];
                    });
                  }  
                  else if ($.inArray (rowNumber, _dayRowPos) >-1){ row.forEach(function(cell, index){
                      cell.fillColor = '#6f6f6f';
                      cell.color = '#ffffff';
                      cell.fontSize = 11;
                      cell.bold = true;
                      if (index == 0) cell.margin = [4,2,2,2];
                      else cell.margin = [2,2,2,2];
                    });
                  }
                  else if($.inArray (rowNumber, _permanentRowPos) >-1){ 
                    row.forEach(function(cell, index){
                      cell.fillColor = '#dedede';
                      cell.bold = true;
                      cell.bold = true;
                      if (index == 0) cell.margin = [4,2,2,2];
                      else cell.margin = [2,2,2,2];
                    });
                  }
                  else if (rowNumber == doc.content[2].table.body.length -1){
                    row.forEach(function(cell, index){
                      cell.color = '#000000';
                      cell.fillColor = '#ffffff';
                      cell.margin = [0,15,2,2];
                    })
                  }
                  else{
                    row.forEach(function(cell, index){
                      cell.fillColor = '#ffffff';
                      cell.margin = [2,4,2,4];
                      // cell.cellBorder = '1px solid red';
                    });
                  }
                });
              }
            }
          ]
        }
      ]
      });
    }

    
    _printSpaceProgram(space);
    _printSpaceInfo();

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closepopup = callback;
      }
    }
  }

}(Pard || {}));