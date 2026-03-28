import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Card = ({ children, index, order, total, cardDistance = 15, verticalDistance = 20 }) => {
  const position = useMemo(() => {
    const idx = order.indexOf(index);
    return idx;
  }, [order, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const isFront = position === 0;
    const opacity = interpolate(
      position,
      [0, total - 1],
      [1, 0.4],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      position,
      [0, total - 1],
      [1, 0.85],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      position,
      [0, total - 1],
      [0, -verticalDistance * (total - 1)],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      position,
      [0, total - 1],
      [0, cardDistance * (total - 1)],
      Extrapolate.CLAMP
    );

    if (position === -1) return { opacity: 0 };

    return {
      opacity: withSpring(opacity),
      zIndex: total - position,
      transform: [
        { scale: withSpring(scale) },
        { translateY: withSpring(translateY) },
        { translateX: withSpring(translateX) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

import { ChevronRight } from 'lucide-react-native';

const CardSwap = ({ 
  children, 
  onCardClick, 
  cardDistance = 20,
  verticalDistance = 25
}) => {
  const childArray = React.Children.toArray(children);
  const total = childArray.length;
  const [order, setOrder] = useState(childArray.map((_, i) => i));

  const swap = useCallback(() => {
    setOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const front = newOrder.shift();
      newOrder.push(front);
      return newOrder;
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.cardsWrapper}>
        {childArray.map((child, index) => (
          <Card 
            key={index} 
            index={index} 
            order={order} 
            total={total}
            cardDistance={cardDistance}
            verticalDistance={verticalDistance}
          >
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => onCardClick?.(index)}
              style={styles.touchable}
            >
              {child}
            </TouchableOpacity>
          </Card>
        ))}
      </View>
      
      {/* Elegant Manual Switch Button */}
      <TouchableOpacity 
        onPress={swap}
        style={styles.switchButton}
        className="bg-white/90 p-3 rounded-2xl shadow-lg border border-white"
      >
        <ChevronRight size={24} color="#000" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsWrapper: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '85%',
    height: 160,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  switchButton: {
    position: 'absolute',
    bottom: 5,
    right: '10%',
    zIndex: 100,
  }
});

export default CardSwap;
