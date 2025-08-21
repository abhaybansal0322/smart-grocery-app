import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const productId = String(formData.get('productId') || '')
    const alt = (formData.get('alt') as string) || undefined
    const isPrimary = (formData.get('isPrimary') as string) === 'true'

    if (!file || !productId) {
      return NextResponse.json({ error: 'file and productId are required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await fs.mkdir(uploadsDir, { recursive: true })

    const ext = path.extname(file.name) || '.jpg'
    const filename = `${productId}-${Date.now()}${ext}`
    const filepath = path.join(uploadsDir, filename)
    await fs.writeFile(filepath, buffer)

    const publicUrl = `/uploads/products/${filename}`

    // Read-modify-write images array
    const Products = await getCollection('Product')
    const current = await Products.findOne<any>({ id: productId } as any)
    const currentImages = (current as any)?.images || []
    const newImage = { url: publicUrl, alt, isPrimary }
    const nextImages = Array.isArray(currentImages) ? [...currentImages, newImage] : [newImage]

    await Products.updateOne(
      { id: productId } as any,
      { $set: { images: nextImages, imageUrl: isPrimary ? publicUrl : current?.imageUrl } }
    )

    return NextResponse.json({
      message: 'Image uploaded successfully',
      image: newImage,
      productId,
      url: publicUrl
    })
  } catch (error) {
    console.error('Error uploading product image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: 'Upload failed', details: errorMessage }, { status: 500 })
  }
}


