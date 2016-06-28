import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import promiseMiddleware from './middlewares/promise_middleware';

const createStoreWithMiddleware = applyMiddleware(
    thunk,
    promiseMiddleware
  )(createStore);

let store = null;

export function configureStore() {
  store = createStoreWithMiddleware(rootReducer);
  return store;
};

export function getStore() {
  return store;
}
