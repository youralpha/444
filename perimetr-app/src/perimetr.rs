


use serde::{Deserialize, Serialize};

#[derive(Clone, PartialEq, Serialize, Deserialize)]
pub struct TaskField {
    pub id: String,
    pub label: String,
    pub type_: String,
    pub placeholder: Option<String>,
}

#[derive(Clone, PartialEq, Serialize, Deserialize)]
pub struct ProtocolTask {
    pub id: String,
    pub text: String,
    pub time: String,
    pub description: String,
    pub fields: Vec<TaskField>,
}

#[derive(Clone, PartialEq, Serialize, Deserialize)]
pub struct ProtocolCycle {
    pub id: String,
    pub title: String,
    pub color: String,
    pub tasks: Vec<ProtocolTask>,
}

pub fn get_cycles() -> Vec<ProtocolCycle> {
    vec![
        ProtocolCycle {
            id: "daily".into(), title: "Ежедневно".into(), color: "text-emerald".into(),
            tasks: vec![
                ProtocolTask {
                    id: "d1".into(), text: "Утренний оперативный брифинг (ПОЛНЫЙ SAS)".into(), time: "15 мин".into(),
                    description: "SAS (Situational Awareness Sync) — проактивная синхронизация с миссией.".into(),
                    fields: vec![
                        TaskField { id: "sas_anticipation".into(), label: "1. АНТИЦИПАЦИЯ".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "w".into(), label: "2. W — WISH".into(), type_: "input".into(), placeholder: None },
                        TaskField { id: "o1".into(), label: "3. O — OUTCOME".into(), type_: "input".into(), placeholder: None },
                        TaskField { id: "o2".into(), label: "4. O — OBSTACLE".into(), type_: "input".into(), placeholder: None },
                        TaskField { id: "p".into(), label: "5. P — PLAN".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "d2".into(), text: "OODA Loop (Цикл Бойда)".into(), time: "В моменте".into(),
                    description: "Наблюдай -> Ориентируйся -> Решай -> Действуй.".into(),
                    fields: vec![
                        TaskField { id: "ooda_count".into(), label: "Циклов за день".into(), type_: "number".into(), placeholder: None },
                        TaskField { id: "ooda_decision".into(), label: "Ключевое решение".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "d4".into(), text: "Физиологический чек (H2F)".into(), time: "2 мин".into(),
                    description: "Физика тела определяет психику.".into(),
                    fields: vec![
                        TaskField { id: "sleep".into(), label: "Сон (1-10)".into(), type_: "number".into(), placeholder: None },
                        TaskField { id: "energy".into(), label: "Энергия (1-10)".into(), type_: "number".into(), placeholder: None },
                        TaskField { id: "focus".into(), label: "Фокус (1-10)".into(), type_: "number".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "d5".into(), text: "Teach-Back изученного".into(), time: "15 мин".into(),
                    description: "Если не можешь объяснить, значит не понял.".into(),
                    fields: vec![
                        TaskField { id: "learned".into(), label: "Что понято?".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "explained".into(), label: "Кому?".into(), type_: "input".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "d6".into(), text: "EOD Дебрифинг (Протокол Отбоя)".into(), time: "10 мин".into(),
                    description: "End of Day (EOD) Debrief — ритуал закрытия оперативного дня.".into(),
                    fields: vec![
                        TaskField { id: "eod_dump".into(), label: "1. BRAIN DUMP (Сброс мыслей)".into(), type_: "textarea".into(), placeholder: Some("Выгрузи это сюда, чтобы не думать ночью.".into()) },
                        TaskField { id: "eod_aar".into(), label: "2. МИКРО-AAR".into(), type_: "textarea".into(), placeholder: Some("Выполнено ли утреннее WISH?".into()) },
                        TaskField { id: "eod_win".into(), label: "3. ДОФАМИНОВАЯ ФИКСАЦИЯ".into(), type_: "input".into(), placeholder: Some("Главная победа дня".into()) }
                    ]
                }
            ]
        },
        ProtocolCycle {
            id: "weekly".into(), title: "Еженедельно".into(), color: "text-blue".into(),
            tasks: vec![
                ProtocolTask {
                    id: "w1".into(), text: "Тактический AAR".into(), time: "30 мин".into(),
                    description: "Разбор полетов за неделю.".into(),
                    fields: vec![
                        TaskField { id: "planned".into(), label: "План".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "happened".into(), label: "Факт".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "why".into(), label: "Почему?".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "fix".into(), label: "Изменения".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "w2".into(), text: "ShadowBox-тренировка".into(), time: "30 мин".into(),
                    description: "Сравнение своих решений с экспертными.".into(),
                    fields: vec![
                        TaskField { id: "expert_case".into(), label: "Кейс".into(), type_: "input".into(), placeholder: None },
                        TaskField { id: "pattern_gap".into(), label: "Разрыв".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "w4".into(), text: "Контролируемый микрострессор".into(), time: "Варьируется".into(),
                    description: "Закаливание нервной системы.".into(),
                    fields: vec![
                        TaskField { id: "stressor".into(), label: "Что сделано?".into(), type_: "input".into(), placeholder: None },
                        TaskField { id: "reaction".into(), label: "Реакция тела".into(), type_: "textarea".into(), placeholder: None }
                    ]
                }
            ]
        },
        ProtocolCycle {
            id: "monthly".into(), title: "Ежемесячно".into(), color: "text-orange".into(),
            tasks: vec![
                ProtocolTask {
                    id: "m1".into(), text: "Стратегический AAR".into(), time: "60 мин".into(),
                    description: "Анализ прошедшего месяца.".into(),
                    fields: vec![
                        TaskField { id: "progress_pct".into(), label: "Прогресс (%)".into(), type_: "number".into(), placeholder: None },
                        TaskField { id: "stop_doing".into(), label: "Прекратить делать".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "start_doing".into(), label: "Начать делать".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "m3".into(), text: "Агентурная сеть (Обновление)".into(), time: "Варьируется".into(),
                    description: "Разбор контактов и стратегий.".into(),
                    fields: vec![
                        TaskField { id: "network_favors".into(), label: "Услуги авансом".into(), type_: "textarea".into(), placeholder: None }
                    ]
                }
            ]
        },
        ProtocolCycle {
            id: "quarterly".into(), title: "Ежеквартально".into(), color: "text-red".into(),
            tasks: vec![
                ProtocolTask {
                    id: "q2".into(), text: "Brainwriting Pre-Mortem".into(), time: "60 мин".into(),
                    description: "Вскрытие до смерти. Ищем причины будущего провала плана.".into(),
                    fields: vec![
                        TaskField { id: "reasons".into(), label: "Причины фатального провала".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "actions".into(), label: "Превентивные действия".into(), type_: "textarea".into(), placeholder: None }
                    ]
                },
                ProtocolTask {
                    id: "q3".into(), text: "Red Team Review".into(), time: "2-3 часа".into(),
                    description: "Атака на собственный план (Красные команды ЦРУ).".into(),
                    fields: vec![
                        TaskField { id: "ai_critique".into(), label: "Главная уязвимость стратегии".into(), type_: "textarea".into(), placeholder: None },
                        TaskField { id: "human_filter".into(), label: "Решение проблемы".into(), type_: "textarea".into(), placeholder: None }
                    ]
                }
            ]
        }
    ]
}
