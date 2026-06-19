import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = "You are an AI assistant for Go Offer curators. Write ready-to-send messages for mentees in Russian, warm and professional tone. Always use [Имя] placeholder. End each message with a clear next step.";

const TARIFFS = [
  {
    id: "take-all", name: "Take All", price: "$2,850", fee: "4%", duration: "6 мес",
    color: "#A78BFA", emoji: "rocket",
    rows: [
      { label: "Куратор", value: "входит" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "нет", dim: true },
      { label: "Резюме от Go Offer", value: "входит" },
      { label: "LinkedIn оформление", value: "Самост. + созвон" },
      { label: "Моки", value: "2 мока" },
      { label: "Аутрич LinkedIn Helper", value: "1 мес, 5/2" },
      { label: "Ассистент на подачи", value: "нет", dim: true },
      { label: "Фоллуапы", value: "нет", dim: true },
      { label: "Чекапы", value: "1 чекап" },
      { label: "Доступ к чату после", value: "7 мес" },
    ]
  },
  {
    id: "take-all-plus", name: "Take All+", price: "$4,950", fee: "5%", duration: "6 мес",
    color: "#F472B6", badge: "Популярный", emoji: "flower",
    rows: [
      { label: "Куратор", value: "входит" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "6 мес", hot: true },
      { label: "Резюме от Go Offer", value: "входит" },
      { label: "LinkedIn оформление", value: "Самост. + созвон" },
      { label: "Моки", value: "4 мока" },
      { label: "Аутрич LinkedIn Helper", value: "2 мес, 5/2" },
      { label: "Ассистент на подачи", value: "1, до 2500 подач", hot: true },
      { label: "Фоллуапы", value: "2 мес, 5/2", hot: true },
      { label: "Чекапы", value: "3 (раз в 2 мес)" },
      { label: "Доступ к чату после", value: "12 мес" },
    ]
  },
  {
    id: "vip", name: "VIP", price: "$7,750", fee: "6%", duration: "12 мес",
    color: "#FBBF24", badge: "Максимум", emoji: "star",
    rows: [
      { label: "Куратор", value: "входит" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "6 мес", hot: true },
      { label: "Резюме от Go Offer", value: "силами Go Offer" },
      { label: "LinkedIn оформление", value: "Силами Go Offer" },
      { label: "Моки", value: "6 моков" },
      { label: "Аутрич LinkedIn Helper", value: "4 мес, 5/2" },
      { label: "Ассистент на подачи", value: "1, до 5000 подач", hot: true },
      { label: "Фоллуапы", value: "4 мес, 5/2", hot: true },
      { label: "Чекапы", value: "6 (раз в мес)" },
      { label: "Доступ к чату после", value: "Навсегда!", hot: true },
    ]
  },
  {
    id: "comeback-lite", name: "Comeback Lite", price: "$2,800", fee: "5%", duration: "3 мес",
    color: "#34D399", badge: "Возврат", emoji: "leaf",
    rows: [
      { label: "Куратор", value: "3 мес" },
      { label: "CRM + Easy Apply Bot", value: "3 мес" },
      { label: "Long Apply Bot", value: "нет", dim: true },
      { label: "Комбо-сессия", value: "LinkedIn+резюме+стратегия" },
      { label: "LinkedIn оформление", value: "В комбо-сессии" },
      { label: "Моки", value: "1 мок" },
      { label: "Аутрич LinkedIn Helper", value: "2 мес" },
      { label: "Ассистент на подачи", value: "до 1500 подач" },
      { label: "Фоллуапы", value: "нет", dim: true },
      { label: "Чекапы", value: "1 чекап" },
      { label: "Доступ к чату после", value: "3 мес, только чтение" },
    ]
  },
  {
    id: "comeback-pro", name: "Comeback Pro", price: "$4,400", fee: "6%", duration: "6 мес",
    color: "#67E8F9", badge: "Возврат", emoji: "sparkle",
    rows: [
      { label: "Куратор", value: "6 мес" },
      { label: "CRM + Easy Apply Bot", value: "6 мес" },
      { label: "Long Apply Bot", value: "нет", dim: true },
      { label: "Комбо-сессия", value: "LinkedIn+резюме+стратегия" },
      { label: "LinkedIn оформление", value: "В комбо-сессии" },
      { label: "Моки", value: "2 мока" },
      { label: "Аутрич LinkedIn Helper", value: "3 мес" },
      { label: "Ассистент на подачи", value: "до 3000 подач" },
      { label: "Фоллуапы", value: "нет", dim: true },
      { label: "Чекапы", value: "1 чекап" },
      { label: "Доступ к чату после", value: "6 мес, только чтение" },
    ]
  },
];

