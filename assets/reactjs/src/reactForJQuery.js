import  React from 'react'
import ReactDOM from 'react-dom'

import EventsList from './components/searchPage/EventsList'
import EventPopupContent from './components/searchPage/EventPopupContent'
import { PrimaryTag, SecondaryTag, CategoryTag } from './components/designElements/Tags'

function Catalog (key, props) {
  let catalog = {
	  'EventsList': <EventsList {...props}/>,
    'EventPopupContent': <EventPopupContent {...props}/>,
    'PrimaryTag': <PrimaryTag {...props}/>,
    'SecondaryTag': <SecondaryTag {...props}/>,
    'CategoryTag': <CategoryTag {...props}/>
  }
  return catalog[key]
}

Pard.ReactComponents.Mount = (reactComponentName, props, JQueryMountingElement) => {
  let reactComponent = Catalog(reactComponentName, props)
  $(document).ready( () => {
    ReactDOM.render(
      reactComponent,
      JQueryMountingElement[0]
    );
  })
}
