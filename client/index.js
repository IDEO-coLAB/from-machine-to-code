import React from 'react'
import ReactDOM from 'react-dom'
import thunkMiddleware from 'redux-thunk'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import AppContainer from './containers/AppContainer'
// import { circuitsReducer } from './reducers/circuitReducer'

// import css
import './styles/main.scss'

const appReducer = combineReducers({
  // circuits: circuitsReducer
})

const createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore)
const appStore = createStoreWithMiddleware(appReducer)

ReactDOM.render(
  <Provider store={ appStore }>
    <AppContainer />
  </Provider>,
  document.getElementById('app')
)