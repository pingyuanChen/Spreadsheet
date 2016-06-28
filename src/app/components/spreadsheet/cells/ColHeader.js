'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

class ColHeader extends Component {
  render() {
    return (
      <View style={styles.cellContainer}/>
    );
  }
}

const styles = StyleSheet.create({
  cellContainer: {
    borderColor: '#d1d1d1',
    borderWidth: 1,
    borderRightColor: 'transparent'
  }
});


export default ColHeader;