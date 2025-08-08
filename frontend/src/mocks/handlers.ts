import { http, HttpResponse, delay } from "msw";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const withBase = (path: string) => `${apiBase}${path}`;

export const handlers = [
  // GET /organizers
  http.get(withBase("/organizers"), async () => {
    await delay(300);
    return HttpResponse.json({
      items: [
        { id: "org-1", slug: "riverclub", name: "River Club" },
        { id: "org-2", slug: "aquadream", name: "Aqua Dream" },
      ],
      total: 2,
    });
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


