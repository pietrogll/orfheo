import React from 'react'
import {LoginHeader, InsideHeader} from '../JQuery/jqueryComponents'

export default function Header () {

  if (Pard.UserStatus['status']==='outsider') 
    return (
      <div className='header__login-react'>
        <LoginHeader/>
      </div>
    )
  else
    return (
      <div className='header__inside-react'>
        <InsideHeader/>
      </div>
    )

}