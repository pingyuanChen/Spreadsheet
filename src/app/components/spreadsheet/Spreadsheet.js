import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/Ionicons';

import spreadsheetActions from '../../actions/spreadsheet';

class Spreadsheet extends Component {

  componentDidMount() {
    const props = this.props;
    props.dispatch(spreadsheetActions.getSpreadsheet(props.route.gui));
  }

  _renderNavBar() {
    const navigator = this.props.navigator;
    const titleConfig = {
      title: '石墨文档',
      tintColor: '#333'
    };
    const leftButton = (
      <View>
        <TouchableOpacity onPress={() => {if (index > 0) {navigator.pop()}}} >
          <Icon name='md-arrow-back' style={[styles.navBarBtn, {fontSize: 20}]}/>
        </TouchableOpacity>
      </View>
    )
    const rightButton = (
      <View>
        <TouchableOpacity >
          <Icon name='ios-settings-outline' style={[styles.navBarBtn, {fontSize: 20}]}/>
        </TouchableOpacity>
      </View>
    )

    return (
      <NavigationBar
        style={styles.navBar}
        title={titleConfig}
        leftButton={leftButton}
        rightButton={rightButton} />
    );
  }

  render() {
    return (
      <View>
        { this._renderNavBar() }

      </View>
    );
  }
};

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: '#fff',
    height: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  navBarBtn: {
    color: '#333',
    paddingLeft: 10,
    paddingRight: 10
  },
});

function mapStateToProps(state) {
  return {
    spreadsheet: state.spreadsheet
  };
}

function mapDispatchToProps(dispatch) {
  return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
