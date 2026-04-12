package org.tactical.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.tactical.dashboard.theme.*
import kotlinx.coroutines.delay

@Composable
fun BaseScreen(onBack: () -> Unit) {
    var isRunning by remember { mutableStateOf(false) }
    var seconds by remember { mutableStateOf(0) }

    LaunchedEffect(isRunning) {
        while (isRunning) {
            delay(1000)
            seconds++
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Tactical900)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("НА ГЛАВНУЮ", color = Gray400, modifier = Modifier.clickable { onBack() }.align(Alignment.Start).padding(bottom = 16.dp))

        Column(
            modifier = Modifier
                .widthIn(max = 400.dp)
                .background(Tactical800)
                .border(1.dp, Tactical700)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("ТАЙМЕР ДЫХАНИЯ И РЕЛАКСАЦИИ 2.0", color = Color.White)
            Spacer(modifier = Modifier.height(16.dp))

            // Simple mockup of a timer ring
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .border(8.dp, if(isRunning) TacticalAccent else Tactical700, androidx.compose.foundation.shape.CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}",
                    color = Color.White,
                    style = androidx.compose.material.MaterialTheme.typography.h1
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Button(
                    onClick = { isRunning = true; seconds = 0 },
                    colors = ButtonDefaults.buttonColors(backgroundColor = TacticalAccent, contentColor = Tactical900)
                ) {
                    Text("СТАРТ")
                }
                Button(
                    onClick = { isRunning = false },
                    colors = ButtonDefaults.buttonColors(backgroundColor = Tactical700, contentColor = Color.White)
                ) {
                    Text("СТОП")
                }
            }
        }
    }
}
