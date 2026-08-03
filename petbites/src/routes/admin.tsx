import { createFileRoute } from "@tanstack/react-router";

import { AdminApp } from "@/features/admin/admin-app";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "PetBites CMS" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "PetBites content management system." },
    ],
  }),
  component: AdminApp,
});
