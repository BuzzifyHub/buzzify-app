import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';
import todoReducer from './Reducer';
import {createStore} from 'redux';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, todoReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
