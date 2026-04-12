package org.tactical.dashboard.theme

import androidx.compose.material.MaterialTheme
import androidx.compose.material.Typography
import androidx.compose.material.darkColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val TacticalColors = darkColors(
    primary = TacticalAccent,
    primaryVariant = TacticalAccent,
    secondary = TacticalAccent,
    background = Tactical900,
    surface = Tactical800,
    error = TacticalAlert,
    onPrimary = Tactical900,
    onSecondary = Tactical900,
    onBackground = TacticalText,
    onSurface = TacticalText,
    onError = TacticalText
)

val TacticalTypography = Typography(
    defaultFontFamily = FontFamily.SansSerif,
    h1 = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        letterSpacing = 1.5.sp
    ),
    h2 = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        letterSpacing = 0.5.sp
    ),
    body1 = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp
    ),
    button = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        letterSpacing = 1.sp
    )
)

@Composable
fun TacticalTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = TacticalColors,
        typography = TacticalTypography,
        content = content
    )
}
