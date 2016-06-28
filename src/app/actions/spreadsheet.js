import { getSpreadsheetByGuid } from '../models/spreadsheet';

const getSpreadsheet = (guid) => {
  return {
    types: ['SPREADSHEET_LOAD', 'SPREADSHEET_LOAD_SUCCESS', 'SPREADSHEET_LOAD_FAIL'],
    promise: getSpreadsheetByGuid(guid)
  };
};


export default {
  getSpreadsheet: getSpreadsheet
};
