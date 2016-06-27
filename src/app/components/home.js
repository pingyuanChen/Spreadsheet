import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ListView
} from 'react-native';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/FontAwesome';

import listActions from '../actions/list';

class Home extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1.id !== r2.id
    });
    this.state = {
      ds: ds,
      list: ds.cloneWithRows([])
    };
    this.renderRow = this._renderRow.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(listActions.getList());
  }

  componentWillReceiveProps(nextProps) {
    const updatedList = this.state.ds.cloneWithRows(nextProps.list.files);
    this.setState({
      list: updatedList
    });
  }

  _renderRow(rowData) {
    let iconUrl;
    if (rowData.type === 0) {
      iconUrl = require('../../assets/images/doc.png');
    } else if (rowData.type === 1) {
      iconUrl = require('../../assets/images/folder.png');
    } else {
      iconUrl = require('../../assets/images/spreadsheet.png');
    }

    return (
      <TouchableHighlight
        onPress={this._clickRow.bind(this, rowData)} >
        <View style={styles.item}>
          <Image
            source={ iconUrl }
            style={styles.itemIcon}
            resizeMode='contain' />
          <View style={{flex:1}}>
            <View>
              <Text style={styles.itemName}>
                {rowData.name}
              </Text>
              {/*<TouchableHighlight
                onPress={this._showMenu}>
                <Image />
              </TouchableHighlight>*/}
            </View>
            <Text 
              style={styles.itemBrief}
              numberOfLines={2}>
              {rowData.preview}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  _renderSeparator() {
    return (
      <View style={styles.rowSeparator} />
    );
  }

  _clickRow(rowData) {
    this.props.navigator.push({
      name: 'spreadsheet'
    });
  }

  _showMenu() {

  }

  _newAction() {

  }

  _renderNavBar() {
    const navigator = this.props.navigator;
    const title = '石墨文档';
    const leftButton = (
      <View>
        <Text
          onPress={() => {if (index > 0) {navigator.pop()}}}>
          返回
        </Text>
      </View>
    )
    const rightButton = (
      <View>
        <TouchableOpacity onPress={this._newAction}>
          <Icon name='plus' />
        </TouchableOpacity>
      </View>
    )

    return (
      <NavigationBar
        title={title}
        leftButton={leftButton}
        rightButton={rightButton} />
    );
  }

  render() {
    return (
      <View>
        { this._renderNavBar() }
        <ListView
          dataSource={this.state.list}
          renderRow={this.renderRow}
          renderSeparator={this._renderSeparator} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  itemIcon: {
    width: 35,
    height: 35
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16
  },
  itemName: {
    // lineHeight: 30,
    // justifyContent: 'center'
  },
  itemBrief: {
    lineHeight: 16,
    fontSize: 10,
    color: '#6b6d6f'
  },
  rowSeparator: {
    height: 1,
    marginLeft: 54,
    marginRight: 19,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: '#eff1f1'
  }
});

function mapStateToProps(state) {
  return {
    list: state.list
  };
}

function mapDispatchToProps(dispatch) {
  return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
