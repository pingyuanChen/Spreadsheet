import { getListByGuid } from '../models/home';

const getList = (guid) => {
  return {
    types: ['LIST_LOAD', 'LIST_LOAD_SUCCESS', 'LIST_LOAD_FAIL'],
    promise: getListByGuid(guid)
  };
};


export default {
  getList: getList
};
