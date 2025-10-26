const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL || 'https://linka-q5pcpohqv-mbragis-projects.vercel.app'

export const minikitConfig = {
  accountAssociation: {
    "header": "",
    "payload": "",
    "signature": ""
  },
  miniapp: {
    version: "1",
    name: "Linka", 
    subtitle: "Discover, Chat, and Pay with Ease", 
    description: "Conversations that close onchain. Discover vendors, chat naturally, and pay with ease.",
    screenshotUrls: [],
    iconUrl: ``,
    splashImageUrl: ``,
    splashBackgroundColor: "#F6FBF4",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketplace", "chat", "payments", "base", "onchain"],
    heroImageUrl: ``, 
    tagline: "Conversations that close onchain",
    ogTitle: "Linka — Discover, Chat, and Pay with Ease",
    ogDescription: "Conversations that close onchain. Discover vendors, chat naturally, and pay with ease.",
    ogImageUrl: ``,
  },
} as const

