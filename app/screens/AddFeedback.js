import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import Images from '../assets/images/index';
import {connect} from 'react-redux';
import PickerInput from '../components/PickerInput';
import {ActionCreators} from '../actions/index';
import LoaderView from '../components/LoaderView';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';
import {Picker} from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import {utils} from '@react-native-firebase/app';
import * as Sentry from '@sentry/react-native';

class AddFeedbackScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'ADD FEEDBACK',
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
      subject_id: 'Select Subject',
      checkValue: '',
      subjectList: [],
      feedback: '',
      errors: {
        subject_id: '',
        feedback: '',
      },
      loading: true,
    };
    this._mounted = false;
    this.addFeedback = this.addFeedback.bind(this);
    this.inputs = {};
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchSubjects();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  fetchSubjects() {
    Utils.makeApiRequest(
      'subjects',
      {},
      this.props.appData.token,
      'GET',
      'feedback',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status == true) {
            this.setState({subjectList: result.data, loading: false});
          } else {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.msg || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  addFeedback() {
    let error = false;

    if (this.state.subject_id == 'Select Subject') {
      Utils.displayAlert('', 'Please select subject');
      error = true;
    } else if (!this.state.feedback) {
      Utils.displayAlert('', 'Please enter feedback');
      error = true;
    }

    if (error) {
      return;
    }

    Keyboard.dismiss();
    this.setState({loading: true});

    Utils.makeApiRequest(
      'feedback',
      {
        feedback_subject_id: this.state.subject_id,
        feedbacks: this.state.feedback,
        user_id: this.props.appData.id,
        created_by: this.props.appData.id,
      },
      this.props.appData.token,
      'POST',
      '',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            let message = result?.message || result?.msg;
            if (message) {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('Opps!', message);
              }
            } else {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  'Opps!',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          } else if (result.status == true) {
            this.setState({
              subject_id: 'Select Subject',
              feedback: '',
              loading: false,
            });
            Utils.displayAlert(
              'Info!',
              result.msg || 'Address has been saved successfully',
              'OK',
              null,
              () => {
                this.props.toggleNewFeedbackAdded();
                this.props.navigation.navigate('FeedbackD');
              },
              false,
              false,
            );
          } else {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  showSubjectList() {
    this.state.subjectList.map(val => {
      return <Text>{val.name}</Text>;
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.loading && (
            <View style={localStyle.loaderContainer}>
              <LoaderView
                loading={this.state.loading}
                style={localStyle.loader}
              />
            </View>
          )}
          <ScrollView
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.scrollView}>
            <View style={[styles.card, localStyle.pickerInputContainer]}>
              {/* OLD CODE */}
              {/* <RNPickerSelect
                placeholder={{label: 'Select Subject'}}
                style={pickerSelectStyles}
                value={this.state.subject_id}
                useNativeAndroidPickerStyle={false}
                onValueChange={value => {
                  Keyboard.dismiss();
                  this.state.errors.subject_id = '';
                  this.setState({
                    subject_id: value,
                    errors: this.state.errors,
                  });
                }}
                items={this.state.subjectList.map(obj => ({
                  id: obj.id,
                  label: obj.name,
                  value: obj.id,
                }))}
                // ]}
                onDonePress={val => {}}
              /> */}

              {/* NEW CODE */}
              {/* <Picker
                placeholder={'Select Subject'}
                style={pickerSelectStyles}
                selectedValue={this.state.subject_id}
                onValueChange={value => {
                  Keyboard.dismiss();
                  this.state.errors.subject_id = '';
                  this.setState({
                    subject_id: value,
                    errors: this.state.errors,
                  });
                }}
                // items={this.state.subjectList.map(obj => ({
                //   id: obj.id,
                //   label: obj.name,
                //   value: obj.id,
                // }))}
                // ]}
              >
                {this.state.subjectList.map(obj => {
                  return (
                    <Picker.Item key={obj.id} label={obj.name} value={obj.id} />
                  );
                })}
              </Picker> */}

              <SelectDropdown
                onSelect={(selectedItem, index) => {
                  Keyboard.dismiss();
                  this.state.errors.subject_id = '';
                  this.setState({
                    subject_id: selectedItem.id,
                    errors: this.state.errors,
                  });
                }}
                data={this.state.subjectList}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem.name;
                }}
                defaultButtonText="Select Subject"
                rowTextForSelection={(item, inex) => {
                  return item.name;
                }}
                buttonStyle={{width: utils.width, borderRadius: 8}}
              />

              {this.showSubjectList()}
            </View>

            <View style={[styles.card, localStyle.card]}>
              <TextInput
                returnKeyType="next"
                placeholder="Write your feedback here..."
                multiline={true}
                numberOfLines={4}
                style={localStyle.textInput}
                underlineColorAndroid="transparent"
                ref={input => (this.inputs['feedback'] = input)}
                onChangeText={feedback => {
                  this.state.errors.feedback = '';
                  this.setState({
                    feedback: feedback,
                    errors: this.state.errors,
                  });
                }}
              />
            </View>
          </ScrollView>
          <BlueButton
            onPress={this.addFeedback}
            buttonText="SUBMIT"
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
  subject: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(30),
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(8),
    paddingTop: Utils.moderateScale(15),
    paddingLeft: Utils.moderateScale(20),
    paddingRight: Utils.moderateScale(20),
    height: Utils.moderateScale(140),
    marginBottom: Utils.scale(4),
  },
  pickerInputContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(30),
    // paddingTop: Utils.moderateScale(15),
    // paddingLeft: Utils.moderateScale(20),
    // paddingRight: Utils.moderateScale(20),
    paddingBottom: 0,
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
    marginTop: Utils.scale(5),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
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
  dropdownPickerStyle: {
    width: Utils.scale(300),
    marginLeft: Utils.moderateScale(15),
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  loader: {},
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    color: 'black',
    height: 50,
    backgroundColor: '#f0f0f0',
    paddingRight: 30,
    marginBottom: 10,
    paddingLeft: 10, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    width: '100%',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 15,
    color: 'black',
    backgroundColor: '#f0f0f0',
    paddingRight: 30,
    marginBottom: 10, // to ensure the text is never behind the icon
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleNewFeedbackAdded: data =>
      dispatch(ActionCreators.toggleNewFeedbackAdded(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddFeedbackScreen);
