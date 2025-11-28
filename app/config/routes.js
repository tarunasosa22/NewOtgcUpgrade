import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, Text, Platform } from 'react-native';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import LandingScreen from '../screens/Landing';
import LoginSignupScreen from '../screens/LoginSignup';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import OtpScreen from '../screens/Otp';
import ResetPasswordScreen from '../screens/ResetPassword';
import CompletedOrdersScreen from '../screens/CompletedOrders';
import PendingOrdersScreen from '../screens/PendingOrders';
import OrderDetailsScreen from '../screens/OrderDetails';
import ScheduleOrderScreen from '../screens/ScheduleOrder';
import ExpressOrderScreen from '../screens/ExpressOrder';
import ScheduleOrderInstructionsScreen from '../screens/ScheduleOrderInstructions';
import NotificationsScreen from '../screens/Notifications';
import ProfileScreen from '../screens/Profile';
import ScheduleDateTimeScreen from '../screens/ScheduleDateTime';
import ScheduleAddressScreen from '../screens/ScheduleAddress';
import ScheduleCardScreen from '../screens/ScheduleCard';
import ReviewOrderScreen from '../screens/ReviewOrder';
import EditProfileScreen from '../screens/EditProfile';
import MyCardsScreen from '../screens/MyCards';
import AddNewCardScreen from '../screens/AddNewCard';
import MyAddressesScreen from '../screens/MyAddresses';
import AddNewAddressScreen from '../screens/AddNewAddress';
import EditAddressScreen from '../screens/EditAddress';
import ChangePasswordScreen from '../screens/ChangePassword';
import WashAndFoldPricingScreen from '../screens/WashAndFoldPricing';
import DryCleanPricingScreen from '../screens/DryCleanPricing';
import AboutUsScreen from '../screens/AboutUs';
import FeedbackScreen from '../screens/Feedbacks';
import AddFeedbackScreen from '../screens/AddFeedback';
import FeedbackDetailsScreen from '../screens/FeedbackDetails';
import FaqScreen from '../screens/Faq';
import PrivacyPolicyScreen from '../screens/PrivacyPolicy';
import TermsConditionsScreen from '../screens/TermsConditions';
import PendingFeedbacks from '../screens/PendingFeedbacks';
import CompletedFeedbacks from '../screens/CompletedFeedbacks';
import { NewSideMenu, store } from '../../App';
import { navigationRef } from './RootNavigation';
import { ActionCreators } from '../actions';
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import RateModal from 'react-native-store-rating';
import Rate, { AndroidMarket } from 'react-native-rate';
import InAppReview from 'react-native-in-app-review';

/*
header: (props) => {
    console.log(props);
    return <SafeAreaView style={{height: 54}}><LinearGradient colors={['#3b2eb6', '#21e381']} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text style={{textAlign: 'center'}}>Hello</Text></LinearGradient></SafeAreaView>
},
*/

