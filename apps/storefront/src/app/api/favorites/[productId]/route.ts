import { forwardAuthenticatedFavorites } from "@lib/favorites/server"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params
  return forwardAuthenticatedFavorites(`/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  })
}
