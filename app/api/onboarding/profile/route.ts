import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { onboardingSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
    const validatedData = onboardingSchema.parse(body)

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: validatedData.phone,
        cnic: validatedData.cnic,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        cnic: true,
      }
    })

    // Create or update profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      create: {
        userId: session.user.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
    })

    return NextResponse.json(
      { message: 'Profile updated successfully', user },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Onboarding profile error:', error)
    
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