function DrawerContent() {
  const navigation = useNavigation();
  const isCheck = store.getState().appData.signUpData?.isSignUpDone
  return (
    <View style={{ paddingTop: 0, flex: 1 }}>
      <LinearGradient
        colors={['#3b2eb6', '#21e381']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={drawerStyle.container}>
          <NewSideMenu />
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
            style={drawerStyle.content}
            onPress={() => {

              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('ProfileNav', { screen: 'Profile' });
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
              // store.dispatch(ActionCreators.setDrawerCloseState());
            }}>
            <Image
              source={Images.drawerProfileIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
            style={drawerStyle.content}
            onPress={() => {
              // store.dispatch(ActionCreators.setDrawerCloseState());
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('MyOrdersNav');
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
            }}>
            <Image
              source={Images.drawerOrdersIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>My Orders</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
            style={drawerStyle.content}
            onPress={() => {
              //   store.dispatch(ActionCreators.setDrawerCloseState());
              navigation.navigate('ProfileNav', {screen: 'MyAddressesD'});
            }}>
            <Image
              source={Images.drawerAddressIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>My Addresses</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
            style={drawerStyle.content}
            onPress={() => {
              // store.dispatch(ActionCreators.setDrawerCloseState());
              navigation.navigate('ProfileNav', { screen: 'PricingD' });
            }}>
            <Image
              source={Images.drawerPricingIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>Pricing</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }} style={drawerStyle.content} onPress={() => {
                              store.dispatch(ActionCreators.setDrawerCloseState());
                              NavigationService.navigate('AboutUs');
                          }}>
                              <Image source={Images.drawerAboutIcon} resizeMode="contain" style={drawerStyle.image} />
                              <Text style={drawerStyle.text}>About</Text>
                          </TouchableOpacity> */}
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
            style={drawerStyle.content}
            onPress={() => {
              // store.dispatch(ActionCreators.setDrawerCloseState());
              navigation.navigate('ProfileNav', { screen: 'FaqD' });
            }}>
            <Image
              source={Images.drawerFaqIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>FAQ's</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
            style={drawerStyle.content}
            onPress={() => {
              // store.dispatch(ActionCreators.setDrawerCloseState());
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('ProfileNav', { screen: 'FeedbackD' });
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
            }}>
            <Image
              source={Images.drawerFeedbacksIcon}
              resizeMode="contain"
              style={drawerStyle.image}
            />
            <Text style={drawerStyle.text}>Feedback</Text>
          </TouchableOpacity>
          {isCheck ?
            <TouchableOpacity
              hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
              style={drawerStyle.content}
              onPress={() => {

                const isCheck = store.getState().appData.signUpData?.isSignUpDone
                if (isCheck) {
                  Utils.displayAlert(
                    'Logout',
                    'Are you sure you want to logout?',
                    'Yes',
                    null,
                    async () => {
                      try {
                        await messaging().deleteToken()
                        Utils.makeApiRequest(
                          'delete-device-token',
                          {
                            device_token:
                              store.getState().appData.appData.deviceToken,
                          },
                          store.getState().appData.appData.token,
                        );
                      } catch (error) {
                        console.log(error);
                        throw new Error(error);
                      }
                      AsyncStorage.clear();
                      store.dispatch(ActionCreators.logout());
                      store.dispatch(ActionCreators.clearScheduleOrderData());
                      store.dispatch(ActionCreators.setDrawerCloseState());
                      // this.props.navigate('LoggedOutNav');
                      navigation.reset({
                        index: 0, routes: [{
                          name: "LoggedOutNav"
                        }]
                      })
                      // navigation.navigate('LoggedOutNav');
                    },
                    true,
                    true,
                  );
                } else {
                  Utils.displayAlert(
                    'Oops!',
                    'You need to login first',
                  );
                }

              }}>
              <Image
                source={Images.drawerLogoutIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>Logout</Text>
            </TouchableOpacity> :
            <TouchableOpacity
              hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
              style={drawerStyle.content}
              onPress={() => {
                navigation.reset({
                  index: 0, routes: [{
                    name: "LoggedOutNav"
                  }]
                })
              }}>
              <Image
                source={Images.drawerLogoutIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>Login</Text>
            </TouchableOpacity>
          }
        </View>
      </LinearGradient>
    </View>
  );
}
const drawerStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Utils.moderateVerticalScale(32, 1),
    flexDirection: 'row',
  },
  name: {
    marginTop: Utils.moderateVerticalScale(105, 1),
    marginBottom: Utils.moderateVerticalScale(50, 0.5),
    fontSize: Utils.moderateScale(16, 0.5),
    fontFamily: 'Roboto-BoldCondensed',
    color: 'white',
  },
  image: {
    height: Utils.moderateScale(20),
    width: Utils.moderateScale(20),
  },
  text: {
    fontSize: Utils.moderateScale(14),
    fontFamily: 'Poppins-Regular',
    marginLeft: Utils.moderateScale(20),
    color: 'white',
  },
});

const MyOrdersTabs = createMaterialTopTabNavigator();

function My_Orders_Tabs() {
  return (
    <MyOrdersTabs.Navigator
      initialRouteName="PendingOrders"
      screenOptions={{
        swipeEnabled: true,
        upperCaseLabel: true,
        tabBarActiveTintColor: '#3b2eb6',
        tabBarStyle: {
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 10,
          backgroundColor: '#f012',
          minHeight: 10,
        },
        // style: {
        //   backgroundColor: '#3b2eb6',
        //   shadowColor: 'transparent',
        //   elevation: 0,
        // },
        // tabStyles: {},
        // indicatorStyle: {
        //   backgroundColor: '#ffffff',
        // },
        // labelStyle: {
        //   fontFamily: 'Roboto-BoldCondensed',
        //   letterSpacing: 2,
        //   fontSize: Utils.moderateScale(14),
        // },
      }}>
      <MyOrdersTabs.Screen
        name="PendingOrders"
        component={PendingOrdersScreen}
        options={{
          title: 'ACTIVE ORDERS',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
      <MyOrdersTabs.Screen
        name="CompletedOrders"
        component={CompletedOrdersScreen}
        options={{
          title: 'COMPLETED',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
    </MyOrdersTabs.Navigator>
  );
}

const MyOrdersStack = createNativeStackNavigator();

function My_Orders_Stack() {
  const navigation = useNavigation();
  return (
    <MyOrdersStack.Navigator
      initialRouteName="MyOrders"
      screenOptions={{
        title: 'ORDERS',
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
        headerRight: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={() => navigation.openDrawer()}>
            <Image
              source={Images.drawerIcon}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
      }}>
      <MyOrdersStack.Screen
        name="MyOrders"
        component={My_Orders_Tabs}
        options={{ title: 'MY ORDERS', headerTitleAlign: 'center' }}
      />
      <MyOrdersStack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'ORDER DETAILS',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
    </MyOrdersStack.Navigator>
  );
}

const FeedbackTab = createNativeStackNavigator();

export function Feedback_Tab() {
  return (
    <FeedbackTab.Navigator
      initialRouteName="CompletedFeeedbacks"
      screenOptions={{
        headerShown: false,
        // activeTintColor: '#ffffff',
        // inactiveTintColor: '#adb5d1',
        // upperCaseLabel: true,
        // style: {
        //   backgroundColor: '#3b2eb6',
        //   shadowColor: 'transparent',
        //   elevation: 0,
        // },
        // tabStyles: {},
        // indicatorStyle: {
        //   backgroundColor: '#ffffff',
        // },
        labelStyle: {
          fontFamily: 'Roboto-BoldCondensed',
          letterSpacing: 2,
          fontSize: Utils.moderateScale(14),
        },
      }}>
      <FeedbackTab.Screen
        name="PendingFeedbacks"
        component={PendingFeedbacks}
        options={{
          title: '',
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
      <FeedbackTab.Screen
        name="CompletedFeeedbacks"
        component={CompletedFeedbacks}
        options={{
          title: 'COMPLETED',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
    </FeedbackTab.Navigator>
  );
}

const PricingTab = createMaterialTopTabNavigator();

function Pricing_Tab() {
  return (
    <PricingTab.Navigator
      initialRouteName="WashAndFold"
      screenOptions={{
        activeTintColor: '#ffffff',
        inactiveTintColor: '#adb5d1',
        upperCaseLabel: true,
        style: {
          backgroundColor: '#3b2eb6',
          shadowColor: 'transparent',
          elevation: 0,
        },
        tabStyles: {},
        indicatorStyle: {
          backgroundColor: '#ffffff',
        },
        labelStyle: {
          fontFamily: 'Roboto-BoldCondensed',
          letterSpacing: 2,
          fontSize: Utils.moderateScale(14),
        },
      }}>
      <PricingTab.Screen
        name="WashAndFold"
        component={WashAndFoldPricingScreen}
        options={{
          title: 'WASH & FOLD',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
      <PricingTab.Screen
        name="DryCleaning"
        component={DryCleanPricingScreen}
        options={{
          title: 'DRY CLEANING',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#dedede',
          tabBarStyle: {
            backgroundColor: '#3b2eb6',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
          },
        }}
      />
    </PricingTab.Navigator>
  );
}

const ScheduleOrderStack = createNativeStackNavigator();

function Schedule_Order_Stack() {
  const navigation = useNavigation();
  return (
    <ScheduleOrderStack.Navigator
      initialRouteName="ScheduleOrder"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
        headerRight: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={() => {
              navigation.openDrawer();
            }}>
            <Image
              source={Images.drawerIcon}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
      }}>
      <ScheduleOrderStack.Screen
        name="ScheduleOrder"
        component={ScheduleOrderScreen}
        options={{
          headerBackVisible: false,
          title: 'SCHEDULE',
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ExpressOrder"
        component={ExpressOrderScreen}
        options={{
          headerBackTitle: '',
          title: 'EXPRESS CHECKOUT',
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ScheduleOrderInstructions"
        component={ScheduleOrderInstructionsScreen}
        options={{
          title: 'SCHEDULE',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ScheduleDateTime"
        component={ScheduleDateTimeScreen}
        options={{
          title: 'SCHEDULE',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ScheduleAddress"
        component={ScheduleAddressScreen}
        options={{
          title: 'SCHEDULE',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ScheduleCard"
        component={ScheduleCardScreen}
        options={{
          title: 'SCHEDULE',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}
      />
      <ScheduleOrderStack.Screen
        name="ReviewOrder"
        component={ReviewOrderScreen}
        options={{
          title: 'REVIEW ORDER',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
        }}
      />
    </ScheduleOrderStack.Navigator>
  );
}

const NotificationsStack = createNativeStackNavigator();

function Notificatons_Stack() {
  const navigation = useNavigation();
  return (
    <NotificationsStack.Navigator
      initialRouteName="Notifications"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
        headerRight: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={
              () => navigation.openDrawer()
              // this.props?.route?.state?.routes[0]?.params?.openDrawer()
            }>
            <Image
              source={Images.drawerIcon}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
      }}>
      <NotificationsStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'ORDER TRACKER',
        }}
      />
      <NotificationsStack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'ORDER DETAILS',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
    </NotificationsStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();

function Profile_Stack() {
  const navigation = useNavigation();
  return (
    <ProfileStack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
        headerRight: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={() => {
              navigation.openDrawer();
            }}>
            <Image
              source={Images.drawerIcon}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
      }}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '', headerShown: false }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'EDIT PROFILE',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="MyCards"
        component={MyCardsScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'MY CARDS',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="AddNewCard"
        component={AddNewCardScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'ADD NEW CARD',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="MyAddressesD"
        component={MyAddressesScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'MY ADDRESSES',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="AddNewAddress"
        component={AddNewAddressScreen}
        options={{
          title: 'ADD NEW ADDRESS',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="EditAddress"
        component={EditAddressScreen}
        options={{
          title: 'EDIT ADDRESS',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'CHANGE PASSWORD',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="PricingD"
        component={Pricing_Tab}
        options={{
          title: 'PRICING',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="FeedbackD"
        component={FeedbackScreen}
        options={{
          headerBackTitle: '',
          title: 'FEEDBACK',
          headerTitleAlign: 'center',
        }}
      />
      <ProfileStack.Screen
        name="AddFeedback"
        component={AddFeedbackScreen}
        options={{
          title: 'ADD FEEDBACK',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="FeedbackDetails"
        component={FeedbackDetailsScreen}
        options={{
          title: 'FEEDBACK',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
      <ProfileStack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{
          title: 'ABOUT US',
          headerTitleAlign: 'center',
        }}
      />
      <ProfileStack.Screen
        name="FaqD"
        component={FaqScreen}
        options={{
          title: 'FAQ',
          headerTitleAlign: 'center',
          headerBackTitle: '',
        }}
      />
    </ProfileStack.Navigator>
  );
}

const FaqStack = createNativeStackNavigator();

function Faq_Stack() {
  const navigation = useNavigation();
  return (
    <FaqStack.Navigator
      initialRouteName="Faq"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
        headerLeft: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={() => {
              navigation.goBack();
            }}>
            <Image
              source={Images}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={{
              paddingLeft: Utils.scale(30),
              paddingTop: Utils.scale(10),
              paddingBottom: Utils.scale(10),
            }}
            onPress={() => {
              navigation.openDrawer();
            }}>
            <Image
              source={Images.drawerIcon}
              style={{
                marginRight: Utils.moderateScale(15, 0.5),
                width: Utils.moderateScale(22),
                height: Utils.moderateScale(22),
              }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          </TouchableOpacity>
        ),
      }}>
      <FaqStack.Screen
        name="Faq"
        component={FaqScreen}
        options={{
          title: 'FAQ',
          headerTitleAlign: 'center',
          headerBackVisible: true,
        }}
      />
    </FaqStack.Navigator>
  );
}

const MyDrawer = createDrawerNavigator();
function My_Drawer() {
  return (
    <MyDrawer.Navigator
      ref={navigationRef}
      initialRouteName="LoggedInNav"
      screenOptions={{
        overlayColor: 'transparent',
        drawerPosition: 'right',
        title: '',
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
      }}
      drawerContent={props => <DrawerContent {...props} />}>
      <MyDrawer.Screen
        name="LoggedInNav"
        component={Logged_In_Stack}
        options={{ headerShown: false }}
      />
      <MyDrawer.Screen
        name="Profile"
        component={Profile_Stack}
        options={{ headerShown: false }}
      />
      <MyDrawer.Screen
        name="MyOrders"
        component={My_Orders_Stack}
        options={{ headerShown: false }}
      />
      {/* <MyDrawer.Screen
        name="MyAddressesD"
        component={MyAddressesScreen}
        // options={{headerShown: true}}
      /> */}
      {/* <MyDrawer.Screen
        name="Pricing"
        component={Pricing_Screen_Stack}
        options={{headerShown: false}}
      /> */}
      {/* <MyDrawer.Screen
        name="Faq"
        component={Faq_Stack}
        options={{headerShown: false}}
      /> */}
    </MyDrawer.Navigator>
  );
}

const LoggedInStack = createBottomTabNavigator();

export function Logged_In_Stack() {

  const isCheck = store.getState().appData.signUpData?.isSignUpDone
  const isOrderSchedule = store.getState()?.appData?.isOrderSchedule?.isOrderSchedule
  const isDoneRate = store.getState()?.appData?.isDoneRate?.isDoneRate

  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(link => {
      isLinkingHandler(link.url);
    });
    handleDynamicLink();
    return () => unsubscribe();
  }, []);


  const handleDynamicLink = async () => {
    const initialLink = await dynamicLinks().getInitialLink();
    if (initialLink) {
      // Extract the recipe ID from the URL and navigate to the recipe detail screen
      let ID = extractRecipeIdFromLink(initialLink)

      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MyOrdersNav', // Name of the stack navigator
              state: {
                routes: [
                  {
                    name: 'OrderDetails',
                    params: { orderId: 107 }// Name of the screen within the stack navigator
                  },
                ],
              },
            },
          ]
        }),
      );


    }
  };

  const isLinkingHandler = (initialLink) => {
    if (initialLink) {
      // Extract the recipe ID from the URL and navigate to the recipe detail screen
      let ID = extractRecipeIdFromLink(initialLink)
      console.log("ID ID -------------> ", ID)
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MyOrdersNav', // Name of the stack navigator
              state: {
                routes: [
                  {
                    name: 'OrderDetails',
                    params: { orderId: ID }// Name of the screen within the stack navigator
                  },
                ],
              },
            },
          ]
        }),
      );
    }
  };


  const extractRecipeIdFromLink = (link) => {
    console.log("link ---------------> ", link);
    if (!link || typeof link !== 'string') {
      console.error("Invalid link format");
      return null;
    }

    const parts = link.split('/');
    return parts[parts.length - 1]; // Last part should be the recipe ID
  };

  const rateModalStyles = StyleSheet.create({
    button: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textTransform: 'upparcase'
    },
  })

  useEffect(() => {
    // Timer for the first ad after 5 minutes
    console.log('REDUX--->', isCheck, isOrderSchedule, isOrderSchedule % 3 == 0, isDoneRate)
    if (isCheck && isOrderSchedule && isOrderSchedule % 3 == 0 && !isDoneRate) {
      const firstAdTimer = setTimeout(() => {

        // const options = {
        //   AppleAppID: "1436606731",
        //   GooglePackageName: "com.otgc.onthegocleaners",
        //   // AmazonPackageName: "com.mywebsite.myapp",
        //   // OtherAndroidURL: "http://www.randomappstore.com/app/47172391",
        //   preferredAndroidMarket: AndroidMarket.Google,
        //   preferInApp: true,
        //   openAppStoreIfInAppFails: false,
        //   // fallbackPlatformURL: "http://www.mywebsite.com/myapp.html",
        // }
        // store.dispatch(ActionCreators.setOrderSchedule({ isOrderSchedule: false }))
        // Rate.rate(options, (success, errorMessage) => {
        //   if (success) {
        //     store.dispatch(ActionCreators.setDoneRate({ isDoneRate: true }))
        //     // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        //   }
        //   if (errorMessage) {
        //     // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
        //     console.error(`Example page Rate.rate() error: ${errorMessage}`)
        //   }
        // })

        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            // when return true in android it means user finished or close review flow
            console.log('InAppReview in android', hasFlowFinishedSuccessfully);

            console.log(
              'InAppReview in ios has launched successfully',
              hasFlowFinishedSuccessfully,
            );

            if (hasFlowFinishedSuccessfully) {
              store.dispatch(ActionCreators.setDoneRate({ isDoneRate: true }))
              // do something for ios
              // do something for android
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }, 2000); // 300000 ms = 5 minutes

      return () => {
        clearTimeout(firstAdTimer);
      };
    }
  }, [isCheck, isOrderSchedule, isDoneRate]);

  return (
    <>
      <LoggedInStack.Navigator
        ref={navigationRef}
        initialRouteName="ScheduleOrderNav"
        screenOptions={{
          shifting: 'true',
          headerShown: false,
          tabBarStyle: { backgroundColor: '#21e381' },
        }}>
        <LoggedInStack.Screen
          name="ScheduleOrderNav"
          component={Schedule_Order_Stack}
          listeners={({ navigation }) => ({
            tabPress: e => {
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('ScheduleOrder');
              }
            }
          })}
          options={{
            tabBarLabel: 'Order Now',
            tabBarIcon: ({ focused, tintColor }) => {
              var icon = focused ? Images.scheduleOnIcon : Images.scheduleOffIcon;
              return <Image source={icon} />;
            },
            tabBarActiveBackgroundColor: '#21e381',
            tabBarInactiveBackgroundColor: '#21e381',
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#696969',
          }}
        />
        <LoggedInStack.Screen
          name="MyOrdersNav"
          component={My_Orders_Stack}
          listeners={({ navigation }) => ({
            tabPress: event => {
              // if (!is_onboarding_completed) {
              event.preventDefault();
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('LoggedInNav', { screen: 'MyOrdersNav' });
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
            },
          })}
          options={{
            tabBarLabel: 'My Orders',
            tabBarActiveBackgroundColor: '#21e381',
            tabBarInactiveBackgroundColor: '#21e381',
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#696969',
            tabBarIcon: ({ focused, tintColor }) => {
              var icon = focused ? Images.ordersOnIcon : Images.ordersOffIcon;
              return (
                <Image
                  source={icon}
                  height={Utils.scale(25)}
                  width={Utils.scale(25)}
                />
              );
            },
          }}
        />

        <LoggedInStack.Screen
          name="NotificationsNav"
          component={Notificatons_Stack}
          listeners={({ navigation }) => ({
            tabPress: event => {
              // if (!is_onboarding_completed) {
              event.preventDefault();
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('LoggedInNav', { screen: 'NotificationsNav' });
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
            },
          })}
          options={{
            tabBarLabel: 'Order Tracker',
            tabBarActiveBackgroundColor: '#21e381',
            tabBarInactiveBackgroundColor: '#21e381',
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#696969',
            tabBarIcon: ({ focused, tintColor }) => {
              var icon = focused
                ? Images.notificationOnIcon
                : Images.notificationOffIcon;

              return <Image source={icon} />;
            },
          }}
        />
        <LoggedInStack.Screen
          name="ProfileNav"
          component={Profile_Stack}
          listeners={({ navigation }) => ({
            tabPress: event => {
              // if (!is_onboarding_completed) {
              event.preventDefault();
              const isCheck = store.getState().appData.signUpData?.isSignUpDone
              if (isCheck) {
                navigation.navigate('LoggedInNav', { screen: 'ProfileNav' });
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'You need to login first',
                );
              }
            },
          })}
          options={{
            tabBarLabel: 'My Profile',
            tabBarActiveBackgroundColor: '#21e381',
            tabBarInactiveBackgroundColor: '#21e381',
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#696969',
            tabBarIcon: ({ focused, tintColor }) => {
              var icon = focused ? Images.profileOnIcon : Images.profileOffIcon;
              return <Image source={icon} />;
            },
          }}
        />
      </LoggedInStack.Navigator>
      <RateModal
        modalTitle="Are you enjoying this app?"
        rateBtnText={'Rate'}
        cancelBtnText={'Cancel'}
        totalStarCount={5}
        defaultStars={0}
        isVisible={true}
        sendBtnText={'Send'}
        commentPlaceholderText={'Placeholder text'}
        emptyCommentErrorMessage={'Empty comment error message'}
        iTunesStoreUrl={`itms-apps://itunes.apple.com/app/${Utils.IOS_APP_ID}`}
        playStoreUrl={`market://details?id=${Utils.ANDROID_APP_ID}`}
        isModalOpen={isModalOpen}
        // storeRedirectThreshold={3}
        style={{
          paddingHorizontal: 30,
        }}
        onSendReview={(e) => {
          console.log("ISPRESS", e)
        }}
        onStarSelected={(e) => {
          console.log('change rating', e);
        }}
        onClosed={() => {
          console.log('pressed cancel button...')
          setIsModalOpen(false)
        }}
        sendContactUsForm={(state) => {
          console.log('change rating', state);
          store.dispatch(ActionCreators.setDoneRate(true))
          setIsModalOpen(false)
        }}
        styles={rateModalStyles}
        ratingProps={{
          selectedColor: 'red',
        }}
        modalProps={{
          animationType: 'fade',
        }}
      />
    </>
  );
}

const LoggedOutStack = createNativeStackNavigator();

export function Logged_Out_Stack() {
  return (
    <LoggedOutStack.Navigator
      initialRouteName="TermsConditionsScreen"
      screenOptions={{
        headerMode: 'screen',
        headerStyle: {
          backgroundColor: '#3b2eb6',
          borderBottomWidth: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Regular',
          letterSpacing: 2,
          ...Platform.select({
            android: {
              fontSize: Utils.moderateScale(16),
            },
          }),
        },
        headerTintColor: 'white',
        headerBackTitle: null,
      }}>
      <LoggedOutStack.Screen
        name="Landing"
        component={LandingScreen}
        options={{
          headerShown: false,
        }}
      />
      <LoggedOutStack.Screen
        name="LoginSignup"
        component={LoginSignupScreen}
        options={{
          headerShown: false,
        }}
      />
      <LoggedOutStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
      <LoggedOutStack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
      />

      <LoggedOutStack.Screen name="Otp" component={OtpScreen} />
      <LoggedOutStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'FORGOT PASSWORD',
          headerTitleAlign: 'center',
        }}
      />
      <LoggedOutStack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
      />
    </LoggedOutStack.Navigator>
  );
}

const RootStack = createNativeStackNavigator();

const RootStackCreator = e => {
  // console.log('Value of Sign In =============>', e);
  let routename;
  let signedIn = e.signedIn;

  if (signedIn) {
    routename = 'LoggedInNav';
  } else {
    routename = 'LoggedOutNav';
  }
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator initialRouteName={routename}>
        <RootStack.Screen
          name="LoggedInNav"
          component={My_Drawer}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="LoggedOutNav"
          component={Logged_Out_Stack}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );

  // return createSwitchNavigator(
  //   {
  //     LoggedOutNav: {
  //       screen: Logged_Out_Stack,
  //     },
  //     LoggedInNav: {
  //       screen: Logged_In_Stack,
  //     },
  //   },
  //   {
  //     initialRouteName: signedIn == false ? 'LoggedOutNav' : 'LoggedInNav',
  //   },
  // );
};

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    signUpData: state.appData.signUpData,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearScheduleOrderData: data =>
      dispatch(ActionCreators.clearScheduleOrderData(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStackCreator);
