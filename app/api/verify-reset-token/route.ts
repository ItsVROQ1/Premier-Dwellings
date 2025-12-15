import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would verify the token against your database
    // For now, we'll assume any token is valid for demo purposes
    // You would typically store reset tokens in a database with expiration
    
    return NextResponse.json(
      { message: 'Token is valid' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}