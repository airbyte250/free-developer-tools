import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = request.nextUrl.searchParams.get('tenantId') || null

  const images = await prisma.goImage.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(images)
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('image') as File | null
  const link = (formData.get('link') as string) || '/go'
  const targetTiles = parseInt((formData.get('targetTiles') as string) || '100', 10)
  const tenantId = (formData.get('tenantId') as string) || null

  if (!file) {
    return Response.json({ error: 'No image uploaded' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const tileId = crypto.randomBytes(6).toString('hex')
  const tilesDir = path.join(process.cwd(), 'public', 'tiles', tileId)

  if (!existsSync(tilesDir)) {
    await mkdir(tilesDir, { recursive: true })
  }

  // Save original image temporarily
  const tempPath = path.join(tilesDir, 'original.tmp')
  await writeFile(tempPath, buffer)

  // Split image into tiles using sharp
  let splitResult
  try {
    const sharp = (await import('sharp')).default
    const metadata = await sharp(buffer).metadata()
    const imgWidth = metadata.width || 1920
    const imgHeight = metadata.height || 1080

    // Calculate grid
    const targetWidth = 1920
    const targetHeight = 1080
    const aspectRatio = targetWidth / targetHeight
    const cols = Math.max(1, Math.round(Math.sqrt(targetTiles * aspectRatio)))
    const rows = Math.max(1, Math.round(targetTiles / cols))
    const tileWidth = Math.floor(targetWidth / cols)
    const tileHeight = Math.floor(targetHeight / rows)
    const finalWidth = tileWidth * cols
    const finalHeight = tileHeight * rows

    // Resize image to target dimensions
    const resizedBuffer = await sharp(buffer)
      .resize(finalWidth, finalHeight, { fit: 'cover' })
      .jpeg({ quality: 65 })
      .toBuffer()

    const manifest: Array<{ f: string; r: number; c: number }> = []

    // Split into tiles
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileFileName = `${crypto.randomUUID()}.jpg`
        const tileBuffer = await sharp(resizedBuffer)
          .extract({
            left: col * tileWidth,
            top: row * tileHeight,
            width: tileWidth,
            height: tileHeight,
          })
          .jpeg({ quality: 65 })
          .toBuffer()

        await writeFile(path.join(tilesDir, tileFileName), tileBuffer)
        manifest.push({ f: tileFileName, r: row, c: col })
      }
    }

    // Shuffle manifest
    for (let i = manifest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[manifest[i], manifest[j]] = [manifest[j], manifest[i]]
    }

    // Save manifest
    await writeFile(path.join(tilesDir, 'manifest.json'), JSON.stringify(manifest))

    splitResult = {
      tileId,
      cols,
      rows,
      count: manifest.length,
      width: finalWidth,
      height: finalHeight,
      manifest,
    }
  } catch (err) {
    try { await unlink(tempPath) } catch {}
    return Response.json({ error: 'Image processing failed: ' + String(err) }, { status: 500 })
  }

  // Clean up temp file
  try { await unlink(tempPath) } catch {}

  // Save to database with tenantId
  const goImage = await prisma.goImage.create({
    data: {
      tileId: splitResult.tileId,
      link,
      cols: splitResult.cols,
      rows: splitResult.rows,
      count: splitResult.count,
      width: splitResult.width,
      height: splitResult.height,
      manifest: splitResult.manifest,
      tenantId,
    },
  })

  return Response.json({
    success: true,
    image: goImage,
    message: `Image split into ${splitResult.count} tiles`,
  })
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tileId } = await request.json()
  if (!tileId) {
    return Response.json({ error: 'No tile ID' }, { status: 400 })
  }

  // Delete from DB
  await prisma.goImage.deleteMany({ where: { tileId } })

  // Delete files
  const tilesDir = path.join(process.cwd(), 'public', 'tiles', tileId)
  if (existsSync(tilesDir)) {
    const { rm } = await import('fs/promises')
    await rm(tilesDir, { recursive: true, force: true })
  }

  return Response.json({ success: true })
}
