'use strict';


(function(ns){
  ns.Widgets = ns.Widgets || {};

  ns.Widgets.SelectorTableColumn = function(column, selectorOptions){

    if (column.data().unique().length>1 || selectorOptions){
      var _selector = $('<select>');
      var _selectContainer = $('<div>').addClass('select-container-datatableColumn');
      _selector
        .append(
          $('<option>').attr('value','').text('')
        )
        .appendTo(
          _selectContainer
            .appendTo(
              $(column.header())
            )
        );
      if (selectorOptions) selectorOptions.forEach(function(opt){_selector.append( '<option value="'+opt+'">'+opt+'</option>' )});
      else column.data().unique().sort().each( function ( d, j ) {_selector.append( '<option value="'+d+'">'+d+'</option>' )});
      
      _selector.on( 'change', function () {
        var val = $.fn.dataTable.util.escapeRegex(
            _selector.val()
        );
        column.search( val ? '^'+val+'$' : '', true, false ).draw();
      });
      _selector.click(function(e){
        e.stopPropagation();
      });
    }
  }

  ns.Widgets.CheckBoxFilter = function(colTosearch, label) {
    var _checkBox = $('<input>')
      .attr({ type: 'checkbox', 'value': true})
      .on('change', function(){
        var val = '';
        if(_checkBox.is(":checked")) val = Pard.t.text('dictionary.yes');
       colTosearch.search(val).draw(); 
      });
    var _labelCkbx = $('<label>')
      .html(label)
      .css({'display':'inline', 'cursor':'pointer'})
      .on('click', function(){
        _checkBox.trigger('change');
      });
   
    var _filtersContainer = $('<div>').append(
      $('<span>').append(_checkBox, _labelCkbx))         
    return _filtersContainer;
  }

}(Pard || {}));
  