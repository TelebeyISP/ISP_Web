export type SitePage = {
  title: string
  href: string
  description: string
  keywords: string
}

/** Pages a shopper can open from the header search, besides Medusa products. */
export const SITE_PAGES: SitePage[] = [
  { title: "Home", href: "/", description: "Telebey wireless home", keywords: "home telecom 5g vibes" },
  { title: "Plans", href: "/plans", description: "Prepaid and postpaid mobile plans", keywords: "starter unlimited explorer data esim" },
  { title: "Shop", href: "/shop", description: "Phones, routers, and accessories", keywords: "devices store hardware" },
  { title: "Network", href: "/plans", description: "Coverage and 5G plans", keywords: "coverage network 5g signal" },
  { title: "Bring Your Phone", href: "/activate", description: "Use your phone on Telebey", keywords: "byop esim activation" },
  { title: "Activate eSIM", href: "/activate", description: "Turn on a Telebey eSIM", keywords: "activate sim qr" },
  { title: "Support", href: "/find-store", description: "Find a store or get help", keywords: "help contact support" },
  { title: "Find a Store", href: "/find-store", description: "Telebey store locator", keywords: "locator retail" },
  { title: "Cart", href: "/cart", description: "Your Medusa cart", keywords: "checkout bag" },
  { title: "Wishlist", href: "/wishlist", description: "Saved Medusa products", keywords: "heart favorites" },
  { title: "Account", href: "/account", description: "Your Telebey account", keywords: "profile mytid" },
  { title: "Billing", href: "/billing", description: "Pay your bill", keywords: "invoice payment" },
  { title: "Order History", href: "/order-history", description: "Past orders", keywords: "orders receipts" },
  { title: "Manage Data", href: "/manage-data", description: "Data usage", keywords: "usage sim" },
  { title: "Business", href: "/business", description: "Telebey for business", keywords: "enterprise company" },
  { title: "My HomeNet", href: "/homenet", description: "Home internet", keywords: "home wifi broadband" },
  { title: "Community", href: "/community", description: "Telebey community", keywords: "people profiles" },
  { title: "Sign in", href: "/auth", description: "ISP account login", keywords: "login register mytid password" },
  { title: "Privacy Policy", href: "/privacy", description: "How Telebey handles data", keywords: "privacy legal" },
  { title: "Terms of Use", href: "/terms", description: "Terms of use", keywords: "terms legal" },
  { title: "Cookies", href: "/cookies", description: "Cookie policy", keywords: "cookies" },
  { title: "Legal", href: "/legal", description: "Legal center", keywords: "legal" },
  { title: "License", href: "/license", description: "License", keywords: "license" },
]

export function searchSitePages(term: string): SitePage[] {
  const needle = term.trim().toLowerCase()
  if (needle.length < 2) return []
  return SITE_PAGES.filter((page) => {
    const haystack = `${page.title} ${page.description} ${page.keywords}`.toLowerCase()
    return haystack.includes(needle)
  }).slice(0, 6)
}
