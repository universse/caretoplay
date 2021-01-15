import React, { Component } from 'react'

import { apiClient } from 'utils/apiClient'

function handleError(error, componentStack) {
  apiClient.logError(error, componentStack)
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    const { onError = handleError } = this.props
    onError(error.toString(), info.componentStack)
  }

  render() {
    const { children, fallback = <></> } = this.props

    if (this.state.hasError) {
      return fallback
    }

    return children
  }
}
