import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { randomUUID } from "node:crypto"
import sharp, { type Metadata } from "sharp"

const MAX_FILES = 5
const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_DECODED_PIXELS = 40_000_000
const MAX_ANIMATION_FRAMES = 100

type UploadedFile = {
  buffer: Buffer
  mimetype: string
  originalname: string
}

const detectedImageType = (buffer: Buffer) => {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { mimeType: "image/png", extension: "png" }
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" }
  }
  const signature = buffer.subarray(0, 12).toString("ascii")
  if (signature.startsWith("GIF87a") || signature.startsWith("GIF89a")) {
    return { mimeType: "image/gif", extension: "gif" }
  }
  if (signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP") {
    return { mimeType: "image/webp", extension: "webp" }
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(buffer.subarray(8, 12).toString("ascii"))
  ) {
    return { mimeType: "image/avif", extension: "avif" }
  }
  return null
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const files = ((req as MedusaRequest & { files?: UploadedFile[] }).files || [])
  if (!Array.isArray(files) || files.length === 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No files were uploaded")
  }
  if (files.length > MAX_FILES) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `A maximum of ${MAX_FILES} files is allowed`)
  }

  const validated: Array<{
    filename: string
    mimeType: string
    content: string
    access: "public"
  }> = []
  // Decode sequentially so a single authenticated request cannot force five
  // worst-case image decodes to occupy memory at the same time.
  for (const file of files) {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0 || file.buffer.length > MAX_FILE_BYTES) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Each image must be between 1 byte and 5 MiB")
    }
    const detected = detectedImageType(file.buffer)
    if (!detected || typeof file.mimetype !== "string" || file.mimetype.toLowerCase() !== detected.mimeType) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only valid JPEG, PNG, GIF, WebP, or AVIF images are allowed")
    }
    let metadata: Metadata
    try {
      metadata = await sharp(file.buffer, {
        failOn: "error",
        limitInputPixels: MAX_DECODED_PIXELS,
      }).metadata()
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The image is corrupt or exceeds the decoded-pixel limit")
    }
    const frames = metadata.pages || 1
    const frameHeight = metadata.pageHeight || metadata.height || 0
    const totalPixels = (metadata.width || 0) * frameHeight * frames
    if (
      !metadata.width ||
      !metadata.height ||
      frames > MAX_ANIMATION_FRAMES ||
      totalPixels > MAX_DECODED_PIXELS
    ) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The image dimensions or animation frame count are too large")
    }

    let normalized: Buffer
    try {
      // Re-encoding drops source metadata and trailing polyglot payloads. Sharp
      // does not copy EXIF/ICC metadata unless explicitly requested.
      normalized = await sharp(file.buffer, {
        animated: true,
        failOn: "error",
        limitInputPixels: MAX_DECODED_PIXELS,
      }).rotate().webp({ quality: 85, effort: 4 }).toBuffer()
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The image could not be safely normalized")
    }
    if (normalized.length === 0 || normalized.length > MAX_FILE_BYTES) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The normalized image exceeds 5 MiB")
    }
    validated.push({
      filename: `${randomUUID()}.webp`,
      mimeType: "image/webp",
      content: normalized.toString("base64"),
      access: "public" as const,
    })
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: { files: validated },
  })
  res.status(200).json({ files: result })
}
