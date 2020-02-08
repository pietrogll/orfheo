'use strict';
 
(function(ns){

  ns.Widgets = ns.Widgets || {};  

  ns.Widgets.ArtistProgram = function(profile_id, the_event, programPopupTitleContainer){
    
    var artist = the_event.artists[profile_id];
    var artistProgram = artist.program
    var spaces = the_event.spaces;
    var eventProgram = the_event.program;

    var _closepopup = {};
    var _createdWidget = $('<div>');

    var _columnsHeaders = ['schedule','title','space','address', 'phone', 'email'];

    var _infoArtistBox = $('<div>').addClass('info-box-popup-program');

    var _conflictPerformances = [];

    var _printArtistInfo = function(){
      var _translatorSubC = Pard.UserInfo['texts']['subcategories'];
      var _popupTitle = the_event.artists[profile_id].artist.name; 
      if (!($.isEmptyObject(artistProgram))){
        _popupTitle += ' (';
        var _artistCategories = [];
        for (var performanceId in artistProgram){
          var subcat = artistProgram[performanceId].show.participant_subcategory || artist.proposals[artistProgram[performanceId].show.participant_proposal_id].proposal.subcategory;
          _artistCategories.push(_translatorSubC['artist'][subcat]);
        }
        _popupTitle += Pard.Widgets.UniqueArray(_artistCategories).join(', ')+ ')';
      }
      programPopupTitleContainer.empty().append(_popupTitle)

      var _infoArtist = 'tel. ' + artist.artist.phone.value +' - email: '+ artist.artist.email;
      _infoArtistBox.empty().append($('<p>').append(_infoArtist));
    } 

    var _printArtistProgram = function(){
      var _rowPosition = 1;
      var _dayRowPos = [];
      var _permanentRowPos = [];
      
      _createdWidget.empty();

      var myPerformances = Object.keys(artistProgram).map(function(performance_id){
        return artistProgram[performance_id].show;
      });

      _conflictPerformances = Pard.Widgets.ConflictPerformances(myPerformances);

      var _artistTable = $('<table>').addClass('table_display table-proposal row-border').attr({'cellspacing':"0", 'width':'100%'});
      var _tableBox = $('<div>').addClass('table-artist-program');
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

      _artistTable.append(_thead.append(_titleRow));
      _artistTable.append(_tfoot.append(_footRow));

      var _tbody = $('<tbody>');
      var lastDate;
      var lastType = 'false';

      var _dayRow = function(performance, permanent){
        var _row = $('<tr>'); 
        var _timeCol = $('<td>').addClass('column-artist-program-call-manager column-time');
        var _titleCol = $('<td>').addClass('column-artist-program-call-manager column-title');
        var _nameCol = $('<td>').addClass('column-artist-program-call-manager column-name');
        var _addressCol = $('<td>').addClass('column-artist-program-call-manager column-address');
        var _phoneCol = $('<td>').addClass('column-artist-program-call-manager column-phone');
        var _emailCol = $('<td>').addClass('column-artist-program-call-manager column-email');

        if (permanent){
          _timeCol.append(Pard.t.text('dictionary.permanent').capitalize());
          _titleCol.append(moment(performance.date).locale(Pard.Options.language()).format('dddd'));
          _row.addClass('permanent-row-program-table-call-manager');
          _permanentRowPos.push(_rowPosition);

        }
        else{
          _timeCol.append(moment(performance.date).locale(Pard.Options.language()).format('dddd').toUpperCase());
          _titleCol.append(moment(performance.date).locale(Pard.Options.language()).format('DD-MM-YYYY'));
          _row.addClass('day-row-program-table-call-manager');
          _dayRowPos.push(_rowPosition);

        }

        
        _nameCol.html('');
        _addressCol.html('');
        _phoneCol.html('');
        _emailCol.html('');

        _row.append(_timeCol, _titleCol, _nameCol, _addressCol, _phoneCol, _emailCol);

        _rowPosition = _rowPosition + 1;

        return _row
      }

      var printed = {};

      var _printRow = function(show){
        if (printed[show.id] && printed[show.id][show.date]) return ;

        var _proposal = {};
        var proposalObj = artist.proposals[show.participant_proposal_id]
        if(proposalObj) _proposal = proposalObj.proposal;
        var _title = show.title || _proposal.title;

        var _row = $('<tr>');
        
        if($.inArray(show.id_time, _conflictPerformances) >= 0){
          _row.css({
            'background': '#FBA4A4'
          });
        }

        var _timeCol = $('<td>').addClass('column-artist-program-call-manager column-time');

        var _schedule = Pard.Programations.get(show.id).reduce(function(timeArr, dt){
          if (show.date == dt.date) timeArr.push(moment(parseInt(dt.time[0])).format('HH:mm') + '-' + moment(parseInt(dt.time[1])).format('HH:mm'));
          return timeArr;
        }, []).join(', ');
         
        var _titleCol = $('<td>').addClass('column-artist-program-call-manager column-title');
        var _performanceManagerPopupCaller = $('<a>').attr({'href':'#/'}).text(_title);
        var _nameCol = $('<td>').addClass('column-artist-program-call-manager column-name');
        var _addressCol = $('<td>').addClass('column-artist-program-call-manager column-address');
        var _phoneCol = $('<td>').addClass('column-artist-program-call-manager column-phone');
        var _emailCol = $('<td>').addClass('column-artist-program-call-manager column-email');

        _timeCol.append(_schedule);
        _titleCol.append(_performanceManagerPopupCaller);
        _nameCol.html(spaces[show.host_proposal_id].space.space_name);
        _addressCol.html(spaces[show.host_proposal_id].space.address.route + ' ' + spaces[show.host_proposal_id].space.address.street_number);
        _phoneCol.html(spaces[show.host_proposal_id].space.phone.value);
        _emailCol.html(spaces[show.host_proposal_id].space.email);

        _performanceManagerPopupCaller
          .click(function(){
            var _externalPerformancesBox = $('<div>').css('padding', 0).addClass('noselect');
            var managerPopup = Pard.Widgets.Popup();
            var newDisplayer = new Pard.Displayer(Pard.CachedEvent, Pard.CachedForms);
            newDisplayer.setCloseCallback(function(){
              _titleManagerPopup.text(artist.name())
            });
            var _titleManagerPopup = $('<span>')
              .text(artist.name())
              .addClass('performanceManagerTitle')
              .click(function(){
                if(proposalObj) newDisplayer.displayProposal(artist.proposals[eventProgram[show.id_time].show.participant_proposal_id].proposal, 'artist');
                else newDisplayer.displayParticipant(artist.artist);
              })
            managerPopup.setContent(
              _titleManagerPopup, 
              _externalPerformancesBox
            );
            var _content = eventProgram[show.id_time].manager(false);
            var _closePerformanceManagerCallback = function(){
              newDisplayer.destroy();
              _printArtistProgram(artist);
              _printArtistInfo(artist);
              setTimeout(function(){
                managerPopup.destroy();
              },500);
            }
            _content.setCallback(function(){
              _closePerformanceManagerCallback();
              managerPopup.close();

            });
            _externalPerformancesBox.append(_content.render());
            managerPopup.setCallback(function(){
             _closePerformanceManagerCallback();
            });
            managerPopup.open();
          })

        _row.append(
          _timeCol, 
          _titleCol, 
          _nameCol, 
          _addressCol, 
          _phoneCol, 
          _emailCol
        );
        
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

      _artistTable.append(_tbody);
      _artistTable.addClass('program-table-popup');
      _createdWidget.append(_infoArtistBox, _tableBox.append(_artistTable));

      _artistTable.DataTable({
        rowReorder: false,
        "language":{
          "zeroRecords": Pard.t.text('manager.zeroRecords'),
          "info": "",
          "infoEmpty": Pard.t.text('manager.infoEmpty')
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
          extend: 'collection',
          text:  Pard.Widgets.IconManager('export').render().attr('title',Pard.t.text('manager.export')),
          className: 'ExportCollectionBtn',
          collectionLayout: 'button-list',
          autoClose: true,
          fade: 200,
            buttons: [     
              {
                extend: 'excel',
                exportOptions: {
                    columns: [':visible :lt(1)',':visible :gt(0)']
                },
                filename: Pard.t.text('dictionary.program') + ' ' + artist.name()
              },
              {
                extend: 'pdf',
                exportOptions: {
                    columns: [':visible :lt(1)',':visible :gt(0)']
                },
                orientation: 'landscape',
                filename: Pard.t.text('dictionary.program') + ' ' + artist.name(),
                title: artist.name(),
                footer: true,
                customize: function ( doc ) {
                  doc.content.forEach(function(content) {
                  if (content.style == 'title'){
                    content.fontSize = 16;
                    content.alignment= 'left';
                  }
                  });
                  doc.content[1].layout= 'lightHorizontalLines';
                  doc.content[1].table.widths = [ '10%', '20%', '18%', '25%','10%','18%'];
                  doc.content[1].table.body.forEach(function(row, rowNumber){
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
                    else if (rowNumber == doc.content[1].table.body.length -1){
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

    _printArtistInfo(artist);
    _printArtistProgram(artist);

    return {
      render: function(){
        return _createdWidget;
      },
      setCallback: function(callback){
        _closepopup = function(){
          _createdWidget.remove();
          callback();
        }
      }
    }
  }

}(Pard || {}));