import React, {Component} from 'react'
import { connect } from 'react-redux'
import R from 'ramda'

import { generateTranslationAnimation, insertAnimations } from './../utils/utils'
import { SETTINGS } from './../constants/settings'
import { CONN_ON, CONN_ALERT_ON, CONN_OFF, SCENE_NODE } from './../constants/constants'
import { non, nalon, con, calon, coff } from './../reducers/actions'

const isNode = R.propEq('type', SCENE_NODE)

const CONN_STATES = {
  AVAILABLE: 'AVAILABLE',
  ACTIVATING: 'ACTIVATING',
  DEACTIVATING: 'DEACTIVATING',
}

function mapStateToProps(state) {
  return {
    sceneNodes: R.filter(isNode, state.scenes.scenes[state.scenes.activeScene].objects)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    propagateToOutputNode: (nodeId, isAlert) => {
      const func = isAlert ? nalon(nodeId) : non(nodeId)
      dispatch(func)

    },
    deactivate: (connectionId) => {
      dispatch(coff(connectionId))
    },
    activate: (connectionId, isAlert) => {
      const func = isAlert ? calon(connectionId) : con(connectionId)
      dispatch(func)
    }
  }
}

class NodeConnection extends Component {
  constructor() {
    super()
    this.keyframe = null
    this._isAlert = false
    this._currentState = CONN_STATES.AVAILABLE
  }

  // get isAvailable() {
  //   return this.__isAvailable
  // }

  // set isAvailable(bool) {
  //   return this.__isAvailable = bool
  // }

  // get isAlert() {
  //   return this._isAlert
  // }

  // set isAlert(bool=false) {
  //   return this._isAlert = bool
  // }

  componentWillMount() {
    this.keyframe = generateTranslationAnimation(
      this.props.x1,
      this.props.y1,
      this.props.x2,
      this.props.y2,
      SETTINGS.timeouts.connectionOn/1000)
    insertAnimations(this.keyframe.keyframeRule)
  }

  componentDidUpdate(prevProps) {
    const id = this.props.id

    const outputNode = R.head(R.filter((node) => {
      return node.id === this.props.outputId
    }, this.props.sceneNodes))

    const prevConnState = prevProps.state

    const wasOff = prevConnState === CONN_OFF
    const wasOn = prevConnState !== CONN_OFF

    const nowOff = this.props.state === CONN_OFF
    const nowOn = this.props.state !== CONN_OFF

    if (wasOff && nowOn) {
      if (this._currentState !== CONN_STATES.AVAILABLE) return
      this._isAlert = R.equals(this.props.state, CONN_ALERT_ON)
      this.props.activate(id, this._isAlert)
      // console.log('Conn on:', id, 'isAlert:', this.isAlert)
    }
    else if (wasOn && nowOn) {
      if (this._currentState === CONN_STATES.ACTIVATING) return
      this._currentState = CONN_STATES.ACTIVATING
      setTimeout(() => {
        // console.log('Conn off:', id,'isAlert:', this._isAlert)
        this.props.deactivate(id)
      }, SETTINGS.timeouts.connectionOn)
    }
    else if (wasOn && nowOff) {
      if (this._currentState === CONN_STATES.DEACTIVATING) return
      this._currentState = CONN_STATES.DEACTIVATING
      setTimeout(() => {
        // console.log('Conn propagating: ', id,'isAlert:', this._isAlert)
        // console.log('')
        // console.log('')
        // console.log('=================')
        this.props.propagateToOutputNode(outputNode.id, this._isAlert)
        this._currentState = CONN_STATES.AVAILABLE
        this._isAlert = false
      }, SETTINGS.timeouts.connectionOff)
    }
  }

  render() {
    const ballStyles = {
      base: '#28616B',
      alert: '#e36666'
    }

    const lineStyles = {
      base: '#98A2A3',
      alert: '#98A2A3'
    }

    let animation = { display: 'none' }
    let ballStyle = ballStyles.base
    let lineStyle = lineStyles.base

    // Set the animation state
    if (this.props.state === CONN_ON || this.props.state === CONN_ALERT_ON) {
      animation = this.keyframe.keyframeStyle
    }

    switch (this.props.state) {
      case CONN_OFF:
      case CONN_ON:
        ballStyle = ballStyles.base
        lineStyle = lineStyles.base
        break;
      case CONN_ALERT_ON:
        ballStyle = ballStyles.alert
        lineStyle = lineStyles.alert
        break;
      default:
        ballStyle = ballStyles.base
        lineStyle = lineStyles.base
        break;
    }

    return (
      <g>
        <line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} stroke={lineStyle} strokeWidth="16"/>
        <g style={animation}>
          <circle cx="0" cy="0" r="26" fill={ballStyle} />
        </g>
      </g>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeConnection)
