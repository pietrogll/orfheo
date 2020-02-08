import  React, { useState, useEffect, useRef } from 'react'
import ProductionsList from './ProductionsList'
import TitleSection from './TitleSection'

export default function ProductionsSearchEngine () {

  const [productions, setProductions] = useState([])
  const stopPulling = useRef(false);
  const fillWithCards = useRef(true);
  const pull_params = useRef(null);
  const isInitialMount = useRef(true);

  useEffect( () => {
    pull()
    fillWithCards.current = true
  },[])
  
  useEffect( () => {
    if (fillWithCards.current && notScrollBar()) pull()
  })
  
  useEffect( () => {
    if (isInitialMount.current) isInitialMount.current = false
    else window.addEventListener('scroll', scrollPull)
    return () => {
      window.removeEventListener('scroll', scrollPull)
    }
  })

  function notScrollBar () {
    let hasScrollBar = $(document).height() > $(window).height()
    if (hasScrollBar) fillWithCards.current = false
    return !hasScrollBar
  }
  
  function pull () {
    if (stopPulling.current == false) {
      stopPulling.current = true
      Pard.Backend.loadResults(pull_params.current, 'productions', null, function(data){
        stopPulling.current = false
        pull_params.current = data.pull_params
        if (data.productions.length > 0) setProductions([...productions, ...data.productions])
        else stopPulling.current = true
      })
    }
  }

  function scrollPull () {
    if (stopPulling.current == false && isScrollCloseToBottom()){ 
      pull()
    }
  }

  function isScrollCloseToBottom () {
    return $('.list__search-productions').height() - $(window).height() - $(window).scrollTop() <= 300
  }

  return (
    <React.Fragment>
      <TitleSection titleText={Pard.t.text('searchPage.proposals.titleSection')}/>
      <ProductionsList productions={productions}/>
    </React.Fragment>
  )
}
