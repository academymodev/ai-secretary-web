'use client'
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-danger-subtle flex items-center justify-center mx-auto mb-4 text-2xl text-danger font-bold">
              !
            </div>
            <h1 className="font-bold text-lg mb-2 text-fg">Something went wrong</h1>
            <p className="text-sm text-fg-muted mb-5">
              The app hit an unexpected error. Your data is safe — try refreshing the page.
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
