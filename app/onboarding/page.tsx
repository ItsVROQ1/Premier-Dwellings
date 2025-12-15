'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { onboardingSchema } from '@/lib/validations'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cnic: '',
    role: session?.user?.role || 'BUYER',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = onboardingSchema.parse(formData)
      
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        setCurrentStep(2) // Move to ID verification step
      } else {
        const data = await response.json()
        setErrors(data.errors || {})
      }
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string[]> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = [err.message]
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Navigate to ID verification page
      router.push('/verify')
    } catch (error) {
      console.error('Error proceeding to verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {currentStep} of 2: {currentStep === 1 ? 'Profile Information' : 'ID Verification'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName[0]}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName[0]}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>}
                </div>

                <div>
                  <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                    CNIC (Computerized National Identity Card)
                  </label>
                  <input
                    id="cnic"
                    name="cnic"
                    type="text"
                    required
                    value={formData.cnic}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="42101-1234567-1"
                  />
                  {errors.cnic && <p className="mt-1 text-sm text-red-600">{errors.cnic[0]}</p>}
                  <p className="mt-1 text-xs text-gray-500">Format: 42101-1234567-1</p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm"
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="AGENT">Agent</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Account type cannot be changed after registration</p>
                </div>
              </div>

              {errors.root && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errors.root[0]}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Continue to ID Verification'}
              </button>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">ID Verification Required</h3>
              <p className="mt-2 text-sm text-gray-600">
                To {formData.role === 'AGENT' ? 'post listings' : 'start making inquiries'}, you need to verify your identity.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Verification Requirements</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Clear photo of front side of CNIC</li>
                        <li>Clear photo of back side of CNIC</li>
                        {formData.role === 'AGENT' && <li>Agents require verified status to post listings</li>}
                        <li>Review typically takes 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerificationSubmit}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Redirecting...' : 'Continue to ID Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}