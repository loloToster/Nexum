import React, { useState } from "react"
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions
} from "react-native"

import {
  Portal,
  MD2Theme,
  useTheme,
  TextInput,
  Switch,
  Text,
  Button,
  MD2Colors,
  Appbar,
  Avatar,
  Headline,
  Subheading
} from "react-native-paper"

import ColorPicker, {
  BrightnessSlider,
  Preview,
  Swatches
} from "reanimated-color-picker"

import { DEF_WIDGET_PROPS } from "src/consts"
import { fillWithValues } from "src/utils"
import type { WidgetData, WidgetProperties, WidgetProperty } from "src/types"

import { WidgetComponent, widgetComponents } from "src/components/Widget/Widget"
import Error from "src/components/Error/Error"
import RUSure from "src/components/RUSure/RUSure"
import DeviceChoiceBtn from "../DeviceChoiceBtn/DeviceChoiceBtn"

import { SWATCHES_COLORS } from "./swatch-colors"

function Row({
  children,
  extended = false
}: {
  children: React.ReactNode
  extended?: boolean
}) {
  const theme = useTheme<MD2Theme>()
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
  color: function ({ value, onChange }) {
    const theme = useTheme<MD2Theme>()
    const styles = getStyles(theme)

    return (
      <Row>
        <View style={styles.colorPickerWrapper}>
          <ColorPicker
            value={value}
            onChange={clr => onChange(clr.hex)}
            onComplete={clr => onChange(clr.hex)}
            style={styles.colorPicker}
          >
            <Text>Color</Text>
            <Preview hideInitialColor />
            <Swatches colors={SWATCHES_COLORS}></Swatches>
            <BrightnessSlider boundedThumb style={{ borderRadius: 1000 }} />
          </ColorPicker>
        </View>
      </Row>
    )
  },
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

export type SubmitData = {
  component: WidgetComponent
  deviceId: number
  customId: string
  properties: WidgetProperties
}

export type EditWidgetModalProps =
  | (
      | {
          widget: WidgetData
          newWidgetType?: undefined
        }
      | {
          widget?: undefined
          newWidgetType: string
        }
    ) & {
      open?: boolean
      onClose?: () => void
      onAdd?: (props: SubmitData) => void
      onEdit?: (props: SubmitData) => void
      onDelete?: () => void
    }

export default function EditWidgetModal({
  widget,
  newWidgetType,
  open,
  onClose = () => null,
  onAdd = () => null,
  onEdit = () => null,
  onDelete = () => null
}: EditWidgetModalProps) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const newWidget = Boolean(newWidgetType)
  const widgetComponentId = newWidget ? newWidgetType! : widget!.type
  const widgetComponent = widgetComponents.find(c => c.id === widgetComponentId)

  const [deviceId, setDeviceId] = useState(widget?.deviceId ?? -1)
  const [customId, setCustomId] = useState(widget?.customId || "")
  const [title, setTitle] = useState(widget?.properties?.title || "")
  const [widgetProperties, setWidgetProperties] = useState<WidgetProperties>(
    fillWithValues(widget?.properties, DEF_WIDGET_PROPS)
  )

  function setWidgetProp<K extends WidgetProperty>(
    prop: K,
    value: WidgetProperties[K]
  ) {
    setWidgetProperties(props => {
      props[prop] = value
      return { ...props }
    })
  }

  const handleClose = () => {
    if (newWidget) {
      setDeviceId(-1)
      setCustomId("")
      setTitle("")
      fillWithValues(widget?.properties, DEF_WIDGET_PROPS)
    }

    onClose()
  }

  const onSubmit = () => {
    if (!widgetComponent) {
      // todo: will this ever happen?
      return
    }

    const data: SubmitData = {
      deviceId,
      customId,
      component: widgetComponent,
      properties: {
        ...widgetProperties,
        title
      }
    }

    newWidget ? onAdd(data) : onEdit(data)
  }

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleDelete = () => {
    onDelete()
    setDeleteModalOpen(false)
  }

  return (
    <Portal>
      {open && (
        <View style={styles.wrapper}>
          <RUSure
            open={deleteModalOpen}
            onConfirm={handleDelete}
            onDismiss={() => setDeleteModalOpen(false)}
          >
            Are you sure you want to delete this widget?
          </RUSure>
          <Appbar style={styles.bar}>
            <Appbar.Action
              icon="close"
              containerColor="transparent"
              onPress={handleClose}
            />
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
                      DB Id: {newWidget ? "autoincremented number" : widget?.id}
                    </Subheading>
                  </View>
                </View>
              </Row>
              <Row>
                <DeviceChoiceBtn
                  deviceId={deviceId}
                  onChangeDevice={setDeviceId}
                />
              </Row>
              <Row>
                <TextInput
                  label="Custom Id"
                  value={customId}
                  onChangeText={setCustomId}
                />
              </Row>
              <Row>
                <TextInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                />
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
                  <Button onPress={onSubmit} mode="contained" icon="check">
                    Add
                  </Button>
                ) : (
                  <Button onPress={onSubmit} mode="contained" icon="check">
                    Save
                  </Button>
                )}
              </Row>
              <Row>
                {!newWidget && (
                  <Button
                    onPress={() => setDeleteModalOpen(true)}
                    mode="contained"
                    icon="delete"
                    buttonColor={MD2Colors.red900}
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
      )}
    </Portal>
  )
}
const getStyles = (theme: MD2Theme) => {
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
    },
    colorPickerWrapper: {
      padding: 8,
      borderWidth: 2,
      borderColor: MD2Colors.grey800,
      borderRadius: 4
    },
    colorPicker: {
      width: "100%",
      gap: 6
    }
  })
}
