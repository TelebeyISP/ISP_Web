import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { readWishlist, type WishlistItem } from "../route"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing wishlist item id.")
  }

  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Sign in to update your wishlist.")
  }

  const service = req.scope.resolve(Modules.CUSTOMER)
  const customer = await service.retrieveCustomer(customerId)
  const wishlist = (await readWishlist(req)).filter((item) => item.id !== id)

  await service.updateCustomers(customerId, {
    metadata: {
      ...(customer.metadata ?? {}),
      wishlist,
    },
  })

  res.json({ wishlist: wishlist as WishlistItem[] })
}
