import ky from "ky";

import { env } from "@/app/constants/env";

export const apiDashboard = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 180000,
});