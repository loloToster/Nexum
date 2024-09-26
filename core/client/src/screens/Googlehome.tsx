import React, { useEffect, useState } from "react"
import { useQuery } from "react-query"
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

import api from "src/api"
import { SUP_DEVICES } from "src/consts"
import { capitalizeFirstLetter, getTempNegativeId } from "src/utils"
import { GooglehomeDevice } from "src/types/ggl"

import AddModal from "src/components/AddModal/AddModal"
import EditGoogleDeviceModal from "src/components/EditGoogleDeviceModal/EditGoogleDeviceModal"

function Googlehome() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [addModalOpen, setAddModalOpen] = useState(false)

  const [gglDevices, setGglDevices] = useState<GooglehomeDevice[]>([])

  const { data, isRefetching, refetch } = useQuery(
    "google-devices",
    async () => {
      const res = await api.get("/gglsmarthome/devices")
      return res.data
    }
  )

  useEffect(() => {
    setGglDevices(data)
  }, [data])

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
            refreshing={isRefetching}
            onRefresh={refetch}
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
            setGglDevices(prev => [...prev, { ...nd, id: getTempNegativeId() }])
            setEditModalOpen(false)
          }}
          onDelete={id => {
            setGglDevices(prev => prev.filter(d => d.id !== id))
            setEditModalOpen(false)
          }}
          onEdit={ed => {
            setGglDevices(prev => [
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
