import  React from 'react'
import { Icon } from '../JQuery/jqueryComponents'

function PrimaryTag({ text, dimension='normal' }) {
  return <span className={`rfh-tag primary-tag ${dimension}-tag`}> {text} </span>
}

function SecondaryTag({ text, dimension='normal' }) {
  return <span className={`rfh-tag secondary-tag ${dimension}-tag`}> {text} </span>
}

function CategoryTag({ text, dimension='normal' }) {
  return <span className={`rfh-tag secondary-tag ${dimension}-tag`}> 
    <Icon iconKey={text} className={`${text}-Icon-tag`}/>
    <span> {Pard.t.text('categories')[text]} </span>
  </span>
}
 
export { PrimaryTag, SecondaryTag, CategoryTag }