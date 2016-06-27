import { combineReducers } from 'redux';

import listReducer from './list';
// import msgReducer from './msg';

export default combineReducers({
  list: listReducer
});