const DOCS = [
  {
    id: "curator-guide", title: "Гайд куратора", icon: "target", role: "Куратор", color: "#A78BFA",
    sections: [
      { h: "Шаг 1: Онбординг (7 дней)", c: "Проверить доступы: Notion, AXL, Hub, Umniko, Telegram-чат.\n\nОтправить менти:\n- Ссылку на платформу mentor.go-offer.us\n- Рабочую тетрадь из Notion\n- Ссылку на запись стратсессии\n\nКонтролировать модули 0 и 1 в AXL." },
      { h: "Шаг 2: Резюме (10 дней)", c: "1. Впечатления после стратсессии\n2. Фидбек от ментора, чеклист\n3. Анкета для резюме\n4. Резюме готовится 3 рабочих дня\n5. Комментарии менти за 2 рабочих дня\n6. Финал: наша почта и номер в резюме" },
      { h: "Шаг 3: Автоматизация (10 дней)", c: "- Final Resume в кабинете\n- Applicant Profile Form в хабе\n- Парсинг через Диму\n- Статистика в Telegram\n- Запустить боты, ассистента" },
      { h: "Шаг 4: LinkedIn (10 дней)", c: "- Авто-аппликатор к рабочей почте и телефону\n- Удалить старые резюме с профиля\n- Подобрать аутричера\n- Запустить аутрич и фоллуапера" },
      { h: "Шаг 5: Собесы", c: "- Пушить модули, self-pitch, моки\n- При оффере: зафиксировать в таблице\n  (имя, дата, компания, тайтл, сумма)" },
      { h: "Протокол при игноре", c: "4 рабочих дня без ответа - нарушение (макс. 3 раза). На 5й день: письмо + стоп подач.\n\n14+ дней подряд - закрытие программы: письмо -> 7 дней -> закрытие." },
      { h: "Протокол при негативе", c: "1. Присоединение: признать эмоцию\n2. Решение: что сделано и делается\n3. Поддержка или закрывающий вопрос\n\nНельзя: оправдываться, защищать систему.\nЕсли переходит на личности - передать в ОКК." },
    ]
  },
  {
    id: "regulations", title: "Регламент кураторов", icon: "doc", role: "Куратор", color: "#F472B6",
    sections: [
      { h: "График работы", c: "ПН-ПТ, 16:00-01:00 МСК (09:00-18:00 EST).\nСБ-ВС - выходные.\n\nПосле 01:00 МСК уведомления можно отключить.\nНочной бэклог - в первые 2 часа смены." },
      { h: "Стандарты скорости", c: "Первый ответ (рабочее время): макс. 2 часа\nСреднее время ответа: 8 минут\nРазбор ночного бэклога: до 18:00 МСК\nПолное закрытие: не более 3 дней" },
      { h: "Tone of Voice - можно", c: "OK: Всегда по имени\nOK: Я-позиция (Я уточню, Я проверил)\nOK: Эмпатия (Понимаю, как это расстраивает)\nOK: Короткие предложения, активные глаголы\nOK: Всегда Next Step в конце диалога" },
      { h: "Tone of Voice - нельзя", c: "НЕТ: Грубость, сарказм, переход на личности\nНЕТ: Канцелярит\nНЕТ: Обезличенное Мы\nНЕТ: Игнорирование эмоций\nНЕТ: CAPS LOCK\nНЕТ: Ложные обещания о сроках" },
      { h: "Критерии ОКК (1-5)", c: "1. Понимание запроса\n2. Точность решения\n3. Коммуникация\n4. Проактивность (Next Step)\n5. Влияние на клиента" },
    ]
  },
  {
    id: "scripts", title: "Скрипты", icon: "chat", role: "Все", color: "#67E8F9",
    sections: [
      { h: "Не хочет подаваться через хаб", c: "[Имя], привет! Твои показатели - очень крутой результат!\n\nНо есть важный момент: подключаем аутричера для дожимов. Для этого нужно, чтобы поток шел через Хаб.\n\nДавай компромисс: 50% горячих позиций через Хаб, остальное в LinkedIn. Как тебе?" },
      { h: "Клиент вышел из игнора", c: "[Имя], привет! Мы переживали - долго не могли достучаться.\n\nРаботу поставили на паузу только чтобы ресурс не улетал в пустоту без фидбека.\n\nСупер, что снова с нами! Готова возвращаться? Получится до конца недели скорректировать резюме?" },
      { h: "Хочет возврат - нашел работу", c: "[Имя], привет!\n\nПредлагаю не расторгать договор сейчас, а взять паузу которая входит в тариф.\n\nЗаморозим программу на пару недель, а потом вернемся к обсуждению. Что скажешь?" },
      { h: "Передача на Success Fee", c: "[Имя], спасибо что поделился новостями! Рады за тебя, поздравляем - ты молодец!\n\nПередам твои контакты координатору из отдела заботы, он свяжется в ближайшее время.\n\nЖелаем дальнейших успехов! На связи." },
      { h: "Завершение без оффера", c: "[Имя], привет!\n\nНаша программа подошла к концу. Было очень ценно пройти этот путь вместе.\n\nДаже если заветный оффер еще впереди - посмотри какой фундамент мы заложили. Ты стал сильнее как кандидат!" },
      { h: "Технический сбой", c: "[Имя], возникла техническая особенность на платформе. Уже передала информацию в IT-отдел, коллеги занимаются решением.\n\nКак только восстановим - сразу сообщу. Спасибо за терпение!" },
    ]
  },
  {
    id: "returns", title: "Политика возвратов", icon: "refresh", role: "Куратор", color: "#FB923C",
    sections: [
      { h: "Основные принципы", c: "1. Договор - наша опора\n2. Goodwill - только наша инициатива\n3. Документация обязательна\n4. Никаких чарджбэков без медиации\n5. Никакого давления и агрессии" },
      { h: "Шаги при запросе", c: "1. Зафиксировать письменно -> support@go-offer.us\n2. Подтвердить получение за 48 часов\n3. Собрать досье\n4. Breakdown: Eligible = Paid - 1600 USD - стоимость услуг\n5. Все фиксировать в CRM" },
      { h: "Уровни эскалации", c: "1. Менеджер - goodwill до 300 USD\n2. Head of Support - до 1000 USD\n3. Legal - чарджбэки, угрозы\n4. Founder - прецедентные кейсы\n\nПри угрозе чарджбэка -> Legal в течение 4 часов." },
      { h: "Запрещено говорить", c: "НЕТ: Гарантируем работу или оффер\nНЕТ: Это мы виноваты\nНЕТ: Уберите отзыв - добавим денег\nНЕТ: Называть суммы устно\nНЕТ: Наш юрист сказал" },
    ]
  },
  {
    id: "upsell", title: "Upsell", icon: "chart", role: "Куратор", color: "#34D399",
    sections: [
      { h: "Базовые правила", c: "Апсейл - проявление заботы, не втюхивание.\n\n1. Диагностика вместо продажи: сначала боль, потом решение\n2. Связка с результатом: продаем время и оффер\n3. Накапливаемый эффект: не все сразу" },
      { h: "Когда предлагать", c: "После стратсессии -> агрейд или отдельные пакеты\n\nЭтап резюме -> сессия с ментором, доп. редактура\n\nАвтоматизация -> ассистенты, Long Bot\n\nСобесы -> доп. ассистенты, моки" },
    ]
  },
  {
    id: "it", title: "IT Tickets", icon: "tool", role: "Все", color: "#FBBF24",
    sections: [
      { h: "Как создать тикет", c: "1. Linear.app\n2. Корпоративная почта ...@go-offer.us\n3. Описание проблемы (обязательно)\n4. Название тикета\n5. Приоритет и дедлайн" },
      { h: "Скрипт при тех. сбое", c: "Нельзя: программисты опять все сломали\n\nСкрипт:\n[Имя], возникла техническая особенность на платформе. Уже передала информацию в IT-отдел, коллеги занимаются. Сообщу как только восстановим." },
    ]
  },
];

