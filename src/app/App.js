import Expo from 'expo'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import getStore from '../store/createStore'
import Splash from '../views/splash/Splash'
import { initDB } from './firebaseApp'

const store = getStore

class App extends Component {
  constructor () {
    super()
    this.state = {
      fontsAreLoaded: false
    }
  }

  componentWillMount () {
    initDB();
    this.setState({ fontsAreLoaded: true })
  }

  render () {
    if (this.state.fontsAreLoaded) {
      return (
        <Provider store={store}>
          <Splash />
        </Provider>)
    }
    return (<Expo.AppLoading />)
  }
}

export default App
