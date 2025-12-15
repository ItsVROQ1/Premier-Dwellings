import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { idVerificationSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = idVerificationSchema.parse(body)

    // Check if user already has a pending verification
    const existingVerification = await prisma.iDVerification.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    if (existingVerification) {
      return NextResponse.json(
        { error: 'You already have a pending verification request' },
        { status: 400 }
      )
    }

    // Create verification record
    const verification = await prisma.iDVerification.create({
      data: {
        userId: session.user.id,
        documentType: validatedData.documentType,
        frontImage: validatedData.frontImage,
        backImage: validatedData.backImage,
        governmentId: validatedData.governmentId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    // Send notification email
    await sendVerificationEmail({
      email: session.user.email!,
      name: session.user.name || '',
      verificationId: verification.id,
      type: 'submitted'
    })

    return NextResponse.json(
      { message: 'Verification submitted successfully', verification },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Verification submission error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as any

    const where: any = {}
    
    // If not admin, only show user's own verifications
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else {
      // Admin can filter by status
      if (status && status !== 'ALL') {
        where.status = status
      }
    }

    const verifications = await prisma.iDVerification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cnic: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      { verifications },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}