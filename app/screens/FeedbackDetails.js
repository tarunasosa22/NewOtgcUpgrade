import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import Images from '../assets/images/index';
import styles from './styles';
import LoaderView from '../components/LoaderView';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';

class FeedbackDetailsScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'FEEDBACK',
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
      details: null,
      loading: true,
    };
    this._mounted = false;
    const {params} = this.props.route;
    this.id = params ? params.id : null;
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    Utils.makeApiRequest(
      `/single/${this.id}`,
      {feedback_id: this.id},
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
          } else if (result.status) {
            this.setState({loading: false, details: result.data});
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

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    let details = this.state.details,
      date = '---',
      month = '---',
      status = '---';
    if (details) {
      console.log();
      date = new Date(details.created).toString().split(' ');
      month = date[1];
      date = date[0];
      status =
        {
          pending: 'Pending',
          in_progress: 'In Progress',
          completed: 'Completed',
        }[details.status] || '---';
    }
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.loading ? (
            <LoaderView loading={this.state.loading} />
          ) : (
            <View>
              <View
                style={[styles.card, localStyle.card, localStyle.firstCard]}>
                <View
                  style={[
                    localStyle.infoContainer,
                    localStyle.infoContainerForOrderDate,
                  ]}>
                  <View>
                    <View style={localStyle.orderDateContainer}>
                      <Text style={localStyle.orderDateDay}>{date}</Text>
                    </View>
                    <Text style={localStyle.orderTime}>{month}</Text>
                  </View>
                </View>
                <View style={localStyle.infoContainer}>
                  <View style={localStyle.subject}>
                    <Text style={localStyle.labels}>SUBJECT</Text>
                    <Text style={localStyle.info}>
                      {details && details.subject
                        ? details.subject?.name
                        : '---'}
                    </Text>
                  </View>
                  <View style={localStyle.stauts}>
                    <Text style={localStyle.labels}>STATUS</Text>
                    <Text style={localStyle.info}>
                      {`\u2022 `} {status}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.card, localStyle.card, localStyle.feedback]}>
                <Text style={localStyle.info}>
                  {details.feedbacks ? details.feedbacks : '---'}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  card: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.scale(8),
    paddingTop: Utils.moderateScale(15),
    paddingBottom: Utils.moderateScale(15),
  },
  firstCard: {
    marginTop: Utils.moderateScale(30),
    flexDirection: 'row',
  },
  infoContainer: {
    justifyContent: 'space-evenly',
    flex: 1,
    marginLeft: Utils.moderateScale(15),
  },
  orderDateDay: {
    fontFamily: 'Roboto-BoldCondensed',
    fontSize: Utils.moderateScale(18, 0.5),
    color: 'black',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
  },
  orderTime: {
    fontFamily: 'Poppins-Regular',
    color: '#a9b6be',
    fontSize: Utils.moderateScale(14, 0.5),
  },
  info: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14, 0.5),
  },
  labels: {
    fontFamily: 'Poppins-Regular',
    color: '#b1b6bb',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(12),
  },
  feedback: {
    paddingLeft: Utils.moderateScale(15),
    paddingRight: Utils.moderateScale(15),
  },
  orderDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainerForOrderDate: {
    borderRightWidth: 1,
    borderRightColor: '#d7d8da',
    alignItems: 'center',
    flex: 0.2,
    marginLeft: 0,
  },
  subject: {
    marginBottom: Utils.moderateScale(10),
  },
  status: {
    marginTop: Utils.moderateScale(10),
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedbackDetailsScreen);
