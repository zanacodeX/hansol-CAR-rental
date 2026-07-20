"use server";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  await nextAuthSignIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export async function logoutAction() {
  await nextAuthSignOut({ redirectTo: "/" });
}
