
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackText: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in ${this.props.fallbackText}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '10px', color: 'white', backgroundColor: 'black' }}>
          <h3>Rendering Error in: {this.props.fallbackText}</h3>
        </div>
      );
    }

    return this.props.children;
  }
}
