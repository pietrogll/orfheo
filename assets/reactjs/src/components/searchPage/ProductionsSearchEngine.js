import  React, { useState, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import ProductionsList from './ProductionsList'
import TitleSection from './TitleSection'
import { Loader } from '../JQuery/jqueryComponents'

export default function ProductionsSearchEngine (props) {

  const [productions, setProductions] = useState([])
  const isPulling = useRef(false);
  const pull_params = useRef(null);
  const pullNotCompleted = useRef(true);
  
  function pull () {
    if (isPulling.current == false) {
      isPulling.current = true
      Pard.Backend.loadResults(pull_params.current, 'productions', null, function(data){
        isPulling.current = false
        pull_params.current = data.pull_params
        if (data.productions.length > 0) setProductions([...productions, ...data.productions])
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
      <TitleSection titleText={Pard.t.text('searchPage.proposals.titleSection')}/>
      <InfiniteScroll
        pageStart={0}
        loadMore={pull}
        hasMore={pullNotCompleted.current}
        loader={loader}
        threshold={350}
      >
        <ProductionsList productions={productions}/>
      </InfiniteScroll>    
    </div>
  }

  return (
    showHide()
  )
}
