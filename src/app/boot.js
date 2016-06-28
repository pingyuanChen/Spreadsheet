/**
 * Spreadsheet React Native App
 * @pychen
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';

import { configureStore } from './store';
import App from './App';

export default class Boot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      store: configureStore()
    };
  }

  render() {
    // if(this.state.isLoading) {
    //   return null;
    // }
    return (
      <Provider store={this.state.store}>
        <App />
      </Provider>
    );
  }
}
