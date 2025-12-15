import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { action, notes } = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      )
    }

    // Find the verification
    const verification = await prisma.iDVerification.findUnique({
      where: { id },
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

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    if (verification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Verification has already been reviewed' },
        { status: 400 }
      )
    }

    // Update verification status
    const updatedVerification = await prisma.iDVerification.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        notes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
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

    // If approved, update user verification status
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true }
      })
    }

    // Send notification email
    await sendVerificationEmail({
      email: verification.user.email,
      name: verification.user.name || '',
      verificationId: verification.id,
      type: action,
      notes,
    })

    return NextResponse.json(
      { 
        message: `Verification ${action}d successfully`,
        verification: updatedVerification 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}