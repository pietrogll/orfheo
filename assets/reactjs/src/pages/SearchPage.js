import  React, { useState } from 'react'
import { BrowserRouter as Router, Route, NavLink, Switch } from 'react-router-dom';

import ProfilesSearchEngine from '../components/searchPage/ProfilesSearchEngine'
import ProductionsSearchEngine from '../components/searchPage/ProductionsSearchEngine'
import EventsSearchEngine from '../components/searchPage/EventsSearchEngine'
import SpacesSearchEngine from '../components/searchPage/SpacesSearchEngine'

import {Icon} from '../components/JQuery/jqueryComponents'


function SearchNavBar () {
	return <nav className='nav-bar-container__search-page'>
    <ul className='nav-bar__search-page'>
      <li>
        <NavLink 
          to='/search/profiles'
          activeClassName='nav-bar--link__active'
        > 
          <Icon 
            iconKey='profiles'
            className='nav-bar--icon__profiles'
          />
          <span 
            title={Pard.t.text('header.profiles')} 
            className='nav-bar--link'
          >
            {Pard.t.text('header.profiles')}
          </span>
        </NavLink>
      </li>
      <li>
        <NavLink 
          to='/search/proposals'
          activeClassName='nav-bar--link__active'
        >
          <Icon 
            iconKey='proposals'
            className='nav-bar--icon__proposals'
          />
          <span 
            title={Pard.t.text('header.proposals')} 
            className='nav-bar--link'
          >
            {Pard.t.text('header.proposals')}
          </span> 
        </NavLink>
      </li>
      <li>
        <NavLink 
          to='/search/spaces'
          activeClassName='nav-bar--link__active'
        >
          <Icon 
            iconKey='space'
            className='nav-bar--icon__spaces'
          />
          <span 
            title={Pard.t.text('header.spaces')} 
            className='nav-bar--link'
          >
            {Pard.t.text('header.spaces')}
          </span> 
        </NavLink>
      </li>
      <li>
        <NavLink 
          to='/search/events'
          
          activeClassName='nav-bar--link__active'
        >
          <Icon 
            iconKey='events'
            className='nav-bar--icon__events'
          />
          <span 
            title={Pard.t.text('header.events')} 
            className='nav-bar--link'
          >
            {Pard.t.text('header.events')}
          </span>
        </NavLink>
      </li>
    </ul>
  </nav>
}

function SearchRoutes () {

  const [profilesShown, setProfilesShown] = useState(false)
  const [productionsShown, setProductionsShown] = useState(false)
  const [spacesShown, setSpacesShown] = useState(false)
  const [eventsShown, setEventsShown] = useState(false)

  const setShownCatalog = {
    profiles: setProfilesShown,
    productions: setProductionsShown,
    spaces: setSpacesShown,
    events: setEventsShown
  }
  
  function toggleShow (key) {
    const catalog = {
      profiles: <ProfilesSearchEngine isShown={profilesShown} key={'profiles'}/>,
      productions: <ProductionsSearchEngine isShown={productionsShown} key={'productions'} />,
      spaces: <SpacesSearchEngine isShown={spacesShown}key={'spaces'} />,
      events: <EventsSearchEngine isShown={eventsShown} key={'events'} />
    }
    Object.keys(catalog).forEach((item) =>{
      if(key != item) setShownCatalog[item](false)
      else setShownCatalog[item](true)
    })
    return <React.Fragment>
        {Object.keys(catalog).map(item => catalog[item])}
      </React.Fragment>
  }
  return <Switch>
    <Route 
      path='/search/profiles' 
      render={()=>toggleShow('profiles')} 
    />
    <Route 
      path='/search/proposals' 
      render={()=>toggleShow('productions')} 
    />
     <Route 
      path='/search/spaces' 
      render={()=>toggleShow('spaces')} 
    />
     <Route 
      path='/search/events' 
      render={()=>toggleShow('events')} 
    />
  </Switch>
}


export default function SearchPage () {
	return (
		<Router>
      <React.Fragment>
       <SearchNavBar/>
        <div className='searchPage'>
          <Route 
            path='/search' 
            component={SearchRoutes} 
          />
        </div>
      </React.Fragment>
		</Router>
	)
}
