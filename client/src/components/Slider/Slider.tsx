import { useState } from "react"
import { View, Platform, StyleSheet } from "react-native"

import ReactNativeSlider from "@react-native-community/slider"

interface SliderProps {
  min?: number
  max?: number
  step?: number
  initialValue?: number
  minColor?: string
  maxColor?: string
  thumbColor?: string
  vertical?: boolean
  onChange?: (value: number) => void
}

function Slider({
  min = 0,
  max = 1,
  step = 0.1,
  initialValue = 0,
  minColor = "teal",
  maxColor = "gray",
  thumbColor = "teal",
  vertical = false,
  onChange = () => {}
}: SliderProps) {
  const styles = getStyles()

  const [value, setValue] = useState(initialValue)
  const [nativeSize, setNativeSize] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  const sliderPercentage = ((value - min) / (max - min)) * 100

  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent: { layout } }) => {
        setNativeSize(layout)
      }}
    >
      <View
        style={{
          ...styles.nativeSliderWrapper,
          ...(vertical ? { transform: [{ rotate: "-90deg" }] } : {}),
          ...{ width: vertical ? nativeSize.height : nativeSize.width }
        }}
      >
        {/* i found no better way to do this  :/ */}
        {Platform.OS === "web" ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .slider-widget {
                  -webkit-appearance: none;
                  outline: none;
                  height: 5px;
                  background: linear-gradient(to right, ${minColor} 0%, ${minColor} ${sliderPercentage}%, ${maxColor} ${sliderPercentage}%, ${maxColor} 100%);
                  border-radius: 100vh;
                }

                .slider-widget::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 15px;
                  height: 15px;
                  border-radius: 50%;
                  background-color: ${thumbColor};
                }
              `
              }}
            ></style>
            <input
              className="slider-widget"
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              style={{ marginTop: 5, marginBottom: 5 }}
              onChange={e => {
                const v = parseFloat(e.target.value)
                onChange(v)
                setValue(v)
              }}
            />
          </>
        ) : (
          <ReactNativeSlider
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={initialValue}
            minimumTrackTintColor={minColor}
            maximumTrackTintColor={maxColor}
            thumbTintColor={thumbColor}
            onValueChange={n => {
              onChange(n)
              setValue(n)
            }}
          />
        )}
      </View>
    </View>
  )
}

export default Slider

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%"
    },
    nativeSliderWrapper: {}
  })
}
