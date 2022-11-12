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

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
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
  const [inputing, setInputing] = useState(false)
  const [nativeSize, setNativeSize] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  const sliderPercentage = ((value - min) / (max - min)) * 100
  // round the number when using smaller steps to prevent floating point problems
  const roundValue = (val: number) => (step >= 0.001 ? +val.toFixed(3) : val)

  // fix for web slider not updating when initial value is changed
  if (Platform.OS === "web")
    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

  // fix for web slider not responding on touchmove
  const input = useRef<HTMLInputElement>()
  const inputId = uid()
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

        newVal = roundValue(newVal)

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
        style={[
          styles.nativeSliderWrapper,
          vertical ? { transform: [{ rotate: "-90deg" }] } : {},
          { width: vertical ? nativeSize.height : nativeSize.width }
        ]}
      >
        {/* i found no better way to do this  :/ */}
        {Platform.OS === "web" ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .slider-widget-${inputId} {
                  -webkit-appearance: none;
                  outline: none;
                  height: 5px;
                  background: linear-gradient(to right, ${minColor} 0%, ${minColor} ${sliderPercentage}%, ${maxColor} ${sliderPercentage}%, ${maxColor} 100%);
                  border-radius: 100vh;
                }

                .slider-widget-${inputId}::-webkit-slider-thumb {
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
              className={`slider-widget-${inputId}`}
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
            onValueChange={val => {
              val = roundValue(val)
              if (inputing) onChange(val)
              setValue(val)
            }}
            onSlidingStart={() => setInputing(true)}
            onSlidingComplete={() => setInputing(false)}
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
