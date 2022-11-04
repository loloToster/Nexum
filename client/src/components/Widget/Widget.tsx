import { WidgetData } from "./types"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"
import Button from "./Button/Button"
import SliderWidget from "./Slider/Slider"
import Gauge from "./Gauge/Gauge"

// maps string type prop to component
const map: Record<string, (props?: WidgetData) => JSX.Element> = {
  btn: Button,
  sldr: SliderWidget,
  gauge: Gauge
}

function Widget(props: WidgetData) {
  const ChoosenWidget = map[props.type] || Unknown
  return <ChoosenWidget {...props} />
}

export default Widget
