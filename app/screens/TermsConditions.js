import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import WebView from 'react-native-webview';
// import {SafeAreaView} from 'react-navigation';
import styles from './styles';
import * as Utils from '../lib/utils';

export default class TermsConditionsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'TERMS & CONDITIONS',
    };
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <WebView
          style={styles.WebViewStyle}
          onLoad={() => this.setState({loading: false})}
          source={{uri: 'https://www.onthegocleaners.com/terms-conditions'}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        {this.state.loading && (
          <ActivityIndicator
            size="large"
            style={localStyle.activityIndicator}
          />
        )}
      </SafeAreaView>
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
