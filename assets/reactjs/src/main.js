import 'core-js/stable';
import 'regenerator-runtime/runtime';

import  React from 'react' // Important for JSX support
import ReactDOM from 'react-dom'
import App from './App'

$(document).ready( () => {
    ReactDOM.render(
      <App/>,
      document.getElementById('react-root')
    )
  }
)