import  React, { useState } from 'react'
import { EventCard } from '../JQuery/jqueryComponents'
import Popup from '../Popup'
import EventPopupContent from './EventPopupContent';

export default function EventsList (props) {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [popupContent, setPopupContent] = useState('')
	
  const listClass = props.listClass || 'list__search-events'

  if (Pard.Bus.callbacks().modifyEvent){
    Pard.Bus.callbacks().modifyEvent = []
  } 
  Pard.Bus.on('modifyEvent', event  => {
    if(!isPopupOpen) showPopup(true, event)
  })

  function showPopup (status, event) {
    if (isPopupOpen !== status) setIsPopupOpen(status)
    if (status === true && event){
      setPopupContent(
        <EventPopupContent 
          event={event}
          isOwner={props.isOwner}
          blockToUpdate={props.blockToUpdate}
        />
      )
      Pard.Backend.getPublicInfo(
        event.id,
        'events',
        (data) => {
          if (data.status == 'success') {
            const event = data.db_element
            setPopupContent(
              <EventPopupContent 
                event={event}
                isOwner={props.isOwner}
                blockToUpdate={props.blockToUpdate}
              />
            )
          }
        }
      )
    }
	}
	
	function eventCardListItem (event) {

		let eventCard;
		if (event.professional.is_true()){
			eventCard = <li 
				key={event.id}  
			>
				<EventCard event={event}/>
			</li>
		}
		else{
			eventCard = <li 
				key={event.id}  
				onClick={ (e) => {
					e.preventDefault()
					showPopup(true, event)
				}}
			>
				<EventCard event={event}/>
			</li>
		}
		return eventCard;
	}

  return (
    <ul className={listClass}>
      {props.events.map( (event) => 	
        eventCardListItem(event)
      )}
      <Popup
        isPopupOpen={isPopupOpen}
        showPopup={showPopup}
        contentClass={'popup-container-full-large popup-stick-top'}
        stickToTop={props.stickPopupToTop}
      >
        {popupContent}
      </Popup>
    </ul>
  )
}