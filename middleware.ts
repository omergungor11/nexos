import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api routes, static files, admin panel, /teklif (locale-less
  // public showcase pages) and Next.js internals.
  matcher: [
    "/((?!api|_next|admin|teklif|.*\\..*).*)",
  ],
};
