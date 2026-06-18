import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Ты — официальный AI-помощник для кураторов платформы Go Offer.
Твоя цель — помогать кураторам быстро находить ответы в регламенте и генерировать готовые сообщения для менти строго в соответствии с Tone of Voice (ToV) компании.

ПРАВИЛА TONE OF VOICE (ToV) GO OFFER:
1. Всегда обращайся к менти по имени. В готовых сообщениях пиши [Имя] там, где нужно вставить имя.
2. Общайся поддерживающе, грамотно, человечно. Используй Я-позицию: «Я уточню», «Я проверил», «Я передам». Избегай роботизированных ответов и канцелярита.
3. Каждый диалог с менти ОБЯЗАТЕЛЬНО заканчивай конкретным Next Step — клиент должен чётко понимать, что делать дальше.
4. При работе с негативом строго соблюдай схему: Присоединение → Решение → Поддержка/закрывающий вопрос. Никаких оправданий и защиты системы.

КОГДА КУРАТОР ПРОСИТ НАПИСАТЬ СООБЩЕНИЕ ДЛЯ МЕНТИ:
— Выдавай ГОТОВЫЙ текст сообщения, который можно скопировать и отправить.
— Оформляй его в блоке, чётко отделённом от пояснений.
— Если не хватает контекста (имя, ситуация) — запроси его перед тем, как писать.

ДОКУМЕНТЫ:

РЕГЛАМЕНТ: График ПН–ПТ 16:00–01:00 МСК (09:00–18:00 EST). Ответ макс. 2 часа, среднее 8 минут. Ночной бэклог — первые 2 часа смены. Полное закрытие: не более 3 дней. ОКК оценивает по 5 критериям (1–5): понимание запроса, точность решения, коммуникация, проактивность, влияние на клиента. LinkedIn: ассистентам ЗАПРЕЩЕНО давать прямые доступы к LinkedIn менти.

ГАЙД КУРАТОРА:
ШАГ 1 — Онбординг/Стратсессия (7 дней): проверить доступы (Notion, AXL, Hub, Umniko, Streamlit, Kommo, Telegram). Чеклист: личный кабинет, Hub, почта+бот, доступ к курсу, стартовое сообщение. Отправить менти: платформу mentor.go-offer.us, рабочую тетрадь, запись на стратсессию. Контролировать модули 0 и 1 в AXL.
ШАГ 2 — Резюме (10 дней): впечатления после стратсессии, анкета для резюме, резюме готовится 3 рабочих дня, комментарии от менти 2 рабочих дня. Финал: все комментарии отвечены, наша почта и номер в резюме.
ШАГ 3 — Автоматизация (10 дней): Final Resume, Applicant Profile Form в хабе, парсинг через Диму, боты, ассистент.
ШАГ 4 — LinkedIn (10 дней): авто-аппликатор к рабочей почте и телефону, аутричер, LinkedHelper, фоллуапер.
ШАГ 5 — Собесы: пушить модули, self-pitch, моки, чекапы. При оффере: фиксировать в таблице (имя, дата, компания, тайтл, дата выхода, сумма).

ПРОТОКОЛЫ: Игнор 4 раб. дня → нарушение (макс. 3), письмо на 5й день, стоп подач. Игнор 14+ дней → закрытие программы (§5.2): письмо + 7 дней + закрытие. Пауза: freeze form, Kate Milk / Катя Молочник. Оффер: фиксировать в таблице.

СКРИПТЫ: PDF резюме — стандарт США, ATS, защита данных. Не хочет хаб — компромисс 50/50, аутрич и дожимы. Не моя локация — убираем адрес, близкий к офису, конверсия 1%. Американизация — не обязательно, обсуждаем. Вышел из игнора — тёплое приветствие, пауза ради ресурса. Возврат при работе — предложить заморозку 2 недели. Success Fee — передать координатору отдела заботы.

UPSELL: После стратсессии → агрейд/пакеты. Резюме → сессия с ментором, доп. редактура. Автоматизация → ассистенты, Long Bot. Собесы → доп. ассистенты, моки.

ВОЗВРАТЫ (для куратора — первичная реакция): зафиксировать письменно → CRM карточка Refund Request. НЕ обещать суммы устно. НЕ говорить «это мы виноваты». Эскалировать: Head of Support → Legal → Founder. При угрозе чарджбэка/суда — Legal в течение 4 рабочих часов.

