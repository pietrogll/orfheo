import  React, { useState, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import SpacesList from './SpacesList'
import TitleSection from './TitleSection'
import { Loader } from '../JQuery/jqueryComponents'


export default function SpacesSearchEngine (props) {

  const [spaces, setSpaces] = useState([])
  const isPulling = useRef(false);
  const pull_params = useRef(null);
  const pullNotCompleted = useRef(true);

  
  function pull () {
    if (isPulling.current == false) {
      isPulling.current = true
      Pard.Backend.loadResults(pull_params.current, 'spaces', null, function(data){
        isPulling.current = false
        pull_params.current = data.pull_params
        if (data.spaces.length > 0) setSpaces([...spaces, ...data.spaces])
        else {
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
      <TitleSection titleText={Pard.t.text('searchPage.spaces.titleSection')}/>
      <InfiniteScroll
        pageStart={0}
        loadMore={pull}
        hasMore={pullNotCompleted.current}
        loader={loader}
        threshold={350}
      >
        <SpacesList spaces={spaces}/>
      </InfiniteScroll>        
    </div>
  }

  return (
    showHide()
  )

}
