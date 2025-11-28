import ActionButton from 'react-native-action-button';
import {Animated} from 'react-native';
/**
 *  @ Monkey patch to remove useNativeDriver warning
 *  until the PR gets merged we have to use this sollution as mentioned in below lint
 *  https://github.com/mastermoo/react-native-action-button/issues/339#issuecomment-667648863
 */

export default (() => {
  ActionButton.prototype.animateButton = function (animate = true) {
    if (this.state.active) return this.reset();

    if (animate) {
      Animated.spring(this.anim, {toValue: 1, useNativeDriver: false}).start();
    } else {
      this.anim.setValue(1);
    }

    this.setState({active: true, resetToken: this.state.resetToken});
  };

  ActionButton.prototype.reset = function (animate = true) {
    if (this.props.onReset) this.props.onReset();

    if (animate) {
      Animated.spring(this.anim, {toValue: 0, useNativeDriver: false}).start();
    } else {
      this.anim.setValue(0);
    }

    setTimeout(() => {
      if (this.mounted) {
        this.setState({active: false, resetToken: this.state.resetToken});
      }
    }, 250);
  };
})();
