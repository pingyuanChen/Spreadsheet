import { assign } from '../common/utils/lang';

const initState = {
  loaded: false,
  files: [],
  error: null
};


const handleListLoad = (state) => {
  return assign({}, state, {
    loaded: false,
    error: null
  });
};

const handleListLoadSuccess = (state, result) => {
  return assign({}, state, {
    loaded: true,
    files: result
  });
};

const handleListLoadFail = (state, error) => {
  return assign({}, state, {
    loaded: true,
    error: error
  });
};

export default (state, action) => {
  state = state || initState;
  switch (action.type) {
  case 'LIST_LOAD':
    return handleListLoad(state);
  case 'LIST_LOAD_SUCCESS':
    return handleListLoadSuccess(state, action.result);
  case 'LIST_LOAD_FAIL':
    return handleListLoadFail(state, action.error);
  }
  return state;
};
