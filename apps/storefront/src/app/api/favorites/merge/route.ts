import { forwardAuthenticatedFavorites } from "@lib/favorites/server"

export async function POST(request: Request) {
  return forwardAuthenticatedFavorites("/merge", {
    method: "POST",
    body: await request.text(),
  })
}
