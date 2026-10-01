"use server";

import { cookies } from "next/headers";

// Cookies can be written here (a Server Action), not during Server Component rendering.
export async function setName(formData: FormData) {
  const name = String(formData.get("name") ?? "").slice(0, 40);
  (await cookies()).set("lab-name", name, { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function clearName() {
  (await cookies()).delete("lab-name");
}
