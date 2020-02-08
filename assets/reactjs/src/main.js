require("babel-core/register")
require("babel-polyfill")

import  React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

$(document).ready( () => {
    ReactDOM.render(
      <App/>,
      document.getElementById('react-root')
    )
  }
)