package org.tactical.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.tactical.dashboard.theme.*

data class PerimeterTask(val id: String, val title: String, val time: String)

val dailyTasks = listOf(
    PerimeterTask("d1", "Утренний оперативный брифинг (ПОЛНЫЙ SAS)", "15 мин"),
    PerimeterTask("d2", "OODA Loop (Цикл Бойда)", "В моменте"),
    PerimeterTask("d4", "Физиологический чек (H2F)", "2 мин"),
    PerimeterTask("d5", "Teach-Back изученного", "15 мин"),
    PerimeterTask("d6", "EOD Дебрифинг (Протокол Отбоя)", "10 мин")
)

@Composable
fun PerimeterScreen(onBack: () -> Unit) {
    var score by remember { mutableStateOf(0) }
    val completedTasks = remember { mutableStateListOf<String>() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Tactical900)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth().background(Tactical800).border(1.dp, Tactical700).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("НА ГЛАВНУЮ", color = Gray400, modifier = Modifier.clickable { onBack() }.padding(bottom = 8.dp))
                Text("ПЕРИМЕТР V4.0", color = TacticalAccent, style = MaterialTheme.typography.h2)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("АГЕНТ 4444", color = Gray400)
                Text(score.toString(), color = Color.White, style = MaterialTheme.typography.h1)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tasks List
        Column(
            modifier = Modifier.fillMaxWidth().background(Tactical800).border(1.dp, Tactical700).padding(16.dp)
        ) {
            Text("ЕЖЕДНЕВНО", color = TacticalAccent, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(dailyTasks) { task ->
                    val isDone = completedTasks.contains(task.id)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Tactical900)
                            .border(1.dp, Tactical700)
                            .clickable {
                                if (isDone) {
                                    completedTasks.remove(task.id)
                                } else {
                                    completedTasks.add(task.id)
                                }
                            }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (isDone) Icons.Default.CheckCircle else Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = if (isDone) TacticalAccent else Gray600
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(task.title, color = if (isDone) Gray500 else Color.White, fontWeight = FontWeight.Normal)
                            Text(task.time, color = Gray500, style = MaterialTheme.typography.caption)
                        }
                        if (isDone) {
                            Text("🗑", color = TacticalAlert, modifier = Modifier.clickable { completedTasks.remove(task.id) })
                        }
                    }
                }
            }
        }
    }
}
