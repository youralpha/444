package org.tactical.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.tactical.dashboard.theme.Tactical900

@Composable
fun PlaceholderScreen(title: String, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Tactical900)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(title, color = Color.White, style = androidx.compose.material.MaterialTheme.typography.h1)
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            "НА ГЛАВНУЮ",
            color = org.tactical.dashboard.theme.TacticalAccent,
            modifier = Modifier.clickable { onBack() }.padding(8.dp),
            style = androidx.compose.material.MaterialTheme.typography.button
        )
    }
}
