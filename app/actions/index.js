// action types
export const ActionTypes = {
    SET_INITIAL_STATE: 'SET_INITIAL_STATE',
    SET_LOGGED_IN_USER_DATA: 'SET_LOGGED_IN_USER_DATA',
    UPDATE_DEVICE_TOKEN: 'UPDATE_DEVICE_TOKEN',
    SET_DRAWER_OPEN_STATE: 'SET_DRAWER_OPEN_STATE',
    SET_DRAWER_CLOSE_STATE: 'SET_DRAWER_CLOSE_STATE',
    TOGGLE_NEW_CARD_ADDED: 'TOGGLE_NEW_CARD_ADDED',
    TOGGLE_NEW_ADDRESS_ADDED: 'TOGGLE_NEW_ADDRESS_ADDED',
    TOGGLE_NEW_ORDER_ADDED: 'TOGGLE_NEW_ORDER_ADDED',
    TOGGLE_CARD_UPDATED_STATUS: 'TOGGLE_CARD_UPDATED_STATUS',
    TOGGLE_UPDATED_ADDRESS_STATUS: 'TOGGLE_UPDATED_ADDRESS_STATUS',
    TOGGLE_NEW_FEEDBACK_ADDED: 'TOGGLE_NEW_FEEDBACK_ADDED',
    SET_COMPLETED_ORDER_LIST: 'SET_COMPLETED_ORDER_LIST',
    SET_SCHEDULE_ORDER_DATA_SERVICES_AND_PREFERENCES: 'SET_SCHEDULE_ORDER_DATA_SERVICES_AND_PREFERENCES',
    SET_SCHEDULE_ORDER_DATA_INSTRUCTIONS: 'SET_SCHEDULE_ORDER_DATA_INSTRUCTIONS',
    SET_SCHEDULE_ORDER_DATA_DATE_TIME: 'SET_SCHEDULE_ORDER_DATA_DATE_TIME',
    SET_SCHEDULE_ORDER_DATA_ADDRESS: 'SET_SCHEDULE_ORDER_DATA_ADDRESS',
    SET_SCHEDULE_ORDER_DATA_CARD: 'SET_SCHEDULE_ORDER_DATA_CARD',
    SET_SCHEDULE_ORDER_DATA_SERVICES_NAME_LIST: 'SET_SCHEDULE_ORDER_DATA_SERVICES_NAME_LIST',
    SET_SCHEDULE_ORDER_DATA_PREFERENCES_NAME_LIST: 'SET_SCHEDULE_ORDER_DATA_PREFERENCES_NAME_LIST',
    CLEAR_SCHEDULE_ORDER_DATA: 'CLEAR_SCHEDULE_ORDER_DATA',
    SET_SIGNUP_DATA: 'SET_SIGNUP_DATA',
    CLEAR_SIGNUP_DATA: 'CLEAR_SIGNUP_DATA',
    SET_SIGNUP_USER_ADDRESS: 'SET_SIGNUP_USER_ADDRESS',
    CLEAR_SIGNUP_USER_ADDRESS: 'CLEAR_SIGNUP_USER_ADDRESS',
    USER_LOGOUT: 'USER_LOGOUT',
    SET_FCM_TOKEN: 'SET_FCM_TOKEN',
    SET_CURRENT_URL: 'SET_CURRENT_URL',
    SET_RATE_DONE: 'SET_RATE_DONE',
    SET_ORDER_SCHEDULE: 'SET_ORDER_SCHEDULE'
};

// action creators
function setInitialState(data) {
    return { type: ActionTypes.SET_INITIAL_STATE, data: data };
}

function setLoggedInUserData(data) {
    return { type: ActionTypes.SET_LOGGED_IN_USER_DATA, data: data };
}

function updateDeviceToken(data) {
    return { type: ActionTypes.UPDATE_DEVICE_TOKEN, data: data };
}

function setDrawerOpenState() {
    return { type: ActionTypes.SET_DRAWER_OPEN_STATE, data: {} };
}

function setDrawerCloseState() {
    return { type: ActionTypes.SET_DRAWER_CLOSE_STATE, data: {} };
}

function setScheduleOrderDataServicesAndPreferences(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_SERVICES_AND_PREFERENCES, data: data };
}

function setScheduleOrderDataServicesNameList(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_SERVICES_NAME_LIST, data: data };
}

