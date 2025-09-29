import { http, HttpResponse, delay } from "msw";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const withBase = (path: string) => `${apiBase}${path}`;

export const handlers = [
  // Profile GET/PUT
  http.get(withBase("/profile"), async () => {
    await delay(150);
    return HttpResponse.json({
      phone: "+7 (900) 000-00-00",
      telegram: "",
      extra: "",
      verified: false,
    });
  }),
  http.get("*/profile", async () => {
    await delay(150);
    return HttpResponse.json({
      phone: "+7 (900) 000-00-00",
      telegram: "",
      extra: "",
      verified: false,
    });
  }),
  http.put(withBase("/profile"), async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<{
      phone: string;
      telegram: string;
      extra: string;
      verified: boolean;
    }>; 
    return HttpResponse.json({
      phone: body?.phone ?? "+7 (900) 000-00-00",
      telegram: body?.telegram ?? "",
      extra: body?.extra ?? "",
      verified: Boolean(body?.verified ?? false),
    });
  }),
  http.put("*/profile", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<{
      phone: string;
      telegram: string;
      extra: string;
      verified: boolean;
    }>; 
    return HttpResponse.json({
      phone: body?.phone ?? "+7 (900) 000-00-00",
      telegram: body?.telegram ?? "",
      extra: body?.extra ?? "",
      verified: Boolean(body?.verified ?? false),
    });
  }),
  // GET /organizers
  http.get(withBase("/organizers"), async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "8");
    const all = [
      { id: "org-1", slug: "riverclub", name: "River Club" },
      { id: "org-2", slug: "aquadream", name: "Aqua Dream" },
      { id: "org-3", slug: "kayak-pro", name: "Kayak Pro" },
      { id: "org-4", slug: "sup-life", name: "SUP Life" },
      { id: "org-5", slug: "blue-wave", name: "Blue Wave" },
      { id: "org-6", slug: "neo-splav", name: "Neo Splav" },
      { id: "org-7", slug: "lake-club", name: "Lake Club" },
      { id: "org-8", slug: "sea-riders", name: "Sea Riders" },
      { id: "org-9", slug: "aqua-racing", name: "Aqua Racing" },
      { id: "org-10", slug: "water-masters", name: "Water Masters" },
      { id: "org-11", slug: "rapid-zone", name: "Rapid Zone" },
      { id: "org-12", slug: "wave-hunters", name: "Wave Hunters" },
      { id: "org-13", slug: "deep-blue", name: "Deep Blue Adventures" },
      { id: "org-14", slug: "float-team", name: "Float Team" },
      { id: "org-15", slug: "surf-rebels", name: "Surf Rebels" },
      { id: "org-16", slug: "ocean-spirits", name: "Ocean Spirits" },
      { id: "org-17", slug: "aqua-explorers", name: "Aqua Explorers" },
      { id: "org-18", slug: "wild-waters", name: "Wild Waters Co" },
      { id: "org-19", slug: "crystal-current", name: "Crystal Current" },
      { id: "org-20", slug: "blue-horizon", name: "Blue Horizon" },
      { id: "org-21", slug: "nordic-paddlers", name: "Nordic Paddlers" },
      { id: "org-22", slug: "emerald-bay", name: "Emerald Bay Club" },
      { id: "org-23", slug: "aqua-adventures", name: "Aqua Adventures SPB" },
      { id: "org-24", slug: "stream-riders", name: "Stream Riders" },
    ];
    const filtered = q
      ? all.filter((o) => o.name.toLowerCase().includes(q) || o.slug.includes(q))
      : all;
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return HttpResponse.json({ items, total });
  }),
  // Node/any-origin variant
  http.get("*/organizers", async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "8");
    const all = [
      { id: "org-1", slug: "riverclub", name: "River Club" },
      { id: "org-2", slug: "aquadream", name: "Aqua Dream" },
      { id: "org-3", slug: "kayak-pro", name: "Kayak Pro" },
      { id: "org-4", slug: "sup-life", name: "SUP Life" },
      { id: "org-5", slug: "blue-wave", name: "Blue Wave" },
      { id: "org-6", slug: "neo-splav", name: "Neo Splav" },
      { id: "org-7", slug: "lake-club", name: "Lake Club" },
      { id: "org-8", slug: "sea-riders", name: "Sea Riders" },
      { id: "org-9", slug: "aqua-racing", name: "Aqua Racing" },
      { id: "org-10", slug: "water-masters", name: "Water Masters" },
      { id: "org-11", slug: "rapid-zone", name: "Rapid Zone" },
      { id: "org-12", slug: "wave-hunters", name: "Wave Hunters" },
      { id: "org-13", slug: "deep-blue", name: "Deep Blue Adventures" },
      { id: "org-14", slug: "float-team", name: "Float Team" },
      { id: "org-15", slug: "surf-rebels", name: "Surf Rebels" },
      { id: "org-16", slug: "ocean-spirits", name: "Ocean Spirits" },
      { id: "org-17", slug: "aqua-explorers", name: "Aqua Explorers" },
      { id: "org-18", slug: "wild-waters", name: "Wild Waters Co" },
      { id: "org-19", slug: "crystal-current", name: "Crystal Current" },
      { id: "org-20", slug: "blue-horizon", name: "Blue Horizon" },
      { id: "org-21", slug: "nordic-paddlers", name: "Nordic Paddlers" },
      { id: "org-22", slug: "emerald-bay", name: "Emerald Bay Club" },
      { id: "org-23", slug: "aqua-adventures", name: "Aqua Adventures SPB" },
      { id: "org-24", slug: "stream-riders", name: "Stream Riders" },
    ];
    const filtered = q
      ? all.filter((o) => o.name.toLowerCase().includes(q) || o.slug.includes(q))
      : all;
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return HttpResponse.json({ items, total });
  }),

  // GET /organizers/:slug
  http.get(withBase("/organizers/:slug"), async ({ params }) => {
    await delay(50);
    const { slug } = params as { slug: string };

    const orgMap: Record<string, { name: string; description: string; brandColor: string }> = {
      "riverclub": { name: "River Club", description: "Премиальные речные прогулки и активный отдых на воде", brandColor: "#0ea5e9" },
      "aquadream": { name: "Aqua Dream", description: "Мечты о воде становятся реальностью", brandColor: "#22c55e" },
      "kayak-pro": { name: "Kayak Pro", description: "Профессиональный каякинг для всех уровней", brandColor: "#f59e0b" },
      "sup-life": { name: "SUP Life", description: "Стендап-паддлборд как стиль жизни", brandColor: "#8b5cf6" },
      "blue-wave": { name: "Blue Wave", description: "Синяя волна приключений", brandColor: "#3b82f6" },
      "neo-splav": { name: "Neo Splav", description: "Новое поколение сплавов", brandColor: "#ef4444" },
      "lake-club": { name: "Lake Club", description: "Элитный клуб любителей озер", brandColor: "#06b6d4" },
      "sea-riders": { name: "Sea Riders", description: "Покорители морских просторов", brandColor: "#10b981" },
      "aqua-racing": { name: "Aqua Racing", description: "Гоночная школа водных видов спорта", brandColor: "#f97316" },
      "water-masters": { name: "Water Masters", description: "Мастера водной стихии", brandColor: "#84cc16" },
      "rapid-zone": { name: "Rapid Zone", description: "Зона экстремальных порогов", brandColor: "#dc2626" },
      "wave-hunters": { name: "Wave Hunters", description: "Охотники за идеальной волной", brandColor: "#7c3aed" },
      "deep-blue": { name: "Deep Blue Adventures", description: "Глубоководные приключения", brandColor: "#1e40af" },
      "float-team": { name: "Float Team", description: "Команда профессионалов водного туризма", brandColor: "#059669" },
      "surf-rebels": { name: "Surf Rebels", description: "Бунтари серфинга", brandColor: "#be185d" },
      "ocean-spirits": { name: "Ocean Spirits", description: "Духи океана зовут в путешествие", brandColor: "#0891b2" },
      "aqua-explorers": { name: "Aqua Explorers", description: "Исследователи водных миров", brandColor: "#7c2d12" },
      "wild-waters": { name: "Wild Waters Co", description: "Компания дикой воды", brandColor: "#166534" },
      "crystal-current": { name: "Crystal Current", description: "Кристально чистые течения", brandColor: "#0f766e" },
      "blue-horizon": { name: "Blue Horizon", description: "Синий горизонт новых возможностей", brandColor: "#1d4ed8" },
      "nordic-paddlers": { name: "Nordic Paddlers", description: "Скандинавская школа гребли и SUP-туров по северным заливам", brandColor: "#2563eb" },
      "emerald-bay": { name: "Emerald Bay Club", description: "Клуб прогулок по изумрудным бухтам и лагунам", brandColor: "#047857" },
      "aqua-adventures": { name: "Aqua Adventures SPB", description: "Приключенческие маршруты по воде в окрестностях Петербурга", brandColor: "#0ea5e9" },
      "stream-riders": { name: "Stream Riders", description: "Команда любителей бурных потоков и скоростных сплавов", brandColor: "#4f46e5" },
    };

    const org = orgMap[slug] || { name: "Aqua Organization", description: "Организатор водных мероприятий", brandColor: "#6b7280" };

    return HttpResponse.json({
      id: `org-${slug}`,
      slug,
      ...org,
    });
  }),
  // Node/any-origin variant
  http.get("*/organizers/:slug", async ({ params }) => {
    await delay(50);
    const { slug } = params as { slug: string };

    const orgMap: Record<string, { name: string; description: string; brandColor: string }> = {
      "riverclub": { name: "River Club", description: "Премиальные речные прогулки и активный отдых на воде", brandColor: "#0ea5e9" },
      "aquadream": { name: "Aqua Dream", description: "Мечты о воде становятся реальностью", brandColor: "#22c55e" },
      "kayak-pro": { name: "Kayak Pro", description: "Профессиональный каякинг для всех уровней", brandColor: "#f59e0b" },
      "sup-life": { name: "SUP Life", description: "Стендап-паддлборд как стиль жизни", brandColor: "#8b5cf6" },
      "blue-wave": { name: "Blue Wave", description: "Синяя волна приключений", brandColor: "#3b82f6" },
      "neo-splav": { name: "Neo Splav", description: "Новое поколение сплавов", brandColor: "#ef4444" },
      "lake-club": { name: "Lake Club", description: "Элитный клуб любителей озер", brandColor: "#06b6d4" },
      "sea-riders": { name: "Sea Riders", description: "Покорители морских просторов", brandColor: "#10b981" },
      "aqua-racing": { name: "Aqua Racing", description: "Гоночная школа водных видов спорта", brandColor: "#f97316" },
      "water-masters": { name: "Water Masters", description: "Мастера водной стихии", brandColor: "#84cc16" },
      "rapid-zone": { name: "Rapid Zone", description: "Зона экстремальных порогов", brandColor: "#dc2626" },
      "wave-hunters": { name: "Wave Hunters", description: "Охотники за идеальной волной", brandColor: "#7c3aed" },
      "deep-blue": { name: "Deep Blue Adventures", description: "Глубоководные приключения", brandColor: "#1e40af" },
      "float-team": { name: "Float Team", description: "Команда профессионалов водного туризма", brandColor: "#059669" },
      "surf-rebels": { name: "Surf Rebels", description: "Бунтари серфинга", brandColor: "#be185d" },
      "ocean-spirits": { name: "Ocean Spirits", description: "Духи океана зовут в путешествие", brandColor: "#0891b2" },
      "aqua-explorers": { name: "Aqua Explorers", description: "Исследователи водных миров", brandColor: "#7c2d12" },
      "wild-waters": { name: "Wild Waters Co", description: "Компания дикой воды", brandColor: "#166534" },
      "crystal-current": { name: "Crystal Current", description: "Кристально чистые течения", brandColor: "#0f766e" },
      "blue-horizon": { name: "Blue Horizon", description: "Синий горизонт новых возможностей", brandColor: "#1d4ed8" },
      "nordic-paddlers": { name: "Nordic Paddlers", description: "Скандинавская школа гребли и SUP-туров по северным заливам", brandColor: "#2563eb" },
      "emerald-bay": { name: "Emerald Bay Club", description: "Клуб прогулок по изумрудным бухтам и лагунам", brandColor: "#047857" },
      "aqua-adventures": { name: "Aqua Adventures SPB", description: "Приключенческие маршруты по воде в окрестностях Петербурга", brandColor: "#0ea5e9" },
      "stream-riders": { name: "Stream Riders", description: "Команда любителей бурных потоков и скоростных сплавов", brandColor: "#4f46e5" },
    };

    const org = orgMap[slug] || { name: "Aqua Organization", description: "Организатор водных мероприятий", brandColor: "#6b7280" };

    return HttpResponse.json({
      id: `org-${slug}`,
      slug,
      ...org,
    });
  }),

  // GET /organizers/:slug/events
  http.get(withBase("/organizers/:slug/events"), async ({ params }) => {
    await delay(120);
    const { slug } = params as { slug: string };
    const now = Date.now();
    const items = [
      {
        id: "ev-101",
        organizerSlug: slug,
        title: "Заплыв по утренней Неве",
        dateStart: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        location: "Санкт-Петербург",
        price: 1500,
        capacity: 30,
        available: 12,
        difficulty: 2,
        features: ["Маршрут 12 км", "Инструктаж", "Горячий чай"],
      },
      {
        id: "ev-102",
        organizerSlug: slug,
        title: "Ночной SUP-тур",
        dateStart: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Канал Грибоедова",
        price: 2200,
        capacity: 20,
        available: 5,
        difficulty: 3,
        features: ["Фонари", "Фото сопровождение"],
      },
      {
        id: "ev-103",
        organizerSlug: slug,
        title: "Каякинг в заливе",
        dateStart: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: null,
        location: "Финский залив",
        price: 3000,
        capacity: 16,
        available: 16,
        difficulty: 1,
        features: ["Снаряжение включено"],
      },
      {
        id: "ev-104",
        organizerSlug: slug,
        title: "Марафон гребли",
        dateStart: new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Нева",
        price: 4500,
        capacity: 40,
        available: 2,
        difficulty: 4,
        features: ["Дистанция 25 км", "Пит-стоп"],
      },
      {
        id: "ev-105",
        organizerSlug: slug,
        title: "SUP-йога на рассвете",
        dateStart: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Озеро Долгое",
        price: 1800,
        capacity: 12,
        available: 8,
        difficulty: 2,
        features: ["Инструктор-йог", "Тихая акватория"],
      },
      {
        id: "ev-106",
        organizerSlug: slug,
        title: "Сплав выходного дня",
        dateStart: new Date(now + 20 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 21 * 24 * 60 * 60 * 1000).toISOString(),
        location: "р. Мста",
        price: 5200,
        capacity: 25,
        available: 20,
        difficulty: 3,
        features: ["2 дня", "Ночёвка в палатке", "Питание включено"],
      },
      {
        id: "ev-107",
        organizerSlug: slug,
        title: "Винд-серфинг для новичков",
        dateStart: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Залив Лахта",
        price: 2800,
        capacity: 8,
        available: 3,
        difficulty: 2,
        features: ["Обучение с нуля", "Доски в аренду", "Сертификат"],
      },
      {
        id: "ev-108",
        organizerSlug: slug,
        title: "Экстремальный рафтинг",
        dateStart: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        location: "р. Шуя",
        price: 6500,
        capacity: 14,
        available: 0,
        difficulty: 5,
        features: ["Категория 4", "Профессиональные гиды", "Экипировка"],
      },
      {
        id: "ev-109",
        organizerSlug: slug,
        title: "Вечерний каяк-тур",
        dateStart: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Река Мойка",
        price: 1200,
        capacity: 24,
        available: 18,
        difficulty: 1,
        features: ["Легкий маршрут", "Романтическая атмосфера"],
      },
      {
        id: "ev-110",
        organizerSlug: slug,
        title: "SUP-серфинг в шторм",
        dateStart: new Date(now + 12 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Финский залив",
        price: 3800,
        capacity: 6,
        available: 6,
        difficulty: 4,
        features: ["Только опытные", "Волны до 1м", "Неопрен в комплекте"],
      },
      {
        id: "ev-111",
        organizerSlug: slug,
        title: "Семейный сплав",
        dateStart: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        location: "р. Вуокса",
        price: 2100,
        capacity: 32,
        available: 24,
        difficulty: 1,
        features: ["Детям от 6 лет", "Спокойная вода", "Пикник включен"],
      },
      {
        id: "ev-112",
        organizerSlug: slug,
        title: "Подводное плавание",
        dateStart: new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Карьер Рускеала",
        price: 4200,
        capacity: 10,
        available: 7,
        difficulty: 3,
        features: ["Сертификат PADI", "Гидрокостюм", "Подводная фото"],
      },
      {
        id: "ev-113",
        organizerSlug: slug,
        title: "Кайт-серфинг курс",
        dateStart: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Курорт Игора",
        price: 8900,
        capacity: 12,
        available: 9,
        difficulty: 3,
        features: ["3 дня обучения", "Международный сертификат", "Проживание"],
      },
      {
        id: "ev-114",
        organizerSlug: slug,
        title: "Стендап-комедия на воде",
        dateStart: new Date(now + 16 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Яхт-клуб Нева",
        price: 1600,
        capacity: 50,
        available: 35,
        difficulty: 1,
        features: ["Необычный формат", "Профессиональные комики", "Фуршет"],
      },
      {
        id: "ev-115",
        organizerSlug: slug,
        title: "Ледовая рыбалка и сауна",
        dateStart: new Date(now + 25 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 26 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Озеро Вуокса",
        price: 3500,
        capacity: 20,
        available: 16,
        difficulty: 1,
        features: ["Зимняя рыбалка", "Русская баня", "Уха из улова"],
      },
    ];
    return HttpResponse.json({ items, total: items.length });
  }),
  // Node/any-origin variant
  http.get("*/organizers/:slug/events", async ({ params }) => {
    await delay(120);
    const { slug } = params as { slug: string };
    const now = Date.now();
    const items = [
      {
        id: "ev-101",
        organizerSlug: slug,
        title: "Заплыв по утренней Неве",
        dateStart: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        location: "Санкт-Петербург",
        price: 1500,
        capacity: 30,
        available: 12,
        difficulty: 2,
        features: ["Маршрут 12 км", "Инструктаж", "Горячий чай"],
      },
      {
        id: "ev-102",
        organizerSlug: slug,
        title: "Ночной SUP-тур",
        dateStart: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Канал Грибоедова",
        price: 2200,
        capacity: 20,
        available: 5,
        difficulty: 3,
        features: ["Фонари", "Фото сопровождение"],
      },
      {
        id: "ev-103",
        organizerSlug: slug,
        title: "Каякинг в заливе",
        dateStart: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: null,
        location: "Финский залив",
        price: 3000,
        capacity: 16,
        available: 16,
        difficulty: 1,
        features: ["Снаряжение включено"],
      },
      {
        id: "ev-104",
        organizerSlug: slug,
        title: "Марафон гребли",
        dateStart: new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Нева",
        price: 4500,
        capacity: 40,
        available: 2,
        difficulty: 4,
        features: ["Дистанция 25 км", "Пит-стоп"],
      },
      {
        id: "ev-105",
        organizerSlug: slug,
        title: "SUP-йога на рассвете",
        dateStart: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Озеро Долгое",
        price: 1800,
        capacity: 12,
        available: 8,
        difficulty: 2,
        features: ["Инструктор-йог", "Тихая акватория"],
      },
      {
        id: "ev-106",
        organizerSlug: slug,
        title: "Сплав выходного дня",
        dateStart: new Date(now + 20 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 21 * 24 * 60 * 60 * 1000).toISOString(),
        location: "р. Мста",
        price: 5200,
        capacity: 25,
        available: 20,
        difficulty: 3,
        features: ["2 дня", "Ночёвка в палатке", "Питание включено"],
      },
      {
        id: "ev-107",
        organizerSlug: slug,
        title: "Винд-серфинг для новичков",
        dateStart: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Залив Лахта",
        price: 2800,
        capacity: 8,
        available: 3,
        difficulty: 2,
        features: ["Обучение с нуля", "Доски в аренду", "Сертификат"],
      },
      {
        id: "ev-108",
        organizerSlug: slug,
        title: "Экстремальный рафтинг",
        dateStart: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        location: "р. Шуя",
        price: 6500,
        capacity: 14,
        available: 0,
        difficulty: 5,
        features: ["Категория 4", "Профессиональные гиды", "Экипировка"],
      },
      {
        id: "ev-109",
        organizerSlug: slug,
        title: "Вечерний каяк-тур",
        dateStart: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Река Мойка",
        price: 1200,
        capacity: 24,
        available: 18,
        difficulty: 1,
        features: ["Легкий маршрут", "Романтическая атмосфера"],
      },
      {
        id: "ev-110",
        organizerSlug: slug,
        title: "SUP-серфинг в шторм",
        dateStart: new Date(now + 12 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Финский залив",
        price: 3800,
        capacity: 6,
        available: 6,
        difficulty: 4,
        features: ["Только опытные", "Волны до 1м", "Неопрен в комплекте"],
      },
      {
        id: "ev-111",
        organizerSlug: slug,
        title: "Семейный сплав",
        dateStart: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        location: "р. Вуокса",
        price: 2100,
        capacity: 32,
        available: 24,
        difficulty: 1,
        features: ["Детям от 6 лет", "Спокойная вода", "Пикник включен"],
      },
      {
        id: "ev-112",
        organizerSlug: slug,
        title: "Подводное плавание",
        dateStart: new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Карьер Рускеала",
        price: 4200,
        capacity: 10,
        available: 7,
        difficulty: 3,
        features: ["Сертификат PADI", "Гидрокостюм", "Подводная фото"],
      },
      {
        id: "ev-113",
        organizerSlug: slug,
        title: "Кайт-серфинг курс",
        dateStart: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Курорт Игора",
        price: 8900,
        capacity: 12,
        available: 9,
        difficulty: 3,
        features: ["3 дня обучения", "Международный сертификат", "Проживание"],
      },
      {
        id: "ev-114",
        organizerSlug: slug,
        title: "Стендап-комедия на воде",
        dateStart: new Date(now + 16 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Яхт-клуб Нева",
        price: 1600,
        capacity: 50,
        available: 35,
        difficulty: 1,
        features: ["Необычный формат", "Профессиональные комики", "Фуршет"],
      },
      {
        id: "ev-115",
        organizerSlug: slug,
        title: "Ледовая рыбалка и сауна",
        dateStart: new Date(now + 25 * 24 * 60 * 60 * 1000).toISOString(),
        dateEnd: new Date(now + 26 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Озеро Вуокса",
        price: 3500,
        capacity: 20,
        available: 16,
        difficulty: 1,
        features: ["Зимняя рыбалка", "Русская баня", "Уха из улова"],
      },
    ];
    return HttpResponse.json({ items, total: items.length });
  }),

  // Organizer dashboard events
  http.get(withBase("/organizer/events"), async () => {
    await delay(200);
    const now = Date.now();
    return HttpResponse.json({
      items: [
        { id: "e1", title: "SUP Sunset", date: new Date(now + 86400000).toISOString(), price: 1800, capacity: 20 },
        { id: "e2", title: "Kayak Weekend", date: new Date(now + 2 * 86400000).toISOString(), price: 2500, capacity: 12 },
        { id: "e3", title: "Рафтинг экстрим", date: new Date(now + 3 * 86400000).toISOString(), price: 4200, capacity: 16 },
        { id: "e4", title: "Винд-серфинг курс", date: new Date(now + 5 * 86400000).toISOString(), price: 3800, capacity: 8 },
        { id: "e5", title: "Семейный сплав", date: new Date(now + 7 * 86400000).toISOString(), price: 1900, capacity: 25 },
        { id: "e6", title: "Ночной каяк-тур", date: new Date(now + 10 * 86400000).toISOString(), price: 2200, capacity: 18 },
        { id: "e7", title: "SUP-йога", date: new Date(now + 12 * 86400000).toISOString(), price: 1600, capacity: 15 },
        { id: "e8", title: "Кайт-серфинг", date: new Date(now + 14 * 86400000).toISOString(), price: 5500, capacity: 6 },
      ],
    });
  }),
  http.get("*/organizer/events", async () => {
    await delay(200);
    const now = Date.now();
    return HttpResponse.json({
      items: [
        { id: "e1", title: "SUP Sunset", date: new Date(now + 86400000).toISOString(), price: 1800, capacity: 20 },
        { id: "e2", title: "Kayak Weekend", date: new Date(now + 2 * 86400000).toISOString(), price: 2500, capacity: 12 },
        { id: "e3", title: "Рафтинг экстрим", date: new Date(now + 3 * 86400000).toISOString(), price: 4200, capacity: 16 },
        { id: "e4", title: "Винд-серфинг курс", date: new Date(now + 5 * 86400000).toISOString(), price: 3800, capacity: 8 },
        { id: "e5", title: "Семейный сплав", date: new Date(now + 7 * 86400000).toISOString(), price: 1900, capacity: 25 },
        { id: "e6", title: "Ночной каяк-тур", date: new Date(now + 10 * 86400000).toISOString(), price: 2200, capacity: 18 },
        { id: "e7", title: "SUP-йога", date: new Date(now + 12 * 86400000).toISOString(), price: 1600, capacity: 15 },
        { id: "e8", title: "Кайт-серфинг", date: new Date(now + 14 * 86400000).toISOString(), price: 5500, capacity: 6 },
      ],
    });
  }),

  // Bookings
  http.post(withBase("/bookings"), async ({ request }) => {
    const { eventId } = (await request.json()) as { eventId: string };
    return HttpResponse.json({ id: "bk_mock_1", eventId, status: "pending" });
  }),
  http.post("*/bookings", async ({ request }) => {
    const { eventId } = (await request.json()) as { eventId: string };
    return HttpResponse.json({ id: "bk_mock_1", eventId, status: "pending" });
  }),
  http.get(withBase("/bookings/:id"), async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ id, event: { id: "ev-101", title: "Заплыв по утренней Неве" }, amount: 2000, status: "pending" });
  }),
  http.get("*/bookings/:id", async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ id, event: { id: "ev-101", title: "Заплыв по утренней Неве" }, amount: 2000, status: "pending" });
  }),
  // GET /events/:id
  http.get(withBase("/events/:id"), async ({ params }) => {
    await delay(200);
    const { id } = params as { id: string };
    return HttpResponse.json({
      id,
      title: "Карточка события (мок)",
      price: 2000,
      capacity: 20,
      available: 8,
    });
  }),
];

