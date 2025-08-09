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
    await delay(300);
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
    await delay(300);
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
    await delay(250);
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
    await delay(250);
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
    await delay(400);
    const { slug } = params as { slug: string };
    return HttpResponse.json({
      items: [
        {
          id: "ev-101",
          organizerSlug: slug,
          title: "Заплыв по утренней Неве",
          dateStart: new Date().toISOString(),
          price: 1500,
          capacity: 30,
          available: 12,
        },
      ],
      total: 1,
    });
  }),
  // Node/any-origin variant
  http.get("*/organizers/:slug/events", async ({ params }) => {
    await delay(400);
    const { slug } = params as { slug: string };
    return HttpResponse.json({
      items: [
        {
          id: "ev-101",
          organizerSlug: slug,
          title: "Заплыв по утренней Неве",
          dateStart: new Date().toISOString(),
          price: 1500,
          capacity: 30,
          available: 12,
        },
      ],
      total: 1,
    });
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