const ICON_MAP = {
  target: "O", doc: "#", chat: "...", refresh: "R", chart: "^", tool: "T", rocket: ">>", flower: "*", star: "x", leaf: "~", sparkle: "+",
};

function AstroSVG({ color, size }) {
  const s = size || 100;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill={color} opacity="0.05"/>
      <ellipse cx="50" cy="65" rx="18" ry="22" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <circle cx="50" cy="38" r="18" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <ellipse cx="50" cy="38" rx="11" ry="10" fill={color} opacity="0.2"/>
      <ellipse cx="45" cy="34" rx="3" ry="2.5" fill="white" opacity="0.15"/>
      <path d="M32 58 Q22 63 21 72 Q21 77 27 77 Q31 77 32 72 L34 63" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <path d="M68 58 Q78 63 79 72 Q79 77 73 77 Q69 77 68 72 L66 63" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <circle cx="24" cy="78" r="4" fill={color} opacity="0.5"/>
      <circle cx="76" cy="78" r="4" fill={color} opacity="0.5"/>
      <path d="M41 86 L38 97 Q38 100 42 100 Q45 100 46 97 L47 87" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <path d="M59 86 L62 97 Q62 100 58 100 Q55 100 54 97 L53 87" fill="#1a1535" stroke={color} strokeWidth="1.5"/>
      <rect x="58" y="54" width="7" height="11" rx="2" fill={color} opacity="0.35"/>
      <circle cx="15" cy="20" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="85" cy="15" r="1" fill="white" opacity="0.4"/>
      <circle cx="10" cy="50" r="1" fill={color} opacity="0.7"/>
      <circle cx="90" cy="45" r="1.5" fill={color} opacity="0.5"/>
    </svg>
  );
}

