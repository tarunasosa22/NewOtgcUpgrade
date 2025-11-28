import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModalPortal, ScaleAnimation } from 'react-native-modals';
import { navigationRef } from '../config/RootNavigation';
import * as Sentry from '@sentry/react-native';
const { width, height } = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.25) =>
  size + (scale(size) - size) * factor;
const moderateVerticalScale = (size, factor = 0.25) =>
  size + (verticalScale(size) - size) * factor;

export const IOS_APP_ID = 'com.onTheGoCleaners.app'
export const ANDROID_APP_ID = 'com.otgc.onthegocleaners'
export const APP_STORE_LINK = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
export const PLAY_STORE_LINK = `market://details?id=${ANDROID_APP_ID}`;

function siteUrl(endpoint = 'users') {
  // return `http://192.168.1.41:5000/api/v1/${endpoint}/`;
  // return `https://staging-api.onthegocleaners.com/api/v1/${endpoint}/`;

  // return 'http://api.onthegocleaners.com:3001/api/v2/' + endpoint + '/';
  // return `https://onthegocleaners-api.cloudapps.zeroek.com/api/v1/${endpoint}/`;
  const LIVE_URL = `https://api.onthegocleaners.com/api/v1/${endpoint}/`
  const STAGING_URL = `https://staging-api.onthegocleaners.com/api/v1/${endpoint}/`
  const LOCAL_URL = `http://192.168.0.94:8080/api/v1/${endpoint}/`
  return STAGING_URL;
}

const ItemsPerPage = 10;

const DateFormat = 'MMM DD, YYYY';
const DateFormatReview = 'MMM DD';
const DateFormatReview1 = 'MM/DD/YY';

const DeviceInfo = require('react-native-device-detection');

function displayAlert(
  title = '',
  messageText = '',
  buttonText = '',
  messageComponent = null,
  callbackOnOk = null,
  showCross = false,
  cancelable = true,
  showImageFirst = false,
) {
  const displayAlertStyle = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginBottom: 15,
      width: width * 0.8,
    },
    heading: {
      textAlign: 'center',
      fontFamily: 'Roboto-BoldCondensed',
      paddingVertical: 20,
      fontSize: moderateScale(16),
      ...Platform.select({
        android: {
          color: 'black',
          fontWeight: '500',
        },
      }),
    },
    messageContainer: {
      marginTop: moderateScale(10),
      width: '85%',
      marginBottom: moderateScale(10),
    },
    messageText: {
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
      ...Platform.select({
        android: {
          color: 'black',
        },
      }),
      fontSize: moderateScale(14),
    },
    blueButton: {
      backgroundColor: '#171151',
      borderRadius: 50,
      borderWidth: 1,
      borderColor: '#171151',
      height: moderateVerticalScale(40, 0.5),
      width: '85%',
      justifyContent: 'center',
      marginBottom: moderateScale(10, 0.5),
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#171151',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    blueButtonText: {
      color: 'white',
      fontFamily: 'Poppins-Regular',
      letterSpacing: 2,
      fontSize: moderateScale(14),
    },
    messageComponentContainer: {
      marginTop: moderateScale(10),
      marginBottom: 0,
      width: '100%',
    },
    closeIcon: {
      alignSelf: 'flex-end',
      marginRight: 5,
    },
  });

  const id = ModalPortal.show(
    <View style={displayAlertStyle.container}>
      {showCross && (
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            if (id !== undefined) ModalPortal.dismissAll(id);
          }}
          style={displayAlertStyle.closeIcon}>
          <View style={{ paddingVertical: 8, paddingHorizontal: 5 }}>
            <Icon name="close" size={15} />
          </View>
        </TouchableOpacity>
      )}
      <Text style={displayAlertStyle.heading}>{title}</Text>
      <View style={displayAlertStyle.messageContainer}>
        {showImageFirst == false && (
          <Text style={displayAlertStyle.messageText}>{messageText}</Text>
        )}
        <View style={displayAlertStyle.messageComponentContainer}>
          {messageComponent && messageComponent}
        </View>
        {showImageFirst == true && (
          <Text style={displayAlertStyle.messageText}>{messageText}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          id !== undefined && ModalPortal.dismiss(id);
          if (typeof callbackOnOk === 'function') {
            callbackOnOk();
          }
        }}
        style={displayAlertStyle.blueButton}>
        <Text style={displayAlertStyle.blueButtonText}>
          {buttonText ? buttonText : 'OK'}
        </Text>
      </TouchableOpacity>
    </View>,
    {
      modalAnimation: new ScaleAnimation({
        initialValue: 0, // optional
        useNativeDriver: true, // optional
      }),
    },
  );

  //   DialogManager.show(
  //     {
  //       haveTitleBar: false,
  //       width: width - scale(50),
  //       overlayOpacity: 0.4,
  //       dialogAnimation: new ScaleAnimation(),
  //       overlayBackgroundColor: 'rgb(23, 17, 81)',
  //       dismissOnTouchOutside: cancelable,
  //       dialogStyle: {borderRadius: 10, width: '90%'},
  //       children: (
  //         <DialogContent>
  //           <View style={displayAlertStyle.container}>
  //             {showCross && (
  //               <TouchableOpacity
  //                 hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
  //                 onPress={() => {
  //                   if (DialogManager !== undefined) DialogManager.dismissAll();
  //                 }}
  //                 style={displayAlertStyle.closeIcon}>
  //                 <Icon name="close" size={15} />
  //               </TouchableOpacity>
  //             )}
  //             <Text style={displayAlertStyle.heading}>{title}</Text>
  //             <View style={displayAlertStyle.messageContainer}>
  //               {showImageFirst == false && (
  //                 <Text style={displayAlertStyle.messageText}>{messageText}</Text>
  //               )}
  //               <View style={displayAlertStyle.messageComponentContainer}>
  //                 {messageComponent && messageComponent}
  //               </View>
  //               {showImageFirst == true && (
  //                 <Text style={displayAlertStyle.messageText}>{messageText}</Text>
  //               )}
  //             </View>
  //             <TouchableOpacity
  //               onPress={() => {
  //                 DialogManager !== undefined &&
  //                   DialogManager.dismissAll(() => {
  //                     setTimeout(
  //                       () =>
  //                         typeof callbackOnOk === 'function' && callbackOnOk(),
  //                       100,
  //                     );
  //                   });
  //               }}
  //               style={displayAlertStyle.blueButton}>
  //               <Text style={displayAlertStyle.blueButtonText}>
  //                 {buttonText ? buttonText : 'OK'}
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         </DialogContent>
  //       ),
  //     },
  //     () => {
  //       // callback for show
  //     },
  //   );
}

