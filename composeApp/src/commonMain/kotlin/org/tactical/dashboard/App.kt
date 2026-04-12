package org.tactical.dashboard

import androidx.compose.runtime.*
import org.tactical.dashboard.theme.TacticalTheme
import org.tactical.dashboard.ui.*

@Composable
fun App() {
    var currentScreen by remember { mutableStateOf(Screen.MainMenu) }

    TacticalTheme {
        when (currentScreen) {
            Screen.MainMenu -> MainMenu(onNavigate = { currentScreen = it })
            Screen.Base -> BaseScreen { currentScreen = Screen.MainMenu }
            Screen.Kpt -> KptScreen { currentScreen = Screen.MainMenu }
            Screen.Perimeter -> PerimeterScreen { currentScreen = Screen.MainMenu }
        }
    }
}
