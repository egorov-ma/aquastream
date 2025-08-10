import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Панель организатора — AquaStream",
    template: "%s — Панель организатора — AquaStream",
  },
  description: "Управление событиями, модерация оплат, группы и настройки бренда.",
  robots: { index: false },
};

export default function OrgDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}


