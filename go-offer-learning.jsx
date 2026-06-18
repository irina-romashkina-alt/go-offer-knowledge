import { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Ты — официальный AI-помощник для кураторов платформы Go Offer.
Твоя цель — генерировать готовые сообщения для менти строго в Tone of Voice компании.

ПРАВИЛА ToV:
1. Всегда [Имя] там, где нужно вставить имя менти
2. Я-позиция: «Я уточню», «Я проверил», «Я передам»
3. Каждое сообщение заканчивать конкретным Next Step
4. При негативе: Присоединение → Решение → Поддержка
5. Никакого канцелярита, никаких оправданий

КОГДА ПРОСЯТ НАПИСАТЬ СООБЩЕНИЕ — выдай ГОТОВЫЙ текст в блоке, который можно скопировать.
Если не хватает деталей (имя, ситуация) — спроси перед тем как писать.

ЗНАЕШЬ ЭТИ СИТУАЦИИ:
- Онбординг нового менти
- Клиент не отвечает (игнор 4 дня / 14 дней)
- Клиент вышел из игнора
- Резюме готово, просим фидбек
- Жалоба на качество / негатив
- Хочет возврат / нашёл работу сам
- Передача на Success Fee
- Технический сбой на платформе
- Клиент не хочет подаваться через хаб
- Завершение программы без оффера
- Завершение программы с оффером

Язык: русский. Тон: профессиональный, тёплый, как опытный коллега.`;

// ── DATA ──────────────────────────────────────────────────────────────────────
const TARIFFS = [
  {
    id: "take-all", name: "Take All", price: "$2,850", fee: "4%", duration: "6 мес",
    color: "#A78BFA",
    rows: [
      { label: "Куратор", value: "✓" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "✗", dim: true },
      { label: "Резюме от Go Offer", value: "✓" },
      { label: "LinkedIn оформление", value: "Самост. + созвон" },
      { label: "Моки", value: "2" },
      { label: "Аутрич LinkedIn Helper", value: "1 мес, 5/2" },
      { label: "Ассистент на подачи", value: "✗", dim: true },
      { label: "Фоллуапы", value: "✗", dim: true },
      { label: "Чекапы", value: "1" },
      { label: "Доступ к чату после", value: "7 мес" },
    ]
  },
  {
    id: "take-all-plus", name: "Take All+", price: "$4,950", fee: "5%", duration: "6 мес",
    color: "#F472B6", badge: "Популярный",
    rows: [
      { label: "Куратор", value: "✓" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "✓ 6 мес", hot: true },
      { label: "Резюме от Go Offer", value: "✓" },
      { label: "LinkedIn оформление", value: "Самост. + созвон" },
      { label: "Моки", value: "4" },
      { label: "Аутрич LinkedIn Helper", value: "2 мес, 5/2" },
      { label: "Ассистент на подачи", value: "1, до 2500 подач", hot: true },
      { label: "Фоллуапы", value: "2 мес, 5/2", hot: true },
      { label: "Чекапы", value: "3 (раз в 2 мес)" },
      { label: "Доступ к чату после", value: "12 мес" },
    ]
  },
  {
    id: "vip", name: "VIP", price: "$7,750", fee: "6%", duration: "12 мес",
    color: "#FBBF24", badge: "Максимум",
    rows: [
      { label: "Куратор", value: "✓" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "✓ 6 мес", hot: true },
      { label: "Резюме от Go Offer", value: "✓ силами Go Offer" },
      { label: "LinkedIn оформление", value: "Силами Go Offer" },
      { label: "Моки", value: "6" },
      { label: "Аутрич LinkedIn Helper", value: "4 мес, 5/2" },
      { label: "Ассистент на подачи", value: "1, до 5000 подач", hot: true },
      { label: "Фоллуапы", value: "4 мес, 5/2", hot: true },
      { label: "Чекапы", value: "6 (раз в мес)" },
      { label: "Доступ к чату после", value: "Навсегда ✓", hot: true },
    ]
  },
  {
    id: "comeback-lite", name: "Comeback Lite", price: "$2,800", fee: "5%", duration: "3 мес",
    color: "#34D399", badge: "Возврат",
    rows: [
      { label: "Куратор", value: "✓ 3 мес" },
      { label: "CRM + Easy Apply Bot", value: "3 мес" },
      { label: "Long Apply Bot", value: "✗", dim: true },
      { label: "Комбо-сессия", value: "LinkedIn+резюме+стратегия" },
      { label: "LinkedIn оформление", value: "В комбо-сессии" },
      { label: "Моки", value: "1" },
      { label: "Аутрич LinkedIn Helper", value: "2 мес" },
      { label: "Ассистент на подачи", value: "до 1500 подач" },
      { label: "Фоллуапы", value: "✗", dim: true },
      { label: "Чекапы", value: "1" },
      { label: "Доступ к чату после", value: "3 мес, только чтение" },
    ]
  },
  {
    id: "comeback-pro", name: "Comeback Pro", price: "$4,400", fee: "6%", duration: "6 мес",
    color: "#67E8F9", badge: "Возврат",
    rows: [
      { label: "Куратор", value: "✓ 6 мес" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "✗", dim: true },
      { label: "Комбо-сессия", value: "LinkedIn+резюме+стратегия" },
      { label: "LinkedIn оформление", value: "В комбо-сессии" },
      { label: "Моки", value: "2" },
      { label: "Аутрич LinkedIn Helper", value: "3 мес" },
      { label: "Ассистент на подачи", value: "до 3000 подач" },
      { label: "Фоллуапы", value: "✗", dim: true },
      { label: "Чекапы", value: "1" },
      { label: "Доступ к чату после", value: "6 мес, только чтение" },
    ]
  },
];

const DOCS = {
  "curator-guide": {
    title: "Гайд куратора", icon: "🎯", role: "Куратор",
    color: "#A78BFA",
    sections: [
      { heading: "Шаг 1: Онбординг — Стратсессия (7 дней)", content: "Проверить доступы: Notion, AXL, Hub, Umniko, Streamlit, Kommo, Telegram-чат.

Чеклист: личный кабинет, Hub, почта+бот, доступ к курсу, стартовое сообщение.

Отправить менти:
• Ссылку на платформу mentor.go-offer.us
• Рабочую тетрадь (из Notion, раздел Strategy)
• Ссылку на запись стратсессии с ментором

Контролировать прохождение модулей 0 и 1 в AXL до стратсессии." },
      { heading: "Шаг 2: Упаковка — Резюме (10 дней)", content: "1. Спросить впечатления после стратсессии
2. Дождаться фидбека от ментора, проверить чеклист
3. Отправить анкету для резюме
4. Передать ментору карточку резюме
5. Проверить модули 2–4 в AXL
6. Резюме готовится 3 рабочих дня → взять ссылку из поля «Result»
7. Попросить комментарии за 2 рабочих дня
8. Финал: все комментарии отвечены, наша почта и номер в резюме" },
      { heading: "Шаг 3: Автоматизация и подачи (10 дней)", content: "• Убедиться, что резюме прикреплено как «Final Resume»
• Попросить заполнить Applicant Profile Form в хабе
• Настроить парсинг через Диму
• Проверить публикацию статистики в Telegram
• Запустить боты, подобрать ассистента
• Прислать ссылку для скриншотов LinkedIn" },
      { heading: "Шаг 4: LinkedIn (10 дней)", content: "• Авто-аппликатор привязан к рабочей почте и телефону
• Удалить предыдущие резюме с профиля LinkedIn
• Подобрать аутричера в чате «Рассылки Хелпер | GO OFFER»
• Согласовать текст для аутрича через LinkedHelper
• Запустить аутрич и фоллуапера" },
      { heading: "Шаг 5: Собесы (до оффера)", content: "• Пушить прохождение модулей
• Убедиться, что менти написал self-pitch
• Пушить моки и чекапы
• Отправлять интервью на «прожарки»
• При оффере: зафиксировать в таблице (имя, дата, компания, тайтл, дата выхода, сумма)" },
      { heading: "Протокол при игноре", content: "4 рабочих дня без ответа → нарушение (макс. 3 раза). На 5й день: письмо + стоп подач.

14+ дней подряд → закрытие программы (§5.2): письмо → 7 дней → закрытие.

Практика: куратор пишет первым, не ждёт." },
      { heading: "Протокол при негативе", content: "1. Присоединение: «[Имя], понимаю, как это расстраивает...»
2. Решение: что сделано, что делается, кто отвечает
3. Поддержка или закрывающий вопрос

❌ Не оправдываться, не защищать систему
❌ Если переходит на личности → передать в ОКК" },
    ]
  },
  "regulations": {
    title: "Регламент кураторов", icon: "📋", role: "Куратор",
    color: "#F472B6",
    sections: [
      { heading: "График работы", content: "ПН–ПТ, 16:00–01:00 МСК (09:00–18:00 EST). СБ–ВС — выходные.

Правило «Офлайн-режима»: после 01:00 МСК уведомления можно отключить. Ночной бэклог — в первые 2 часа смены (до 18:00 МСК)." },
      { heading: "Стандарты скорости ответа", content: "Макс. первый ответ (рабочее время): 2 часа
Среднее время первого ответа: 8 минут
Разбор ночного бэклога: до 18:00 МСК
Полное закрытие обращения: не более 3 дней

При сложных запросах — промежуточный статус каждые 24 часа." },
      { heading: "Tone of Voice — допустимо", content: "✅ Всегда по имени
✅ Я-позиция: «Я уточню», «Я проверил»
✅ Эмпатия: «Понимаю, как это расстраивает»
✅ Короткие предложения, активные глаголы
✅ Всегда Next Step в конце диалога
✅ Обоснование с точки зрения рынка труда" },
      { heading: "Tone of Voice — недопустимо", content: "❌ Грубость, сарказм, переход на личности
❌ Канцелярит: «в целях обеспечения»
❌ Обезличенное «Мы» там, где важна личная вовлечённость
❌ Игнорирование эмоций — сначала присоединиться
❌ CAPS LOCK и множество восклицательных знаков
❌ Ложные обещания о сроках" },
      { heading: "Критерии ОКК (шкала 1–5)", content: "1. Понимание запроса — учёт контекста и истории
2. Точность решения — верная и применимая информация
3. Коммуникация — живой язык, Я-позиция
4. Проактивность — чёткий Next Step в конце
5. Влияние — решение с первого ответа, минимум усилий" },
    ]
  },
  "scripts": {
    title: "Скрипты", icon: "💬", role: "Все",
    color: "#67E8F9",
    sections: [
      { heading: "Клиент не хочет подаваться через хаб", content: "«[Имя], привет! Твои показатели — очень крутой результат 😊

Но есть важный момент: на этой неделе подключаем аутричера для дожимов. Чтобы он работал на 100%, нам нужно, чтобы основной поток шёл через Хаб — иначе не сможем «подхватить» вакансии.

Давай компромисс: 50% горячих позиций через Хаб, остальное в LinkedIn как тебе удобно. Как тебе такой план?»" },
      { heading: "Не моя локация в резюме", content: "«[Имя], отличный вопрос! Мы изучили, как рекрутеры выбирают кандидатов — они смотрят на тайтл и близость к офису. Даже для удалёнки многие тяготеют к «близким» кандидатам.

Поэтому убираем адрес из резюме, а в заявках ставим адрес близкий к офису. Тестировали весь февраль — конверсия стабильно 1%.

Тебя что-то беспокоит?»" },
      { heading: "Клиент вышел из игнора", content: "«[Имя], привет! Мы переживали — долго не могли достучаться.

Работу поставили на паузу только для того, чтобы твой ресурс и подачи не улетали в пустоту без твоего фидбека.

Супер, что снова с нами! Готова возвращаться? Получится до конца недели скорректировать резюме?»" },
      { heading: "Хочет возврат — нашёл работу", content: "«[Имя], привет!

Я бы предложила не расторгать договор сейчас, а взять паузу, которая входит в тариф — и посмотреть как будет развиваться ситуация.

Например, заморозим программу на пару недель, а потом вернёмся к обсуждению. Что скажешь?»" },
      { heading: "Передача на Success Fee", content: "«[Имя], спасибо, что поделился новостями! Рады за тебя, поздравляем — ты молодец! 💪

Я передам твои контакты координатору из отдела заботы, он свяжется с тобой в ближайшее время, чтобы обсудить детали по Success Fee.

Желаем дальнейших успехов! На связи.»" },
      { heading: "Завершение без оффера", content: "«[Имя], привет!

Наша программа подошла к концу. Мне было очень ценно пройти этот путь вместе с тобой.

Что мы успели: упаковка резюме, LinkedIn, позиционирование, подачи и интервью.

Даже если заветный оффер ещё впереди — посмотри, какой фундамент мы заложили. Ты стал сильнее как кандидат! Всё обязательно сложится 🍀»" },
      { heading: "Технический сбой", content: "«[Имя], возникла техническая особенность на платформе. Я уже передала информацию в IT-отдел, коллеги занимаются решением.

Как только всё восстановим — сразу сообщу. Спасибо за терпение!»" },
    ]
  },
  "returns": {
    title: "Политика возвратов", icon: "🔄", role: "Куратор",
    color: "#FB923C",
    sections: [
      { heading: "Основные принципы", content: "1. Договор — наша опора: каждое решение опирается на конкретные пункты
2. Goodwill — только наша инициатива, не уступка под давлением
3. Документация обязательна: каждый шаг в CRM письменно
4. Никаких чарджбэков без медиации (§9.2(c))
5. Никаких обещаний результата, давления или агрессии" },
      { heading: "Шаги при запросе на возврат", content: "1. Зафиксировать письменно → email на support@go-offer.us
2. В течение 48 рабочих часов подтвердить получение
3. Собрать досье: модули, мокс, воркшопы, история
4. Breakdown: Eligible = Paid − $1,600 − стоимость услуг
5. Всё фиксировать в CRM с датами и ссылками на пункты Договора" },
      { heading: "Уровни эскалации", content: "1. Менеджер — goodwill до $300
2. Head of Support — до $1,000 или до 30% Final Price
3. Legal — чарджбэки, угрозы, settlement agreements
4. Founder — прецедентные кейсы

При угрозе чарджбэка/суда → Legal в течение 4 рабочих часов." },
      { heading: "Запрещено говорить", content: "❌ «Гарантируем работу / оффер / placement»
❌ «Это мы виноваты», «команда плохо отработала»
❌ «Уберите отзыв — добавим денег»
❌ «Отзовите чарджбэк — вернём всё»
❌ Называть суммы устно до согласования
❌ «Наш юрист сказал», «Founder решил»" },
    ]
  },
  "upsell": {
    title: "Upsell", icon: "📈", role: "Куратор",
    color: "#34D399",
    sections: [
      { heading: "Базовые правила", content: "Апсейл — проявление заботы, не «втюхивание».

1. Диагностика вместо продажи: сначала «боль», потом решение
2. Связка с результатом: продаём сэкономленное время и оффер
3. Накапливаемый эффект: не нужно продавать всё сразу" },
      { heading: "Когда предлагать", content: "После стратсессии → агрейд тарифа или отдельные пакеты

Этап резюме → индивидуальная сессия с ментором, доп. редактура

Этап автоматизации → ассистенты, Long Bot

Этап собесов → доп. ассистенты, моки" },
    ]
  },
  "it": {
    title: "IT Tickets", icon: "🔧", role: "Все",
    color: "#FBBF24",
    sections: [
      { heading: "Как создать тикет", content: "1. Перейти на форму создания тикета в Linear.app
2. Авторизоваться через корпоративную почту ...@go-offer.us
3. Заполнить: Описание проблемы* (обязательно)
4. Дать название тикету
5. Поставить приоритет и дедлайн" },
      { heading: "Скрипт при тех. сбое", content: "❌ Нельзя: «программисты опять всё сломали»

✅ Скрипт:
«[Имя], возникла техническая особенность на платформе. Я уже передал(а) информацию в IT-отдел, коллеги занимаются решением. Сообщу как только восстановим.»

НЕ обещать «в течение часа» без подтверждения от разработчиков." },
    ]
  },
};

const NAV = [
  { id: "tariffs", label: "Тарифы", icon: "💎" },
  { id: "knowledge", label: "База знаний", icon: "📚" },
  { id: "ai", label: "AI-помощник", icon: "✨" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
];

const G = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" };

// ── TARIFFS VIEW ───────────────────────────────────────────────────────────────
function TariffsView() {
  const [active, setActive] = useState("take-all");
  const tar = TARIFFS.find(t => t.id === active);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, background: "linear-gradient(135deg,#fff,rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Тарифы</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>Выбери тариф, чтобы увидеть что в него входит</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TARIFFS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${active === t.id ? t.color + "88" : "rgba(255,255,255,0.1)"}`, background: active === t.id ? `${t.color}18` : "rgba(255,255,255,0.03)", color: active === t.id ? t.color : "rgba(255,255,255,0.5)", fontWeight: active === t.id ? 700 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.15s", boxShadow: active === t.id ? `0 0 16px ${t.color}30` : "none" }}>
            {t.name}
            {t.badge && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>· {t.badge}</span>}
          </button>
        ))}
      </div>

      {/* Selected tariff card + features */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
        {/* Price card */}
        <div style={{ ...G, border: `1px solid ${tar.color}44`, borderRadius: 14, padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${tar.color},${tar.color}44)`, boxShadow: `0 0 14px ${tar.color}` }} />
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: `radial-gradient(circle,${tar.color}25,transparent 70%)`, pointerEvents: "none" }} />
          {tar.badge && <div style={{ fontSize: 10, fontWeight: 700, color: tar.color, background: `${tar.color}18`, border: `1px solid ${tar.color}33`, padding: "3px 9px", borderRadius: 20, display: "inline-block", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>{tar.badge}</div>}
          <div style={{ fontSize: 28, fontWeight: 900, color: tar.color, letterSpacing: "-1px", textShadow: `0 0 24px ${tar.color}`, lineHeight: 1 }}>{tar.price}</div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{tar.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{tar.fee} с оффера</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Срок: {tar.duration}</div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ключевые плюсы</div>
            {tar.rows.filter(r => r.hot).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: tar.color, flexShrink: 0, marginTop: 5, boxShadow: `0 0 5px ${tar.color}` }} />
                <div style={{ fontSize: 12, color: tar.color, fontWeight: 500, lineHeight: 1.4 }}>{r.label}: {r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full features list */}
        <div style={{ ...G, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Что входит в {tar.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>· {tar.rows.length} условий</div>
          </div>
          {tar.rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: i < tar.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{r.label}</div>
              <div style={{ fontSize: 13, fontWeight: r.hot ? 700 : 400, color: r.dim ? "rgba(255,255,255,0.2)" : r.hot ? tar.color : "rgba(255,255,255,0.8)", textShadow: r.hot ? `0 0 10px ${tar.color}` : "none" }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Compare all — small table */}
      <div style={{ marginTop: 14, ...G, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Сравнение цен</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {TARIFFS.map(t => (
            <div key={t.id} onClick={() => setActive(t.id)} style={{ padding: "14px 12px", textAlign: "center", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.05)", background: active === t.id ? `${t.color}10` : "transparent", transition: "all 0.15s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.color, marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: active === t.id ? t.color : "#fff", textShadow: active === t.id ? `0 0 16px ${t.color}` : "none" }}>{t.price}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.fee} · {t.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── KNOWLEDGE VIEW ─────────────────────────────────────────────────────────────
function KnowledgeView({ search }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [expanded, setExpanded] = useState({});

  const filteredDocs = Object.entries(DOCS).filter(([, doc]) =>
    search === "" || doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.sections.some(s => s.heading.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  if (activeDoc) {
    const doc = DOCS[activeDoc];
    return (
      <div style={{ maxWidth: 780 }}>
        <button onClick={() => setActiveDoc(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: "5px 0" }}>← Назад</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, background: `${doc.color}18`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${doc.color}33` }}>{doc.icon}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{doc.sections.length} разделов · {doc.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {doc.sections.map((s, i) => {
            const key = `${activeDoc}-${i}`;
            const open = expanded[key] !== false;
            return (
              <div key={i} style={{ ...G, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => toggle(key)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  <span>{s.heading}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </button>
                {open && <div style={{ padding: "0 18px 15px", color: "rgba(255,255,255,0.6)", fontSize: 13.5, lineHeight: 1.75, whiteSpace: "pre-wrap", borderTop: "1px solid rgba(255,255,255,0.05)" }}><div style={{ paddingTop: 13 }}>{s.content}</div></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, background: "linear-gradient(135deg,#fff,rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>База знаний</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>{filteredDocs.length} документов</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {filteredDocs.map(([id, doc]) => (
          <div key={id} onClick={() => setActiveDoc(id)}
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${doc.color}30`, borderRadius: 13, padding: "20px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = doc.color + "66"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${doc.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = doc.color + "30"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${doc.color},${doc.color}33)`, boxShadow: `0 0 10px ${doc.color}` }} />
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, background: `radial-gradient(circle,${doc.color}20,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ width: 40, height: 40, background: `${doc.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 13, border: `1px solid ${doc.color}25` }}>{doc.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 5 }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 13, lineHeight: 1.4 }}>{doc.sections[0].heading}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: doc.color, background: `${doc.color}15`, padding: "2px 8px", borderRadius: 20, border: `1px solid ${doc.color}22` }}>{doc.role}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{doc.sections.length} разд. →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI VIEW ────────────────────────────────────────────────────────────────────
function AIView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! Я AI-помощник куратора Go Offer ✨

Могу написать готовое сообщение для менти в любой ситуации:
• Онбординг нового менти
• Клиент не отвечает
• Жалоба на качество
• Хочет возврат
• Завершение программы
• и многое другое

Просто опиши ситуацию — и я напишу текст, который можно скопировать и отправить." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const QUICK = [
    "Напиши приветствие для нового менти",
    "Клиент не отвечает 4 дня",
    "Менти вышел из игнора",
    "Завершение программы с оффером",
    "Клиент жалуется на качество резюме",
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await resp.json();
      setMessages(p => [...p, { role: "assistant", content: data.content?.[0]?.text || "Ошибка." }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Ошибка соединения. Попробуй ещё раз." }]);
    }
    setLoading(false);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", maxWidth: 820 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, background: "linear-gradient(135deg,#fff,rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI-помощник</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>Генерирует готовые тексты для менти в ToV Go Offer</p>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q)}
              style={{ padding: "7px 13px", borderRadius: 20, border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.15)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.08)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"; }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#A78BFA,#F472B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 9, alignSelf: "flex-end", boxShadow: "0 0 10px rgba(167,139,250,0.4)" }}>✨</div>
            )}
            <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13.5, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none", boxShadow: m.role === "user" ? "0 4px 14px rgba(167,139,250,0.3)" : "none" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#A78BFA,#F472B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
            <div style={{ display: "flex", gap: 5, padding: "12px 15px", background: "rgba(255,255,255,0.05)", borderRadius: "14px 14px 14px 4px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", animation: `dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 9, alignItems: "flex-end", ...G, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 13, padding: "10px 12px" }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Опиши ситуацию или попроси написать сообщение..."
          rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          style={{ width: 36, height: 36, background: input.trim() ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 9, color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: input.trim() ? "0 4px 14px rgba(167,139,250,0.4)" : "none", transition: "all 0.15s" }}>↑</button>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [sidebar, setSidebar] = useState(true);
  const [activeNav, setActiveNav] = useState("tariffs");
  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const SW = sidebar ? 210 : 60;
  const labels = { tariffs: "Тарифы", knowledge: "База знаний", ai: "AI-помощник", settings: "Настройки" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080516", fontFamily: "'Inter',-apple-system,sans-serif", overflow: "hidden", position: "relative" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 99px; } input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); } button { font-family: inherit; cursor: pointer; } @keyframes dot { 0%,80%,100% { opacity:.3; transform:scale(.8); } 40% { opacity:1; transform:scale(1); } }`}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", top: -150, left: -150, width: 500, height: 500, background: "radial-gradient(circle,rgba(167,139,250,0.1),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -100, width: 450, height: 450, background: "radial-gradient(circle,rgba(244,114,182,0.07),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[...Array(50)].map((_, i) => <div key={i} style={{ position: "absolute", left: `${(i*37+13)%100}%`, top: `${(i*53+7)%100}%`, width: (i%3)+1, height: (i%3)+1, background: "#fff", borderRadius: "50%", opacity: 0.12+(i%5)*0.06 }} />)}
      </div>

      {/* SIDEBAR */}
      <aside style={{ width: SW, flexShrink: 0, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.22s ease", overflow: "hidden", zIndex: 10, position: "relative" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: sidebar ? "0 13px" : "0 10px", justifyContent: sidebar ? "space-between" : "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {sidebar && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#A78BFA,#F472B6)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 12px rgba(167,139,250,0.5)" }}>🍍</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>Go Offer</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.7px" }}>База знаний</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebar(p => !p)} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 9, flexShrink: 0 }}>
            {sidebar ? "◀" : "▶"}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "10px 5px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)} title={!sidebar ? item.label : ""}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: sidebar ? "8px 10px" : "9px", justifyContent: sidebar ? "flex-start" : "center", borderRadius: 8, border: `1px solid ${active ? "rgba(167,139,250,0.3)" : "transparent"}`, background: active ? "rgba(167,139,250,0.12)" : "transparent", color: active ? "#A78BFA" : "rgba(255,255,255,0.35)", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all 0.13s", width: "100%" }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {sidebar && <span style={{ flex: 1 }}>{item.label}</span>}
                {active && sidebar && <div style={{ width: 4, height: 4, background: "#A78BFA", borderRadius: "50%", boxShadow: "0 0 5px #A78BFA" }} />}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "8px 5px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: sidebar ? "7px 10px" : "7px", justifyContent: sidebar ? "flex-start" : "center", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: 25, height: 25, borderRadius: "50%", background: "linear-gradient(135deg,#A78BFA,#F472B6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>И</div>
            {sidebar && <div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Ирина Р.</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Куратор</div></div>}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative", zIndex: 1 }}>
        <header style={{ height: 60, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Главная</span>
            <span style={{ color: "rgba(255,255,255,0.13)" }}>/</span>
            <span style={{ color: "#A78BFA", fontWeight: 600 }}>{labels[activeNav]}</span>
          </div>
          {activeNav === "knowledge" && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 11px", width: 200, border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#fff", width: "100%" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 6, position: "relative" }}>
            <button onClick={() => { setNotif(p => !p); setUserMenu(false); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, position: "relative" }}>
              🔔<div style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, background: "#F472B6", borderRadius: "50%", border: "1.5px solid #080516" }} />
            </button>
            {notif && (
              <div style={{ position: "absolute", top: 40, right: 40, width: 240, background: "rgba(10,5,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 11, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 8 }}>Уведомления</div>
                {["Новый документ в базе знаний", "Напоминание: заполни отчёт"].map((n, i) => (
                  <div key={i} style={{ padding: "8px 5px", fontSize: 12, color: "rgba(255,255,255,0.6)", borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.05)" : "none", lineHeight: 1.5 }}>
                    <span style={{ display: "inline-block", width: 4, height: 4, background: "#A78BFA", borderRadius: "50%", marginRight: 7, verticalAlign: "middle" }} />{n}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setUserMenu(p => !p); setNotif(false); }} style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#A78BFA,#F472B6)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, boxShadow: "0 0 12px rgba(167,139,250,0.35)" }}>И</button>
            {userMenu && (
              <div style={{ position: "absolute", top: 40, right: 0, width: 165, background: "rgba(10,5,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 11, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100, padding: 6 }}>
                {["Профиль", "Настройки", "Выйти"].map((item, i) => (
                  <div key={i} style={{ padding: "7px 9px", borderRadius: 7, fontSize: 13, color: i === 2 ? "#F472B6" : "rgba(255,255,255,0.65)", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{item}</div>
                ))}
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "20px" }} onClick={() => { setNotif(false); setUserMenu(false); }}>
          {activeNav === "tariffs" && <TariffsView />}
          {activeNav === "knowledge" && <KnowledgeView search={search} />}
          {activeNav === "ai" && <AIView />}
          {activeNav === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⚙️</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>Раздел в разработке</div>
              <div style={{ fontSize: 12, marginTop: 5 }}>Скоро появится здесь</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
