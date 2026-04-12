package org.tactical.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.tactical.dashboard.theme.*

enum class Screen {
    MainMenu, Base, Kpt, Perimeter
}

@Composable
fun MainMenu(onNavigate: (Screen) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Tactical900)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 400.dp)
                .background(Tactical800)
                .border(1.dp, Tactical700)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "ГЛАВНОЕ МЕНЮ",
                color = TacticalAccent,
                style = androidx.compose.material.MaterialTheme.typography.h1
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "ВЫБЕРИТЕ ПРОТОКОЛ ДЛЯ ЗАПУСКА",
                color = Gray400,
                style = androidx.compose.material.MaterialTheme.typography.body2
            )

            Spacer(modifier = Modifier.height(24.dp))

            MenuButton("ТАЙМЕР ДЫХАНИЯ (BASE)") { onNavigate(Screen.Base) }
            Spacer(modifier = Modifier.height(16.dp))
            MenuButton("КПТ ПРОТОКОЛ") { onNavigate(Screen.Kpt) }
            Spacer(modifier = Modifier.height(16.dp))
            MenuButton("ПЕРИМЕТР V4.0") { onNavigate(Screen.Perimeter) }
        }
    }
}

@Composable
fun MenuButton(text: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Tactical900)
            .border(1.dp, Tactical700)
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 16.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text, color = Color.White, fontWeight = FontWeight.Bold)
            Text("►", color = TacticalAccent)
        }
    }
}
