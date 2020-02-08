import  React, { useState, useEffect } from 'react'
import Modal from 'react-foundation-modal'
 
export default function Popup (props) {

  const [popupContentClass, setPopupContentClass] = useState('')
  const popupId = (new Date).getTime()
  
  useEffect( () => {
    if (props.isPopupOpen == true){
      const htmlEl = document.getElementsByTagName('HTML')[0]
      htmlEl.classList.add('overflowHidden')
      const contentClass = props.contentClass || 'popup-container-full'
      setPopupContentClass(`popup-content-container ${contentClass}`)
    }
    window.addEventListener('click', closePopupOnBackgroundClick)
    return () => {
      window.removeEventListener('click', closePopupOnBackgroundClick)
    }
  })

  function closePopupOnBackgroundClick (e) {
    if (props.isPopupOpen == true){
      const elementClasses = e.target.classList
      const isBackgroundClick = elementClasses.contains(popupId)
      if (isBackgroundClick) closePopup()
    }
  }

  function closePopup () {
    const htmlEl = document.getElementsByTagName('HTML')[0]
    htmlEl.classList.remove('overflowHidden')
    document.getElementsByTagName('HTML')[0].classList
    props.showPopup(false) 
  }

  let innerClass = `vcenter-inner ${popupId}`
  if (props.stickToTop) innerClass += " stick-to-top"

  return (
      <Modal 
        open={props.isPopupOpen}
        closeModal={props.showPopup}
        isModal={true}
        size='full'
        hideCloseButton={true} 
      > 
        <div className='vcenter-outer'>
          <div className={innerClass}>
            <div className={popupContentClass}>
              <button className='close-button small-1 popup-close-btn' type='button' onClick={closePopup} >
                <span>&times;</span>
              </button>
              {props.children}
            </div>
          </div>
        </div>
      </Modal>  
    );
}
 