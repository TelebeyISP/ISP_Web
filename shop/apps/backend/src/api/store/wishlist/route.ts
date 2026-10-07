import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"

export type WishlistItem = {
  id: string
  productId?: string
  productName: string
  variantName: string
  unitPrice: number
  image?: string
}

function customerId(req: MedusaRequest) {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Sign in with your Telebey account to save a wishlist."
    )
  }
  return id
}

export async function readWishlist(req: MedusaRequest): Promise<WishlistItem[]> {
  const service = req.scope.resolve(Modules.CUSTOMER)
  const customer = await service.retrieveCustomer(customerId(req))
  const stored = customer.metadata?.wishlist
  return Array.isArray(stored) ? (stored as WishlistItem[]) : []
}

async function writeWishlist(req: MedusaRequest, wishlist: WishlistItem[]) {
  const service = req.scope.resolve(Modules.CUSTOMER)
  const id = customerId(req)
  const customer = await service.retrieveCustomer(id)
  await service.updateCustomers(id, {
    metadata: {
      ...(customer.metadata ?? {}),
      wishlist,
    },
  })
  return wishlist
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const wishlist = await readWishlist(req)
  res.json({ wishlist })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as Partial<WishlistItem>
  if (!body.id || !body.productName) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A Medusa variant id and product name are required."
    )
  }

  const item: WishlistItem = {
    id: body.id,
    productId: body.productId,
    productName: body.productName,
    variantName: body.variantName || "Standard",
    unitPrice: Number(body.unitPrice) || 0,
    image: body.image,
  }

  const current = await readWishlist(req)
  const wishlist = current.some((entry) => entry.id === item.id)
    ? current
    : [...current, item]
  await writeWishlist(req, wishlist)
  res.json({ wishlist })
}
