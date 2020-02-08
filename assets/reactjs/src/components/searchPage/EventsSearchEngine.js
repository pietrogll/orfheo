import  React, { useState, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import EventsList from './EventsList'
import TitleSection from './TitleSection'
import { Loader } from '../JQuery/jqueryComponents'

export default function EventsSearchEngine (props) {

  const [events, setEvents] = useState([])
  const isPulling = useRef(false);
  const pull_params = useRef(null);
  const pullNotCompleted = useRef(true);
  
  
  function pull () {
    if (isPulling.current == false) {
      isPulling.current = true
      Pard.Backend.loadResults(pull_params.current, 'events', null, function(data){
        isPulling.current = false
        pull_params.current = data.pull_params
        if (data.events.length > 0) setEvents([...events, ...data.events])
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
    <Loader id={loaderId} key={0}/>
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
      <TitleSection titleText={Pard.t.text('searchPage.events.titleSection')}/>
      <InfiniteScroll
        pageStart={0}
        loadMore={pull}
        hasMore={pullNotCompleted.current}
        loader={loader}
        threshold={350}
      >
        <EventsList 
          events={events}
          stickPopupToTop={true}
        />
      </InfiniteScroll>    
    </div>
  }

  return (
    showHide()
  )

}
  
