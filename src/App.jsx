import { useState, useRef, useEffect } from "react";
import { 
  GraduationCap, Trophy, Clock, BookOpen, Search, Bell, 
  ChevronLeft, ChevronRight, MessageSquare, ShieldAlert, 
  Zap, RefreshCw, BarChart3, HelpCircle, Rocket, Heart, 
  Star, Leaf, Sparkles, Send, CheckCircle2, AlertCircle, Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SYSTEM_PROMPT = "You are an AI assistant for Go Offer curators. Write ready-to-send messages for mentees in Russian, warm and professional tone. Always use [Имя] placeholder. End each message with a clear next step.";

const TARIFFS = [
  {
    id: "take-all", name: "Take All", price: "$2,850", fee: "4%", duration: "6 мес",
    color: "from-violet-400 to-indigo-500", textHex: "#A78BFA", icon: Rocket,
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
    color: "from-pink-400 to-rose-500", textHex: "#F472B6", badge: "Популярный", icon: Heart,
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
    color: "from-amber-400 to-orange-500", textHex: "#FBBF24", badge: "Максимум", icon: Star,
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
    color: "from-emerald-400 to-teal-500", textHex: "#34D399", badge: "Возврат", icon: Leaf,
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
    color: "from-cyan-400 to-blue-500", textHex: "#67E8F9", badge: "Возврат", icon: Sparkles,
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
    id: "curator-guide", title: "Гайд куратора", icon: BarChart3, role: "Куратор", color: "text-violet-400", bgLight: "bg-violet-500/10", borderLight: "border-violet-500/20",
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
    id: "regulations", title: "Регламент кураторов", icon: BookOpen, role: "Куратор", color: "text-pink-400", bgLight: "bg-pink-500/10", borderLight: "border-pink-500/20",
    sections: [
      { h: "График работы", c: "ПН-ПТ, 16:00-01:00 МСК (09:00-18:00 EST).\nСБ-ВС - выходные.\n\nПосле 01:00 МСК уведомления можно отключить.\nНочной бэклог - в первые 2 часа смены." },
      { h: "Стандарты скорости", c: "Первый ответ (рабочее время): макс. 2 часа\nСреднее время ответа: 8 минут\nРазбор ночного бэклога: до 18:00 МСК\nПолное закрытие: не более 3 дней" },
      { h: "Tone of Voice - можно", c: "OK: Всегда по имени\nOK: Я-позиция (Я уточню, Я проверил)\nOK: Эмпатия (Понимаю, как это расстраивает)\nOK: Короткие предложения, active verbs\nOK: Всегда Next Step в конце диалога" },
      { h: "Tone of Voice - нельзя", c: "НЕТ: Грубость, сарказм, переход на личности\nНЕТ: Канцелярит\nНЕТ: Обезличенное Мы\nНЕТ: Игнорирование эмоций\nНЕТ: CAPS LOCK\nНЕТ: Ложные обещания о сроках" },
      { h: "Критерии ОКК (1-5)", c: "1. Понимание запроса\n2. Точность решения\n3. Коммуникация\n4. Проактивность (Next Step)\n5. Влияние на клиента" },
    ]
  },
  {
    id: "scripts", title: "Скрипты", icon: MessageSquare, role: "Все", color: "text-cyan-400", bgLight: "bg-cyan-500/10", borderLight: "border-cyan-500/20",
    sections: [
      { h: "Не хочет подаваться через хаб", c: "[Имя], привет! Твои показатели - очень крутой результат!\n\nНо есть важный момент: подключаем аутричера для дожимов. Для этого нужно, чтобы поток шел через Хаб.\n\nДавай компромисс: 50% горячих позиций через Хаб, остальное в LinkedIn. Как тебе?" },
      { h: "Клиент вышел из игнора", c: "[Имя], привет! Мы переживали - долго не могли достучаться.\n\nРаботу поставили на паузу только чтобы ресурс не улетал в пустоту без фидбека.\n\nСупер, что снова с нами! Готова возвращаться? Получится до конца недели скорректировать резюме?" },
      { h: "Хочет возврат - нашел работу", c: "[Имя], привет!\n\nПредлагаю не расторгать договор сейчас, а взять паузу которая входит в тариф.\n\nЗаморозим программу на пару недель, а потом вернемся к обсуждению. Что скажешь?" },
    ]
  },
  {
    id: "returns", title: "Политика возвратов", icon: RefreshCw, role: "Куратор", color: "text-orange-400", bgLight: "bg-orange-500/10", borderLight: "border-orange-500/20",
    sections: [
      { h: "Основные принципы", c: "1. Договор - наша опора\n2. Goodwill - только наша инициатива\n3. Документация обязательна\n4. Никаких чарджбэков без медиации\n5. Никакого давления и агрессии" },
    ]
  }
];

const ACTIVITY_DATA = [
  { name: 'Пн', hours: 2.4 },
  { name: 'Вт', hours: 4.1 },
  { name: 'Ср', hours: 3.8 },
  { name: 'Чт', hours: 5.2 },
  { name: 'Пт', hours: 4.7 },
  { name: 'Сб', hours: 1.5 },
  { name: 'Вс', hours: 0.8 },
];

const MODULES = [
  {
    id: 1,
    title: "Модуль 1: Стратегия рынка и Позиционирование",
    tags: ["Sales", "B2B", "Strategy"],
    progress: 100,
    status: "completed",
    lessons: [
      { name: "Анализ целевого рынка US/EU", done: true },
      { name: "Определение ценностного предложения", done: true },
      { name: "Выбор целевых вертикалей и доменов", done: true }
    ]
  },
  {
    id: 2,
    title: "Модуль 2: Оптимизация LinkedIn и Резюме",
    tags: ["LinkedIn", "Resume", "Automation"],
    progress: 65,
    status: "processing",
    lessons: [
      { name: "Сборка мастер-резюме по стандартам ATS", done: true },
      { name: "Настройка профиля LinkedIn под поисковые алгоритмы", done: true },
      { name: "Запуск автоматизации через Easy Apply Bot", done: false },
      { name: "Инструктаж ассистента по подачам", done: false }
    ]
  },
  {
    id: 3,
    title: "Модуль 3: Outreach-стратегия и Сеть",
    tags: ["Outreach", "Networking"],
    progress: 0,
    status: "not_started",
    lessons: [
      { name: "Поиск ЛПРов и рекрутеров в целевых компаниях", done: false },
      { name: "Написание кастомных цепочек фоллуапов", done: false },
      { name: "Протоколы выстраивания отношений в чатах", done: false }
    ]
  },
  {
    id: 4,
    title: "Модуль 4: Искусство Mock-интервью",
    tags: ["Interviews", "Mock", "Sales Pitch"],
    progress: 0,
    status: "not_started",
    lessons: [
      { name: "Формулирование идеального Self-Pitch", done: false },
      { name: "Разбор поведенческих вопросов (STAR метод)", done: false },
      { name: "Симуляция технического интервью с ментором", done: false }
    ]
  }
];

function TariffsView() {
  const [active, setActive] = useState("take-all");
  const tar = TARIFFS.find(t => t.id === active);
  const TarIcon = tar.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Тарифы программы</h1>
        <p className="text-slate-400 text-sm mt-1">Детальная спецификация пакетов услуг и условий акселератора Go Offer</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TARIFFS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                isActive 
                  ? 'bg-violet-500/10 border-violet-500/40 text-violet-400 shadow-lg shadow-violet-500/5' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.name} {t.badge && `· ${t.badge}`}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${tar.color}`} />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl text-violet-400">
              <TarIcon className="w-6 h-6" />
            </div>
            {tar.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                {tar.badge}
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{tar.price}</div>
          <div className="text-base font-bold text-slate-200 mt-2">{tar.name}</div>
          <div className="text-xs text-slate-400 mt-1">{tar.fee} Success Fee · {tar.duration} сопровождения</div>

          {tar.rows.some(r => r.hot) && (
            <div className="mt-6 pt-4 border-t border-white/5 space-y-2.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ключевые преимущества</div>
              {tar.rows.filter(r => r.hot).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong className="text-white">{r.label}:</strong> {r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold text-white">Включенные опции пакета {tar.name}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {tar.rows.map((r, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-3 hover:bg-white/[0.01] transition-colors">
                <span className="text-sm text-slate-400">{r.label}</span>
                <span className={`text-sm ${r.dim ? 'text-slate-600 font-normal' : r.hot ? 'text-violet-400 font-bold' : 'text-slate-200'}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeView({ search }) {
  const [activeDoc, setActiveDoc] = useState(null);

  const filtered = DOCS.filter(doc => 
    search === "" || 
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.sections.some(s => s.h.toLowerCase().includes(search.toLowerCase()) || s.c.toLowerCase().includes(search.toLowerCase()))
  );

  if (activeDoc) {
    const doc = DOCS.find(d => d.id === activeDoc);
    if (!doc) return null;
    const DocIcon = doc.icon;
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <button 
          onClick={() => setActiveDoc(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Назад к документам
        </button>

        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 p-5 rounded-2xl">
          <div className={`p-3 rounded-xl ${doc.bgLight} ${doc.color} border ${doc.borderLight}`}>
            <DocIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{doc.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{doc.sections.length} разделов · Доступ: {doc.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          {doc.sections.map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-white/[0.01] border-b border-white/5">
                <h4 className="text-sm font-semibold text-slate-200">{s.h}</h4>
              </div>
              <div className="px-5 py-4 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {s.c}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">База знаний куратора</h1>
        <p className="text-slate-400 text-sm mt-1">Регламенты, скрипты, гайды и пошаговые инструкции ведения менти</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => {
          const DocIcon = doc.icon;
          return (
            <div 
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${doc.bgLight} ${doc.color} border ${doc.borderLight}`}>
                  <DocIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium bg-white/5 text-slate-400 px-2 py-0.5 rounded-md border border-white/5">
                  {doc.role}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{doc.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{doc.sections[0]?.h}</p>
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] text-slate-500">
                <span>Пошаговое руководство</span>
                <span>{doc.sections.length} глав</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! Я AI-помощник куратора Go Offer.\n\nЯ обучен генерировать готовые к отправке сообщения для менти с соблюдением Tone of Voice нашей компании.\n\nВыберите быстрый запрос ниже или опишите индивидуальную проблему менти!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const QUICK = [
    "Шаблон приветствия нового менти",
    "Менти игнорирует сообщения 4 дня",
    "Клиент оставил негативный отзыв",
    "Оффер получен, перевод на Success Fee"
  ];

  const handleSend = (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);

    // Имитируем генерацию ToV ответов
    setTimeout(() => {
      let reply = "";
      if (msg.includes("приветствия")) {
        reply = "[Имя], привет! С огромным удовольствием приветствую тебя на платформе Go Offer! 🚀\n\nМы провели детальную аналитическую подготовку и создали твою индивидуальную рабочую карту в Notion. Наша цель — вывести твой профиль в топ-рейтинг кандидатов на рынках US и EU.\n\nКаков наш следующий шаг: Пожалуйста, перейди по ссылке на платформу mentor.go-offer.us, заполни Модуль 0 и дай знать, как закончишь. На связи!";
      } else if (msg.includes("игнорирует")) {
        reply = "[Имя], привет! Заметила, что мы уже 4 дня не выходили на связь. Очень надеюсь, что у тебя всё в порядке.\n\nМы приостановили текущие бот-подачи, чтобы не расходовать драгоценные отклики без регулярной сверки фидбека и апдейтов.\n\nКаков наш следующий шаг: Напиши, пожалуйста, всё ли хорошо и готова ли ты вернуться к активной работе на этой неделе?";
      } else {
        reply = "[Имя], привет! Понимаю твою обеспокоенность ситуацией. Мы всегда держим качество на особом контроле и уже подключили команду оптимизации.\n\nДавай разберем по пунктам все изменения в стратегии подачи, чтобы максимизировать конверсию в приглашения.\n\nКаков наш следующий шаг: Давай созвонимся завтра в 17:00 по МСК для быстрой калибровки профиля, удобно?";
      }
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl border border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden backdrop-blur-xl animate-fade-in">
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white">Go Offer ToV Copilot</h2>
          <p className="text-xs text-slate-400 mt-0.5">Генератор готовых ответов для менти в нужном тональности</p>
        </div>
        <span className="text-xs bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-full font-medium border border-violet-500/20">
          Claude 3.5 Sonnet Engine
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
            )}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none' 
                : 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 dot-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 dot-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 dot-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 py-3 border-t border-white/5 flex gap-2 overflow-x-auto bg-black/10">
          {QUICK.map((q, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(q)}
              className="text-xs bg-white/5 border border-white/5 hover:border-white/10 rounded-full px-3 py-1.5 whitespace-nowrap text-slate-300 hover:text-white transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 items-center">
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Опишите кейс или введите запрос для копайлота..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 text-white disabled:text-slate-500 rounded-xl transition-all shadow-md shadow-violet-600/10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function LearningView() {
  const [filter, setFilter] = useState("all");
  const [courses, setCourses] = useState(MODULES);

  const filteredModules = courses.filter(m => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const toggleLesson = (moduleId, lessonIndex) => {
    setCourses(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const updatedLessons = m.lessons.map((l, idx) => idx === lessonIndex ? { ...l, done: !l.done } : l);
      const doneCount = updatedLessons.filter(l => l.done).length;
      const progress = Math.round((doneCount / updatedLessons.length) * 100);
      const status = progress === 100 ? "completed" : progress > 0 ? "processing" : "not_started";
      return { ...m, lessons: updatedLessons, progress, status };
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Аналитика и Обучение</h1>
        <p className="text-slate-400 text-sm mt-1">Панель контроля успеваемости кандидатов и освоения модулей акселерации</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">41.2%</div>
            <div className="text-xs text-slate-400 mt-0.5">Средний прогресс трека</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div className="h-full bg-violet-500" style={{ width: '41.2%' }} />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">21.5 ч</div>
            <div className="text-xs text-slate-400 mt-0.5">Времени в системе на этой неделе</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">2 / 4</div>
            <div className="text-xs text-slate-400 mt-0.5">Завершено крупных этапов</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">Динамика активности обучения (Недельный тренд)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Часы, затраченные кандидатом на изучение материалов и выполнение домашних заданий</p>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#110c26', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                itemStyle={{ color: '#c084fc' }}
              />
              <Area type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Course Checklist */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Чек-лист модулей программы</h3>
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: "all", label: "Все модули" },
              { id: "processing", label: "В процессе" },
              { id: "completed", label: "Пройденные" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map(m => (
            <div key={m.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1">
                    {m.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    m.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-slate-500 border border-white/5'
                  }`}>
                    {m.status === 'completed' ? 'Пройден' : m.status === 'processing' ? 'В процессе' : 'Не начат'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-3">{m.title}</h4>

                {/* Lessons Checklist */}
                <div className="space-y-2 mb-4 bg-black/10 p-3 rounded-xl border border-white/5">
                  {m.lessons.map((lesson, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleLesson(m.id, idx)}
                      className="flex items-center gap-2.5 cursor-pointer group text-xs"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        lesson.done 
                          ? 'bg-violet-600 border-violet-500 text-white' 
                          : 'border-white/20 bg-transparent group-hover:border-white/40'
                      }`}>
                        {lesson.done && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={lesson.done ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white transition-colors'}>
                        {lesson.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                  <span>Прогресс модуля</span>
                  <span className="font-bold text-white">{m.progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-violet-500'}`} style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebar, setSidebar] = useState(true);
  const [activeNav, setActiveNav] = useState("learning");
  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const labels = { 
    learning: "Обучение", 
    tariffs: "Тарифы", 
    knowledge: "База знаний", 
    ai: "AI-помощник" 
  };
  
  const NAV = [
    { id: "learning", label: "Обучение", icon: GraduationCap },
    { id: "tariffs", label: "Тарифы", icon: Zap },
    { id: "knowledge", label: "База знаний", icon: BookOpen },
    { id: "ai", label: "AI-помощник", icon: Sparkles },
  ];

  return (
    <div className="flex h-100vh bg-[#080516] text-white font-sans overflow-hidden relative">
      {/* Abstract Background Accents */}
      <div className="fixed -top-36 -left-36 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-36 -right-24 w-[450px] h-[450px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <aside className={`shrink-0 bg-white/[0.02] border-r border-white/10 flex flex-col transition-all duration-300 overflow-hidden z-10 relative backdrop-blur-xl ${sidebar ? 'w-60' : 'w-[68px]'}`}>
        <div className="h-16 flex items-center px-4 justify-between border-b border-white/5 shrink-0">
          {sidebar && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-md shadow-violet-500/30">
                🍍
              </div>
              <div>
                <div className="font-extrabold text-xs text-white tracking-wide">Go Offer</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hub Dashboard</div>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebar(!sidebar)}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {sidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {NAV.map(item => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setSearch(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                } ${!sidebar ? 'justify-center' : ''}`}
                title={!sidebar ? item.label : ""}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                {sidebar && <span className="flex-1 text-left">{item.label}</span>}
                {isActive && sidebar && <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center bg-white/5 p-2 rounded-xl gap-3 ${!sidebar ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              И
            </div>
            {sidebar && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">Ирина Р.</div>
                <div className="text-[10px] text-slate-500 truncate">Старший Куратор</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 z-10 relative">
        {/* Header bar */}
        <header className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-4 justify-between shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Главная</span>
            <span className="text-slate-700">/</span>
            <span className="text-violet-400 font-semibold">{labels[activeNav]}</span>
          </div>

          {activeNav === "knowledge" && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-64 focus-within:border-violet-500/50 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Поиск регламентов..." 
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full" 
              />
            </div>
          )}

          <div className="flex gap-3 relative">
            {/* Notification system */}
            <button 
              onClick={() => { setNotif(!notif); setUserMenu(false); }}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full border border-[#080516]" />
            </button>
            
            {notif && (
              <div className="absolute top-10 right-10 w-64 bg-[#110c26] border border-white/10 p-3 rounded-xl z-50 shadow-2xl space-y-2">
                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2">Уведомления</div>
                <div className="p-2 bg-white/5 rounded-lg text-xs text-slate-300 border border-white/5">
                  <span className="font-semibold text-white block mb-0.5">База знаний</span>
                  Добавлен новый скрипт по обходу возражений Success Fee.
                </div>
              </div>
            )}

            <button 
              onClick={() => { setUserMenu(!userMenu); setNotif(false); }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white font-extrabold text-xs flex items-center justify-center"
            >
              И
            </button>
            
            {userMenu && (
              <div className="absolute top-10 right-0 w-44 bg-[#110c26] border border-white/10 p-1.5 rounded-xl z-50 shadow-2xl text-xs space-y-0.5">
                <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors">Профиль куратора</div>
                <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors">Настройки системы</div>
                <div className="px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors border-t border-white/5 mt-1 pt-1.5">Выйти</div>
              </div>
            )}
          </div>
        </header>

        {/* View Router Main */}
        <main className="flex-1 overflow-y-auto p-6" onClick={() => { setNotif(false); setUserMenu(false); }}>
          {activeNav === "learning" && <LearningView />}
          {activeNav === "tariffs" && <TariffsView />}
          {activeNav === "knowledge" && <KnowledgeView search={search} />}
          {activeNav === "ai" && <AIView />}
        </main>
      </div>
    </div>
  );
}
