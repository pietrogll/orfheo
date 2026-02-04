'use strict';

(function(ns){

  ns.Backend = (function(){

    var _send = function(url, data, callback, callbackFail){
      return $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: data,
        timeout: 300000,  // wait for 5 minutes ?? / putting 0 it would wait forever
        error: function(xhr, status, err){
          console.log('ERROR FOR ', url,  status, err.toString())
          console.log('xhr ', xhr)
        }
      })
      .done(function(data) {
        if (callback)
          callback(data);
      })
      .fail(function(data) {
        console.log("error");
        $('.spinner').remove();
        if (callbackFail){
          callbackFail();
        }
        else if (data.statusText == 'abort' ){ }
        else{
          Pard.Widgets.ErrorMessage();
        }
      });
    };

    var _get = function(url, data, callback, callbackFail){
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        data: data
      })
      .done(function(data) {
        if (callback)
          callback(data);
      })
      .fail(function() {
        console.log("error");
        $('.spinner').remove();
        if (callbackFail){
          callbackFail();
        }
        else{
          Pard.Widgets.ErrorMessage();
        }
      });
    };

// ============================================
//     USER
// =============================================



    var _register = function(email, password, notification, event_id, callback){
      _send(
        '/login/register',
        {
          email: email,
          password: password,
          lang: Pard.Options.language(),
          notification: notification, 
          event_id: event_id
        },
        callback
      );
    };

    var _deleteUser = function(callback){
      _send(
        '/users/delete_user',
        {},
        callback
      );
    };

    var _login = function(email, password, callback){
      _send(
        '/login/login',
        {
          email: email,
          password: password
        },
        callback
      );
    };

    var _passwordRecovery = function(email, callback){
      _send(
        '/login/forgotten_password',
        {
          email: email
        },
        callback
      );
    };

    var _logout = function(callback){
      _send(
        '/login/logout',
        {},
        callback
      );
    };

    var _modifyPassword = function(password, callback){
      _send(
        '/users/modify_password',
        {
          password: password
        },
        callback
      );
    };

    var _modifyLang = function(lang, callback){
      _send(
        '/modify_lang',
        {
          lang: lang
        },
        callback
      );
    };

    var _saveInterests = function(interests, callback){
      _send(
        '/users/save_interests',
        {
          interests: interests
        },
        callback
      );
    };




// ============================================
//   PROFILE
// =============================================


    var _createProfile = function(form, callback){
      _send(
        '/users/create_profile',
        form,
        callback
      );
    };

    var _modifyProfile = function(form, callback){
      _send(
        '/users/modify_profile',
        form,
        callback
      );
    };

    var _modifyProfileName = function(name, profile_id, callback){
      _send(
        '/users/modify_profile_name',
        {
          name: name,
          id: profile_id
        },
        callback
      );
    };

    var _modifyProfileDescription = function(new_description, profile_id, callback){
      _send(
        '/users/modify_profile_description',
        {
          description: new_description,
          id: profile_id
        },
        callback
        )      
    }

    var _deleteProfile = function(profile_id, callback){
      _send(
        '/users/delete_profile',
        {
          id: profile_id
        },
        callback
      );
    };

    var _checkName = function(name, profile_id, callback){
      return _send(
        '/users/check_name',
        {
          name: name,
          profile_id: profile_id
        },
        callback
      );
    }

    var _searchProfiles = function(tags, shown, event_id, callback){
      _send(
        '/search/results',
        {
          query: tags,
          shown: shown,
          event_id: event_id,
          lang: Pard.Options.language()
        },
        callback
      );
    };


    var _listProfiles = function(callback){
      _send(
        '/users/list_profiles',
        {},
        callback
      );
    }


    var _getProfileSpacesAndProductions = function(profile_id, event_id, callback){
      _send(
        '/users/profile_productions_spaces',
        {
          profile_id: profile_id,
          event_id: event_id
        },
        callback
        )
    }




// ============================================
//   PROPOSALS (productions)
// =============================================



    var _createProposal = function(form, callback){
      _send(
        '/users/create_production',
        form,
        callback
      );
    };

    var _modifyProposal = function(form, callback){
       _send(
        '/users/modify_production',
        form,
        callback
      );
    };

    var _deleteProposal = function(proposal_id, callback){
      _send(
        '/users/delete_production',
        {
          id: proposal_id
        },
        callback
      );
    };


