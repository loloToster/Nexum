import React, { useEffect, useRef, useState } from "react"
import { View, Platform, StyleSheet } from "react-native"
import ReactNativeSlider from "@react-native-community/slider"

import { map, roundBadFloat, roundByStep, uid } from "src/utils"

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
  onChange = () => null
}: SliderProps) {
  const styles = getStyles()

  const [value, setValue] = useState(initialValue)
  const [inputing, setInputing] = useState(false)
  const [nativeSize, setNativeSize] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  const sliderPercentage = ((value - min) / (max - min)) * 100

  // fix for web slider not updating when initial value is changed
  if (Platform.OS === "web")
    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

  // fix for web slider not responding on touchmove
  const input = useRef<HTMLInputElement>(null)
  const inputId = uid()
  if (Platform.OS === "web" && vertical) {
    useEffect(() => {
      const moveHandler = (e: TouchEvent) => {
        if (!inputing || !input.current) return

        const { clientY } = e.touches[0]
        const { y, height } = input.current.getBoundingClientRect()
        const start = y + height
        const end = y

        const prevVal = value
        let newVal = map(clientY, start, end, min, max)

        // value needs to be within min & max
        newVal = newVal > max ? max : newVal
        newVal = newVal < min ? min : newVal

        newVal = roundBadFloat(roundByStep(newVal, step))

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
              val = roundBadFloat(val)
              if (inputing) onChange(val)
              setValue(val)
            }}
            onSlidingStart={() => setInputing(true)}
            onSlidingComplete={val => {
              setInputing(false)
              val = roundBadFloat(val)
              onChange(val)
              setValue(val)
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
