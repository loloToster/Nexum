import { useState } from "react"
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions
} from "react-native"

import {
  Portal,
  Theme,
  useTheme,
  TextInput,
  Switch,
  Text,
  Button,
  Colors,
  Appbar,
  Avatar,
  Headline,
  Subheading
} from "react-native-paper"

import type { WidgetData, WidgetProperties, WidgetProperty } from "src/types"
import { widgetComponents } from "src/components/Widget/Widget"
import Error from "src/components/Error/Error"

function Row({
  children,
  extended = false
}: {
  children: React.ReactNode
  extended?: boolean
}) {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={[styles.row, extended ? styles.extendenRow : undefined]}>
      {children}
    </View>
  )
}

type Inputs = {
  [K in WidgetProperty]?: (props: {
    value: WidgetProperties[K]
    onChange: (val: WidgetProperties[K]) => void
  }) => JSX.Element
}

const inputs: Inputs = {
  text: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput label="Text" value={value} onChangeText={onChange} />
      </Row>
    )
  },
  onText: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput label="On Text" value={value} onChangeText={onChange} />
      </Row>
    )
  },
  offText: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput label="Off Text" value={value} onChangeText={onChange} />
      </Row>
    )
  },
  isSwitch: function ({ value, onChange }) {
    return (
      <Row extended>
        <Text>Switch</Text>
        <Switch value={value} onValueChange={onChange} />
      </Row>
    )
  },
  isVertical: function ({ value, onChange }) {
    return (
      <Row extended>
        <Text>Vertical</Text>
        <Switch value={value} onValueChange={onChange} />
      </Row>
    )
  },
  step: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput
          label="Steps"
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={s => onChange(parseFloat(s))} // todo: change
        />
      </Row>
    )
  },
  min: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput
          label="Minimum Value"
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={s => onChange(parseFloat(s))} // todo: change
        />
      </Row>
    )
  },
  max: function ({ value, onChange }) {
    return (
      <Row>
        <TextInput
          label="Maximum Value"
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={s => onChange(parseFloat(s))} // todo: change
        />
      </Row>
    )
  }
}

export type EditWidgetModalProps =
  | {
      widget: WidgetData
      newWidgetType?: undefined
    }
  | {
      widget?: undefined
      newWidgetType: string
    }

export default function EditWidgetModal({
  widget,
  newWidgetType
}: EditWidgetModalProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const newWidget = Boolean(newWidgetType)
  const widgetComponentId = newWidget ? newWidgetType : widget?.type
  const widgetComponent = widgetComponents.find(c => c.id === widgetComponentId)

  const [customId, setCustomId] = useState("")
  const [title, setTitle] = useState("")
  const [widgetProperties, setWidgetProperties] = useState<WidgetProperties>({
    // default values
    title: "",
    color: theme.colors.accent,
    text: "",
    onText: "",
    offText: "",
    isSwitch: true,
    isVertical: false,
    min: 0,
    max: 10,
    step: 1
  })

  function setWidgetProp<K extends WidgetProperty>(
    prop: K,
    value: WidgetProperties[K]
  ) {
    setWidgetProperties(props => {
      props[prop] = value
      return { ...props }
    })
  }

  return (
    <Portal>
      <View style={styles.wrapper}>
        <Appbar style={styles.bar}>
          <Appbar.Action icon="close" onPress={() => null} />
        </Appbar>
        {widgetComponent ? (
          <ScrollView style={styles.container}>
            <Row>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar.Icon size={64} icon="pencil" />
                <View style={{ marginLeft: 12 }}>
                  <Headline>
                    {newWidget ? "Add" : "Editing"} {widgetComponent.name}
                  </Headline>
                  <Subheading style={{ color: theme.colors.placeholder }}>
                    DB Id: {newWidget ? "autoincremented number" : 123}
                  </Subheading>
                </View>
              </View>
            </Row>
            <Row>
              <TextInput
                label="Custom Id"
                value={customId}
                onChangeText={setCustomId}
              />
            </Row>
            <Row>
              <TextInput label="Title" value={title} onChangeText={setTitle} />
            </Row>
            {widgetComponent.editableProperties
              .filter(prop => Boolean(inputs[prop]))
              .map(prop => {
                const Component = inputs[prop] as any // todo: remove any
                return (
                  <Component
                    value={widgetProperties[prop]}
                    onChange={(v: any) => setWidgetProp(prop, v)}
                    key={prop}
                  />
                )
              })}
            <Row>
              {newWidget ? (
                <Button onPress={() => null} mode="contained" icon="check">
                  Add
                </Button>
              ) : (
                <Button onPress={() => null} mode="contained" icon="check">
                  Save
                </Button>
              )}
            </Row>
            <Row>
              {!newWidget && (
                <Button
                  onPress={() => null}
                  mode="contained"
                  icon="delete"
                  color={Colors.red500}
                >
                  Remove Widget
                </Button>
              )}
            </Row>
            <View
              style={{ height: Dimensions.get("window").height / 2.5 }}
            ></View>
          </ScrollView>
        ) : (
          <Error text="Unknown widget type" />
        )}
      </View>
    </Portal>
  )
}
const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.background,
      flex: 1,
      paddingTop: StatusBar.currentHeight
    },
    bar: {
      backgroundColor: theme.colors.background,
      justifyContent: "flex-end"
    },
    container: {
      flex: 1,
      padding: 12
    },
    row: {
      marginVertical: 6
    },
    extendenRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }
  })
}
