import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import {Tab, Tabs, ScrollableTab} from 'native-base';
import {connect} from 'react-redux';
import styles from './styles';
import Images from '../assets/images/index';
import {ActionCreators} from '../actions/index';
import * as Utils from '../lib/utils';
import BlueButton from '../components/button/BlueButton';
import PendingFeedbacks from './PendingFeedbacks';
import CompletedFeedbacks from './CompletedFeedbacks';
import {TabView, SceneMap} from 'react-native-tab-view';
import {Feedback_Tab} from '../config/routes';

class FeedbackScreen extends Component {
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
      index: 0,
      routes: [
        {key: 'first', title: 'First'},
        {key: 'second', title: 'Second'},
      ],
    };
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.props.newFeedbackAdded.added) {
          this.pendingFeedbacksTab && this.pendingFeedbacksTab.handleRefresh();
          this.props.toggleNewFeedbackAdded();
        }
      },
    );
  }

  componentDidMount() {
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
  }

  render() {
    // renderScene = SceneMap({
    //   first: <PendingFeedbacks />,
    //   second: <CompletedFeedbacks />,
    // });
    // const layout = useWindowDimensions();
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: '#3b2eb6'}]}>
        <BlueButton
          onPress={() => this.props.navigation.navigate('AddFeedback')}
          buttonText="+ ADD NEW"
          style={localStyle.button}
        />
        {/* <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
        /> */}
        {/* <Tabs
          renderTabBar={() => (
            <ScrollableTab
              style={{borderWidth: 0, backgroundColor: '#3b2eb6'}}
            />
          )}
          tabBarUnderlineStyle={{backgroundColor: '#ffffff', height: 2}}>
          <Tab
            heading="PENDING"
            tabStyle={localStyle.tabStyle}
            activeTabStyle={localStyle.tabStyle}
            textStyle={localStyle.textStyle}
            activeTextStyle={localStyle.activeTextStyle}>
            <PendingFeedbacks
              ref={ref => (this.pendingFeedbacksTab = ref)}
              navigation={this.props.navigation}
              userToken={this.props.appData.token}
            />
          </Tab>
          <Tab
            heading="COMPLETED"
            tabStyle={localStyle.tabStyle}
            activeTabStyle={localStyle.tabStyle}
            textStyle={localStyle.textStyle}
            activeTextStyle={localStyle.activeTextStyle}>
            <CompletedFeedbacks
              navigation={this.props.navigation}
              userToken={this.props.appData.token}
            />
          </Tab>
        </Tabs> */}
        <View style={{margin: 10}}></View>
        <Feedback_Tab />
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  button: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(15),
    ...Platform.select({
      ios: {
        shadowColor: '#171151',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.0,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabStyle: {
    backgroundColor: '#3b2eb6',
    shadowColor: 'transparent',
    elevation: 0,
  },
  textStyle: {
    fontFamily: 'Roboto-BoldCondensed',
    letterSpacing: 2,
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
    fontSize: Utils.moderateScale(14),
    color: '#adb5d1',
  },
  activeTextStyle: {
    fontFamily: 'Roboto-BoldCondensed',
    letterSpacing: 2,
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
    fontSize: Utils.moderateScale(14),
    color: '#ffffff',
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    newFeedbackAdded: state.appData.newFeedbackAdded,
    // newCardAdded: state.appData.newCardAdded,
    // cardUpdated: state.appData.cardUpdated,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleNewFeedbackAdded: data =>
      dispatch(ActionCreators.toggleNewFeedbackAdded(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackScreen);
