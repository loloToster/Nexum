import React, { useState } from "react"
import { StyleSheet, Image, View } from "react-native"
import { Colors, FAB, Text } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"
import { Device as DeviceI } from "src/types"

import useDebounce from "src/hooks/useDebounce"

import SearchableList from "src/components/SearchableList/SearchableList"
import Device from "src/components/Device/Device"
import AddDeviceModal from "src/components/AddDeviceModal/AddDeviceModal"

// @ts-ignore
import microcontrollerPlusIcon from "assets/microcontroller-plus.png"

function Devices() {
  const styles = getStyles()

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue)
  const [addDeviceModalActive, setAddDeviceModalActive] = useState(false)

  const {
    isLoading,
    isError,
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text>{device.name}</Text>
        <View
          style={{
            marginLeft: 7,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: device.active
              ? Colors.lightGreenA700
              : Colors.grey800
          }}
        ></View>
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
        error={isError ? "Could not load devices" : ""}
        onSearch={setSearchValue}
      ></SearchableList>
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
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
