import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Intro, Studio , Help} from "./pages"

import "./global.sass"

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path='/' component={Intro}></Route>
        <Route exact path='/studio' component={Studio}></Route>
        <Route exact path='/help' component={Help}></Route>
      </Router>
    )
  }
}

export default App