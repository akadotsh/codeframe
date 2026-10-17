import { env } from "cloudflare:workers";
import { Container, getContainer } from "@cloudflare/containers";

export class ApiContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";
  envVars = {
    API_URL: env.APP_URL,
    PORT: "8080",
    PUBLIC_WEB_URL: env.APP_URL,
    UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL,
  };
}

export default {
  fetch(request, workerEnv) {
    const path = new URL(request.url).pathname;
    if (path === "/health" || path === "/api" || path.startsWith("/api/")) {
      return getContainer(workerEnv.API_CONTAINER).fetch(request);
    }
    return workerEnv.ASSETS.fetch(request);
  },
};
