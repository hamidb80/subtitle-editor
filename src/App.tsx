import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Intro, Studio } from "./pages"

import "./styles/app.sass"

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