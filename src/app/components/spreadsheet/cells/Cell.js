import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class Cell extends Component {
  render() {
    const props = this.props;

    return (
      <View style={styles.cellContainer}>
        <Text>{props.value}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  cellContainer: {
    borderColor: '#d1d1d1',
    borderWidth: 1,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent'
  }
});