function setScheduleOrderDataPreferencesNameList(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_PREFERENCES_NAME_LIST, data: data };
}

function setScheduleOrderDataInstructions(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_INSTRUCTIONS, data: data };
}

function setScheduleOrderDataDateTime(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_DATE_TIME, data: data };
}

function setScheduleOrderDataAddress(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_ADDRESS, data: data };
}

function setScheduleOrderDataCard(data) {
    return { type: ActionTypes.SET_SCHEDULE_ORDER_DATA_CARD, data: data };
}

function toggleNewCardAdded(data) {
    return { type: ActionTypes.TOGGLE_NEW_CARD_ADDED, data: data };
}

function toggleNewAddessAdded(data) {
    return { type: ActionTypes.TOGGLE_NEW_ADDRESS_ADDED, data: data };
}

function toggleNewOrderAdded(data) {
    return { type: ActionTypes.TOGGLE_NEW_ORDER_ADDED, data: data };
}

function toggleNewFeedbackAdded(data) {
    return { type: ActionTypes.TOGGLE_NEW_FEEDBACK_ADDED, data: data };
}

function toggleCardUpdatedStatus(data) {
    return { type: ActionTypes.TOGGLE_CARD_UPDATED_STATUS, data: data };
}

function toggleUpdatedAddressStatus() {
    return { type: ActionTypes.TOGGLE_UPDATED_ADDRESS_STATUS, data: {} };
}

function clearScheduleOrderData() {
    return { type: ActionTypes.CLEAR_SCHEDULE_ORDER_DATA, data: {} };
}

function setSignUpData(data) {
    return { type: ActionTypes.SET_SIGNUP_DATA, data: data };
}
function clearSignUpData() {
    return { type: ActionTypes.CLEAR_SIGNUP_DATA, data: {} };
}

function setSignUpUserAddress(data) {
    return { type: ActionTypes.SET_SIGNUP_USER_ADDRESS, data: data };
}
function clearSignUpUserAddress() {
    return { type: ActionTypes.CLEAR_SIGNUP_USER_ADDRESS, data: {} };
}

function logout() {
    return { type: ActionTypes.USER_LOGOUT, data: {} };
}

function setFcmToken(data) {
    return { type: ActionTypes.SET_FCM_TOKEN, data: data ? data : '' };
}
function setCurrentURL(data) {
    return { type: ActionTypes.SET_CURRENT_URL, data: data ? data : '' };
}

function setDoneRate(data) {
    return { type: ActionTypes.SET_RATE_DONE, data: data };
}

function setOrderSchedule(data) {
    return { type: ActionTypes.SET_ORDER_SCHEDULE, data: data };
}

export const ActionCreators = {
    setInitialState: setInitialState,
    setLoggedInUserData: setLoggedInUserData,
    updateDeviceToken: updateDeviceToken,
    setDrawerOpenState: setDrawerOpenState,
    setDrawerCloseState: setDrawerCloseState,
    setScheduleOrderDataServicesAndPreferences: setScheduleOrderDataServicesAndPreferences,
    setScheduleOrderDataServicesNameList: setScheduleOrderDataServicesNameList,
    setScheduleOrderDataPreferencesNameList: setScheduleOrderDataPreferencesNameList,
    setScheduleOrderDataInstructions: setScheduleOrderDataInstructions,
    setScheduleOrderDataDateTime: setScheduleOrderDataDateTime,
    setScheduleOrderDataAddress: setScheduleOrderDataAddress,
    setScheduleOrderDataCard: setScheduleOrderDataCard,
    toggleNewCardAdded: toggleNewCardAdded,
    toggleNewAddessAdded: toggleNewAddessAdded,
    toggleNewOrderAdded: toggleNewOrderAdded,
    toggleUpdatedAddressStatus: toggleUpdatedAddressStatus,
    toggleNewFeedbackAdded: toggleNewFeedbackAdded,
    toggleCardUpdatedStatus: toggleCardUpdatedStatus,
    clearScheduleOrderData: clearScheduleOrderData,
    setSignUpData: setSignUpData,
    clearSignUpData: clearSignUpData,
    setSignUpUserAddress: setSignUpUserAddress,
    clearSignUpUserAddress: clearSignUpUserAddress,
    logout: logout,
    setFcmToken: setFcmToken,
    setCurrentURL: setCurrentURL,
    setDoneRate: setDoneRate,
    setOrderSchedule: setOrderSchedule
};
