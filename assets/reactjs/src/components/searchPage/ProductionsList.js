import  React, { useState } from 'react'
import {ProductionCard, ProductionPopupContent} from '../JQuery/jqueryComponents'
import Popup from '../Popup'
import ColouredLargePopupHeader from './ColouredLargePopupHeader'

export default function ProductionsList ({productions}) {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupContent, setPopupContent] = useState('')

  function showPopup (status, production) {
    if (isPopupOpen !== status) setIsPopupOpen(status)
    if (status === true && production){
      setPopupContent(
        <div>
          <ColouredLargePopupHeader
            title={production.title}
            color = {production.profile_color}
            iconKey = {production.category}
          />
          <ProductionPopupContent production={production}/>
        </div>
      )
    }
  }

  return (
    // <ul className='tracks list__search-productions'>
    //  {productions.map( (production) => 
    //     <li key={production.id} onClick={
    //       (e) => {
    //         e.preventDefault()
    //         showPopup(true, production)
    //       }}>
    //       <ProductionCard 
    //         production={production}
    //       />
    //     </li>
    //   )}
      // <Popup
      //   isPopupOpen={isPopupOpen}
      //   showPopup={showPopup}
      //   contentClass={'popup-container-full-large popup-stick-top'}
      //   stickToTop={true}
      // >
      //   {popupContent}
      // </Popup>
    // </ul>
    <div className='tracks list__search-productions'>
      {productions.map( (production) => 
        <div className='track' key={production.id} onClick={
          (e) => {
            e.preventDefault()
            showPopup(true, production)
          }}>
            <ProductionCard 
              production={production}
            />
        </div>
      )}
      <Popup
        isPopupOpen={isPopupOpen}
        showPopup={showPopup}
        contentClass={'popup-container-full-large popup-stick-top'}
        stickToTop={true}
      >
        {popupContent}
      </Popup>
    </div>
  )
}