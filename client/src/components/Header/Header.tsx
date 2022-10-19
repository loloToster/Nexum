import { StackHeaderProps } from "@react-navigation/stack"
import { Appbar } from "react-native-paper"

function Header({ options, back, navigation }: StackHeaderProps) {
    const title = typeof options.headerTitle == "string" ? options.headerTitle : "Nexum"

    return (
        <Appbar.Header>
            {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
            <Appbar.Content title={title} />
            <Appbar.Action icon="raspberry-pi" onPress={() => { }} />
            <Appbar.Action icon="account-multiple" onPress={() => navigation.navigate("users")} />
        </Appbar.Header>
    )
}

export default Header
