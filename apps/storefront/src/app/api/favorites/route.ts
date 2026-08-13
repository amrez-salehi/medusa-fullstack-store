import { forwardAuthenticatedFavorites } from "@lib/favorites/server"

export async function GET() {
  return forwardAuthenticatedFavorites("")
}

export async function POST(request: Request) {
  return forwardAuthenticatedFavorites("", {
    method: "POST",
    body: await request.text(),
  })
}
