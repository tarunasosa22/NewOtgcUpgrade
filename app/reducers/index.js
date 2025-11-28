import { combineReducers } from 'redux';
//import navReducer from './navReducer';
import rootReducer from './rootReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import persistReducer from 'redux-persist/es/persistReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const appReducer = combineReducers({
  //navigation: navReducer,
  appData: persistedReducer,
});

export default appReducer;
