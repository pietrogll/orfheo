import  React from 'react'
import ColouredLargePopupHeader from './ColouredLargePopupHeader'
import { Icon, Owner } from '../JQuery/jqueryComponents'
import CloudinaryImage from '../ReactImage';
import PersonalButton from '../PersonalButton';
import DateTimeCalendarElement from '../DateTimeCalendarElement';
import { PrimaryTag, SecondaryTag, CategoryTag } from '../designElements/Tags';


export default function EventPopupContent ({ event, isOwner, blockToUpdate, pastEvent }) {

  let  headerButtons;
  if (isOwner && !pastEvent){
    headerButtons = <div className='header-popup-btns'>
      <button 
        type='button' 
        className='deleteProfileComponentBtn'
        onClick={() => Pard.Widgets.DeleteEventItem(event.id, blockToUpdate)}  
      >
        <Icon iconKey='delete'/>
      </button>
      <button 
        type='button' 
        className='modifyProfileComponentsBtn'
        onClick={() => Pard.Widgets.ModifyEventItem(event, blockToUpdate)}
      >
        <Icon iconKey='modify'/>
      </button>
    </div>
  }

  const tagsBlock = <div className='popup-aside-block'>
    <div style={{marginBottom: '-.8rem'}}>
      <PrimaryTag 
        text={Pard.t.text(`event_type.${event.type}`)}
        key='type'
      />
      {event.categories.artist.map(category => 
        <CategoryTag 
          text={category}
          key={category}
        />
      )}
    </div>
  </div>

  let addressToLink = 'https://maps.google.com/maps?q=';
  if (event['address']['route'] && event['address']['street_number']) addressToLink += event['address']['route']+' '+event['address']['street_number']+', ';
  addressToLink += event['address']['locality']+' '+event['address']['postal_code'];
  const calendar = event.eventTime.map( evt => <DateTimeCalendarElement key={evt.time[0]} {...evt} />)
  const infoBlock = <div className='popup-aside-block'>
    <div>
      <Icon iconKey='location' className='information-contact-icon-column'/>
      <a href={addressToLink} target='_blank'>
        {event.place.capitalize()}
      </a>
    </div>
    <div style={{marginTop: '.5rem'}}>
      <Icon iconKey='calendar' className='information-contact-icon-column'/>
      <div className='eventPopup__calendar'> 
        {calendar}
      </div>
    </div>
  </div>

  const owner = {
    id: Pard.CachedProfile.id || event.profile_id,
    name: Pard.CachedProfile.name || event.profile_name,
    color: Pard.CachedProfile.color || event.color,
    isProfilePage: Object.keys(Pard.CachedProfile).length > 0
  }

  const ownerBlock = <div className='popup-aside-block'>
     <Owner owner={owner} />
  </div>

  let description, baseline, buttons = ''
  if (event.texts && Object.keys(event.texts).length > 0){
    const textLang = Object.keys(event.texts)[0]
    const text = event.texts[textLang]
    description =text.description
    baseline =text.baseline
    if(text.buttons && Object.keys(text.buttons).length > 0){
      buttons = Object.keys(text.buttons).map( buttonKey => 
        <PersonalButton
          key={buttonKey} 
          button={text.buttons[buttonKey]} 
          buttonClass='aside-personal-btn' 
        />
      )
    }
  }
  const descriptionBlock = <div className='popup-main-block'>
    <h6 className='eventPopup__baseline'>
      {baseline}
    </h6>
    <div 
      dangerouslySetInnerHTML={{__html: description}}
      className='information-info'
    />
  </div>
   let buttonsBlock
   if(buttons) buttonsBlock = <div className='popup-aside-block'>
       {buttons}
   </div>


  let imageBlock 
  if (event.img && event.img.length > 0){
    imageBlock = <div className='popup-main-block'>
      <div className='eventPopup__image'>
        <CloudinaryImage publicId={event.img[0]} imgSetting={{width:'315', effect:'saturation:50'}} />
      </div>
    </div>
  }
	  

  const aside = <div className='content-popup-aside'>
    {tagsBlock}
    {infoBlock}
    {buttonsBlock}
    {ownerBlock}
  </div>
  const vLine = <div className='v-line-content-popup'></div>
	const main = <div className='content-popup-main'>
    {descriptionBlock}
    {imageBlock}
  </div>

  const contentStyle = {
    'position': 'relative',
    'height': '100%'
  };
  const content = <div style={contentStyle}>
    {aside}
    {vLine}
    {main}
  </div>
		
	return (
    <div>
      <ColouredLargePopupHeader
        title={event.name}
        color={event.color}
      />
      {headerButtons}
      {content}   
    </div>
  )
}