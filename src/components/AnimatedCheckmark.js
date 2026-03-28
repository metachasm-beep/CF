import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing, 
  withSequence, 
  withDelay, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width } = Dimensions.get('window');

const AnimatedCheckmark = ({ onAnimationComplete }) => {
  const circleProgress = useSharedValue(0);
  const pathProgress = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    circleProgress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    pathProgress.value = withDelay(
      300, 
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }, () => {
        if (onAnimationComplete) {
          // Fade out after completion
          opacity.value = withDelay(800, withTiming(0, { duration: 300 }, (isFinished) => {
             if (isFinished) {
               runOnJS(onAnimationComplete)();
             }
          }));
        }
      })
    );
  }, []);

  const animatedCircleProps = useAnimatedProps(() => {
    const perimeter = 2 * Math.PI * 45;
    return {
      strokeDashoffset: perimeter * (1 - circleProgress.value),
    };
  });

  const animatedPathProps = useAnimatedProps(() => {
    const pathLength = 100; // approximate length of checkmark path
    return {
      strokeDashoffset: pathLength * (1 - pathProgress.value),
    };
  });

  const perimeter = 2 * Math.PI * 45;
  const pathLength = 100;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <View style={styles.shadowWrapper}>
        <Animated.View style={[styles.container, { transform: [{ scale }], opacity }]}>
          <Svg width="120" height="120" viewBox="0 0 100 100">
            <AnimatedCircle
              cx="50"
              cy="50"
              r="45"
              stroke="#14B8A6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${perimeter} ${perimeter}`}
              animatedProps={animatedCircleProps}
            />
            <AnimatedPath
              d="M 30 50 L 45 65 L 70 35"
              stroke="#14B8A6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${pathLength} ${pathLength}`}
              animatedProps={animatedPathProps}
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  shadowWrapper: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 70,
  },
  container: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AnimatedCheckmark;
