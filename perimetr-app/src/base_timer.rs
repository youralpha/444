use dioxus::prelude::*;
use async_std::task;
use std::time::Duration;

#[derive(Clone, PartialEq)]
struct Phase {
    id: String,
    name: String,
    duration_ms: i32,
    color: String,
    title: String,
    desc: String,
}

fn get_hrv_cycle(bpm: f32) -> Vec<Phase> {
    let ms = ((60.0 / bpm / 2.0) * 1000.0) as i32;
    vec![
        Phase { id: "inhale".into(), name: "ВДОХ".into(), duration_ms: ms, color: "var(--color-emerald)".into(), title: "ВСР".into(), desc: "Мягкий вдох".into() },
        Phase { id: "exhale".into(), name: "ВЫДОХ".into(), duration_ms: ms, color: "var(--color-blue)".into(), title: "ВСР".into(), desc: "Мягкий выдох".into() }
    ]
}

fn get_sigh_cycle() -> Vec<Phase> {
    vec![
        Phase { id: "inh1".into(), name: "ВДОХ (80%)".into(), duration_ms: 2000, color: "var(--color-emerald)".into(), title: "Сброс стресса".into(), desc: "Глубокий вдох".into() },
        Phase { id: "inh2".into(), name: "ДОВДОХ (20%)".into(), duration_ms: 500, color: "var(--color-emerald)".into(), title: "Сброс стресса".into(), desc: "Короткий довдох".into() },
        Phase { id: "exh".into(), name: "ВЫДОХ".into(), duration_ms: 5500, color: "var(--color-blue)".into(), title: "Сброс стресса".into(), desc: "Длинный выдох через рот".into() },
        Phase { id: "pause".into(), name: "ПАУЗА".into(), duration_ms: 8000, color: "var(--text-dim)".into(), title: "Сброс стресса".into(), desc: "Обычное дыхание".into() }
    ]
}

fn get_pmr_cycle() -> Vec<Phase> {
    let groups = vec![
        ("1. Кисти", "Сожмите кулаки максимально.", "Резко разожмите."),
        ("2. Плечи", "Согните руки, напрягите бицепсы.", "Отпустите. Руки тяжёлые."),
        ("3. Лицо", "Зажмурьтесь. Гримаса напряжения.", "Лицо расслаблено."),
        ("4. Трапеции", "Поднимите плечи к ушам.", "Сбросьте плечи вниз."),
        ("5. Грудь", "Сведите лопатки, напрягите.", "Отпустите."),
        ("6. Живот", "Твердый пресс.", "Мягкий живот."),
        ("7. Ноги", "Носки на себя, напрягите бедра.", "Отпустите.")
    ];
    let mut p = Vec::new();
    for g in groups {
        p.push(Phase { id: "on".into(), name: "НАПРЯЖЕНИЕ".into(), duration_ms: 7000, color: "var(--color-red)".into(), title: g.0.into(), desc: g.1.into() });
        p.push(Phase { id: "off".into(), name: "РАССЛАБЛЕНИЕ".into(), duration_ms: 20000, color: "var(--color-emerald)".into(), title: g.0.into(), desc: g.2.into() });
    }
    p
}

fn get_base_program(total_minutes: i32) -> Vec<Phase> {
    let mut p = Vec::new();
    let is20 = total_minutes <= 20;
    let sigh_target_ms = if is20 { 3 * 60000 } else { 5 * 60000 };
    let hrv_target_ms = if is20 { 10 * 60000 } else { 20 * 60000 };

    p.push(Phase { id: "intro".into(), name: "ПОДГОТОВКА".into(), duration_ms: 10000, color: "var(--color-orange)".into(), title: "Этап 1: Физиологический вздох".into(), desc: "Приготовьтесь к двойному вдоху носом.".into() });

    let sigh_cycles = (sigh_target_ms - 10000) / 16000;
    for _ in 0..sigh_cycles {
        p.extend(get_sigh_cycle());
    }

    p.push(Phase { id: "trans1".into(), name: "ПЕРЕХОД".into(), duration_ms: 10000, color: "var(--color-orange)".into(), title: "Этап 2: Резонансное дыхание".into(), desc: "Выровняйте дыхание.".into() });

    let hrv_cycles = (hrv_target_ms - 10000) / 10000;
    for _ in 0..hrv_cycles {
        p.extend(get_hrv_cycle(6.0));
    }

    p.push(Phase { id: "trans2".into(), name: "ПЕРЕХОД".into(), duration_ms: 10000, color: "var(--color-orange)".into(), title: "Этап 3: Мышечная релаксация".into(), desc: "Приготовьтесь к работе с телом.".into() });

    p.extend(get_pmr_cycle());

    p
}

