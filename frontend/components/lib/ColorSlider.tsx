import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Slider } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import tinycolor from "tinycolor2";

interface Props {
  hue?: number;
  style?: object;
  onValueChange?: (hue: number) => void;
  setValue?: any;
}

interface State {
  hue: number;
}

const MIN_HUE = 0;
const MAX_HUE = 359;
const STEP = 0.1;

export default class HueColorSlider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hue: props.hue || MIN_HUE,
    };
  }

  onValueChange = (hue: number) => {
    this.setState({ hue });

    // Handle black and white
    if (hue <= 0) {
      this.props.setValue("#000000");
    } else if (hue >= 359) {
      this.props.setValue("#FFFFFF");
    } else {
      this.props.setValue(tinycolor({ h: hue, s: 1, l: 0.5 }).toHexString());
    }

    if (this.props.onValueChange) {
      this.props.onValueChange(hue);
    }
  };

  render() {
    const { hue } = this.state;
    const { style } = this.props;
    const gradientColors = [
      "hsl(0, 0%, 0%)", // Black
      "hsl(0, 100%, 50%)", // Red
      "hsl(60, 100%, 50%)", // Yellow
      "hsl(120, 100%, 50%)", // Green
      "hsl(180, 100%, 50%)", // Cyan
      "hsl(240, 100%, 50%)", // Blue
      "hsl(300, 100%, 50%)", // Magenta

      "hsl(0, 0%, 100%)", // White
    ];

    return (
      <View style={style}>
        <LinearGradient
          style={styles.track}
          colors={gradientColors}
          //   start={{ x: 0, y: 0.5 }}
          //   end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        >
          <Slider
            value={hue}
            onValueChange={this.onValueChange}
            minimumValue={MIN_HUE}
            maximumValue={MAX_HUE}
            step={STEP}
            thumbTintColor={`transparent`}
            trackStyle={{ height: 0 }}
            thumbStyle={[styles.thumbStyle]}
            thumbTouchSize={{ width: 50, height: 50 }}
          />
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  track: {
    height: 30,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "center",
  },
  thumbStyle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    // backgroundColor: 'white',
    borderWidth: 2,
    // borderColor: 'gray',
  },
});
