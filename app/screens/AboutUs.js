import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import WebView from 'react-native-webview';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import styles from './styles';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';

class AboutUsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'ABOUT US',
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

  componentDidMount() {
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <WebView
            style={styles.WebViewStyle}
            onLoad={() => this.setState({loading: false})}
            source={{uri: 'https://www.onthegocleaners.com/about-us'}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          {this.state.loading && (
            <ActivityIndicator
              size="large"
              style={localStyle.activityIndicator}
            />
          )}
        </LinearGradient>
      </View>
    );
  }
}

const localStyle = StyleSheet.create({
  WebViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  activityIndicator: {
    position: 'absolute',
    top: Utils.height / 2 - 10,
    left: Utils.width / 2 - 10,
  },
});

const mapStateToProps = state => {
  return {
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AboutUsScreen);
