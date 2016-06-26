import React, { Component } from 'react';
import {
  Navigator
} from 'react-native';

import Home from './components/home';
import Spreadsheet from './components/spreadsheet';

export default class AppNavigator extends Component {
  _renderScene(route, navigator) {
    switch (route.name) {
      case 'home':
        return <Home navigator={navigator} />;
      case 'spreadsheet':
        return <Spreadsheet navigator={navigator} />;
      default:
        return <Home navigator={navigator} />;
    }
  }

  render() {
    return (
      <Navigator
        initialRoute={{name: 'home'}}
        renderScene={this._renderScene} />
    );
  }
}


