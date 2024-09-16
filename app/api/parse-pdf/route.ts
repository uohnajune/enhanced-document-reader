import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('Received request to parse PDF')
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({ error: 'Invalid file type. Please upload a PDF.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('File converted to Buffer')

    const data = await pdfParse(buffer)
    console.log('PDF parsed successfully')

    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error('Error parsing PDF:', error)
    return NextResponse.json({ error: 'Error parsing PDF: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