// ============================================
//   FREE BLOCKS
// =============================================

 

    var _createFreeBlock = function(form, callback){
      _send(
        '/users/create_free_block',
        form,
        callback
        )      
    }

    var _modifyFreeBlock = function(form, callback){
      _send(
        '/users/modify_free_block',
        form,
        callback
        )      
    }

    var _deleteFreeBlock = function(free_blook_id, callback){
      _send(
        '/users/delete_free_block',
        {
          id: free_blook_id
        },
        callback
        )      
    }





// ============================================
//   SPACE
// =============================================



    var _createSpace = function(form, callback){
      _send(
        '/users/create_space',
        form,
        callback
        )
    }

    var _modifySpace = function(form, callback){
      _send(
        '/users/modify_space',
        form,
        callback
        )
    }

    var _deleteSpace = function(space_id, callback){
      _send(
        '/users/delete_space',
        {
          id: space_id
        },
        callback
        )
    }


// ============================================
//   EVENTS
// =============================================
  

    // var _getEventPageInfo = function(event_id, callback){}
  
    var _createEvent = function(form, callback){
      _send(
        '/users/create_event',
        form,
        callback
      );
    }


    var _modifyEvent = function(form, callback){
      _send(
        '/users/modify_event',
        form,
        callback
      );
    }

    var _deleteEvent = function(event_id, callback){
      _send(
        '/users/delete_event',
        {
          id: event_id
        },
        callback
      );
    }



    var _updatePartners = function(form, callback){
      _send(
        '/users/update_partners',
        form,
        callback
      );
    }

    var _events = function(callback){
      _get(
        '/events',
        {},
        callback
      );
    }


    var _eventManager = function(event_id, callback){
     _send(
        '/users/event_manager',
        {
          event_id: event_id,
          lang: Pard.Options.language()
        },
        callback
      );
    }





// ============================================
//   CALLS
// =============================================

  var _getCall = function(program_id,callback){
    _get(
      '/call',
      {
        id: program_id
      },
      callback
    )
  } 
  
  var _createCall = function(form, callback){
      _send(
        '/users/create_call',
        form,
        callback
      );
    }


    var _modifyCall = function(form, callback){
      _send(
        '/users/modify_call',
        form,
        callback
      );
    }


    var _deleteCall = function(call_id, callback){
      _send(
        '/users/delete_call',
        {
          id: call_id
        },
        callback
      );
    }
  




// ============================================
//   FORMS
// =============================================


    var _getCallForms = function(call_id, callback){
      _send(
        '/forms',
        {
          call_id: call_id,
          lang: Pard.Options.language()
        },
        callback
      );
    };


    var _getFormsByCallId = function(call_id, callback){
      _send(
        '/forms/get_call_forms',
        {
          call_id: call_id
        },
        callback
      );
    };


    var _createForm = function(form, callback){
      _send( 
        '/forms/create',
        form,
        callback
      );
    }


    var _modifyForm = function(form, callback){
      _send( 
        '/forms/modify',
        form,
        callback
      );
    }

    var _deleteForm = function(form_id, callback){
      _send( 
        '/forms/delete',
        {
          id: form_id
        },
        callback
      );
    }



// ============================================
//   PARTICIPANT
// =============================================

  
  var _modifyParticipant = function(form, callback){
    _send(
      'participant/modify',
      form,
      callback
    )

  }



