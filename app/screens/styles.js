import {StyleSheet, Platform} from 'react-native';
import * as Utils from '../lib/utils';

export default styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#faf9ff',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12),
    paddingTop: Utils.verticalScale(5),
  },
});
