import React, { Component } from 'react';
import {
  View
} from 'react-native';

import AppNavigator from './navigator';

class App extends Component {
  render() {
    return (
      <View style={{flex:1}}>
        <AppNavigator />
      </View>
    );
  }
}

export default App;
