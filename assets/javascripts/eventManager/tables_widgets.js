'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};

  ns.Widgets.ProposalFieldTablePrinter = {  
    InputTel: function(proposal, field){
      return  proposal[field]['value'];
    },
    CheckBox: function(proposal, field){
      var dictionaryCheckBox = {
        false: Pard.t.text('dictionary.no').capitalize(),
        true: Pard.t.text('dictionary.yes').capitalize()
      }
      return dictionaryCheckBox[proposal[field]];
    },
    Links: function(proposal, field){
      return '<a href="'+proposal[field]+'" target: "_blank">'+ proposal[field]+'</a>';
    },
    Selector: function(proposal, field, form){
      return form[field].args[0][proposal[field]];
    },
    InputNumber: function(proposal, field, form){
      var _text = proposal[field];
      if (form[field].args) _text += ' '+form[field].args[1]
      return _text;
    },
    MultipleSelector: function(proposal, field, form){
      var _selections = proposal[field].map(function(val){
        return form[field].args[0][val];
      }); 
      return _selections.join(', ');
    }
  }


   ns.Widgets.InfoTab = {
    printer: function(typeTable, displayer, form){
    
      var _other = function(){
        var _txt = '';
        if (form && form.other) _txt = form.other.label;
        return _txt;
      }

      var _other_cat = function(proposal){
        var _catList = '';
        if (proposal.other_categories){
          _catList = proposal.other_categories.map(function(c){
              return form.other_categories.args[0][c]
          }).join(', ')
        }
        return _catList;
      }

      return {
        amend:{
          info: function(proposal){
            if (proposal.amend) return proposal.amend; 
            else return '';
          },
          label: Pard.t.text('dictionary.amend').capitalize(),
          input: 'TextAreaEnriched'
        },
        proposal_type: {
          info: function(proposal){
            var _dictionary = {
              'artist':'performer', //artist.category
              'space':'stage'
            }
            return $('<span>').append(
              Pard.Widgets.IconManager(_dictionary[proposal.proposal_type]).render().css({'margin-right': '-0.5rem'}))
          },
          label: Pard.t.text('dictionary.type').capitalize(),
          input: 'proposal_type'
        },
        date:{
          info: function(proposal){
            return moment(proposal.register_date).locale(Pard.Options.language()).format('YYYY/MM DD');
          },
          label: Pard.t.text('dictionary.date').capitalize(),
          input: 'date'
        },
        selected:{
          info:function(proposal){
            if (Pard.Widgets.IsBlank(proposal.selected)) return Pard.t.text('dictionary.no');
            else return Pard.t.text('dictionary.yes');
          },
          label: Pard.t.text('dictionary.selected').capitalize(),
          input: 'CheckBox'
        },
        type:{ // SPACE TYPE
          info: function(proposal){
             return Pard.t.text('space_type')[proposal.type];
          },
          label: Pard.t.text('dictionary.space_type').capitalize(),
          input: 'Selector'
        },
        ambients_number:{
          info: function(proposal, np) { 
            if(proposal['ambients']) return Object.keys(proposal['ambients']).length;
          },
          label: Pard.t.text('proposal.ambients_n').capitalize(),
          input:'Inputtext'
        },
        name:{
          info: function(proposal){
            if (proposal.own) return $('<span>').append(proposal['name']);
            else return $('<a>').append(proposal['name']).attr({'href':'/profile?id='+proposal.profile_id, 'target':'_blank'});
          }, 
          label: Pard.t.text('dictionary.profile').capitalize(),
          input:'Inputtext'
        },
        space_name:{ 
          label: Pard.t.text('dictionary.space_name').capitalize(),
          input:'Inputtext',
          info: function(proposal, np){
            var text;
            if (proposal.title) text = proposal['title'];
            else if (proposal.space_name) text = proposal['space_name'];
            return $('<a>').attr({'href':'#/'}).append(text).on('click', function(){
              var _list = Pard.Widgets.InfoTab[typeTable].column(0, { search:'applied' }).data().toArray();  
              displayer.displayProposalsList(proposal, proposal.proposal_type, _list);
            });
          },
        },
        phone:{
          info: function(proposal){
            if (proposal.phone) return proposal.phone.value;
            else return '';
          },
          label: Pard.t.text('dictionary.phone').capitalize(),
          input : "InputTel"
        },
        address:{ 
          info: function(proposal){
            var _address = ' ';
            if (proposal['address']){
              if (proposal['address']['route']) _address +=  proposal['address']['route']+ ' ';
              if (proposal['address']['street_number']) _address += ' '+proposal['address']['street_number']+',  ';
              if (proposal['address']['door']) _address += ', '+Pard.t.text('proposal.form.door')+proposal['address']['door']+',  ';
              _address += proposal['address']['postal_code']+', '+proposal['address']['locality'];
            }
            return $('<a>').attr({
              'href':'https://maps.google.com/maps?q='+_address,
              target: '_blank'}).append(_address);
          },
          label: Pard.t.text('dictionary.address').capitalize(),
          input: 'InputAddressSpace'
        },
        duration: {
          info: function(proposal){
            return proposal['duration'] + ' min';
          },
          label: Pard.t.text('dictionary.duration').capitalize(),
          input: 'Selector'
        },
        availability:{  
          info: function(proposal) {
            var _info = '';
            proposal['availability'].forEach(function(day){
              _info += moment(new Date(day)).locale(Pard.Options.language()).format('DD MMMM, ');
            });
            return _info.substring(0, _info.length-2);
          },
          label: Pard.t.text('dictionary.availability').capitalize(),
          input: 'MultipleDaysSelector'
        },
        email: {
          label : Pard.t.text('dictionary.email').capitalize(),
          input : "EmailInput",
        },
        description : {
          label: Pard.t.text('dictionary.description').capitalize(),
          input : "TextAreaEnriched"
        },
        subcategory : {
          info: function(proposal){
            var form = form || Pard.CachedForms[proposal.proposal_type][proposal.form_id].blocks;
            return form.subcategory.args[0][proposal.subcategory];
          },
          label : Pard.t.text('dictionary.category').capitalize(),
          input : "Selector"
        },
        other_categories : {
          info: function(proposal){
            var other_cat = _other_cat(proposal);
            return other_cat;
          },
          label : Pard.t.text('dictionary.other_categories').capitalize(),
          input : "Selector"
        },
        other : {
          info: function(proposal){
            return proposal['other'];
          },
          label : _other(),
          input : "Selector"
        },
        titleAddress:{
          info: function(proposal, np){
            var text;
            if (proposal.title) text = proposal['title'];
            else if (proposal.space_name) text = proposal['space_name'];
            return $('<a>').attr({'href':'#/'}).append(text).on('click', function(){
              var _list = Pard.Widgets.InfoTab[typeTable].column(0, { search:'applied' }).data().toArray();  
              displayer.displayProposalsList(proposal, proposal.proposal_type, _list);
            });
          },
          label : Pard.t.text('dictionary.title').capitalize() + ' / ' + Pard.t.text('dictionary.space_name').capitalize(),
          input : "Inputtext"
        },
        hiddenType:{
          info: function(proposal){
            return proposal.proposal_type; 
          },
          label:'hiddenType',
          input: 'Inputtex'
        },
        profile_id:{
          info: function(proposal){
            return proposal.own ? proposal.profile_id+'_'+proposal.proposal_id+'_'+proposal.proposal_type+'_own' : proposal.profile_id+'_'+proposal.proposal_id+'_'+proposal.proposal_type+'_received';
          },
          label:'profile_id',
          input: 'Inputtex'
        },
        proposalNumber:{
          info: function(p, proposalNumber){
            return proposalNumber;
          },
          label:'proposalNumber',
          input:'Selector'
        },
        children:{
          info: function(proposal){
            return Pard.t.text('widget.inputChildren.' + proposal.children);
          },
          label: Pard.t.text('dictionary.audience').capitalize(),
          input:'InputChildren'
        },
        title: {
          info: function(proposal, np){
            var text;
            if (proposal.title) text = proposal['title'];
            else if (proposal.space_name) text = proposal['space_name'];
            return $('<a>').attr({'href':'#/'}).append(text).on('click', function(){
              var _list = Pard.Widgets.InfoTab[typeTable].column(0, { search:'applied' }).data().toArray();  
              displayer.displayProposalsList(proposal, proposal.proposal_type, _list);
            });
          },
          label: Pard.t.text('dictionary.title').capitalize(),
          input: 'Inputtext'
        },
        short_description: {
          info: function(proposal){
            return proposal.short_description; 
          },
          label: Pard.t.text('dictionary.short_description').capitalize(),
          input: 'TextAreaEnriched'
        },
        cache: {
          info: function(proposal){
            var cache = '';
            if (proposal.cache.value && proposal.cache.value!='false') cache += proposal.cache.value+'€'
            if (proposal.cache.comment) cache += ' - '+proposal.cache.comment;
            return cache;
          },
          label: Pard.t.text('dictionary.cache').capitalize(),
          input: 'Inputtext'
        },
        comments:{
          info: function(proposal){
            return proposal['comments'];
          },
          label: Pard.t.text('widget.inputComments.label').capitalize(),
          input: 'Inputtext'
        }
      }
    }
  }



  ns.Widgets.ProgramTableInfo = function(the_event, displayer){
    var _cronoOrder = function(show){
      return the_event.eventTime.map(function(evt){return evt.date}).indexOf(show.date)+show.permanent+show.time[0]+show.time[1];
    } 
    return{
      cronoOrder:{
        label:'',
        info: function(show){
          return _cronoOrder(show);
        }
      },
      date: {
        info: function(show){
          return moment(new Date(show['date'])).format('DD-MM-YYYY');
        },
        label: Pard.t.text('dictionary.day').capitalize()
      },
      time:{
        info: function(show){
          var start = moment(new Date(show.time[0])).format('HH:mm');
          var end = moment(new Date(show.time[1])).format('HH:mm');
          return start+'-'+end;
        },
        label: Pard.t.text('dictionary.schedule').capitalize()
      },
      participant_name:{
        info: function(show){
          return $('<a>').attr('href','#/').text(show.participant_name).click(function(){displayer.displayArtistProgram(show.participant_id)});
        },
        label: Pard.t.text('dictionary.artist').capitalize()
      },
      participant_email:{
        label: Pard.t.text('manager.program.artistEmail')
      },
      participant_phone:{
        label: Pard.t.text('manager.program.participant_phone')
      },
      participant_subcategory:{
        info: function(show){
          return Pard.UserInfo['texts']['subcategories']['artist'][show.participant_subcategory];
        },
        label: Pard.t.text('manager.program.artistCat')
      },
      participant_other_categories:{
        info: function(show){
          if (show.participant_other_categories) return show.participant_other_categories
        },
        label: Pard.t.text('manager.program.participant_other_categories')
      },
      participant_other:{
        info: function(show){
          if (show.participant_other) return show.participant_other;
        },
        label: Pard.t.text('manager.program.participant_other')
      },
      title: {
        label: Pard.t.text('dictionary.title').capitalize(),
        info: function(show){
          var _info = $('<a>').attr('href','#/')
          .text(show.title)
          .click(function(){
            if (show.permanent == 'true') {
              var artistProgram = the_event.artists[show.participant_id].program;
              artistProgram[show.id_time].displayManager(true, true);
            }
            else  {
              the_event.program[show.id_time].displayManager(true);
            }
          })
          return _info;
        }
      },
      short_description:{
        label: Pard.t.text('dictionary.short_description').capitalize()
      },
      order:{
        info: function(show){
          return parseInt(show['order']) + 1;
        },
        label: Pard.t.text('manager.program.spaceNum')
      },
      host_name: {
        info: function(show){
          return $('<a>').attr('href','#/').text(show.host_name).click(function(){displayer.displaySpaceProgramList(show.host_proposal_id)});
        },
        label: Pard.t.text('dictionary.space').capitalize()
      },
      host_email:{
        label: Pard.t.text('manager.program.spaceEmail')
      },
      host_phone:{
        label: Pard.t.text('manager.program.host_phone')
      },
      host_subcategory:{
        info: function(show){
          return Pard.UserInfo['texts']['subcategories']['space'][show.host_subcategory];
        },
        label: Pard.t.text('manager.program.spaceCat')
      },
      host_other_categories:{
        info: function(show){
          if (show.host_other_categories) return show.host_other_categories;
        },
        label:  Pard.t.text('manager.program.host_other_categories')
      },
      host_other:{
        info: function(show){
          if (show.host_other) return show.host_other;
        },
        label: Pard.t.text('manager.program.host_other')
      },
      needs:{
        info: function(show){
          if (show.comments && !Pard.Widgets.IsBlank(show.comments.needs)) return  show.comments.needs
        },
        label: Pard.t.text('widget.inputComments.label_needs')
      },
      comments:{
        info: function(show){
          if (show.comments && !Pard.Widgets.IsBlank(show.comments.comments)) return  show.comments.comments
        },
        label: Pard.t.text('dictionary.comments').capitalize()
      },
      confirmed:{
        label: Pard.t.text('dictionary.confirmed').capitalize(),
        info: function(show){
          return  show['confirmed'] == 'true' ? Pard.t.text('dictionary.yes').capitalize() : Pard.t.text('dictionary.no').capitalize()
        }
      },
      children:{
        label: Pard.t.text('dictionary.audience').capitalize(),
        info: function(show){
          return  Pard.t.text('widget.inputChildren')[show['children']]
        }
      },
      price:{
        label: Pard.t.text('dictionary.price').capitalize(),
        info: function(show){
          if (show['price'] && !Pard.Widgets.IsBlank(show.price.price)) return  show.price.price;
        }
      }
    }
  }


  ns.Widgets.SummableInputsTable = function(proposalType, typeTable, summableInputs, fieldKey){
    
    var _createdWidget = $('<div>').addClass('artist-out-of-program-popup-content');
    var inputs = summableInputs.args[0];
    var columns = Object.keys(inputs);
    var _tableCreated = $('<table>').addClass('table-proposal stripe row-border artist-out-of-program-table').attr({'cellspacing':"0"}).css({
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
    var _emailColumn;

    columns.forEach(function(field, col_index){
      var _text; 
      _text = inputs[field].label;
      var _titleCol = $('<th>').text(_text);
      var _titleFoot = $('<th>').text(_text);
      _titleRow.append(_titleCol);
      _titleRowFoot.append(_titleFoot);
      if (inputs[field].input == 'InputEmail') _emailColumn = col_index;
    });
    _tableCreated.append(_thead.append(_titleRow));
    _tableCreated.append(_tfoot.append(_titleRowFoot));

    var _tbody = $('<tbody>');
    
    Pard.Backend.getProposals(
      Pard.CachedEvent.call_id, 
      proposalType, 
      {'form_id': typeTable}, 
      function(data){
        _printTable(data.proposals);
      }
    );

    var _printTable = function(proposals){

      proposals.forEach(function(proposal){
        for (var i in proposal[fieldKey]){
          var inputVal = proposal[fieldKey][i]
          var _row = $('<tr>');
          columns.forEach(function(field){
            var _info;
            if ($.inArray(inputs[field].input, Object.keys(Pard.Widgets.ProposalFieldTablePrinter))>-1) _info = Pard.Widgets.ProposalFieldTablePrinter[inputs[field].input](inputVal, field, inputs);
            else _info = inputVal[field];
            var _col = $('<td>').append(_info);
            _row.append(_col);
            _tbody.append(_row);
          });
        }
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
              if (_emailColumn){
                var columnData = _dataTable.column(_emailColumn, { search:'applied' }).data().unique();
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
          },
          {
            extend: 'collection',
            text:  Pard.Widgets.IconManager('export').render().attr('title', Pard.t.text('manager.export')),
            className: 'ExportCollectionBtn',
            autoClose: true,
            fade: 200,
            collectionLayout: 'button-list',
            buttons: [
            //para exportar tabla con todas las propuestas
              {
                extend: 'excel',
                text:'Excel',
                customizeData: function(doc) {
                  doc.header.forEach(function(t, i){
                    if (t.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) doc.header[i] = Pard.t.text('dictionary.category').capitalize()
                  });
                },
                exportOptions: {
                    columns: ':visible'
                },
                filename: Pard.t.text('dictionary.table').capitalize() + '-' + typeTable
              },
              {
                extend: 'pdf',
                text:'PDF',
                customize: function(doc) {
                  doc.content[1].table.body[0].forEach(function(colTitle){
                    if (colTitle.text.indexOf(Pard.t.text('dictionary.category').capitalize())>-1) colTitle.text = Pard.t.text('dictionary.category').capitalize();
                    colTitle.alignment = 'left';
                    colTitle.margin = [2,2,2,2];
                  }) 
                },
                exportOptions: {
                  columns: ':visible',
                },
                orientation: 'landscape',
                filename: Pard.t.text('dictionary.table').capitalize() + '-' + typeTable
              },
              {
                extend: 'copy',
                text: Pard.t.text('dictionary.copy').capitalize(),
                header: false,
                exportOptions: {
                  columns:  ':visible',
                }
              }
            ]
          }
        ]
      });

      if (!_emailColumn) _dataTable.button( '0' ).remove();

    }

    return _createdWidget
  }


  ns.Widgets.ShowRow = function(show, _columns, infoProgram, the_event){
    var _space = the_event.spaces[show.host_proposal_id].space;
    var _show = $.extend(true, {}, show);
    var _proposal = {};
    var participant = the_event.artists[show.participant_id]
    if(show.participant_proposal_id && participant.proposals[show.participant_proposal_id]) _proposal = participant.proposals[show.participant_proposal_id].proposal;
    var _proposalFields = ['title', 'short_description', 'children'];

    _show.participant_name = the_event.artists[show.participant_id].name;
    _show.participant_email = the_event.artists[show.participant_id].artist.email;
    _show.participant_phone = show.participant_phone || '';
    if (!_show.participant_phone && the_event.artists[show.participant_id].artist.phone) _show.participant_phone = the_event.artists[show.participant_id].artist.phone.value;
    if(show.participant_proposal_id) _proposalFields.forEach(function(field){
        _show[field] = show[field] || _proposal[field];
      });
    _show.participant_subcategory = show.participant_subcategory || _proposal.subcategory;
    _show.participant_other_categories = show.participant_other_categories;
    if(!_show.participant_other_categories && _proposal.other_categories) _show.participant_other_categories = _proposal.other_categories.map(function(c){
        return Pard.CachedForms['artist'][_proposal.form_id]['blocks']['other_categories'].args[0][c]
      }).join(', ');
    _show.participant_other = show.participant_other || _proposal.other;
    _show.host_name = _space.space_name;
    _show.host_email = _space.email;
    _show.host_phone = show.host_phone || _space.phone.value;
    _show.host_subcategory = _space.subcategory;
    _show.order = show.order || _space.index;
    _show.host_other_categories = show.host_other_categories;
    if(!_show.host_other_categories && _space.other_categories) _show.host_other_categories = _space.other_categories.map(function(c){
        return Pard.CachedForms['space'][_space.form_id]['blocks']['other_categories'].args[0][c]}
      ).join(', ');
    _show.host_other = show.host_other || _space.other;


    var _row = $('<tr>').attr('id', 'programTable-' + show.id_time);
    _columns.forEach(function(field){
      var _info = '';
      if(infoProgram[field] && infoProgram[field].info) _info = infoProgram[field].info(_show);
      else _info = _show[field];
      var _col = $('<td>').addClass('column-call-manager-table');
      _col.addClass('column-'+field);
      _row.append(_col);
      _col.append(_info);
    });

    return _row;
  }



}(Pard || {}));
