import  React from 'react'
import SearchPage from './pages/SearchPage'
import { Footer } from './components/JQuery/jqueryComponents'
import Header from './components/layout/Header'

export default function App () {
  return (
    <React.Fragment>
      <Header/>
      <main>
        <SearchPage/>
      </main>
      <Footer/>
    </React.Fragment>
  )
}