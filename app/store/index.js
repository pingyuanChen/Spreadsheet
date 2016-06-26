import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import promiseMiddleware from './middlewares/promise_middleware';

const createStoreWithMiddleware = applyMiddleware(
    thunk,
    promiseMiddleware
  )(createStore);

export default function configureStore() {
  return createStoreWithMiddleware(rootReducer)
};
