'use strict';

(function(ns){

  ns.Widgets = ns.Widgets || {};  

  ns.Widgets.CardHelper = function(proposal){
    var color = Pard.Widgets.CategoryColor(proposal.subcategory);
    var duration = ((parseInt(proposal.duration)/60 * Pard.HourHeight) + 2) || Pard.PermanentCardHeight;
    var _width = Pard.ColumnWidth;
    if(_width > 176 * 2) _width = 176 * 2; 

    var _card =$('<div>').addClass('dragging-card-call-manager').css({
      'width': _width,
      'height': duration,
      'border-color':color,
      'cursor': 'move'
    });
    var _title = $('<p>').addClass('proposal-title-card-call-manager').append($('<a>').attr('href','#/').text(Pard.Widgets.CutString(proposal.title, 35)).removeClass('cursor_move').addClass('cursor_move'));
    _card.append(_title.css({
      'position': 'absolute',
      })
    );

    return {
      render: function(){
        return _card;
      }
    }
  }

  ns.Widgets.SpaceHelper = function(spaceCol){
    var _spaceCol = spaceCol.clone();

    _spaceCol.find('.programHelper').css({
      left: '-=' + (spaceCol.position().left + 1)
    });

    return {
      render: function(){
        return _spaceCol;
      }
    }
  }

}(Pard || {}));