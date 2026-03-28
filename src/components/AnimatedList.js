import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const AnimatedList = ({ 
  data, 
  renderItem, 
  keyExtractor, 
  contentContainerStyle,
  showGradients = true,
  ...props 
}) => {
  const [topGradientOpacity, setTopGradientOpacity] = React.useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = React.useState(1);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollTop = contentOffset.y;
    const scrollHeight = contentSize.height;
    const clientHeight = layoutMeasurement.height;

    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  const internalRenderItem = (info) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(info.index * 50).duration(400).springify()}
        layout={LinearTransition}
      >
        {renderItem(info)}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={data}
        renderItem={internalRenderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        {...props}
      />
      
      {showGradients && (
        <>
          <Animated.View 
            pointerEvents="none" 
            style={[styles.gradientTop, { opacity: topGradientOpacity }]}
          >
            <LinearGradient
              colors={['#000', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View 
            pointerEvents="none" 
            style={[styles.gradientBottom, { opacity: bottomGradientOpacity }]}
          >
            <LinearGradient
              colors={['transparent', '#000']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    paddingBottom: 40,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
  },
});

export default AnimatedList;
