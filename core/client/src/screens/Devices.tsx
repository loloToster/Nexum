import React, { useState } from "react"
import { StyleSheet, Image, View } from "react-native"
import { MD2Colors, FAB, Text } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"
import { Device as DeviceI } from "src/types"

import useDebounce from "src/hooks/useDebounce"

import SearchableList from "src/components/SearchableList/SearchableList"
import Device from "src/components/Device/Device"
import AddDeviceModal from "src/components/AddDeviceModal/AddDeviceModal"

import microcontrollerPlusIcon from "assets/microcontroller-plus.png"

function Devices() {
  const styles = getStyles()

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue)
  const [addDeviceModalActive, setAddDeviceModalActive] = useState(false)

  const {
    isLoading,
    isError,
    isRefetching,
    data,
    refetch: refetchDevices
  } = useQuery(["devices", debouncedSearchValue], async ({ queryKey }) => {
    const query = encodeURIComponent(queryKey[1] || "")
    const params = query ? `?q=${query}` : query
    const res = await api.get("/devices" + params)
    return res.data
  })

  const renderTitle = (device: DeviceI) => {
    return (
      <View style={styles.row}>
        <Text>{device.name}</Text>
        <View style={[styles.activityWrapper, styles.row]}>
          {(device.active || 0) > 1 && (
            <Text style={styles.activityNumber}>{device.active}</Text>
          )}
          <View
            style={[
              styles.activityDot,
              {
                backgroundColor: device.active
                  ? MD2Colors.lightGreenA700
                  : MD2Colors.grey800
              }
            ]}
          ></View>
        </View>
      </View>
    )
  }

  const renderDevice = (device: DeviceI) => {
    return <Device device={device} deleteDevice={() => refetchDevices()} />
  }

  return (
    <>
      <AddDeviceModal
        visible={addDeviceModalActive}
        onDismiss={() => setAddDeviceModalActive(false)}
        onAdd={() => refetchDevices()}
      />
      <SearchableList
        data={data}
        renderTitle={renderTitle}
        renderContent={renderDevice}
        loading={isLoading}
        refreshing={isRefetching}
        error={isError ? "Could not load devices" : ""}
        notFound="No devices were found"
        onSearch={setSearchValue}
        onRefresh={refetchDevices}
      />
      <FAB
        style={styles.fab}
        icon={({ size }) => (
          <Image
            source={microcontrollerPlusIcon}
            style={{ width: size, height: size, opacity: 0.7 }}
          />
        )}
        animated={false}
        onPress={() => setAddDeviceModalActive(true)}
      />
    </>
  )
}

export default Devices

const getStyles = () => {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center"
    },
    activityWrapper: {
      marginLeft: 7
    },
    activityNumber: {
      marginRight: 3,
      color: MD2Colors.lightGreenA700,
      fontSize: 12,
      fontWeight: "800"
    },
    activityDot: {
      width: 8,
      height: 8,
      borderRadius: 4
    },
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
