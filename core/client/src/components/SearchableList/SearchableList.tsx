import React, { useEffect, useState } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import {
  useTheme,
  Theme,
  Searchbar,
  ActivityIndicator,
  List,
  Text
} from "react-native-paper"

import Error from "src/components/Error/Error"
import Translatable from "src/components/Translatable/Translatable"

export interface SearchableListProps<T> {
  searchBarPlaceHolder?: string
  loading?: boolean
  error?: string
  notFound?: string
  data: T[]
  renderTitle: (itemData: T) => React.ReactNode
  renderContent: (itemData: T) => JSX.Element
  onSearch?: (q: string) => void
}

function SearchableList<T>({
  searchBarPlaceHolder = "Search",
  loading = false,
  error,
  notFound = "",
  data,
  renderTitle,
  renderContent,
  onSearch = () => null
}: SearchableListProps<T>) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    onSearch(searchValue)
  }, [searchValue])

  const renderItem = ({ item }: { item: T }) => {
    return (
      <List.Accordion title={renderTitle(item)}>
        {renderContent(item)}
      </List.Accordion>
    )
  }

  return (
    <View style={styles.container}>
      <Searchbar
        style={styles.search}
        value={searchValue}
        onChangeText={setSearchValue}
        placeholder={searchBarPlaceHolder}
      />
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <Error text={error} />
      ) : !data.length ? (
        <Translatable>
          <View style={styles.notFoundWrapper}>
            <Text style={styles.notFound}>{notFound}</Text>
          </View>
        </Translatable>
      ) : (
        <FlatList data={data} renderItem={renderItem} />
      )}
    </View>
  )
}

export default SearchableList

const getStyles = (theme: Theme) => {
  const space = 10

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
      padding: space,
      paddingBottom: 0
    },
    search: {
      marginBottom: space
    },
    loadingWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    notFoundWrapper: {
      padding: 30,
      alignItems: "center"
    },
    notFound: {
      color: theme.colors.surface,
      textAlign: "center",
      fontSize: 20
    }
  })
}
