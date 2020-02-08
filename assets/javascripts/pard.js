var Pard = {}
Pard.UserInfo = {}

// Force https: protocol (only in production --> develpment do not works with https)
if (window.location.hostname != "localhost" && window.location.protocol != 'https:')
{
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

Pard.addQueryLang = function() {   
  return URI(document.location).removeSearch('lang').addSearch("lang", Pard.Options.language());
};
