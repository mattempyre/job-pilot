import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

type CreateInsforgeServerOptions = {
  accessToken?: string;
};

export async function createInsforgeServer(
  options: CreateInsforgeServerOptions = {},
) {
  return createServerClient({
    accessToken: options.accessToken,
    cookies: await cookies(),
  });
}