fn get_arsenal_program() -> Vec<Phase> {
    vec![
        Phase { id: "kog1".into(), name: "ОЦЕНКА".into(), duration_ms: 60000, color: "var(--color-red)".into(), title: "СТОП-КАДР".into(), desc: "Вспомните стрессовую ситуацию. Что произошло?".into() },
        Phase { id: "kog2".into(), name: "ПРОВЕРКА".into(), duration_ms: 120000, color: "var(--color-orange)".into(), title: "ACT-Разделение".into(), desc: "Скажите себе: «У меня есть мысль...». Оцените вероятность худшего.".into() },
        Phase { id: "kog3".into(), name: "ДЕЙСТВИЕ".into(), duration_ms: 120000, color: "var(--color-blue)".into(), title: "Действие".into(), desc: "Какое конкретное действие вы можете сделать прямо сейчас?".into() },

        Phase { id: "trans1".into(), name: "ПЕРЕХОД".into(), duration_ms: 10000, color: "var(--color-orange)".into(), title: "Ментальная репетиция".into(), desc: "Переходим к программированию событий.".into() },

        Phase { id: "mr1".into(), name: "ОПТИМУМ".into(), duration_ms: 120000, color: "var(--color-emerald)".into(), title: "Оптимальный сценарий".into(), desc: "Всё идет по плану. Вы уверены.".into() },
        Phase { id: "mr2".into(), name: "СЛОЖНОСТЬ".into(), duration_ms: 180000, color: "var(--color-red)".into(), title: "Сложный сценарий".into(), desc: "Неожиданное препятствие. Дышите. Вы берете контроль.".into() },
        Phase { id: "mr3".into(), name: "ПРОВАЛ".into(), duration_ms: 120000, color: "var(--color-orange)".into(), title: "Провальный сценарий".into(), desc: "Худший исход. Минимизация ущерба.".into() },

        Phase { id: "trans2".into(), name: "ПЕРЕХОД".into(), duration_ms: 10000, color: "var(--color-orange)".into(), title: "Yoga Nidra (NSDR)".into(), desc: "Подготовка ко сну.".into() },
        Phase { id: "yn".into(), name: "ПРАКТИКА".into(), duration_ms: 600000, color: "var(--color-blue)".into(), title: "Глубокое расслабление".into(), desc: "Следуйте за аудиозаписью NSDR.".into() },
    ]
}

