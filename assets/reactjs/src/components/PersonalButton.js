import  React from 'react'

export default function PersonalButton ( { button, buttonClass='buttonFromAtag' } ) {

  const buttonProps = {}

  if (button.link){ 
    buttonProps.href = button.link
    buttonProps.target = '_blank'
  }
  if (button.tooltip) buttonProps.title =  button.tooltip

  return <a className={buttonClass} {...buttonProps}>
    {button.text}
  </a>

}