Язык: русский. Тон: профессиональный, дружелюбный, как опытный коллега. Если вопрос вне документов — честно скажи об этом.`;

const TRAINER_STEPS = [
  {
    id: "s1", step: "Шаг 1", title: "Онбординг — Стратсессия", duration: "7 дней", icon: "🚀", color: "#7C5CFC",
    intro: "Клиент только что оплатил тариф и попал в чат. Твоя задача — встретить его тепло и запустить процесс.",
    tasks: [
      { id: "t1", text: "Проверить карточку клиента в Notion → «All mentees»", hint: "Там тариф, закреплённый ментор и ссылка на рабочую тетрадь" },
      { id: "t2", text: "Убедиться, что созданы: личный кабинет, Hub, почта+бот, доступ к курсу", hint: "Чеклист доступов в Гайде, Шаг 1" },
      { id: "t3", text: "Отправить стартовое сообщение менти с задачами и дедлайнами", hint: "Шаблон: модуль 0 → рабочая тетрадь → запись на стратсессию" },
      { id: "t4", text: "Прислать ссылку на обучающую платформу mentor.go-offer.us", hint: "" },
      { id: "t5", text: "Прислать индивидуальную ссылку на рабочую тетрадь (из Notion клиента)", hint: "Раздел Strategy в личном кабинете" },
      { id: "t6", text: "Прислать ссылку для записи на стратсессию с ментором", hint: "Ссылки в зависимости от закреплённого ментора" },
      { id: "t7", text: "Проверить прохождение модулей 0 и 1 в AXL до стратсессии", hint: "AXL → CRM → Контакты → Имя менти → Обучение" },
    ],
    quiz: { question: "Клиент написал в 23:45 с вопросом по платформе. Когда ты должен ответить?", options: ["Сразу, в ту же ночь", "В первые 2 часа следующей смены (до 18:00 МСК)", "В течение 8 минут — это стандарт", "Не позднее 24 часов"], correct: 1, explanation: "Правило «Офлайн-режима»: ночной бэклог разбирается в начале следующей смены. Стандарт 8 минут — для рабочего времени (16:00–01:00 МСК)." }
  },
  {
    id: "s2", step: "Шаг 2", title: "Упаковка — Резюме", duration: "10 дней", icon: "📄", color: "#06B6D4",
    intro: "Стратсессия прошла. Теперь нужно запустить создание резюме и держать процесс под контролем.",
    tasks: [
      { id: "t1", text: "Спросить впечатления после стратсессии", hint: "Важно поддержать энергию клиента в начале пути" },
      { id: "t2", text: "Дождаться фидбека от ментора, проверить чеклист для резюме в карточке", hint: "" },
      { id: "t3", text: "Отправить менти ссылку на анкету для создания резюме", hint: "" },
      { id: "t4", text: "Передать ментору ссылку на карточку резюме по чеклисту (доска прожарки)", hint: "В течение рабочего дня" },
      { id: "t5", text: "Проверить прохождение модулей 2–4 в AXL", hint: "" },
      { id: "t6", text: "Дождаться готового резюме (3 рабочих дня), взять ссылку из поля «Result»", hint: "" },
      { id: "t7", text: "Попросить менти оставить комментарии в течение 2 рабочих дней", hint: "" },
      { id: "t8", text: "Проверить финальную версию: все комментарии отвечены, наша почта и номер в резюме", hint: "" },
    ],
    quiz: { question: "Менти прислал: «Мне всё не нравится, переделайте». Что делаешь?", options: ["Переделываешь — клиент всегда прав", "Запрашиваешь подробный фидбэк по конкретным пунктам", "Эскалируешь Head of Support", "Объясняешь, что резюме уже принято"], correct: 1, explanation: "При неконструктивных комментариях — запросить подробный фидбэк. Только после получения адекватных комментариев переносим в «Комментарии от менти» для ментора." }
  },
  {
    id: "s3", step: "Шаг 3", title: "Автоматизация и подачи", duration: "10 дней", icon: "🤖", color: "#10B981",
    intro: "Резюме готово. Пора запустить машину — боты, ассистент, парсинг вакансий.",
    tasks: [
      { id: "t1", text: "Убедиться, что резюме прикреплено как «Final Resume» в кабинете", hint: "Наша почта и рабочий номер в контактах" },
      { id: "t2", text: "Попросить заполнить Applicant Profile Form в хабе", hint: "hub.go-offer.us/applicant-profile-form" },
      { id: "t3", text: "Настроить парсинг через Диму (после получения резюме и APF)", hint: "" },
      { id: "t4", text: "Проверить, что публикация статистики в Telegram включена (Андрей)", hint: "" },
      { id: "t5", text: "Убедиться, что боты запущены и статистика получена", hint: "" },
      { id: "t6", text: "Подобрать ассистента в чате «Назначения ассов | GO OFFER»", hint: "Задачу создаём сразу, на 2 недели вперёд" },
      { id: "t7", text: "Прислать ссылку для скриншотов LinkedIn (из раздела LinkedIn Statistics)", hint: "" },
    ],
    quiz: { question: "Менти говорит: «В хабе куча нерелевантных вакансий». Что делаешь?", options: ["Это норма, всё нормально", "Эскалируешь в чат «Проблемы», тегаешь ответственного за парсинг", "Просишь менти самостоятельно удалять нерелевантные", "Переключаешь с Easy Bot на Long Bot"], correct: 1, explanation: "Если нерелевантных вакансий сильно много — это НЕ норма. Эскалируй в чат «Проблемы», тегай ответственного за парсинг и проси откорректировать под требования клиента." }
  },
  {
    id: "s4", step: "Шаг 4", title: "Настройка LinkedIn", duration: "10 дней", icon: "🔗", color: "#F59E0B",
    intro: "Подачи идут. Теперь настраиваем аутрич — прямые сообщения рекрутерам и компаниям.",
    tasks: [
      { id: "t1", text: "Убедиться, что авто-аппликатор привязан к рабочей почте и телефону", hint: "Все предыдущие резюме удалены с профиля LinkedIn" },
      { id: "t2", text: "Подобрать аутричера в чате «Рассылки Хелпер | GO OFFER»", hint: "" },
      { id: "t3", text: "Согласовать текст для аутрича через LinkedHelper", hint: "" },
      { id: "t4", text: "Проверить запуск аутрича через LinkedHelper", hint: "" },
      { id: "t5", text: "Запустить фоллуапера", hint: "" },
    ],
    quiz: { question: "Ассистент просит прямой доступ к LinkedIn менти, чтобы быстрее откликаться. Что ответишь?", options: ["Разрешаешь — так эффективнее", "Разрешаешь только опытным ассистентам", "Категорически отказываешь — риск блокировки аккаунта", "Спрашиваешь разрешения у ментора"], correct: 2, explanation: "Категорически ЗАПРЕЩЕНО давать ассистентам прямые доступы к LinkedIn менти — это риск блокировки аккаунта." }
  },
  {
    id: "s5", step: "Шаг 5", title: "Собесы и финиш", duration: "До оффера", icon: "🏆", color: "#EF4444",
    intro: "Интервью пошли! Твоя задача — поддерживать энергию менти и вести к офферу.",
    tasks: [
      { id: "t1", text: "Проверить и пушить прохождение оставшихся модулей обучения", hint: "" },
      { id: "t2", text: "Убедиться, что менти написал self-pitch", hint: "" },
      { id: "t3", text: "Пушить прохождение моков и чекапов", hint: "" },
      { id: "t4", text: "Отправлять интервью на «прожарки» с менторами", hint: "" },
      { id: "t5", text: "При получении оффера: зафиксировать в таблице (имя, дата, компания, тайтл, дата выхода, сумма)", hint: "" },
      { id: "t6", text: "Передать клиента координатору отдела заботы для Success Fee", hint: "«Я передам твои контакты нашему координатору из отдела заботы...»" },
    ],
    quiz: { question: "Клиент получил оффер из компании, где он проходил интервью ДО программы и предупредил об этом. Претендуем на Success Fee?", options: ["Да, всегда претендуем", "Нет — клиент предупредил заранее, компания была до программы", "Претендуем на половину", "Решает Founder"], correct: 1, explanation: "Мы НЕ претендуем на оффер, если менти уже проходил интервью в этой компании и предупредил Go Offer заранее. Также: летние стажировки и нетарифные пакеты." }
  }
];

const DOCS_CONTENT = {
  "regulations": {
    title: "Регламент кураторов", role: "curator", icon: "📋",
    sections: [
      { heading: "Цели и зона ответственности", content: "Главная цель: быстрое и бесстрессовое прохождение менти от онбординга до оффера.\n\nРоль куратора: проактивный продюсер клиента. 70% задержек на старте — психологические факторы.\n\nЗадача: сокращать время на размышления и инструктивно двигать по спринтам." },
      { heading: "График работы", content: "ПН–ПТ, 16:00–01:00 МСК (09:00–18:00 EST). СБ–ВС — выходные.\n\nПравило «Офлайн-режима»: после 01:00 МСК уведомления можно отключить. Ночной бэклог — в первые 2 часа следующей смены.\n\nОтпуск: уведомить руководителя за 1,5 месяца. Подготовить статус-лист по активным менти." },
      { heading: "Стандарты скорости ответа", content: "Макс. время первого ответа (рабочее время): 2 часа\nСреднее время первого ответа: 8 минут\nРазбор ночного бэклога: до 18:00 МСК\nПолное закрытие обращения: не более 3 дней\n\nПри сложных запросах — промежуточный статус клиенту каждые 24 часа." },
      { heading: "Tone of Voice — допустимо", content: "✅ Персонализация: всегда по имени\n✅ Я-позиция: «Я уточню», «Я проверил»\n✅ Эмпатия: «Понимаю, как это может расстраивать»\n✅ Ясность: короткие предложения, активные глаголы\n✅ Проактивность: всегда Next Step в конце диалога\n✅ Экспертность: обоснование с точки зрения рынка" },
      { heading: "Tone of Voice — недопустимо", content: "❌ Грубость, сарказм, переход на личности\n❌ Канцелярит: «в целях обеспечения», «в рамках взаимодействия»\n❌ Обезличенное «Мы» там, где важна личная вовлечённость\n❌ Игнорирование эмоций\n❌ CAPS LOCK и множество восклицательных знаков\n❌ Ложные обещания о сроках" },
      { heading: "Критерии ОКК (шкала 1–5)", content: "1. Понимание запроса — учёт контекста и истории\n2. Точность решения — верная и применимая информация\n3. Коммуникация — живой язык, Я-позиция\n4. Проактивность — чёткий Next Step в конце\n5. Влияние — решение с первого ответа, минимум усилий" },
    ]
  },
  "scripts": {
    title: "Скрипты", role: "all", icon: "💬",
    sections: [
      { heading: "Почему резюме в PDF?", content: "США — золотой стандарт PDF:\n1. Сохранение визуальной структуры\n2. Совместимость с ATS (Applicant Tracking Systems)\n3. Целостность данных — рекрутер не изменит случайно ничего в документе" },
      { heading: "Не хочет подаваться через хаб", content: "«Привет! Твои показатели по интервью — очень крутой результат 😊\n\nНо я к тебе с важным моментом по стратегии: на этой неделе мы подключаем аутричера для дожимов по вакансиям. Для этого нам критически важно, чтобы основной поток подач шёл через Хаб — иначе мы не сможем «подхватить» эти вакансии.\n\nДавай попробуем компромисс: 50% горячих позиций через Хаб, остальное в LinkedIn как тебе удобно. Так и скорость сохраним, и мощности задействуем на 100%.\n\nКак тебе такой план?»" },
      { heading: "Не моя локация в резюме", content: "«Отличный вопрос! Мы изучили, как рекрутеры выбирают кандидатов: они смотрят на тайтл и близость к офису. Даже для удалёнки многие тяготеют к «близким» кандидатам.\n\nПоэтому мы убираем адрес из резюме, а в заявках ставим адрес близкий к офису компании. Тестировали весь февраль — конверсия стабильно 1%, это результат.\n\nТебя что-то беспокоит?»" },
      { heading: "Не нравится «американизация»", content: "«Конечно, ты вправе не соглашаться! Мы ни в коем случае не заставляем — можем оставить все названия компаний как есть.\n\n«Американизация» — это один из методов борьбы с предвзятостью некоторых рекрутеров, но он подходит не всем. Именно поэтому мы всегда обсуждаем заранее.\n\nКак поступим?»" },
      { heading: "Клиент вышел из игнора", content: "«Привет! Мы тебя совсем потеряли и начали переживать — долго не могли достучаться.\n\nМы поставили работу на паузу только для того, чтобы твой ресурс и оплаченные подачи не улетали в пустоту без твоего фидбека.\n\nСупер, что ты снова с нами! Готова возвращаться в рабочий ритм? Получится до конца недели скорректировать резюме?»" },
      { heading: "Хочет возврат — нашёл работу", content: "«[Имя], привет!\n\nЯ бы предложила не расторгать договор сейчас, а взять паузу, которая входит в тариф, и посмотреть, как будет развиваться ситуация.\n\nНапример, заморозим программу на пару недель, а потом вернёмся к обсуждению. Что скажешь?»" },
      { heading: "Передача на Success Fee", content: "«Привет! Спасибо большое, что поделился новостями. Рады за тебя, поздравляем — ты красавчик и молодец! 💪\n\nЯ передам твои контакты нашему координатору из отдела заботы, он свяжется с тобой в ближайшее время, чтобы обсудить детали по выплате Success Fee.\n\nЖелаем дальнейших успехов! На связи.»" },
      { heading: "Протокол при негативе", content: "Алгоритм ответа:\n1. Присоединение — дать понять, что услышали: «[Имя], понимаю, что отсутствие приглашений после стольких подач вызывает раздражение»\n2. Решение — что сделано, что делается, кто отвечает\n3. Поддержка или закрывающий вопрос\n\n❌ Не оправдываться, не защищать систему\n❌ Если переходит на личности — передаём в ОКК" },
    ]
  },
  "returns-policy": {
    title: "Политика возвратов", role: "curator", icon: "🔄",
    sections: [
      { heading: "Основные принципы", content: "1. Договор — наша опора: каждое решение опирается на конкретные пункты\n2. Goodwill — только наша инициатива, не уступка под давлением\n3. Документация обязательна: каждый шаг в CRM, каждое решение письменно\n4. Никаких чарджбэков без медиации (§9.2(c))\n5. NJ Consumer Fraud Act: никаких обещаний результата, давления или агрессии" },
      { heading: "Шаги при запросе на возврат", content: "1. Зафиксировать письменно → email на support@go-offer.us\n2. В течение 48 рабочих часов подтвердить получение\n3. Собрать досье: модули, мокс, воркшопы, история, Infractions\n4. Breakdown: Eligible Refund = Paid − $1,600 − стоимость использованных услуг\n5. Всё фиксировать в CRM с датами, суммами, ссылками на пункты Договора" },
      { heading: "Уровни эскалации", content: "1. Менеджер — goodwill до $300\n2. Head of Support — до $1,000 или до 30% Final Contract Price\n3. Legal — чарджбэки, угрозы, pre-litigation, settlement agreements\n4. Founder — прецедентные кейсы" },
      { heading: "Гигиена коммуникации — запрещено", content: "❌ «Гарантируем работу / оффер / placement»\n❌ «Это мы виноваты», «команда плохо отработала» — admission of liability\n❌ «Уберите отзыв — добавим денег» / «Отзовите чарджбэк — вернём всё»\n❌ Называть суммы устно до внутреннего согласования\n❌ «Наш юрист сказал», «Founder решил»" },
    ]
  },
  "upsell": {
    title: "Upsell", role: "curator", icon: "📈",
    sections: [
      { heading: "Базовые правила", content: "Апсейл — проявление заботы, не «втюхивание».\n\n1. Диагностика вместо продажи: сначала «боль», потом решение\n2. Связка с результатом: продаём сэкономленное время и оффер\n3. Накапливаемый эффект: не нужно продавать всё сразу" },
      { heading: "Когда предлагать", content: "После стратсессии → агрейд тарифа или отдельные пакеты\nЭтап резюме → индивидуальная сессия с ментором, доп. раунд редактуры\nЭтап автоматизации → ассистенты, Long Bot\nЭтап собесов → доп. ассистенты, моки" },
    ]
  },
  "it-tickets": {
    title: "IT Tickets", role: "all", icon: "🔧",
    sections: [
      { heading: "Создание тикета", content: "1. Перейти на форму создания тикета в Linear.app\n2. Авторизоваться через корпоративную почту ...@go-offer.us\n3. Заполнить: Описание проблемы* (обязательно)\n4. Дать название тикету\n5. Поставить приоритет и дедлайн при необходимости" },
      { heading: "Скрипт при тех. сбое с менти", content: "❌ Запрещено: «программисты опять всё сломали»\n\n✅ Скрипт:\n«[Имя], возникла техническая особенность на платформе. Я уже передал(а) информацию в IT-отдел, коллеги занимаются решением. Я сообщу вам, как только всё восстановим.»\n\nНЕ обещать исправление «в течение часа» без подтверждения от разработчиков." },
    ]
  },
};

export default function App() {
  const [view, setView] = useState("home");
  const [activeDoc, setActiveDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Привет! Я AI-помощник для кураторов Go Offer 👋\n\nМогу:\n• Написать готовое сообщение для менти\n• Объяснить любой процесс из регламента\n• Напомнить нужный скрипт\n\nПросто опиши ситуацию — и я помогу." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [trainerStep, setTrainerStep] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [quizState, setQuizState] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-allow-browser": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await resp.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Ошибка." }]);
    } catch { setChatMessages(prev => [...prev, { role: "assistant", content: "Ошибка соединения. Попробуй ещё раз." }]); }
    setChatLoading(false);
  };

  const handleChatKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const currentStep = TRAINER_STEPS[trainerStep];
  const stepKey = currentStep?.id;
  const stepTasks = completedTasks[stepKey] || {};
  const allTasksDone = currentStep && Object.keys(stepTasks).length === currentStep.tasks.length;
  const stepQuiz = quizState[stepKey] || {};

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const cur = { ...prev[stepKey] };
      if (cur[taskId]) delete cur[taskId]; else cur[taskId] = true;
      return { ...prev, [stepKey]: cur };
    });
  };

  const selectQuiz = (idx) => {
    if (stepQuiz.answered) return;
    setQuizState(prev => ({ ...prev, [stepKey]: { selected: idx, answered: true } }));
  };

  const finishStep = () => {
    setCompletedSteps(prev => new Set([...prev, stepKey]));
    if (trainerStep < TRAINER_STEPS.length - 1) setTrainerStep(t => t + 1);
    else setView("trainer-done");
  };

  const toggleSection = (docId, idx) => {
    const key = `${docId}-${idx}`;
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredDocs = Object.entries(DOCS_CONTENT).filter(([, doc]) =>
    searchQuery === "" || doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.sections.some(s => s.heading.toLowerCase().includes(searchQuery.toLowerCase()) || s.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const navBtn = (active) => ({ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, background: active ? "rgba(124,92,252,0.15)" : "transparent", color: active ? "#A78BFA" : "#6B7280", transition: "all 0.15s" });
  const card = { background: "#1A1D27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 };
  const inTrainer = view === "trainer" || view === "trainer-done";
  const inLibrary = view === "library" || view === "doc";

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E9F0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header style={{ background: "rgba(19,21,31,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(124,92,252,0.2)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #7C5CFC, #A78BFA)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🍍</div>
          <div><div style={{ fontWeight: 700, fontSize: 15 }}>Go Offer</div><div style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>База знаний</div></div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          <button style={navBtn(view === "home")} onClick={() => setView("home")}>Главная</button>
          <button style={navBtn(inTrainer)} onClick={() => { setView("trainer"); setTrainerStep(0); }}>🎓 Тренажёр</button>
          <button style={navBtn(inLibrary)} onClick={() => { setView("library"); setActiveDoc(null); }}>📚 База знаний</button>
        </nav>
        {inLibrary && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#13151F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, padding: "7px 12px", width: 220 }}>
            <span style={{ color: "#6B7280", fontSize: 13 }}>🔍</span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск..." style={{ background: "none", border: "none", outline: "none", color: "#E8E9F0", fontSize: 13, width: "100%" }} />
          </div>
        )}
      </header>

      <div style={{ padding: "32px 24px", maxWidth: 1060, margin: "0 auto" }}>

        {view === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "36px 0 44px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🍍</div>
              <h1 style={{ margin: "0 0 10px", fontSize: 30, fontWeight: 800, letterSpacing: "-0.8px" }}>Go Offer — База знаний</h1>
              <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>Все регламенты, скрипты и гайды для кураторов, менторов и ассистентов</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 680, margin: "0 auto" }}>
              {[
                { icon: "🎓", title: "Тренажёр куратора", desc: "Пройди обучение по гайду пошагово с чеклистами и квизами", action: () => { setView("trainer"); setTrainerStep(0); }, color: "#7C5CFC", badge: "5 шагов" },
                { icon: "📚", title: "База знаний", desc: "Регламенты, скрипты, политика возвратов, IT Tickets", action: () => { setView("library"); setActiveDoc(null); }, color: "#06B6D4", badge: `${Object.keys(DOCS_CONTENT).length} документов` },
                { icon: "✨", title: "AI-ассистент", desc: "Попроси написать готовое сообщение для менти или задай вопрос", action: () => setChatOpen(true), color: "#10B981", badge: "Готовые тексты" },
                { icon: "💬", title: "Скрипты", desc: "Готовые ответы на все типовые возражения и ситуации", action: () => { setView("library"); setActiveDoc("scripts"); setView("doc"); }, color: "#F59E0B", badge: "Копируй и отправляй" },
              ].map((item, i) => (
                <div key={i} onClick={item.action}
                  style={{ ...card, padding: 22, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ width: 42, height: 42, background: item.color + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{item.desc}</div>
                  <span style={{ fontSize: 11, background: item.color + "22", color: item.color, padding: "3px 8px", borderRadius: 6 }}>{item.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "trainer" && (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 5px", fontSize: 21, fontWeight: 700 }}>🎓 Тренажёр куратора</h2>
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>Пройди все шаги гайда по порядку. В конце каждого — квиз.</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {TRAINER_STEPS.map((s, i) => (
                <div key={s.id} onClick={() => setTrainerStep(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 3, borderRadius: 2, background: completedSteps.has(s.id) ? s.color : i === trainerStep ? s.color + "88" : "rgba(255,255,255,0.08)", marginBottom: 5 }} />
                  <div style={{ fontSize: 10, color: completedSteps.has(s.id) ? s.color : i === trainerStep ? "#E8E9F0" : "#4B5563", fontWeight: i === trainerStep ? 600 : 400 }}>{s.step}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(135deg, ${currentStep.color}22, ${currentStep.color}08)`, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "22px 26px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, background: currentStep.color + "33", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{currentStep.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: currentStep.color, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{currentStep.step} · {currentStep.duration}</div>
                    <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{currentStep.title}</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#9CA3AF", fontSize: 14, lineHeight: 1.6 }}>{currentStep.intro}</p>
              </div>
              <div style={{ padding: "22px 26px" }}>
                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>
                  Чеклист · {Object.keys(stepTasks).length}/{currentStep.tasks.length}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {currentStep.tasks.map(task => {
                    const done = !!stepTasks[task.id];
                    return (
                      <div key={task.id} onClick={() => toggleTask(task.id)}
                        style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 13px", borderRadius: 9, background: done ? "rgba(124,92,252,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(124,92,252,0.25)" : "rgba(255,255,255,0.05)"}`, cursor: "pointer" }}>
                        <div style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${done ? currentStep.color : "rgba(255,255,255,0.2)"}`, background: done ? currentStep.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          {done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, color: done ? "#9CA3AF" : "#E8E9F0", textDecoration: done ? "line-through" : "none" }}>{task.text}</div>
                          {task.hint && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>💡 {task.hint}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {allTasksDone && (
                <div style={{ padding: "0 26px 26px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 18 }}>
                    <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 11 }}>Квиз — проверь знания</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>{currentStep.quiz.question}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {currentStep.quiz.options.map((opt, i) => {
                        const isSelected = stepQuiz.selected === i;
                        const isCorrect = i === currentStep.quiz.correct;
                        const show = stepQuiz.answered;
                        let bg = "rgba(255,255,255,0.04)", border = "1px solid rgba(255,255,255,0.07)", color = "#CBD5E1";
                        if (show && isCorrect) { bg = "rgba(16,185,129,0.12)"; border = "1px solid rgba(16,185,129,0.4)"; color = "#4ADE80"; }
                        else if (show && isSelected && !isCorrect) { bg = "rgba(239,68,68,0.1)"; border = "1px solid rgba(239,68,68,0.3)"; color = "#F87171"; }
                        return (
                          <div key={i} onClick={() => selectQuiz(i)}
                            style={{ padding: "10px 13px", borderRadius: 8, background: bg, border, color, fontSize: 13.5, cursor: show ? "default" : "pointer" }}>
                            <span style={{ color: "#4B5563", marginRight: 7 }}>{["A","B","C","D"][i]}.</span>{opt}
                          </div>
                        );
                      })}
                    </div>
                    {stepQuiz.answered && (
                      <>
                        <div style={{ marginTop: 12, padding: "11px 13px", background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 8, fontSize: 13, color: "#C4B5FD", lineHeight: 1.6 }}>
                          💡 {currentStep.quiz.explanation}
                        </div>
                        <button onClick={finishStep}
                          style={{ marginTop: 12, width: "100%", padding: "12px", background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}bb)`, border: "none", borderRadius: 9, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                          {trainerStep < TRAINER_STEPS.length - 1 ? `Перейти к Шагу ${trainerStep + 2} →` : "Завершить обучение 🏆"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "trainer-done" && (
          <div style={{ textAlign: "center", padding: "56px 0", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>🏆</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800 }}>Обучение завершено!</h2>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>Ты прошёл все 5 шагов гайда куратора и ответил на все квизы. Теперь ты готов вести менти от онбординга до оффера.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => { setView("library"); setActiveDoc(null); }} style={{ padding: "11px 22px", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 9, color: "#A78BFA", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Открыть базу знаний</button>
              <button onClick={() => { setView("trainer"); setTrainerStep(0); setCompletedTasks({}); setQuizState({}); setCompletedSteps(new Set()); }} style={{ padding: "11px 22px", background: "linear-gradient(135deg, #7C5CFC, #6D48F5)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Пройти заново</button>
            </div>
          </div>
        )}

        {view === "library" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 5px", fontSize: 21, fontWeight: 700 }}>📚 База знаний</h2>
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{filteredDocs.length} документов</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 13 }}>
              {filteredDocs.map(([id, doc]) => (
                <div key={id} onClick={() => { setActiveDoc(id); setView("doc"); }}
                  style={{ ...card, padding: 20, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,92,252,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ width: 40, height: 40, background: "rgba(124,92,252,0.12)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>{doc.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{doc.title}</div>
                  <div style={{ color: "#6B7280", fontSize: 12.5, marginBottom: 12 }}>{doc.sections[0]?.heading}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, background: doc.role === "all" ? "rgba(34,197,94,0.12)" : "rgba(124,92,252,0.12)", color: doc.role === "all" ? "#4ADE80" : "#A78BFA", padding: "3px 8px", borderRadius: 6 }}>
                      {doc.role === "all" ? "Для всех" : "Кураторам"}
                    </span>
                    <span style={{ color: "#4B5563", fontSize: 11.5 }}>{doc.sections.length} разд. →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "doc" && activeDoc && DOCS_CONTENT[activeDoc] && (
          <div style={{ maxWidth: 800 }}>
            <button onClick={() => { setView("library"); setActiveDoc(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, marginBottom: 22, padding: "5px 0" }}>
              ← Назад
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 24 }}>
              <div style={{ width: 46, height: 46, background: "rgba(124,92,252,0.15)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{DOCS_CONTENT[activeDoc].icon}</div>
              <div>
                <h1 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 700 }}>{DOCS_CONTENT[activeDoc].title}</h1>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{DOCS_CONTENT[activeDoc].sections.length} разделов</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {DOCS_CONTENT[activeDoc].sections.map((section, idx) => {
                const key = `${activeDoc}-${idx}`;
                const isOpen = expandedSections[key] !== false;
                return (
                  <div key={idx} style={{ ...card, overflow: "hidden" }}>
                    <button onClick={() => toggleSection(activeDoc, idx)}
                      style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "none", border: "none", color: "#E8E9F0", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}>
                      <span>{section.heading}</span>
                      <span style={{ color: "#4B5563", fontSize: 10, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 18px 16px", color: "#CBD5E1", fontSize: 13.5, lineHeight: 1.75, whiteSpace: "pre-wrap", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ paddingTop: 13 }}>{section.content}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
        {chatOpen && (
          <div style={{ position: "absolute", bottom: 66, right: 0, width: 385, height: 530, background: "#1A1D27", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 18, display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 31, height: 31, background: "linear-gradient(135deg, #7C5CFC, #A78BFA)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>AI-ассистент куратора</div>
                <div style={{ fontSize: 11, color: "#4ADE80" }}>● Знает все документы Go Offer</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontSize: 15 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 9 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "84%", padding: "9px 12px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background: msg.role === "user" ? "linear-gradient(135deg, #7C5CFC, #6D48F5)" : "#242736", color: "#E8E9F0", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 4, padding: "9px 12px", background: "#242736", borderRadius: "12px 12px 12px 3px", width: "fit-content" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C5CFC", animation: `dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "9px 11px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 7, alignItems: "flex-end" }}>
              <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChatKey} placeholder="Опиши ситуацию или задай вопрос..." rows={1}
                style={{ flex: 1, background: "#0F1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 11px", color: "#E8E9F0", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 88, overflowY: "auto" }} />
              <button onClick={sendMessage} disabled={!chatInput.trim() || chatLoading}
                style={{ width: 34, height: 34, background: chatInput.trim() ? "linear-gradient(135deg, #7C5CFC, #6D48F5)" : "#1F2233", border: "none", borderRadius: 8, cursor: chatInput.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>↑</button>
            </div>
          </div>
        )}
        <button onClick={() => setChatOpen(p => !p)}
          style={{ width: 50, height: 50, background: chatOpen ? "#1A1D27" : "linear-gradient(135deg, #7C5CFC, #6D48F5)", border: chatOpen ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 8px 24px rgba(124,92,252,0.4)", transition: "all 0.2s" }}>
          {chatOpen ? "✕" : "✨"}
        </button>
      </div>

      <style>{`* { box-sizing: border-box; } @keyframes dot { 0%,80%,100% { opacity:.3; transform:scale(.8); } 40% { opacity:1; transform:scale(1); } } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.3); border-radius: 4px; } textarea::placeholder, input::placeholder { color: #4B5563; }`}</style>
    </div>
  );
}
