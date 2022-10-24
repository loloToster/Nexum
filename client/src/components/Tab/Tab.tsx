import { View, StyleSheet, Dimensions } from "react-native"
import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "./Widgets/types"
import Widget from "./Widgets/Widget"

function Tab({ widgets }: { widgets: WidgetData[] }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  // ratio of cell is 4/5
  const cellWidth = Dimensions.get("window").width / 4
  const cellHeight = (cellWidth / 4) * 5

  return (
    <View style={styles.tab}>
      {widgets.map((widgetData, i) => (
        <View
          key={i}
          style={{
            backgroundColor: "teal",
            position: "absolute",
            width: cellWidth * widgetData.w,
            height: cellHeight * widgetData.h,
            left: cellWidth * widgetData.x,
            top: cellHeight * widgetData.y
          }}
        >
          <Widget {...widgetData} />
        </View>
      ))}
    </View>
  )
}

export default Tab

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    tab: {
      backgroundColor: theme.colors.background,
      flex: 1
    }
  })
}
