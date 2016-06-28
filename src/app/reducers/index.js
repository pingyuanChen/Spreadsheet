import { combineReducers } from 'redux';

import listReducer from './list';
import spreadsheetReducer from './spreadsheet';

export default combineReducers({
  list: listReducer,
  spreadsheet: spreadsheetReducer
});