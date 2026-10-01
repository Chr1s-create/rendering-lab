"use server";

import { cookies } from "next/headers";

export async function setTheme(formData: FormData) {
  const theme = String(formData.get("theme") ?? "dark");
  (await cookies()).set("lab-theme", theme === "light" ? "light" : "dark", {
    path: "/",
    sameSite: "lax",
  });
}
