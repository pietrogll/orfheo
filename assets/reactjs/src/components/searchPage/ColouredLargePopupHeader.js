import  React from 'react'
import {Icon} from '../JQuery/jqueryComponents'

export default function ColouredLargePopupHeader (props) {
  const headerStyle = {
    backgroundColor: Pard.Widgets.BackColor(props.color)
  }

  return (
    <div className='content-popup-header' style={headerStyle} >
      <h4 className='small-11'>
        {props.title}
      </h4>
    </div>
  )
}