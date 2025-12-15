'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
// Using string literals instead of enums for SQLite compatibility

interface Verification {
  id: string
  documentType: string
  status: string
  frontImage?: string
  backImage?: string
  governmentId?: string
  notes?: string
  reviewedAt?: Date
  createdAt: Date
  user: {
    id: string
    name?: string
    email: string
    phone?: string
    cnic?: string
    role: string
  }
}

export default function AdminVerificationsPage() {
  const { data: session } = useSession()
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchVerifications()
  }, [filter])

  const fetchVerifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verifications?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setVerifications(data.verifications)
      }
    } catch (error) {
      console.error('Error fetching verifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationAction = async () => {
    if (!selectedVerification) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/verifications/${selectedVerification.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes,
        }),
      })

      if (response.ok) {
        await fetchVerifications()
        setSelectedVerification(null)
        setNotes('')
      }
    } catch (error) {
      console.error('Error reviewing verification:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Check if user is admin
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ID Verification Review</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve/reject user ID verification submissions
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verifications List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Verification Requests
                </h3>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : verifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No verification requests found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifications.map((verification) => (
                      <div
                        key={verification.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedVerification?.id === verification.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {verification.user.name || verification.user.email}
                            </h4>
                            <p className="text-sm text-gray-600">{verification.user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {verification.documentType} • {formatDate(verification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                              {verification.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Verification Details
                </h3>
                
                {selectedVerification ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">User Information</h4>
                      <dl className="mt-2 space-y-2">
                        <div>
                          <dt className="text-xs text-gray-500">Name</dt>
                          <dd className="text-sm text-gray-900">{selectedVerification.user.name || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900">{selectedVerification.user.email}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Phone</dt>
                          <dd className="text-sm text-gray-900">{selectedVerification.user.phone || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">CNIC</dt>
                          <dd className="text-sm text-gray-900">{selectedVerification.user.cnic || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Role</dt>
                          <dd className="text-sm text-gray-900">{selectedVerification.user.role}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Document Images */}
                    {selectedVerification.frontImage && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Document Images</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Front</p>
                            <img
                              src={selectedVerification.frontImage}
                              alt="Front ID"
                              className="w-full h-24 object-cover rounded border"
                            />
                          </div>
                          {selectedVerification.backImage && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Back</p>
                              <img
                                src={selectedVerification.backImage}
                                alt="Back ID"
                                className="w-full h-24 object-cover rounded border"
                              />
                            </div>
                          )}
                          {selectedVerification.governmentId && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 mb-1">Government ID</p>
                              <img
                                src={selectedVerification.governmentId}
                                alt="Government ID"
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {selectedVerification.status === 'PENDING' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Review Action</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setAction('approve')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              action === 'approve'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setAction('reject')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                              action === 'reject'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                        
                        <div>
                          <label htmlFor="notes" className="block text-xs text-gray-700 mb-1">
                            Review Notes
                          </label>
                          <textarea
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this decision..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <button
                          onClick={handleVerificationAction}
                          disabled={isSubmitting}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${
                            action === 'approve'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                          } disabled:opacity-50`}
                        >
                          {isSubmitting ? 'Submitting...' : `${action === 'approve' ? 'Approve' : 'Reject'} Verification`}
                        </button>
                      </div>
                    )}

                    {/* Review History */}
                    {selectedVerification.reviewedAt && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Review History</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Reviewed on {formatDate(selectedVerification.reviewedAt)}
                        </p>
                        {selectedVerification.notes && (
                          <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                            {selectedVerification.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select a verification request to review</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}