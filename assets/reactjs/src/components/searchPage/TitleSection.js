import  React from 'react'

export default function TitleSection ({titleText}) {
  return (
    <div className='titleSection'>
      <div className='titleSection--inner-div'>
        <h2>
          {titleText}
        </h2>
      </div>
    </div>
  )
}