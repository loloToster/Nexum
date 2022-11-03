import { WidgetData } from "./types"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"
import Button from "./Button/Button"

// maps string type prop to component
const map: Record<string, (props?: WidgetData) => JSX.Element> = {
  btn: Button
}

function Widget(props: WidgetData) {
  const ChoosenWidget = map[props.type] || Unknown
  return <ChoosenWidget {...props} />
}

export default Widget
