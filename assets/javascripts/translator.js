'use strict';

var Options = function(){

  var localStorageKey = 'orfheo'
  var orfheoLangs = [
    'es',
    'ca',
    'en'
  ]
  
  var defaultLang = navigator.language || navigator.userLanguage

  if(defaultLang) defaultLang = defaultLang.substring(0,2)
  if ($.inArray(defaultLang, orfheoLangs) < 0) defaultLang = 'es'

  var orfheoStorage
  if (localStorage[localStorageKey]) orfheoStorage = JSON.parse(localStorage[localStorageKey])
  if (!orfheoStorage || !orfheoStorage.language || $.inArray(orfheoStorage.language, orfheoLangs) < 0){
    localStorage[localStorageKey] = JSON.stringify({
      language: defaultLang,
      cookies: false,
      register: {}
    })
    orfheoStorage = JSON.parse(localStorage[localStorageKey])
  }

  return {
    register: function(){
      return orfheoStorage.register
    },
    setRegister: function(info){
      orfheoStorage.register = info
      localStorage[localStorageKey] = JSON.stringify(orfheoStorage)
    },
    language: function(){
      return orfheoStorage.language
    },
    availableLangs: function(){
      return orfheoLangs;
    },
    defaultLanguage: function(){
      return orfheoLangs[0];
    },
    setLanguage: function(lang){
      Pard.Backend.modifyLang(lang, function(){
        orfheoStorage.language = lang
        localStorage[localStorageKey] = JSON.stringify(orfheoStorage)
        location.href = Pard.addQueryLang()
      })
    },
    storeLanguage: function(lang){
      orfheoStorage.language = lang
      localStorage[localStorageKey] = JSON.stringify(orfheoStorage)
      Pard.t.reload()
    },
    cookies: function(){
      return orfheoStorage.cookies
    },
    setCookies: function(){
      orfheoStorage.cookies = true
      localStorage[localStorageKey] = JSON.stringify(orfheoStorage)
    }
  }
}

Pard.Options = Options();

(function(ns){

  ns.Translator = function(language){

    var _text = function(key, interpolations){

      var translatedKey = key.split('.').reduce(function(prev, curr){
        if (prev == null || !prev.hasOwnProperty(curr))
          return null

        return prev[curr]
      }, language)

      // if ('string' != typeof translatedKey)
      //   translatedKey = key

      if (!interpolations)
        return translatedKey

      return translatedKey.replace(/%\{(.+?)\}/g, function(_, subkey){
        if (!interpolations.hasOwnProperty(subkey))
          return '_' + subkey + '_'

        return interpolations[subkey]
      })
    }

    return {
      text:_text,
      reload: function(){Pard.t = ns.Translator(ns.langs[Pard.Options.language()])}
    }
  }

  Pard.t = ns.Translator(ns.langs[Pard.Options.language()])

}(Pard || {}));
