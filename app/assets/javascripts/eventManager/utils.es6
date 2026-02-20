'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};  

  ns.ColumnWidth = 176;
  ns.HourHeight = 60;
  ns.PermanentCardHeight = 62;

  ns.Widgets.Programations = function(){
    var programations = {}
    return {
      add:function(id, dt){
        programations[id] = programations[id] || [];
        programations[id].push(dt);
      },
      remove:function(id, id_time){
        if(programations[id]){
          var index = programations[id].map(function(e){return e.id_time;}).indexOf(id_time);
          if (index > -1) programations[id].splice(index, 1);
        }
      },
      get: function(id){
        return Pard.Widgets.ReorderProgramCrono(programations[id]);
      },
      set: function(id, new_programations){
        programations[id] = new_programations;
      },
      delete: function(id){
        delete programations[id]        
      }
    }
  }

  Pard.Programations = Pard.Widgets.Programations();

  

  ns.Widgets.FormatResource = function(resource) {
    var _label = $('<span>').text(resource.text);

    if(resource.icon){
      var _icon = $('<span>')
      if ($.isArray(resource.icon)) 
        resource.icon.forEach(function(icon){
          _icon.append(Pard.Widgets.IconManager(icon).render().addClass('iconCategory-select2'))
        })
      else _icon = Pard.Widgets.IconManager(resource.icon).render().addClass('iconCategory-select2');
      _label.append(_icon);
    }
    return _label;
  }



  ns.Widgets.CategoryColor = function(sub_category){

    var _dictionary = {
      '1': '#3399FF',
      '2': '#FF62B2',
      '3': '#994C00',
      '4': '#B66BB9',
      '5': '#66CC00',
      '6': '#FF3333',
      '7': '#FFFF00',
      '8': '#C0C0C0',
      '9': '#FF8000',
      '10': '#66CC00',
      '11':'#01D9FF',
      '12':'#44872C',
      '13':'#756D06',
      '14':'#F6ED7D'
    }

    var _default = '#BDC7B8';
    var _color = _dictionary[sub_category] || _default;

    return _color;
  }

  ns.Widgets.DictionaryColor = function(the_event){
    var spaceCategories = the_event.subcategories.space; 
    var _dictionaryColor = {};
    var _library = [
      'rgb(240, 239, 179)',
      'rgb(196, 245, 239)', 
      'rgb(218, 227, 251)',
      'rgb(238, 212, 246)', 
      'rgb(198, 128, 93)', 
      'rgb(147, 135, 219)', 
      'rgb(154, 219, 135)', 
      'rgb(135, 191, 219)',
      'rgb(92, 152, 237)', 
      'rgb(237, 92, 174)'
    ];
    Object.keys(spaceCategories).forEach(function(cat, index){
      if (_library[index]) _dictionaryColor[cat] = _library[index];
      else _dictionaryColor[cat] = '#f6f6f6';
    });
    return _dictionaryColor;
  }


  ns.Widgets.ReorderProgram = function(performances){
    var _compare = function (a,b) {
      if (a.time[0] < b.time[0]) return -1;
      if (a.time[0] > b.time[0]) return 1;
      if (a.time[0] == b.time[0]){
        if (a.time[1] < b.time[1]) return 1;
        if (a.time[1] > b.time[1]) return -1;
      }
      return 0;
    }
    var performancesNotPermanent = [];
    performances.forEach(function(perform){
      if (perform.permanent == 'false') performancesNotPermanent.push(perform); 
    });
    return performancesNotPermanent.sort(_compare);
  }

  ns.Widgets.ReorderProgramCrono = function(performances){
    var _compare = function (a,b) {
      if(a.permanent == 'true' && b.permanent == 'false' && a.date == b.date) return 1;
      if(a.permanent == 'false' && b.permanent == 'true' && a.date == b.date) return -1;
      if (a.time[0] < b.time[0]) return -1;
      if (a.time[0] > b.time[0]) return 1;
      if (a.time[0] == b.time[0]){
        if (a.time[1] < b.time[1]) return -1;
        if (a.time[1] > b.time[1]) return 1;
      }
      return 0;
    }
    return performances.sort(_compare);
  }

  ns.Widgets.TimeManager = function(eventTime){
    var startHour = 0;
    var endHour = 0;
    var endDate = false;
    eventTime.forEach(function(evt, index){
      var day = evt.date;
      var dayTime = evt.time;
      if(index == 0){
        startHour = new Date(parseInt(dayTime[0])).getHours();
        endHour = new Date(parseInt(dayTime[1])).getHours();
      }
      var start = new Date(parseInt(dayTime[0]));
      var end = new Date(parseInt(dayTime[1]));
      var minHour = start.getHours();
      var maxHour = end.getHours();
      if(end.getMinutes() > 0) maxHour += 1;

      if(minHour < startHour) startHour = minHour;
      if(endDate == false){
        if(start.getDate() != end.getDate()){
          endDate = true;
          endHour = maxHour;
        }
        else{if(maxHour > endHour) endHour = maxHour;}
      }
      if(endDate == true && start.getDate() != end.getDate()){
        if(maxHour > endHour) endHour = maxHour; 
      }
    });

    //Amount of hours in our day
    var hourSpan = endHour - startHour;
    if(endHour < startHour) hourSpan = 24 - startHour + endHour;
    var hours = [];
    if(endHour < startHour){
      for (var i = startHour; i < 24; i++) {hours.push(i);}
      for (var i = 0; i <= endHour; i++) {hours.push(i);}
    }
    else{
      for (var i = startHour; i <= endHour; i++) {hours.push(i);}
    }

    eventTime.forEach(function(evt, index){
      // if(day == 'permanent') return;
      var tempTime = [];
      var dayTime = evt.time;
      tempTime[0] = new Date(parseInt(dayTime[0]));
      tempTime[0].setHours(startHour);
      tempTime[0].setMinutes(0);
      tempTime[0] = tempTime[0].getTime();
      tempTime[1] = new Date(parseInt(dayTime[0]));
      tempTime[1].setHours(startHour + hourSpan);
      tempTime[1].setMinutes(0);
      tempTime[1] = tempTime[1].getTime();
      evt.time = [tempTime[0], tempTime[1]];
    });

    return{
      hours: hours,
      eventTime: eventTime
    }
  }

  ns.Widgets.GetEventParticipantNames = function(the_event){
    const _participants_names = [...Object.keys(the_event['artists']).map(artist_id => the_event['artists'][artist_id].name()), ...Object.keys(the_event['spaces']).map(space_id => the_event['spaces'][space_id]['space']['name'])]
    return _participants_names;
  } 

}(Pard || {}));