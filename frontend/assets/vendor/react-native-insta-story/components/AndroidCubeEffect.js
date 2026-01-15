import React from 'react';
import PropTypes from 'prop-types';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PERSPECTIVE = Platform.OS === 'ios' ? 2.38 : 2.2;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.4;

export default class AndroidCubeEffect extends React.Component {
  constructor(props) {
    super(props);

    this.pages = this.props.children.map((child, index) => width * -index);
    this.fullWidth = (this.props.children.length - 1) * width;

    this.state = {
      currentPage: 0,
      scrollLockPage: this.pages[this.props.scrollLockPage],
    };
  }

  UNSAFE_componentWillMount() {
    this._animatedValue = new Animated.ValueXY();
    this._animatedValue.setValue({ x: 0, y: 0 });
    this._value = { x: 0, y: 0 };

    this._animatedValue.addListener((value) => {
      this._value = value;
    });

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const threshold = this.props.swipeThreshold ?? 40;
        return Math.abs(gestureState.dx) > threshold;
      },
      onPanResponderGrant: () => {
        if (this.props.callbackOnSwipe) {
          this.props.callbackOnSwipe(true);
        }
        this._animatedValue.stopAnimation();
        this._animatedValue.setOffset({ x: this._value.x, y: this._value.y });
      },
      onPanResponderMove: (e, gestureState) => {
        if (this.props.loop) {
          if (gestureState.dx < 0 && this._value.x < -this.fullWidth) {
            this._animatedValue.setOffset({ x: width });
          } else if (gestureState.dx > 0 && this._value.x > 0) {
            this._animatedValue.setOffset({ x: -(this.fullWidth + width) });
          }
        }
        Animated.event([null, { dx: this._animatedValue.x }], {
          useNativeDriver: false,
        })(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
      onPanResponderTerminate: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
    });

    const onDoneSwiping = (gestureState) => {
      if (this.props.callbackOnSwipe) {
        this.props.callbackOnSwipe(false);
      }
      const threshold = this.props.swipeThreshold ?? 40;
      let mod = 0;

      if (gestureState.dx > threshold) {
        mod = width / 2;
      } else if (gestureState.dx < -threshold) {
        mod = -width / 2;
      }
      let modPage =
        gestureState.dx > threshold
          ? threshold
          : gestureState.dx < -threshold
          ? -threshold
          : 0;

      const lastPageOffset = this.pages[this.pages.length - 1] ?? 0;
      const atLastPagePosition = Math.abs(this._value.x - lastPageOffset) < width * 0.6;
      if (gestureState.dx < -threshold && atLastPagePosition) {
        if (this.props.onSwipeBeyondEnd) {
          this._animatedValue.stopAnimation();
          this._animatedValue.setValue({
            x: this.pages[this.pages.length - 1],
            y: 0,
          });
          this.props.onSwipeBeyondEnd();
        }
        return;
      }

      const currentPage = Math.abs(this._closestPage(this._value.x + modPage));
      let goTo = this._closest(this._value.x + mod);
      this._animatedValue.flattenOffset({
        x: this._value.x,
        y: this._value.y,
      });
      Animated.timing(this._animatedValue, {
        toValue: { x: goTo, y: 0 },
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      setTimeout(() => {
        this.setState({
          currentPage,
        });
        if (this.props.callBackAfterSwipe) {
          this.props.callBackAfterSwipe(currentPage);
        }
      }, 500);
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({
      scrollLockPage: props.scrollLockPage
        ? this.pages[props.scrollLockPage]
        : undefined,
    });
  }

  /*
      @page: index
    */
  scrollTo(page, animated) {
    animated = animated == undefined ? true : animated;

    if (animated) {
      Animated.timing(this._animatedValue, {
        toValue: { x: this.pages[page], y: 0 },
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      this._animatedValue.setValue({ x: this.pages[page], y: 0 });
    }
    this.setState({
      currentPage: page,
    });
  }

  /*
    Private methods
    */

  _getTransformsFor = (i) => {
    let scrollX = this._animatedValue.x;
    let pageX = -width * i;

    let translateX = scrollX.interpolate({
      inputRange: [pageX - width, pageX, pageX + width],
      outputRange: [(-width - 1) / TR_POSITION, 0, (width + 1) / TR_POSITION],
      extrapolate: 'clamp',
    });

    let rotateY = scrollX.interpolate({
      inputRange: [pageX - width, pageX, pageX + width],
      outputRange: ['-60deg', '0deg', '60deg'],
      extrapolate: 'clamp',
    });

    let translateXAfterRotate = scrollX.interpolate({
      inputRange: [
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width,
      ],
      outputRange: [
        -width - 1,
        (-width - 1) / PERSPECTIVE,
        0,
        (width + 1) / PERSPECTIVE,
        +width + 1,
      ],
      extrapolate: 'clamp',
    });

    let opacity = scrollX.interpolate({
      inputRange: [
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width,
      ],
      outputRange: [0, 0.6, 1, 0.6, 0],
      extrapolate: 'clamp',
    });

    return {
      transform: [
        { perspective: width },
        { translateX },
        { rotateY: rotateY },
        { translateX: translateXAfterRotate },
      ],
      opacity: opacity,
    };
  };

  _renderChild = (child, i) => {
    let expandStyle = this.props.expandView
      ? { paddingTop: 100, paddingBottom: 100, height: height + 200 }
      : { width, height };
    let style = [child.props.style, expandStyle];
    let props = {
      i,
      style,
    };
    let element = React.cloneElement(child, props);

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'transparent' },
          this._getTransformsFor(i, false),
        ]}
        key={`child- ${i}`}
      >
        {element}
      </Animated.View>
    );
  };

  _closest = (num) => {
    let array = this.pages;

    let i = 0;
    let minDiff = 1000;
    let ans;
    for (i in array) {
      let m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = array[i];
      }
    }
    return ans;
  };

  _closestPage = (num) => {
    let array = this.pages;

    let i = 0;
    let minDiff = 1000;
    let ans;
    for (i in array) {
      let m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = i;
      }
    }
    return ans;
  };

  render() {
    let expandStyle = this.props.expandView
      ? { top: -100, left: 0, width, height: height + 200 }
      : { width, height };

    return (
      <Animated.View
        style={styles.flex}
        ref={(view) => {
          this._scrollView = view;
        }}
        {...this._panResponder.panHandlers}
      >
        <Animated.View style={[styles.blackFullScreen, expandStyle]}>
          {this.props.children.map(this._renderChild)}
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  blackFullScreen: {
    backgroundColor: '#000',
    position: 'absolute',
    width,
    height,
  },
});

AndroidCubeEffect.propTypes = {
  callBackAfterSwipe: PropTypes.func,
  scrollLockPage: PropTypes.number,
  expandView: PropTypes.bool,
  children: PropTypes.array,
  callbackOnSwipe: PropTypes.func,
  loop: PropTypes.bool,
  swipeThreshold: PropTypes.number,
  onSwipeBeyondEnd: PropTypes.func,
};

AndroidCubeEffect.defaultProps = {
  expandView: false,
  swipeThreshold: 40,
};