// ============================================
//   CALL PROPOSALS
// =============================================

    var _modifyParamCallProposal = function(params, callback){
      // params -> id, profile_id, call_id, event_id, type, param, value
      _send(
        '/users/modify_param_proposal',
        params,
        callback
      );
    }

    var _getProposals = function(call_id, proposal_type, filters, callback){
      _send(
        '/users/get_call_proposals',
        {
          call_id: call_id,
          type: proposal_type,
          filters: filters
        },
        callback
      );
    }


    var _sendArtistProposal = function(form, callback){
      console.log(form)
      _send(  // OK
        '/users/send_artist_proposal',
        form,
        callback
      );
    };

    var _sendSpaceProposal = function(form, callback){
      _send( // OK
        '/users/send_space_proposal',
        form,
        callback
      );
    };

    var _sendArtistOwnProposal = function(form, callback){
      //OK
      if (form['profile_id']) form['profile_id'] = form['profile_id'].replace('-own','')
      form['own'] = true
      _send(
        '/users/send_artist_proposal',
        form,
        callback
      );
    };

    var _sendSpaceOwnProposal = function(form, callback){
      //OK
      if (form['profile_id']) form['profile_id'] = form['profile_id'].replace('-own','')
      form['own'] = true
      _send(
        '/users/send_space_proposal',
        form,
        callback
      );
    };

    var _amendArtistProposal = function(proposal_id, call_id, amend, callback){ //OK
      _send(
        '/users/amend_artist_proposal',
        {
          id: proposal_id,
          call_id: call_id,
          amend: amend
        },
        callback
      );
    };

    var _amendSpaceProposal = function(proposal_id, call_id, amend, callback){ //OK
      _send(  
        '/users/amend_space_proposal',
        {
          id: proposal_id,
          call_id: call_id,
          amend: amend
        },
        callback
      );
    };

    var _modifyArtistProposal = function(form, callback){
      // OK
      if (form['profile_id']) form['profile_id'] = form['profile_id'].replace('-own','')
      _send(
        '/users/modify_artist_proposal',
        form,
        callback
      );
    };

    var _modifySpaceProposal = function(form, callback){
      // OK
      if (form['profile_id']) form['profile_id'] = form['profile_id'].replace('-own','')
      _send(
        '/users/modify_space_proposal',
        form,
        callback
      );
    };

    var _deleteArtistProposal = function(proposal_id, call_id, event_id, callback){ //OK
      _send(
        '/users/delete_artist_proposal',
        {
          id: proposal_id,
          event_id: event_id,
          call_id: call_id
        },
        callback
      );
    };

    var _deleteSpaceProposal = function(proposal_id, call_id, event_id, callback){  //OK
      _send(
        '/users/delete_space_proposal',
        {
          id: proposal_id,
          event_id: event_id,
          call_id: call_id
        },
        callback
      );
    };


    var _selectSpaceProposal = function(proposal_id, call_id, event_id, callback){  //OK
      _send(
        '/users/select_space_proposal',
        {
          id: proposal_id,
          event_id: event_id,
          call_id: call_id
        },
        callback
      );
    };

    var _selectArtistProposal = function(proposal_id, call_id, event_id, callback){  //OK
      _send(
        '/users/select_artist_proposal',
        {
          id: proposal_id,
          event_id: event_id,
          call_id: call_id
        },
        callback
      );
    };




