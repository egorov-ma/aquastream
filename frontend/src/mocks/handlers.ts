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
    return HttpResponse.json({
      id: `org-${slug}`,
      slug,
      name: slug === "riverclub" ? "River Club" : "Aqua Dream",
      description: "Организатор водных мероприятий",
      brandColor: slug === "riverclub" ? "#0ea5e9" : "#22c55e",
    });
  }),
  // Node/any-origin variant
  http.get("*/organizers/:slug", async ({ params }) => {
    await delay(50);
    const { slug } = params as { slug: string };
    return HttpResponse.json({
      id: `org-${slug}`,
      slug,
      name: slug === "riverclub" ? "River Club" : "Aqua Dream",
      description: "Организатор водных мероприятий",
      brandColor: slug === "riverclub" ? "#0ea5e9" : "#22c55e",
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
    ];
    return HttpResponse.json({ items, total: items.length });
  }),

  // Organizer dashboard events
  http.get(withBase("/organizer/events"), async () => {
    await delay(200);
    return HttpResponse.json({
      items: [
        { id: "e1", title: "SUP Sunset", date: new Date().toISOString(), price: 1800, capacity: 20 },
        { id: "e2", title: "Kayak Weekend", date: new Date(Date.now() + 86400000).toISOString(), price: 2500, capacity: 12 },
      ],
    });
  }),
  http.get("*/organizer/events", async () => {
    await delay(200);
    return HttpResponse.json({
      items: [
        { id: "e1", title: "SUP Sunset", date: new Date().toISOString(), price: 1800, capacity: 20 },
        { id: "e2", title: "Kayak Weekend", date: new Date(Date.now() + 86400000).toISOString(), price: 2500, capacity: 12 },
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


