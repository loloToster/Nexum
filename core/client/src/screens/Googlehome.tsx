import React, { useState } from "react"
import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native"
import {
  FAB,
  Subheading,
  Theme,
  useTheme,
  Colors,
  List,
  Text
} from "react-native-paper"
import { RefreshControl } from "react-native-web-refresh-control"

import { SUP_DEVICES } from "src/consts"
import { capitalizeFirstLetter, getTempNegativeId } from "src/utils"
import { GooglehomeDevice } from "src/types/ggl"

import AddModal from "src/components/AddModal/AddModal"
import EditGoogleDeviceModal from "src/components/EditGoogleDeviceModal/EditGoogleDeviceModal"

function Googlehome() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [addModalOpen, setAddModalOpen] = useState(false)

  const [refreshingGglDevices, setRefreshingGglDevies] = useState(false)
  const [gglDevices, setGglDevies] = useState<GooglehomeDevice[]>([
    {
      id: 0,
      name: "lamp",
      type: "LIGHT",
      traits: [
        {
          name: "OnOff",
          targets: [{ name: "OnOff", customId: "test", deviceId: 2 }]
        },
        {
          name: "Brightness",
          targets: [{ name: "Brightness", customId: "test2", deviceId: 2 }]
        }
      ]
    }
  ])

  const [newDeviceType, setNewDeviceType] = useState("")
  const [editedDevice, setEditedDevice] = useState<GooglehomeDevice | null>(
    null
  )
  const [editModalOpen, setEditModalOpen] = useState(false)

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshingGglDevices}
            onRefresh={() => null}
            tintColor={theme.colors.primary}
          />
        }
        data={gglDevices}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback
            onPress={() => {
              setNewDeviceType("")
              setEditedDevice(item)
              setEditModalOpen(true)
            }}
          >
            <View style={styles.itemContainer}>
              <List.Icon
                icon={SUP_DEVICES.find(sd => sd.type === item.type)?.icon ?? ""}
              />
              <View>
                <Subheading>
                  {item.name}{" "}
                  <Text style={styles.itemType}>
                    ({capitalizeFirstLetter(item.type)})
                  </Text>
                </Subheading>
                <Text style={styles.itemSubtext}>
                  {item.traits.map(t => t.name).join(", ")}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      />
      <AddModal
        title="Add Google Device"
        items={SUP_DEVICES.map(d => ({
          id: d.type,
          name: capitalizeFirstLetter(d.type),
          icon: d.icon
        }))}
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onChoice={id => {
          setNewDeviceType(id)
          setEditedDevice(null)
          setAddModalOpen(false)
          setEditModalOpen(true)
        }}
      />
      {editModalOpen && (
        <EditGoogleDeviceModal
          onClose={() => setEditModalOpen(false)}
          newDeviceType={newDeviceType}
          googleDevice={editedDevice}
          onAdd={nd => {
            setGglDevies(prev => [...prev, { ...nd, id: getTempNegativeId() }])
            setEditModalOpen(false)
          }}
          onEdit={ed => {
            setGglDevies(prev => [
              ...prev.filter(ggld => ggld.id !== ed.id),
              ed
            ])
            setEditModalOpen(false)
          }}
        />
      )}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setAddModalOpen(true)}
      />
    </View>
  )
}

export default Googlehome

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1
    },
    itemContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.grey800,
      borderRadius: theme.roundness,
      margin: 8,
      marginBottom: 0
    },
    itemType: {
      color: theme.colors.placeholder
    },
    itemSubtext: {
      fontSize: 12,
      color: theme.colors.placeholder
    },
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