function getFormBody(data) {
  let formBody = [];
  for (let property in data) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
}

function makeApiRequest(
  url,
  data,
  token = null,
  method = 'POST',
  endpoint = 'users',
  isRaw = false,
) {
  let body = isRaw ? data : getFormBody(data);
  let headers = {
    Accept: 'application/json',
    'Content-Type': isRaw
      ? 'application/json'
      : 'application/x-www-form-urlencoded',
  };
  token != null ? (headers['Authorization'] = `Bearer ${token}`) : null;
  console.log('URL ==>', siteUrl(endpoint) + url);
  console.log('REQUEST ==>', body);

  return fetch(siteUrl(endpoint) + url, {
    method: method,
    headers: headers,
    body: method.toLowerCase() === 'get' ? null : body,
  })
    .then(response => response.json())
    .then(data => {
      console.log('RESPONSE ==>', data);
      console.log(data?.message, 'asaas');
      if (
        data?.message === 'jwt expired' ||
        data?.message === 'invalid signature' ||
        data?.message === 'invalid token' ||
        data?.message === 'jwt malformed' ||
        data?.message === 'jwt signature is required' ||
        data?.message === 'Session Expired please login again' ||
        data?.message === 'User not exist'
      ) {
        let errorObj = JSON.stringify({
          route: siteUrl(endpoint) + url,
          response: data,
          token: token,
        });
        Sentry.captureException(errorObj);
        // logout on token expire
        navigationRef.current?.navigate('LoggedOutNav', { replace: true });
        return;
      }
      if (!data?.status) {
        let errorObj = JSON.stringify({
          route: siteUrl(endpoint) + url,
          response: data,
        });
        Sentry.setExtra('error', errorObj);
        Sentry.captureException(errorObj);
      }
      return data;
    })
    .catch(error => {
      console.log('ERROR ON API CALL', error);
      let errorObj = JSON.stringify({
        route: siteUrl(endpoint) + url,
        response: data,
      });
      Sentry.setExtra('error', errorObj);
      Sentry.captureException(errorObj);
      return false;
    });
}

function isEmpty(obj = null) {
  return (
    obj === null ||
    (Object.keys(obj).length === 0 && obj.constructor === Object)
  );
}

function isIphoneX() {
  if ((Platform.OS === 'ios' && width === 812) || height === 812) {
    return true;
  }
  return false;
}

function isTablet() {
  return DeviceInfo.isTablet;
}

async function saveStateAsyncStorage(data) {
  try {
    await AsyncStorage.setItem('appData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.log('Error occurred while saving state. Error: ' + error);
    return false;
  }
}

async function saveSignUpStateAsyncStorage(data) {
  try {
    await AsyncStorage.setItem('isSignUpProcess', JSON.stringify(data));
    return true;
  } catch (error) {
    console.log('Error occurred while saving state. Error: ' + error);
    return false;
  }
}

async function getStateAsyncStorage(item) {
  try {
    let savedState = await AsyncStorage.getItem(item);
    if (savedState !== null) {
      let parsedState = await JSON.parse(savedState);
      return parsedState;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error occurred while retrieving state. Error: ' + error);
    return false;
  }
}

function formatPhoneNumber(input) {
  // Remove all non-numeric characters from the input
  const cleaned = ('' + input).replace(/\D/g, '');

  // Format the number as (000) 000-0000
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (match) {
    let formattedNumber = '';

    if (match[1]) formattedNumber += `${match[1]}`;
    if (match[2]) formattedNumber += `-${match[2]}`;
    if (match[3]) formattedNumber += `-${match[3]}`;

    return formattedNumber;
  }

  return cleaned;
};

function formatCardNumber(input) {
  // Remove all non-numeric characters from the input
  const cleaned = input.replace(/\D+/g, '');

  // Format the number with spaces every 4 digits
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');

  return formatted;
};

export {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  width,
  height,
  siteUrl,
  displayAlert,
  getFormBody,
  makeApiRequest,
  saveStateAsyncStorage,
  getStateAsyncStorage,
  isIphoneX,
  isTablet,
  isEmpty,
  ItemsPerPage,
  DateFormat,
  DateFormatReview,
  DateFormatReview1,
  formatPhoneNumber,
  formatCardNumber,
  saveSignUpStateAsyncStorage
};
