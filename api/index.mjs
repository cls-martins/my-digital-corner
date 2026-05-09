import server from "../dist/server/server.js";

export default async function handler(request) {
  return await server.fetch(request);
}

export const config = { runtime: "edge" };
