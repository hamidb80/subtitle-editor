import React from 'react'
import {BrowserRouter as Router, Route } from 'react-router-dom'

import Intro from "./pages/Intro"
import Studio from "./pages/Studio"

import "./styles/app.sass"
import "./styles/font-awesome/all.css"
import "./styles/font-awesome/fontawesome.css"

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path='/' component={Intro}></Route>
        <Route exact path='/studio' component={Studio}></Route>
      </Router>
    )
  }
}

export default App