#[component]
pub fn BaseView() -> Element {
    let mut current_mode = use_signal(|| "base");
    let mut is_running = use_signal(|| false);

    // Default 20 mins for init calculation
    let mut phases = use_signal(|| get_base_program(20));
    let mut current_phase_idx = use_signal(|| 0);

    let total_ms_initial: i32 = get_base_program(20).iter().map(|p| p.duration_ms).sum();
    let mut total_time_left = use_signal(|| total_ms_initial); // ms
    let mut time_left_in_phase = use_signal(|| get_base_program(20)[0].duration_ms); // ms

    // Use a background task that doesn't track signals in its dependencies to avoid reactive loops
    // Dioxus 0.5+ use_coroutine or use_hook with a spawn
    use_hook(|| {
        dioxus::prelude::spawn(async move {
            loop {
                task::sleep(Duration::from_millis(100)).await;

                // Read without subscribing since we are in an async loop manually spawned
                if *is_running.read() {
                    let current_ms = *time_left_in_phase.read();
                    let total_ms = *total_time_left.read();

                    if current_ms > 100 {
                        time_left_in_phase.set(current_ms - 100);
                        total_time_left.set(total_ms - 100);
                    } else {
                        // Phase ended, move to next
                        let mut idx = *current_phase_idx.read();
                        let p_len = phases.read().len();

                        if idx + 1 < p_len {
                            idx += 1;
                            current_phase_idx.set(idx);
                            let new_duration = phases.read()[idx].duration_ms;
                            time_left_in_phase.set(new_duration);
                        } else {
                            // Finished
                            is_running.set(false);
                        }
                    }
                }
            }
        })
    });

    let format_time = |ms: i32| -> String {
        if ms < 0 { return "00:00".into() }
        let secs = ms / 1000;
        let m = secs / 60;
        let s = secs % 60;
        format!("{:02}:{:02}", m, s)
    };

    let mut set_mode = move |mode: &'static str| {
        current_mode.set(mode);
        is_running.set(false);
        current_phase_idx.set(0);

        let new_phases = match mode {
            "base" => get_base_program(20),
            "arsenal" => get_arsenal_program(),
            "full" => {
                let mut p = get_base_program(20);
                p.extend(get_arsenal_program());
                p
            },
            _ => vec![]
        };

        let total_ms: i32 = new_phases.iter().map(|p| p.duration_ms).sum();
        total_time_left.set(total_ms);
        if !new_phases.is_empty() {
            time_left_in_phase.set(new_phases[0].duration_ms);
        }
        phases.set(new_phases);
    };

    let p_list = phases();
    let p_idx = current_phase_idx();
    let current_phase = if p_list.is_empty() || p_idx >= p_list.len() { None } else { Some(p_list[p_idx].clone()) };

    rsx! {
        div { class: "view-header",
            div {
                h1 { class: "view-title text-orange", "Стрессоустойчивость" }
                p { class: "text-dim text-sm mt-1 uppercase", "Работа с вегетативной нервной системой" }
            }
            div { class: "flex items-center gap-2 cyber-border py-1 px-3 border-orange",
                span { class: "mono font-bold text-orange", "Осталось: {format_time(total_time_left())}" }
            }
        }

        div { class: "flex justify-center mb-6",
            div { class: "bg-surface p-1 rounded-sm border border-accent flex gap-2 w-full max-w-md",
                button { class: if current_mode() == "base" { "tab-btn-pill active" } else { "tab-btn-pill" }, onclick: move |_| set_mode("base"), "База (20м)" }
                button { class: if current_mode() == "arsenal" { "tab-btn-pill active" } else { "tab-btn-pill" }, onclick: move |_| set_mode("arsenal"), "Арсенал (30м)" }
                button { class: if current_mode() == "full" { "tab-btn-pill active" } else { "tab-btn-pill" }, onclick: move |_| set_mode("full"), "Максимум (50м)" }
            }
        }

        div { class: "flex flex-col items-center",
            div { class: "cyber-border w-full max-w-md p-8 flex flex-col items-center",
                h2 { class: "text-lg font-bold uppercase mb-1",
                    if let Some(ref p) = current_phase { "{p.title}" } else { "ОЖИДАНИЕ" }
                }
                p { class: "text-sm text-dim mb-8 text-center h-12",
                    if let Some(ref p) = current_phase { "{p.desc}" } else { "Выберите программу и нажмите старт." }
                }

                div { class: "timer-container mb-8",
                    div { class: "progress-ring-bg",
                        div {
                            class: "progress-ring-fg",
                            style: if is_running() {
                                format!("animation: pulse 5s infinite, rotate-border 60s linear infinite; border-top-color: {};", current_phase.as_ref().map_or("var(--text-dim)", |p| p.color.as_str()))
                            } else {
                                format!("border-top-color: {};", current_phase.as_ref().map_or("var(--text-dim)", |p| p.color.as_str()))
                            }
                        }
                    }
                    div { class: "timer-content",
                        span {
                            class: "phase-text",
                            style: "color: {current_phase.as_ref().map_or(\"var(--text-dim)\", |p| p.color.as_str())}",
                            if !is_running() && current_phase_idx() == 0 { "ОЖИДАНИЕ" } else if current_phase_idx() >= phases().len() { "ФИНАЛ" } else { "{current_phase.as_ref().unwrap().name}" }
                        }
                        span { class: "time-text", "{format_time(time_left_in_phase())}" }
                    }
                }

                div { class: "flex gap-4 w-full",
                    button {
                        class: "btn-primary flex-1",
                        onclick: move |_| {
                            if current_phase_idx() == 0 && time_left_in_phase() == 0 {
                                set_mode(current_mode());
                            }
                            is_running.set(!is_running());
                        },
                        if is_running() { "ПАУЗА" } else { "СТАРТ" }
                    }
                    button {
                        class: "btn-secondary flex-1",
                        onclick: move |_| set_mode(current_mode()),
                        "СБРОС"
                    }
                }
            }
        }
    }
}
