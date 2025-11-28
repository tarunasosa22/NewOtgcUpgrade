import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
// import { SafeAreaView } from "react-navigation";
import Images from '../assets/images/index';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';

class ScheduleOrderInstructionsScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'SCHEDULE',
      headerRight: (
        <TouchableOpacity
          style={{
            paddingLeft: Utils.scale(30),
            paddingTop: Utils.scale(10),
            paddingBottom: Utils.scale(10),
          }}
          onPress={navigation.getParam('openDrawer')}>
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
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      siteData: null,
      services:
        props?.appData?.appData?.scheduleOrderData?.servicesAndPreferences
          ?.services,
      service_instructions: this.props.serviceInstructions,
      dry_instructions: this.props.dryInstructions,
      driver_instructions: this.props.driverInstructions,
      verticalChangeInDriverInstructions: 4,
      minimum_order_charge: props.route.params.minimum_order_charge,
    };
    this.navToSelectDateTime = this.navToSelectDateTime.bind(this);
    this.inputs = {};
    this.keyboardWillShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
        : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    this.keyboardWillHideSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
        : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    this.inputs.driverInstructions.measure(
      (x, y, width, height, pageX, pageY) => {
        let diff = pageY + height + 60 - event.endCoordinates.screenY;
        if (diff > 0) {
          this.setState({verticalChangeInDriverInstructions: diff});
        }
      },
    );
  };

  keyboardWillHide = event => {
    this.setState({verticalChangeInDriverInstructions: 4});
  };

  componentDidMount() {
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });

    Utils.makeApiRequest(
      'settings',
      {},
      this.props.appData.token,
      'GET',
      'auth',
    ).then(response => {
      if (response.status) {
        this.setState({siteData: response.data});
      }
    });
  }

  navToSelectDateTime() {
    this.props.setScheduleOrderDataInstructions({
      service_instructions: this.state.service_instructions,
      dry_instructions: this.state.dry_instructions,
      driver_instructions: this.state.driver_instructions,
    });
    this.props.navigation.navigate('ScheduleDateTime');
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.scrollView}>
            {this?.state?.services.includes('Wash & Fold') && (
              <View style={localStyle.serviceInstructions}>
                <Text style={[localStyle.text, localStyle.heading]}>
                  Additional Wash & Fold Instructions
                </Text>
                <View style={[styles.card, localStyle.card]}>
                  <TextInput
                    placeholder="We will try and honor but cannot guarantee"
                    multiline={true}
                    numberOfLines={4}
                    maxLength={150}
                    style={localStyle.textInput}
                    onEndEditing={() => Keyboard.dismiss()}
                    underlineColorAndroid="transparent"
                    value={this.state.service_instructions}
                    ref={input => (this.inputs['serviceInstructions'] = input)}
                    onChangeText={serviceInstructions => {
                      this.setState({
                        service_instructions: serviceInstructions,
                      });
                    }}
                  />
                </View>
              </View>
            )}
            {this?.state?.services.includes('Dry Cleaning / Wash & Press') && (
              <View style={localStyle.serviceInstructions}>
                <Text style={[localStyle.text, localStyle.heading]}>
                  {/* Additional Dry Cleaning / Wash & Press Instructions */}
                  Additional Dry Cleaning Instructions
                </Text>
                <View style={[styles.card, localStyle.card]}>
                  <TextInput
                    placeholder="We will try and honor but cannot guarantee"
                    multiline={true}
                    numberOfLines={4}
                    style={localStyle.textInput}
                    onEndEditing={() => Keyboard.dismiss()}
                    underlineColorAndroid="transparent"
                    maxLength={150}
                    value={this.state.dry_instructions}
                    ref={input => (this.inputs['dryInstructions'] = input)}
                    onChangeText={dryInstructions => {
                      this.setState({
                        dry_instructions: dryInstructions,
                      });
                    }}
                  />
                </View>
              </View>
            )}
            <View style={localStyle.driverInstructions}>
              <Text style={[localStyle.text, localStyle.heading]}>
                DRIVER/DELIVERY INSTRUCTIONS
              </Text>
              <View
                style={[
                  styles.card,
                  localStyle.card,
                  {
                    marginBottom: this.state.verticalChangeInDriverInstructions,
                  },
                ]}>
                <TextInput
                  // placeholder="This box is not for scheduling delivery.  If you do not have a doorman, please schedule with your driver."
                  multiline={true}
                  onEndEditing={() => Keyboard.dismiss()}
                  numberOfLines={4}
                  maxLength={150}
                  value={this.state.driver_instructions}
                  style={localStyle.textInput}
                  underlineColorAndroid="transparent"
                  ref={input => (this.inputs['driverInstructions'] = input)}
                  onChangeText={driverInstructions => {
                    this.setState({driver_instructions: driverInstructions});
                  }}
                />
              </View>
            </View>
          </ScrollView>
          <View
            style={{
              paddingHorizontal: 15,
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <Text
              style={[
                localStyle.text,
                localStyle.heading,
                {
                  fontSize: Utils.moderateScale(12),
                  color: '#ffff',
                  textAlign: 'center',
                },
              ]}>
              Please note if your order is under{' '}
              <Text
                style={{fontWeight: '900', fontSize: Utils.moderateScale(13)}}>
                ${this.state.siteData?.minimum_order_charge}
              </Text>
              , there will be a surcharge to reach this minimum.
            </Text>
          </View>
          <BlueButton
            onPress={this.navToSelectDateTime}
            buttonText="CONTINUE"
            style={localStyle.button}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  serviceInstructions: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(30),
  },
  driverInstructions: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(25),
  },
  card: {
    marginTop: Utils.moderateScale(15),
    padding: Utils.moderateScale(10),
    paddingBottom: Utils.moderateScale(5),
    height: Utils.moderateScale(120),
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
    marginTop: Utils.scale(5),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
  },
  textInput: {
    height: Utils.moderateScale(100),
    color: '#17114f',
    fontSize: Utils.moderateScale(14),
    textAlignVertical: 'top',
  },
  heading: {
    letterSpacing: 1,
  },
});

const mapStateToProps = state => {
  return {
    appData: state,
    dryInstructions:
      state.appData.scheduleOrderData.instructions.dry_instructions,
    serviceInstructions:
      state.appData.scheduleOrderData.instructions.service_instructions,
    driverInstructions:
      state.appData.scheduleOrderData.instructions.driver_instructions,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setScheduleOrderDataInstructions: data =>
      dispatch(ActionCreators.setScheduleOrderDataInstructions(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScheduleOrderInstructionsScreen);
