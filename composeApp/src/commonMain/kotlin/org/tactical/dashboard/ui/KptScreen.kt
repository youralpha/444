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

data class KptTask(val id: String, val title: String, val xp: Int)

val sampleTasks = listOf(
    KptTask("w1_1", "Записать мысль по модели СМЭП", 20),
    KptTask("w1_2", "Выполнить одно микродействие (2-10 минут)", 15),
    KptTask("w1_3", "Заполнить трекер активности и настроения", 10)
)

@Composable
fun KptScreen(onBack: () -> Unit) {
    var xp by remember { mutableStateOf(0) }
    var level by remember { mutableStateOf(1) }
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
                Text("КПТ ПРОТОКОЛ", color = TacticalAccent, style = MaterialTheme.typography.h2)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("УРОВЕНЬ $level", color = Color.White, fontWeight = FontWeight.Bold)
                Text("$xp Всего XP", color = Gray400)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tasks List
        Column(
            modifier = Modifier.fillMaxWidth().background(Tactical800).border(1.dp, Tactical700).padding(16.dp)
        ) {
            Text("ЕЖЕДНЕВНЫЕ ЗАДАНИЯ", color = Gray400, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(sampleTasks) { task ->
                    val isDone = completedTasks.contains(task.id)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(if (isDone) Tactical900.copy(alpha=0.5f) else Tactical900)
                            .border(1.dp, Tactical700)
                            .clickable {
                                if (isDone) {
                                    completedTasks.remove(task.id)
                                    xp -= task.xp
                                } else {
                                    completedTasks.add(task.id)
                                    xp += task.xp
                                }
                                level = (xp / 100) + 1
                            }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (isDone) Icons.Default.CheckCircle else Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = if (isDone) TacticalAccent else Gray600
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(task.title, color = if (isDone) Gray500 else Color.White, fontWeight = FontWeight.Bold)
                            Text("+${task.xp} XP", color = TacticalAccent, style = MaterialTheme.typography.caption)
                        }
                    }
                }
            }
        }
    }
}
