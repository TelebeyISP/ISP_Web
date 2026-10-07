/**
 * Telebey devices, accessories, and plan products for the website shop.
 *
 *   pnpm exec medusa exec ./src/scripts/seed-telebey-catalog.ts
 *
 * Safe to re-run: existing handles and the United States region are skipped.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const CATALOG = [
  {
    title: "Telebey Phone Z1",
    handle: "telebey-phone-z1",
    category: "Smartphones",
    description:
      "The ultimate 5G experience with seamless global roaming built in.",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Global Data SIM - 50GB",
    handle: "global-data-sim-50gb",
    category: "Plans",
    description:
      "Prepaid 50GB data plan active in over 150 countries. No expiration.",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Telebey Air Router",
    handle: "telebey-air-router",
    category: "Routers",
    description: "Portable 5G hotspot for professionals on the go.",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1544473244-f6895e691d53?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Magnetic Wireless Charger",
    handle: "magnetic-wireless-charger",
    category: "Accessories",
    description: "Fast-charging stand compatible with modern Telebey devices.",
    price: 39,
    image:
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Telebey Pro Earbuds",
    handle: "telebey-pro-earbuds",
    category: "Accessories",
    description: "Noise-cancelling wireless audio for calls and travel.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Unlimited Domestic Plan",
    handle: "unlimited-domestic-plan",
    category: "Plans",
    description: "Unlimited talk, text, and 5G data in your home country.",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=800&auto=format&fit=crop&q=60",
  },
]

export default async function seedTelebeyCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  const hasUs = regions.some((region) =>
    region.countries?.some((country) => country?.iso_2 === "us")
  )

  if (!hasUs) {
    logger.info("Creating United States region...")
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "us", provider_id: "tp_system" }],
    })
  }

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  const salesChannel = salesChannels[0]
  const shippingProfile = shippingProfiles[0]
  const stockLocation = stockLocations[0]
  if (!salesChannel || !shippingProfile || !stockLocation) {
    throw new Error("Store is missing a sales channel, shipping profile, or stock location.")
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const wanted = [...new Set(CATALOG.map((item) => item.category))]
  const missing = wanted.filter(
    (name) => !existingCategories.some((category) => category.name === name)
  )
  if (missing.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((name) => ({
          name,
          is_active: true,
        })),
      },
    })
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const categoryId = (name: string) =>
    categories.find((category) => category.name === name)?.id

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  })
  const existingHandles = new Set(existingProducts.map((product) => product.handle))
  const toCreate = CATALOG.filter((product) => !existingHandles.has(product.handle))

  if (toCreate.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((product) => ({
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryId(product.category)].filter(Boolean) as string[],
          images: [{ url: product.image }],
          thumbnail: product.image,
          options: [{ title: "Edition", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: product.handle,
              options: { Edition: "Standard" },
              prices: [
                { amount: product.price, currency_code: "usd" },
                { amount: product.price, currency_code: "eur" },
              ],
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        })),
      },
    })
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.id"],
  })
  const unstocked = inventoryItems.filter(
    (item) => !item.location_levels?.length
  )
  if (unstocked.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: unstocked.map((item) => ({
          location_id: stockLocation.id,
          inventory_item_id: item.id,
          stocked_quantity: 1000,
        })),
      },
    })
  }

  logger.info(
    `Telebey catalog ready (${toCreate.length} new products, US region ${
      hasUs ? "already present" : "created"
    }).`
  )

  // Touch the module so a cold container still resolves commerce services.
  container.resolve(Modules.PRODUCT)
}
