import { Appbar } from "react-native-paper"

function Header() {
    return (
        <Appbar.Header>
            <Appbar.Content title="Nexum" />
            <Appbar.Action icon="raspberry-pi" onPress={() => { }} />
            <Appbar.Action icon="account-multiple" onPress={() => { }} />
        </Appbar.Header>
    )
}

export default Header
