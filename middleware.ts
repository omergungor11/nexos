import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api routes, static files, admin panel, and Next.js internals
  matcher: [
    "/((?!api|_next|admin|.*\\..*).*)",
  ],
};
