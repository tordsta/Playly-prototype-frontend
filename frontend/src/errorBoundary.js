import React, { Component } from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null, errorInfo: null };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      this.setState({
          error: error,
          errorInfo: errorInfo
      })
    }
  
    render() {
      if (this.state.errorInfo) {
        console.log("Error")
        console.log(this.state.error)
        console.log("Error info")
        console.log(this.state.errorInfo)
        // You can render any custom fallback UI
        return <h1>Something went wrong.</h1>;
      }
  
      return this.props.children; 
    }
  }

  export default ErrorBoundary;