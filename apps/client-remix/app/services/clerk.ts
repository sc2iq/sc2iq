import { createClerkClient } from "@clerk/remix/api.server"

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

export { clerkClient }

