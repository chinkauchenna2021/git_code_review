// app/api/auth/[...auth]/route.ts
import { auth } from "@/lib/auth/better-config"
import { toNextJsHandler } from "better-auth/next-js"

const { GET, POST } = toNextJsHandler(auth)

export { GET, POST }
