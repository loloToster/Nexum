import { useEffect, useRef, useState } from "react"
import { View, Platform, StyleSheet } from "react-native"

import ReactNativeSlider from "@react-native-community/slider"

function map(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

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

  // fix for web slider not responding on touchmove
  const [inputing, setInputing] = useState(false)
  const input = useRef<HTMLInputElement>()
  if (Platform.OS === "web" && vertical) {
    useEffect(() => {
      const moveHandler = (e: TouchEvent) => {
        if (!inputing) return

        const { clientY } = e.touches[0]
        const { y, height } = input.current.getBoundingClientRect()
        const start = y + height
        const end = y

        const prevVal = value
        let newVal = map(clientY, start, end, min, max)

        // value needs to be within min & max
        newVal = newVal > max ? max : newVal
        newVal = newVal < min ? min : newVal

        // logic that takes step into account
        newVal =
          newVal - (newVal % step) + (newVal % step > step / 2 ? step : 0)

        // round the number when using smaller steps to prevent floating point problems
        newVal = step >= 0.001 ? +newVal.toFixed(3) : newVal

        if (prevVal !== newVal) onChange(newVal)
        setValue(newVal)
      }

      window.addEventListener("touchmove", moveHandler)
      return () => window.removeEventListener("touchmove", moveHandler)
    }, [inputing, value])
  }

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
              ref={input}
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
              onTouchStart={() => setInputing(true)}
              onTouchEnd={() => setInputing(false)}
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