import React, { Component } from "react";
import { Animated, Dimensions, View, FlatListProps } from "react-native";

const { height: screenHeight } = Dimensions.get("window");

interface Props<T> extends FlatListProps<T> {
  data: any;
}

class FullScreenFlatList<T> extends Component<Props<T>> {
  scrollY = new Animated.Value(0);

  render() {
    const translateY = this.scrollY.interpolate({
      inputRange: [0, screenHeight],
      outputRange: [0, screenHeight * 0.5], // Adjust the scaling as needed
      extrapolate: "clamp",
    });

    const scale = this.scrollY.interpolate({
      inputRange: [0, screenHeight],
      outputRange: [1, 0.5], // Adjust the scaling as needed
      extrapolate: "clamp",
    });

    return (
      <View style={{ flex: 1 }}>
        <Animated.FlatList<T>
          {...this.props}
          contentContainerStyle={{ paddingTop: screenHeight }}
          style={{ transform: [{ translateY }, { scale }] }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
            { useNativeDriver: true }
          )}
          inverted
          data={this.props.data}
          renderItem={this.props.renderItem}
          keyExtractor={this.props.keyExtractor}
        />
      </View>
    );
  }
}

export default FullScreenFlatList;
