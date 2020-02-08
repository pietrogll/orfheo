import  React, { useState, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { ProfileCard } from '../JQuery/jqueryComponents'
import TitleSection from './TitleSection'
import { Loader } from '../JQuery/jqueryComponents'


export default function ProfilesSearchEngine (props) {

  const [profiles, setProfiles] = useState([])
  const isPulling = useRef(false);
  const pull_params = useRef(null);
  const pullNotCompleted = useRef(true);
   
  function pull () {
    if (isPulling.current == false) {
      isPulling.current = true
      Pard.Backend.loadResults(pull_params.current, 'profiles', null, function(data){
        isPulling.current = false
        pull_params.current = data.pull_params
        if (data.profiles.length > 0) setProfiles([...profiles, ...data.profiles])
        else{
          isPulling.current = true
          pullNotCompleted.current = false
          document.querySelector('#'+loaderId).innerHTML = ''
        }
      })
    }
  }

  const loaderId = 'loader'+(new Date).getTime().toString()
  const loader = <div id={loaderId} key={0}>
    <Loader />
  </div>

  function showHide () {
    const componentStyle = {}
    if (props.isShown){ 
      componentStyle['display'] =''
    }
    else {
      componentStyle['display'] = 'none'
    }
    return <div style={componentStyle}>
      <TitleSection titleText={Pard.t.text('searchPage.profiles.titleSection')}/>
      <InfiniteScroll
        pageStart={0}
        loadMore={pull}
        hasMore={pullNotCompleted.current}
        loader={loader}
        threshold={350}
      >
        <ul className='list__search-profiles'>
          {profiles.map( (profile,i) => 
            <li key={profile.id}>
              <ProfileCard 
                profile={profile}
              />
            </li>
          )}
        </ul>
      </InfiniteScroll>  
    </div>  
  }
  
  return (
    showHide()
  )
}
  
