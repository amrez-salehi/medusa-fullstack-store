import { NextRequest, NextResponse } from "next/server"

const ADMIN_COOKIE = process.env.NODE_ENV === "production" ? "__Host-medusa-admin" : "medusa-admin"
const MAX_BODY_BYTES = 26 * 1024 * 1024
const MAX_RESPONSE_BYTES = 32 * 1024 * 1024
const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"])

class PayloadTooLargeError extends Error {}

async function readBounded(
  stream: ReadableStream<Uint8Array> | null,
  limit: number
): Promise<ArrayBuffer> {
  if (!stream) return new ArrayBuffer(0)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new PayloadTooLargeError()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const output = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output.buffer
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
  priority: "high" as const,
})

function validOrigin(request: NextRequest) {
  if (!MUTATIONS.has(request.method)) return true
  const expected = process.env.NEXT_PUBLIC_BASE_URL
  if (!expected && process.env.NODE_ENV === "production") return false
  const origin = request.headers.get("origin")
  const fetchSite = request.headers.get("sec-fetch-site")
  return origin === (expected || request.nextUrl.origin) && (!fetchSite || fetchSite === "same-origin")
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!validOrigin(request)) {
    return NextResponse.json({ message: "Request origin is not allowed" }, { status: 403 })
  }

  const { path } = await params
  if (!path?.length || path.some((segment) => !/^[A-Za-z0-9._~-]+$/.test(segment))) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 })
  }
  const apiPath = path.join("/")
  const isLogin = apiPath === "auth/user/emailpass"
  const isLogout = apiPath === "auth/logout"
  if (!isLogin && !isLogout && !apiPath.startsWith("admin/")) {
    return NextResponse.json({ message: "Route is not available" }, { status: 404 })
  }

  if (isLogout) {
    const response = NextResponse.json({ authenticated: false })
    response.cookies.set(ADMIN_COOKIE, "", cookieOptions(0))
    return response
  }

  const declaredHeader = request.headers.get("content-length")
  const declaredLength = declaredHeader === null ? 0 : Number(declaredHeader)
  if (declaredHeader !== null && (!Number.isSafeInteger(declaredLength) || declaredLength < 0)) {
    return NextResponse.json({ message: "Content-Length is invalid" }, { status: 400 })
  }
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Request body is too large" }, { status: 413 })
  }

  let body: ArrayBuffer | undefined
  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      body = await readBounded(request.body, MAX_BODY_BYTES)
    } catch (error) {
      const tooLarge = error instanceof PayloadTooLargeError
      return NextResponse.json(
        { message: tooLarge ? "Request body is too large" : "Request body could not be read" },
        { status: tooLarge ? 413 : 400 }
      )
    }
  }

  const baseURL = new URL(
    process.env.MEDUSA_BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "http://localhost:9000"
  )
  baseURL.pathname = `/${path.map(encodeURIComponent).join("/")}`
  baseURL.search = request.nextUrl.search

  const headers = new Headers({ accept: "application/json" })
  for (const name of ["content-type", "idempotency-key", "x-request-id", "x-forwarded-for"]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (token) headers.set("authorization", `Bearer ${token}`)

  let upstream: Response
  try {
    upstream = await fetch(baseURL, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    return NextResponse.json({ message: "Backend service is unavailable" }, { status: 502 })
  }

  let bytes: ArrayBuffer
  try {
    bytes = await readBounded(upstream.body, MAX_RESPONSE_BYTES)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof PayloadTooLargeError ? "Backend response is too large" : "Backend returned an invalid response" },
      { status: 502 }
    )
  }
  const responseType = upstream.headers.get("content-type") || "application/json"
  let responseBody: BodyInit = bytes
  let authenticatedToken: string | null = null
  if (isLogin && upstream.ok) {
    try {
      const payload = JSON.parse(new TextDecoder().decode(bytes)) as { token?: string }
      if (!payload.token) throw new Error("token missing")
      authenticatedToken = payload.token
      responseBody = JSON.stringify({ authenticated: true })
    } catch {
      return NextResponse.json({ message: "Invalid authentication response" }, { status: 502 })
    }
  }

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": responseType,
      ...(upstream.headers.get("x-request-id")
        ? { "X-Request-Id": upstream.headers.get("x-request-id")! }
        : {}),
    },
  })
  if (authenticatedToken) {
    response.cookies.set(ADMIN_COOKIE, authenticatedToken, cookieOptions(60 * 60))
  }
  if (upstream.status === 401) {
    response.cookies.set(ADMIN_COOKIE, "", cookieOptions(0))
  }
  return response
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