// ============================================
//   ACTIVITIES AND PROGRAMS
// =============================================

    var _getProgram = function(program_id,callback){
      _get(
        '/program',
        {
          id: program_id
        },
        callback
      )
    } 


    var _createProgram = function(form, callback){
      _send(
        '/users/create_program',
        form,
        callback
      );
    }


    var _modifyProgram= function(form, callback){
      _send(
        '/users/modify_program',
        form,
        callback
      );
    }


    var _deleteProgram = function(program_id, callback){
      _send(
        '/users/delete_program',
        {
          id: program_id
        },
        callback
      );
    }


    var _createPerformances = function(form, callback){ //OK
      form['program'] = form['program'].map(function(performance){
        if (performance['host_id']) performance['host_id'] = performance['host_id'].replace('-own','')
        if (performance['participant_id']) performance['participant_id'] = performance['participant_id'].replace('-own','')
        if(Pard.Widgets.IsBlank(performance.permanent)) performance.dateTime = [{date: performance.date, time: performance.time, id_time: performance.id_time}] 
        return performance
      })
      _send( // OK
        '/users/create_performances',
        form,
        callback
      );
    };

    var _modifyPerformances = function(form, callback){ // OK
      form['program'] = form['program'].map(function(performance){ 
        if (performance['host_id']) performance['host_id'] = performance['host_id'].replace('-own','')
        if (performance['participant_id']) performance['participant_id'] = performance['participant_id'].replace('-own','')
        if(Pard.Widgets.IsBlank(performance.permanent)) performance.dateTime = [{date: performance.date, time: performance.time, id_time: performance.id_time}] 
        return performance
      })
      _send(
        '/users/modify_performances',
        form,
        callback
      );
    };

    var _deletePerformances = function(form, callback){ // OK
      var ids = [];
      form['program'] = form['program'].filter(function(performance){if ($.inArray(performance.id, ids)<0){
          ids.push(performance.id);
          return true;
        }
        return false;
      }).map(function(performance){ 
        if (performance['host_id']) performance['host_id'] = performance['host_id'].replace('-own','')
        if (performance['participant_id']) performance['participant_id'] = performance['participant_id'].replace('-own','')
        return performance
      })
      _send(
        '/users/delete_performances',
        form,
        callback
      );
    };

    var _searchProgram = function(event_id, tags, filters, date, time, callback){
      _send(
        '/search/results_program',
        {
          event_id: event_id,
          query: tags,
          filters: filters,
          date: date,
          time: time,
          lang: Pard.Options.language()
        },
        callback
      );
    };

    var _searchProgramNow = function(event_id, callback){
      _send(
        '/search/program_now',
        {
          event_id: event_id
        },
        callback
      );
    };


    var _artistSubcategoriesPrice = function(program_id, event_id, subcategories_price, callback){
      _send(
        '/users/artist_subcategories_price',
        {
          id: program_id,
          event_id: event_id,
          subcategories_price: subcategories_price
        },
        callback
      )
    }

    var _setPermanentsTime = function(program_id, event_id, permanents, callback){
      _send(
        '/users/set_permanents',
        {
          id: program_id,
          event_id: event_id,
          permanents: permanents
        },
        callback
      )
    }


 


// ============================================
//   UTILS
// =============================================

    var _addWhitelist = function(call_id, event_id, name_email, email, callback){
      _send(
        '/users/add_whitelist',
        {
          call_id: call_id,
          event_id: event_id,
          name_email: name_email,
          email: email
        },
        callback
      );
    };

    var _deleteWhitelist = function(call_id, event_id, email, callback){
      _send(
        '/users/delete_whitelist',
        {
          call_id: call_id,
          event_id: event_id,
          email: email
        },
        callback
      );
    };

    var _saveOrder = function(program_id, event_id, order, callback){
     _send(
        '/users/space_order',
        {
          id: program_id,
          event_id: event_id,
          order: order
        },
        callback
      );
    }

    var _publish = function(program_id, event_id, callback){
     _send(
        '/users/publish',
        {
          id: program_id,
          event_id: event_id
        },
        callback
      );
    }


    var _checkParticipantName = function(name, call_id, program_id, participant_id, callback){
      return _send(
        '/users/checks_participant_name',
        {
          name: name,
          call_id: call_id,
          participant_id: participant_id,
          program_id: program_id
        },
        callback
      )
    }

    var _checkSlug = function(slug, callback){
      _send(
        '/users/check_slug',
        {
          slug: slug
        },
        callback
      );
    }

    var _createSlug = function(slug, event_id, callback){
      _send(
        '/users/create_slug',
        {
          slug: slug,
          event_id: event_id
        },
        callback
      );
    }

    var _getUserEmail = function(callback){
      _get(
        '/users/get_user_email',
        { },
        callback
      );
    }






// ============================================
//   MAILS
// =============================================


    var _openCallMail = function(form, callback){
      _send(
        '/admin/open_call_email',
        form,
        callback
        )
    }


    var _textMail = function(form, callback){
      _send(
        '/admin/send_email',
        form,
        callback
        )
    }


    var _feedback = function(name, email, message, callback){
      _send(
        '/feedback',
        {
          name: name,
          email: email,
          message: message
        },
        callback
      );
    }

    var _techSupport = function(name, email, subject, profile, browser, message, callback){
      _send(
        '/techSupport',
        {
          name: name,
          email: email,
          subject: subject,
          profile: profile,
          browser: browser,
          message: message
        },
        callback
      );
    }

    var _business = function(form, callback){
      _send(
        '/business',
        form,
        callback
      );
    }



