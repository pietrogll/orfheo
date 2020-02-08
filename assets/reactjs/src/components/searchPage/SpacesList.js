import  React, { useState } from 'react'
import {SpaceCard, SpacePopupContent} from '../JQuery/jqueryComponents'
import Popup from '../Popup'
import ColouredLargePopupHeader from './ColouredLargePopupHeader'

export default function SpacesList ({spaces}) {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupContent, setPopupContent] = useState('')

  function showPopup (status, space) {
    if (isPopupOpen !== status) setIsPopupOpen(status)
    if (status === true && space){
      setPopupContent(
        <div>
          <ColouredLargePopupHeader 
            title={space.name}
            color={space.profile_color}
          />
          <SpacePopupContent space={space}/>
        </div>
      )
    }
  }
 
  return (
    <ul className='tracks list__search-spaces'>
     {spaces.map( (space) => 
        <li className='track' key={space.id} onClick={
          (e) => {
            e.preventDefault()
            showPopup(true, space)
          }}>
          <SpaceCard 
            space={space}
          />
        </li>
      )}
      <Popup
        isPopupOpen={isPopupOpen}
        showPopup={showPopup}
        contentClass={'popup-container-full-large popup-stick-top'}
        stickToTop={true}
      >
        {popupContent}
      </Popup>
    </ul>
  )
}