'use strict';

(function(ns){
  ns.Widgets = ns.Widgets || {};

  function printTag(type, text, dimension){
    const tagContainer = $('<span>')
    Pard.ReactComponents.Mount(
      type, 
      {
        text: text, 
        dimension: dimension
      }, 
      tagContainer
    )
    return tagContainer
  }

  ns.Widgets.PrimaryTag = (text, dimension='normal') => printTag('PrimaryTag', text, dimension)

  ns.Widgets.SecondaryTag = (text, dimension='normal') => printTag('SecondaryTag', text, dimension)

  ns.Widgets.CategoryTag = (category, dimension='normal') => printTag('CategoryTag', category, dimension)

  // ns.Widgets.CategoryTag = (category, dimension='normal') => $('<span>')
  //   .append(
  //     Pard.Widgets.IconManager(category).render().addClass(`${category}-Icon-tag`),
  //     $('<span>').text(Pard.t.text('categories')[category])
  //   ).addClass(`rfh-tag secondary-tag ${dimension}-tag`)

}(Pard || {}));