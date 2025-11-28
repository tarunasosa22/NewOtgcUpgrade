import { ActionTypes } from '../actions/index';

const initialState = {
  appData: {
    appData: {},
    scheduleOrderData: {},
    drawerState: {},
    newCardAdded: {},
    cardUpdated: {},
    newOrderAdded: {},
    addressUpdated: {},
    newAddressAdded: {},
    newFeedbackAdded: {},
    fcmToken: false,
    url: false,
    isDoneRate: false,
    isOrderSchedule: 0
  },
};

const appData = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOGGED_IN_USER_DATA:
      return action.data;
    case ActionTypes.UPDATE_DEVICE_TOKEN:
      return { ...state, deviceToken: action.data };
    default:
      return state;
  }
};

const signUpData = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.SET_SIGNUP_DATA:
      return action.data;
    default:
      return state;
  }
};

const signUpUserAddress = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.SET_SIGNUP_USER_ADDRESS:
      return action.data;
    default:
      return state;
  }
};

const servicesAndPreferences = (
  state = { services: '', preferences: [] },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_SERVICES_AND_PREFERENCES:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return { services: '', preferences: [] };
    default:
      return state;
  }
};

const servicesNameList = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_SERVICES_NAME_LIST:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return [];
    default:
      return state;
  }
};

const preferencesNameList = (state = { 1: [], 2: [] }, action) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_PREFERENCES_NAME_LIST:
      return { ...state, ...action.data };
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return { 1: [], 2: [] };
    default:
      return state;
  }
};

const instructions = (
  state = { service_instructions: '', driver_instructions: '' },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_INSTRUCTIONS:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return { service_instructions: '', driver_instructions: '' };
    default:
      return state;
  }
};

const dateTime = (
  state = {
    delivery_pickup_date: '',
    delivery_pickup_time_from: '',
    delivery_pickup_time_to: '',
  },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_DATE_TIME:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return {
        delivery_pickup_date: '',
        delivery_pickup_time_from: '',
        delivery_pickup_time_to: '',
      };
    default:
      return state;
  }
};

const address = (
  state = {
    address_details: [],
    is_add_new_address: false,
    pickup_address_id: '',
    addressList: [],
    stateList: [],
    cityList: [],
    dataSaved: false,
  },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_ADDRESS:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return {
        address_details: [],
        is_add_new_address: false,
        pickup_address_id: '',
        addressList: [],
        stateList: [],
        cityList: [],
        dataSaved: false,
      };
    default:
      return state;
  }
};

const card = (
  state = {
    card_details: [],
    is_add_new_card: false,
    user_card_id: '',
    promo_code_id: '',
    promo_code: '',
    promo_code_type: '',
    cardList: [],
    stateList: [],
    cityList: [],
  },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_SCHEDULE_ORDER_DATA_CARD:
      return action.data;
    case ActionTypes.CLEAR_SCHEDULE_ORDER_DATA:
      return {
        card_details: [],
        is_add_new_card: false,
        user_card_id: '',
        promo_code_id: '',
        promo_code: '',
        promo_code_type: '',
        cardList: [],
        stateList: [],
        cityList: [],
      };
    default:
      return state;
  }
};

const drawerState = (state = { open: false }, action) => {
  switch (action.type) {
    case ActionTypes.SET_DRAWER_OPEN_STATE:
      return { open: true };
    case ActionTypes.SET_DRAWER_CLOSE_STATE:
      return { open: false };
    default:
      return state;
  }
};

const newCardAdded = (state = { added: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NEW_CARD_ADDED:
      return { added: !state.added };
    default:
      return state;
  }
};

const newAddressAdded = (state = { added: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NEW_ADDRESS_ADDED:
      return { added: !state.added };
    default:
      return state;
  }
};

const newFeedbackAdded = (state = { added: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NEW_FEEDBACK_ADDED:
      return { added: !state.added };
    default:
      return state;
  }
};

const newOrderAdded = (state = { added: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_NEW_ORDER_ADDED:
      return { added: !state.added };
    default:
      return state;
  }
};

const addressUpdated = (state = { updated: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_UPDATED_ADDRESS_STATUS:
      return { updated: !state.updated };
    default:
      return state;
  }
};

const cardUpdated = (state = { updated: false }, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_CARD_UPDATED_STATUS:
      return { updated: !state.updated };
    default:
      return state;
  }
};

const fcmToken = (state = { fcmToken: '' }, action) => {
  switch (action.type) {
    case ActionTypes.SET_FCM_TOKEN:
      return action.data;
    default:
      return state;
  }
};

const setCurrentURL = (state = { url: '' }, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_URL:
      return action.data;
    default:
      return state;
  }
};

const setDoneRate = (state = { isDoneRate: false }, action) => {
  switch (action.type) {
    case ActionTypes.SET_RATE_DONE:
      return action.data;
    default:
      return state;
  }
};
const setOrderSchedule = (state = { isOrderSchedule: 0 }, action) => {
  switch (action.type) {
    case ActionTypes.SET_ORDER_SCHEDULE:
      return action.data;
    default:
      return state;
  }
};

const scheduleOrderData = (state = {}, action) => {
  return {
    servicesAndPreferences: servicesAndPreferences(
      state.servicesAndPreferences,
      action,
    ),
    servicesNameList: servicesNameList(state.servicesNameList, action),
    preferencesNameList: preferencesNameList(state.preferencesNameList, action),
    instructions: instructions(state.instructions, action),
    dateTime: dateTime(state.dateTime, action),
    address: address(state.address, action),
    card: card(state.card, action),
  };
};

const rootReducer = (state = initialState, action) => {
  let newState = {
    appData: appData(state.appData, action),
    scheduleOrderData: scheduleOrderData(state.scheduleOrderData, action),
    drawerState: drawerState(state.drawerState, action),
    newCardAdded: newCardAdded(state.newCardAdded, action),
    cardUpdated: cardUpdated(state.cardUpdated, action),
    newOrderAdded: newOrderAdded(state.newOrderAdded, action),
    addressUpdated: addressUpdated(state.addressUpdated, action),
    newAddressAdded: newAddressAdded(state.newAddressAdded, action),
    newFeedbackAdded: newFeedbackAdded(state.newFeedbackAdded, action),
    signUpData: signUpData(state.signUpData, action),
    signUpUserAddress: signUpUserAddress(state.signUpUserAddress, action),
    fcmToken: fcmToken(state.fcmToken, action),
    url: setCurrentURL(state.url, action),
    isDoneRate: setDoneRate(state.isDoneRate, action),
    isOrderSchedule: setOrderSchedule(state.isOrderSchedule, action)
  };
  if (action.type == ActionTypes.SET_INITIAL_STATE) {
    newState = { ...newState, ...action.data };
  }
  if (action.type == ActionTypes.USER_LOGOUT) {
    newState = { undefined, action };
  }
  return newState;
};

export default rootReducer;