function FloatingAstro({ color, size, style }) {
  const [y, setY] = useState(0);
  const frameRef = useRef();
  const startRef = useRef();
  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      setY(Math.sin((ts - startRef.current) / 1800) * 7);
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);
  return (
    <div style={Object.assign({}, style, { transform: "translateY(" + y + "px)" })}>
      <AstroSVG color={color} size={size} />
    </div>
  );
}

const G = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" };

function TariffsView() {
  const [active, setActive] = useState("take-all");
  const tar = TARIFFS.find(function(t) { return t.id === active; });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff" }}>Тарифы</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>Выбери тариф чтобы увидеть что в него входит</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TARIFFS.map(function(t) {
          var isActive = active === t.id;
          return (
            <button key={t.id} onClick={function() { setActive(t.id); }}
              style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid " + (isActive ? t.color + "88" : "rgba(255,255,255,0.1)"), background: isActive ? t.color + "18" : "rgba(255,255,255,0.03)", color: isActive ? t.color : "rgba(255,255,255,0.5)", fontWeight: isActive ? 700 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? "0 0 16px " + t.color + "30" : "none" }}>
              {t.name}
              {t.badge ? " · " + t.badge : ""}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14, alignItems: "start" }}>
        <div style={Object.assign({}, G, { border: "1px solid " + tar.color + "44", borderRadius: 14, padding: "22px", position: "relative", overflow: "hidden" })}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + tar.color + "," + tar.color + "44)", boxShadow: "0 0 14px " + tar.color }} />
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <FloatingAstro color={tar.color} size={90} />
          </div>
          {tar.badge ? <div style={{ fontSize: 10, fontWeight: 700, color: tar.color, background: tar.color + "18", border: "1px solid " + tar.color + "33", padding: "3px 9px", borderRadius: 20, display: "inline-block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{tar.badge}</div> : null}
          <div style={{ fontSize: 26, fontWeight: 900, color: tar.color, letterSpacing: "-1px", lineHeight: 1 }}>{tar.price}</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginTop: 7, marginBottom: 4 }}>{tar.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{tar.fee} с оффера - {tar.duration}</div>
          {tar.rows.filter(function(r) { return r.hot; }).length > 0 ? (
            <div style={{ marginTop: 16, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ключевые плюсы</div>
              {tar.rows.filter(function(r) { return r.hot; }).map(function(r, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: tar.color, flexShrink: 0, marginTop: 5, boxShadow: "0 0 5px " + tar.color }} />
                    <div style={{ fontSize: 11, color: tar.color, fontWeight: 500, lineHeight: 1.4 }}>{r.label}: {r.value}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={Object.assign({}, G, { border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" })}>
          <div style={{ padding: "13px 17px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Что входит в {tar.name}</div>
          </div>
          {tar.rows.map(function(r, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 17px", borderBottom: i < tar.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: r.hot ? 700 : 400, color: r.dim ? "rgba(255,255,255,0.2)" : r.hot ? tar.color : "rgba(255,255,255,0.8)" }}>{r.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {TARIFFS.map(function(t) {
            var isA = active === t.id;
            return (
              <div key={t.id} onClick={function() { setActive(t.id); }} style={{ padding: "13px 10px", textAlign: "center", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.05)", background: isA ? t.color + "10" : "transparent", transition: "all 0.15s" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.color, marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: isA ? t.color : "#fff" }}>{t.price}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{t.fee} - {t.duration}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KnowledgeView({ search }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [expanded, setExpanded] = useState({});

  var filtered = DOCS.filter(function(doc) {
    return search === "" || doc.title.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
      doc.sections.some(function(s) { return s.h.toLowerCase().indexOf(search.toLowerCase()) >= 0 || s.c.toLowerCase().indexOf(search.toLowerCase()) >= 0; });
  });

  function toggle(key) { setExpanded(function(p) { var n = Object.assign({}, p); n[key] = !p[key]; return n; }); }

  if (activeDoc) {
    var doc = DOCS.find(function(d) { return d.id === activeDoc; });
    if (!doc) { setActiveDoc(null); return null; }
    return (
      <div style={{ maxWidth: 780 }}>
        <button onClick={function() { setActiveDoc(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: "5px 0" }}>
          &larr; Назад
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, background: doc.color + "18", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid " + doc.color + "33" }}>
            {doc.id === "curator-guide" ? "🎯" : doc.id === "regulations" ? "📋" : doc.id === "scripts" ? "💬" : doc.id === "returns" ? "🔄" : doc.id === "upsell" ? "📈" : "🔧"}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{doc.sections.length} разделов - {doc.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {doc.sections.map(function(s, i) {
            var key = doc.id + i;
            var open = expanded[key] !== false;
            return (
              <div key={i} style={Object.assign({}, G, { border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" })}>
                <button onClick={function() { toggle(key); }} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 17px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  <span>{s.h}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{open ? "v" : ">"}</span>
                </button>
                {open ? <div style={{ padding: "0 17px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13.5, lineHeight: 1.75, whiteSpace: "pre-wrap", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>{s.c}</div> : null}
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
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff" }}>База знаний</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>{filtered.length} документов</p>
      </div>
      <div style={{ position: "relative" }}>
        <FloatingAstro color="#67E8F9" size={80} style={{ position: "absolute", top: -20, right: 0, opacity: 0.5, zIndex: 0, pointerEvents: "none" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, position: "relative", zIndex: 1 }}>
          {filtered.map(function(doc) {
            var icons = { "curator-guide": "🎯", "regulations": "📋", "scripts": "💬", "returns": "🔄", "upsell": "📈", "it": "🔧" };
            return (
              <div key={doc.id} onClick={function() { setActiveDoc(doc.id); }}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + doc.color + "30", borderRadius: 13, padding: "20px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = doc.color + "66"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px " + doc.color + "20"; }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = doc.color + "30"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + doc.color + "," + doc.color + "33)" }} />
                <div style={{ width: 38, height: 38, background: doc.color + "15", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>{icons[doc.id]}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{doc.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 12 }}>{doc.sections[0].h}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: doc.color, background: doc.color + "15", padding: "2px 8px", borderRadius: 20 }}>{doc.role}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{doc.sections.length} разд.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AIView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! Я AI-помощник куратора Go Offer.\n\nМогу написать готовое сообщение для менти:\n- Онбординг нового менти\n- Клиент не отвечает\n- Жалоба на качество\n- Хочет возврат\n- Завершение программы\n\nОпиши ситуацию - напишу текст который можно скопировать." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(function() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  var QUICK = [
    "Напиши приветствие для нового менти",
    "Клиент не отвечает 4 дня",
    "Менти вышел из игнора",
    "Завершение с оффером",
    "Клиент жалуется на резюме",
  ];

  function send(text) {
    var msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    var newMsgs = messages.concat([{ role: "user", content: msg }]);
    setMessages(newMsgs);
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMsgs.map(function(m) { return { role: m.role, content: m.content }; }) })
    }).then(function(r) { return r.json(); }).then(function(data) {
      var text2 = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : "Ошибка.";
      setMessages(function(p) { return p.concat([{ role: "assistant", content: text2 }]); });
      setLoading(false);
    }).catch(function() {
      setMessages(function(p) { return p.concat([{ role: "assistant", content: "Ошибка соединения. Попробуй еще раз." }]); });
      setLoading(false);
    });
  }

  function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(""); } }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 820 }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff" }}>AI-помощник</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>Генерирует готовые тексты для менти в ToV Go Offer</p>
      </div>

      {messages.length <= 1 ? (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
          {QUICK.map(function(q, i) {
            return (
              <button key={i} onClick={function() { send(q); }}
                style={{ padding: "7px 13px", borderRadius: 20, border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)", color: "#A78BFA", fontSize: 12, cursor: "pointer" }}>
                {q}
              </button>
            );
          })}
        </div>
      ) : null}

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        {messages.map(function(m, i) {
          return (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 9 }}>
              {m.role === "assistant" ? <div style={{ flexShrink: 0 }}><AstroSVG color="#A78BFA" size={28} /></div> : null}
              <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13.5, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9 }}>
            <div style={{ flexShrink: 0 }}><AstroSVG color="#A78BFA" size={28} /></div>
            <div style={{ display: "flex", gap: 5, padding: "12px 15px", background: "rgba(255,255,255,0.05)", borderRadius: "14px 14px 14px 4px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", animation: "dot1 1.2s ease-in-out 0s infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", animation: "dot1 1.2s ease-in-out 0.2s infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", animation: "dot1 1.2s ease-in-out 0.4s infinite" }} />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 9, alignItems: "flex-end", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 13, padding: "10px 12px" }}>
        <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={onKey}
          placeholder="Опиши ситуацию или попроси написать сообщение..."
          rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
        <button onClick={function() { send(""); }} disabled={!input.trim() || loading}
          style={{ width: 36, height: 36, background: input.trim() ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 9, color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: input.trim() ? "pointer" : "default" }}>
          &uarr;
        </button>
      </div>
    </div>
  );
}

export default function App() {
  var [sidebar, setSidebar] = useState(true);
  var [activeNav, setActiveNav] = useState("tariffs");
  var [search, setSearch] = useState("");
  var [notif, setNotif] = useState(false);
  var [userMenu, setUserMenu] = useState(false);
  var SW = sidebar ? 210 : 60;
  var labels = { tariffs: "Тарифы", knowledge: "База знаний", ai: "AI-помощник" };
  var NAV = [{ id: "tariffs", label: "Тарифы", icon: "💎" }, { id: "knowledge", label: "База знаний", icon: "📚" }, { id: "ai", label: "AI-помощник", icon: "✨" }];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080516", fontFamily: "Inter,-apple-system,sans-serif", overflow: "hidden", position: "relative" }}>
      <style dangerouslySetInnerHTML={{__html: "* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 99px; } input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); } button { font-family: inherit; cursor: pointer; } @keyframes dot1 { 0%,80%,100%{opacity:.3} 40%{opacity:1} }"}} />

      <div style={{ position: "fixed", top: -150, left: -150, width: 500, height: 500, background: "radial-gradient(circle,rgba(167,139,250,0.1),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -100, width: 450, height: 450, background: "radial-gradient(circle,rgba(244,114,182,0.07),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49].map(function(i) {
        return <div key={i} style={{ position: "fixed", left: ((i*37+13)%100) + "%", top: ((i*53+7)%100) + "%", width: (i%3)+1, height: (i%3)+1, background: i%5===0 ? "#A78BFA" : "#fff", borderRadius: "50%", opacity: 0.1+(i%5)*0.05, pointerEvents: "none", zIndex: 0 }} />;
      })}

      <aside style={{ width: SW, flexShrink: 0, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.22s ease", overflow: "hidden", zIndex: 10, position: "relative" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: sidebar ? "0 13px" : "0 10px", justifyContent: sidebar ? "space-between" : "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {sidebar ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#A78BFA,#F472B6)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 12px rgba(167,139,250,0.5)" }}>🍍</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>Go Offer</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.7px" }}>База знаний</div>
              </div>
            </div>
          ) : null}
          <button onClick={function() { setSidebar(function(p) { return !p; }); }} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0 }}>
            {sidebar ? "«" : "»"}
          </button>
        </div>

        {sidebar ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
            <FloatingAstro color="#A78BFA" size={80} />
          </div>
        ) : null}

        <nav style={{ flex: 1, padding: "6px 5px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(function(item) {
            var active = activeNav === item.id;
            return (
              <button key={item.id} onClick={function() { setActiveNav(item.id); }} title={sidebar ? "" : item.label}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: sidebar ? "8px 10px" : "9px", justifyContent: sidebar ? "flex-start" : "center", borderRadius: 8, border: active ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent", background: active ? "rgba(167,139,250,0.12)" : "transparent", color: active ? "#A78BFA" : "rgba(255,255,255,0.35)", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all 0.13s", width: "100%" }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {sidebar ? <span style={{ flex: 1 }}>{item.label}</span> : null}
                {active && sidebar ? <div style={{ width: 4, height: 4, background: "#A78BFA", borderRadius: "50%" }} /> : null}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "8px 5px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: sidebar ? "7px 10px" : "7px", justifyContent: sidebar ? "flex-start" : "center", borderRadius: 8, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 25, height: 25, borderRadius: "50%", background: "linear-gradient(135deg,#A78BFA,#F472B6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>И</div>
            {sidebar ? <div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Ирина Р.</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Куратор</div></div> : null}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative", zIndex: 1 }}>
        <header style={{ height: 60, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Главная</span>
            <span style={{ color: "rgba(255,255,255,0.13)" }}>/</span>
            <span style={{ color: "#A78BFA", fontWeight: 600 }}>{labels[activeNav]}</span>
          </div>
          {activeNav === "knowledge" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 11px", width: 200, border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>🔍</span>
              <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Поиск..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#fff", width: "100%" }} />
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 6, position: "relative" }}>
            <button onClick={function() { setNotif(function(p) { return !p; }); setUserMenu(false); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, position: "relative" }}>
              🔔<div style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, background: "#F472B6", borderRadius: "50%", border: "1.5px solid #080516" }} />
            </button>
            {notif ? (
              <div style={{ position: "absolute", top: 40, right: 40, width: 230, background: "rgba(10,5,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 11, zIndex: 100, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 8 }}>Уведомления</div>
                <div style={{ padding: "7px 5px", fontSize: 12, color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Новый документ в базе знаний</div>
                <div style={{ padding: "7px 5px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Напоминание: заполни отчет</div>
              </div>
            ) : null}
            <button onClick={function() { setUserMenu(function(p) { return !p; }); setNotif(false); }} style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#A78BFA,#F472B6)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12 }}>И</button>
            {userMenu ? (
              <div style={{ position: "absolute", top: 40, right: 0, width: 155, background: "rgba(10,5,28,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 11, zIndex: 100, padding: 6 }}>
                <div style={{ padding: "7px 9px", borderRadius: 7, fontSize: 13, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>Профиль</div>
                <div style={{ padding: "7px 9px", borderRadius: 7, fontSize: 13, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>Настройки</div>
                <div style={{ padding: "7px 9px", borderRadius: 7, fontSize: 13, color: "#F472B6", cursor: "pointer" }}>Выйти</div>
              </div>
            ) : null}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "20px" }} onClick={function() { setNotif(false); setUserMenu(false); }}>
          {activeNav === "tariffs" ? <TariffsView /> : null}
          {activeNav === "knowledge" ? <KnowledgeView search={search} /> : null}
          {activeNav === "ai" ? <AIView /> : null}
        </main>
      </div>
    </div>
  );
}
