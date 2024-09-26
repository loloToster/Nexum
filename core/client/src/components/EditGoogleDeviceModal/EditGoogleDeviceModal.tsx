import React, { useState } from "react"
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  View
} from "react-native"
import {
  useTheme,
  Theme,
  Portal,
  Appbar,
  Headline,
  TextInput,
  Avatar,
  Subheading,
  Colors,
  Button,
  Switch
} from "react-native-paper"

import { SUP_DEVICES } from "src/consts"
import { capitalizeFirstLetter } from "src/utils"
import { GooglehomeDevice, GooglehomeDeviceTarget } from "src/types/ggl"
import DeviceChoiceBtn from "../DeviceChoiceBtn/DeviceChoiceBtn"

interface EditGoogleDeviceModalProps {
  onClose: () => void
  newDeviceType?: string
  googleDevice?: GooglehomeDevice | null
  onAdd?: (newDevice: Omit<GooglehomeDevice, "id">) => void
  onEdit?: (editedDevice: GooglehomeDevice) => void
}

function EditGoogleDeviceModal({
  onClose,
  newDeviceType,
  googleDevice,
  onAdd = () => null,
  onEdit = () => null
}: EditGoogleDeviceModalProps) {
  if (!newDeviceType && !googleDevice)
    throw new Error("Invalid EditGoogleDeviceModal usage")

  const theme = useTheme()
  const styles = getStyles(theme)

  const newDevice = Boolean(newDeviceType)
  const respectiveSupDevice = SUP_DEVICES.find(
    sp => sp.type === (newDevice ? newDeviceType : googleDevice?.type)
  )

  if (!respectiveSupDevice)
    throw new Error("Invalid type in EditGoogleDeviceModal")

  const handleClose = () => {
    onClose()
  }

  const [name, setName] = useState(googleDevice?.name || "")

  type TraitsEnabled = Record<string, boolean | undefined>
  const [traitsEnabled, setTraitsEnabled] = useState<TraitsEnabled>(() => {
    if (!googleDevice) return {}

    const initialState: TraitsEnabled = {}

    for (const trait of googleDevice.traits) {
      initialState[trait.name] = true
    }

    return initialState
  })

  type TraitsDataTarget = Partial<GooglehomeDeviceTarget>
  type TraitsData = Record<string, TraitsDataTarget[] | undefined>

  const [traitsData, setTraitsData] = useState<TraitsData>(() => {
    if (!googleDevice) return {}

    const initialState: TraitsData = {}

    for (const trait of googleDevice.traits) {
      initialState[trait.name] = trait.targets
    }

    return initialState
  })

  const getTraitsDataField = <T extends keyof TraitsDataTarget>(
    traitName: string,
    targetName: string,
    field: T
  ): TraitsDataTarget[T] | undefined => {
    const target = traitsData[traitName]?.find(t => t.name === targetName)
    return target ? target[field] : undefined
  }

  const setTraitsDataField = <T extends keyof TraitsDataTarget>(
    traitName: string,
    targetName: string,
    field: T,
    value: TraitsDataTarget[T]
  ) => {
    setTraitsData(prev => {
      let trait = prev[traitName] ?? []
      const target = trait.find(target => target.name === targetName)

      if (target) {
        trait = trait.filter(target => targetName !== target.name)
      }

      trait = [...trait, { ...target, name: targetName, [field]: value }]

      return { ...prev, [traitName]: trait }
    })
  }

  const onSubmit = () => {
    const submittedGoogleDevice: Omit<GooglehomeDevice, "id"> = {
      type: respectiveSupDevice.type,
      name,
      traits: respectiveSupDevice.traits
        .filter(trait => traitsEnabled[trait.name] || trait.required)
        .map(trait => ({
          name: trait.name,
          targets: trait.targets.map(target => ({
            name: target,
            deviceId: getTraitsDataField(trait.name, target, "deviceId") ?? -1,
            customId: getTraitsDataField(trait.name, target, "customId") ?? ""
          }))
        }))
    }

    newDevice
      ? onAdd(submittedGoogleDevice)
      : onEdit({ ...submittedGoogleDevice, id: googleDevice!.id })
  }

  return (
    <Portal>
      <View style={styles.wrapper}>
        <Appbar style={styles.bar}>
          <Appbar.Action icon="close" onPress={handleClose} />
        </Appbar>
        <ScrollView style={styles.container}>
          <View style={styles.row}>
            <View style={styles.header}>
              <Avatar.Icon size={80} icon={respectiveSupDevice.icon} />
              <Headline>
                {newDevice ? "Create New Device" : "Edit Device"}
                {": \n"}
                {capitalizeFirstLetter(respectiveSupDevice.type)}
              </Headline>
            </View>
          </View>
          <View style={styles.row}>
            <TextInput label="Name" value={name} onChangeText={setName} />
          </View>
          {respectiveSupDevice.traits.map(trait => (
            <View style={styles.row} key={trait.name}>
              <View style={styles.trait}>
                <View style={styles.traitHeader}>
                  <Subheading>{trait.name}</Subheading>
                  <Switch
                    disabled={trait.required}
                    value={trait.required ? true : traitsEnabled[trait.name]}
                    onValueChange={val => {
                      setTraitsEnabled(prev => ({ ...prev, [trait.name]: val }))
                    }}
                  />
                </View>
                {(trait.required || traitsEnabled[trait.name]) &&
                  trait.targets.map(tar => (
                    <View key={tar}>
                      {/* todo: support adding by widgets  */}
                      <DeviceChoiceBtn
                        style={styles.traitTargetInp}
                        deviceId={getTraitsDataField(
                          trait.name,
                          tar,
                          "deviceId"
                        )}
                        onChangeDevice={dId =>
                          setTraitsDataField(trait.name, tar, "deviceId", dId)
                        }
                      />
                      <TextInput
                        mode="outlined"
                        style={styles.traitTargetInp}
                        label={`Custom Id (${tar})`}
                        value={
                          getTraitsDataField(trait.name, tar, "customId") ?? ""
                        }
                        onChangeText={cId =>
                          setTraitsDataField(trait.name, tar, "customId", cId)
                        }
                      />
                    </View>
                  ))}
              </View>
            </View>
          ))}
          <View style={styles.row}>
            {newDevice ? (
              <Button onPress={onSubmit} mode="contained" icon="check">
                Add
              </Button>
            ) : (
              <Button onPress={onSubmit} mode="contained" icon="check">
                Save
              </Button>
            )}
          </View>
          <View style={{ height: Dimensions.get("window").height / 4 }}></View>
        </ScrollView>
      </View>
    </Portal>
  )
}

export default EditGoogleDeviceModal

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.background,
      flex: 1,
      paddingTop: StatusBar.currentHeight
    },
    header: {
      flex: 1,
      alignItems: "center",
      flexDirection: "row",
      gap: 24
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
      marginTop: 12
    },
    trait: {
      padding: 8,
      borderWidth: 1,
      borderColor: Colors.grey800,
      borderRadius: theme.roundness
    },
    traitHeader: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    traitTargetInp: {
      marginTop: 6
    }
  })
}
