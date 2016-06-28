import React, { Component } from 'react';
import {
  Navigator
} from 'react-native';

import Home from './components/Home';
import Spreadsheet from './components/spreadsheet/Spreadsheet';

export default class AppNavigator extends Component {
  _renderScene(route, navigator) {
    switch (route.name) {
      case 'home':
        return <Home navigator={navigator} route={route} />;
      case 'spreadsheet':
        return <Spreadsheet navigator={navigator} route={route} />;
      default:
        return <Home navigator={navigator} route={route} />;
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