// ============================================
//   SEARCH
// =============================================

  var _getPublicInfo = function (id, db_key, callback){
    _get(
      '/search/public_info',
      {
        id: id,
        db_key: db_key
      },
      callback
    );
  }

  var _loadResults = function(pull_params, db_key, query, callback){
    pull_params = pull_params || {first_half_results: true}
    query = query || {}
    _send(
      '/search/load_results',
      {
        pull_params: pull_params,
        db_key: db_key,
        query: query
      },
      callback
    );
  };




// ============================================
//   HEADER
// =============================================

    var _header = function(callback){
     _send(
        '/users/header',
        {},
        callback
      );
    }




// ============================================
//   ADMIN
// =============================================

    var _adminDeleteUser = function(emailObj, callback){
      _send(
        'admin/delete_user',
        emailObj,
        callback
        )
    }



    return {
      adminDeleteUser: _adminDeleteUser,
      register: _register,
      login: _login,
      passwordRecovery: _passwordRecovery,
      logout: _logout,
      modifyPassword: _modifyPassword,
      modifyLang: _modifyLang,
      createProfile: _createProfile,
      modifyProfile: _modifyProfile,
      modifyProfileName: _modifyProfileName,
      modifyParamCallProposal: _modifyParamCallProposal,
      sendArtistProposal: _sendArtistProposal,
      sendSpaceProposal: _sendSpaceProposal,
      sendArtistOwnProposal: _sendArtistOwnProposal,
      sendSpaceOwnProposal: _sendSpaceOwnProposal,
      createProposal: _createProposal,
      modifyProposal: _modifyProposal,
      deleteProposal: _deleteProposal,
      searchProfiles: _searchProfiles,
      searchProgram: _searchProgram,
      loadResults: _loadResults,
      getPublicInfo: _getPublicInfo,
      deleteArtistProposal: _deleteArtistProposal,
      deleteSpaceProposal: _deleteSpaceProposal,
      deleteProfile: _deleteProfile,
      deleteUser: _deleteUser,
      amendArtistProposal: _amendArtistProposal,
      amendSpaceProposal: _amendSpaceProposal,
      modifyArtistProposal: _modifyArtistProposal,
      modifySpaceProposal: _modifySpaceProposal,
      createPerformances: _createPerformances,
      modifyPerformances: _modifyPerformances,
      deletePerformances: _deletePerformances,
      addWhitelist: _addWhitelist,
      deleteWhitelist: _deleteWhitelist,
      saveOrder: _saveOrder,
      publish: _publish,
      eventManager: _eventManager,
      getCallForms: _getCallForms,
      getFormsByCallId: _getFormsByCallId,
      listProfiles: _listProfiles,
      events: _events,
      header: _header,
      checkName: _checkName,
      feedback: _feedback,
      techSupport: _techSupport,
      business: _business,
      checkSlug: _checkSlug,
      createSlug: _createSlug,
      getUserEmail: _getUserEmail,
      modifyProfileDescription: _modifyProfileDescription,
      createFreeBlock: _createFreeBlock,
      modifyFreeBlock: _modifyFreeBlock,
      deleteFreeBlock: _deleteFreeBlock,
      getProfileSpacesAndProductions: _getProfileSpacesAndProductions,
      createSpace: _createSpace,
      modifySpace: _modifySpace,
      deleteSpace: _deleteSpace,
      openCallMail: _openCallMail,
      textMail: _textMail,
      checkParticipantName: _checkParticipantName,
      selectArtistProposal: _selectArtistProposal,
      selectSpaceProposal: _selectSpaceProposal,
      getProposals: _getProposals,
      artistSubcategoriesPrice: _artistSubcategoriesPrice,
      setPermanentsTime: _setPermanentsTime,
      createEvent: _createEvent,
      modifyEvent: _modifyEvent,
      deleteEvent: _deleteEvent,
      updatePartners: _updatePartners,
      createCall: _createCall,
      modifyCall: _modifyCall,
      deleteCall: _deleteCall,
      createProgram: _createProgram,
      modifyProgram: _modifyProgram,
      deleteProgram: _deleteProgram,
      getCall: _getCall,
      getProgram: _getProgram,
      saveInterests: _saveInterests,
      createForm: _createForm,
      modifyForm: _modifyForm,
      deleteForm: _deleteForm,
      modifyParticipant: _modifyParticipant
    };
    
  }());

}(Pard || {}));

