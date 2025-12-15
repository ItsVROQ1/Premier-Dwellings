'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { idVerificationSchema } from '@/lib/validations'
// Using string literals instead of enums for SQLite compatibility

export default function VerifyPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<{
    frontImage?: string
    backImage?: string
    governmentId?: string
  }>({})
  const [formData, setFormData] = useState({
    documentType: 'CNIC',
    cnic: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [uploadingFiles, setUploadingFiles] = useState<{
    front?: boolean
    back?: boolean
    governmentId?: boolean
  }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const uploadFile = async (file: File, type: 'front' | 'back' | 'governmentId') => {
    setUploadingFiles(prev => ({ ...prev, [type]: true }))
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(prev => ({ ...prev, [`${type}Image`]: data.url }))
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ 
        root: ['File upload failed. Please try again.'] 
      })
    } finally {
      setUploadingFiles(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'governmentId') => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file, type)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = idVerificationSchema.parse({
        ...formData,
        ...uploadedFiles,
      })
      
      const response = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        setCurrentStep(2)
        // Refresh session to update verification status
        await update()
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

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">ID Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload your identification documents to verify your account
          </p>
        </div>

        {currentStep === 1 && (
          <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="CNIC">CNIC (Computerized National Identity Card)</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="OTHER_ID">Other ID</option>
                  </select>
                </div>

                {formData.documentType === 'CNIC' && (
                  <div>
                    <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                      CNIC Number
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
                    <p className="mt-1 text-xs text-gray-500">Format: 42101-1234567-1</p>
                    {errors.cnic && <p className="mt-1 text-sm text-red-600">{errors.cnic[0]}</p>}
                  </div>
                )}

                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.documentType === 'CNIC' ? 'Front Side of CNIC' : 'Front Side of Document'}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {uploadedFiles.frontImage ? (
                        <div className="relative">
                          <img 
                            src={uploadedFiles.frontImage} 
                            alt="Front ID" 
                            className="mx-auto h-32 w-auto rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedFiles(prev => ({ ...prev, frontImage: undefined }))}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="front-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload a file</span>
                              <input
                                id="front-upload"
                                name="front-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleFileChange(e, 'front')}
                                disabled={uploadingFiles.front}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                      {uploadingFiles.front && (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.frontImage && <p className="mt-1 text-sm text-red-600">{errors.frontImage[0]}</p>}
                </div>

                {/* Back Image Upload (for CNIC) */}
                {formData.documentType === 'CNIC' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Back Side of CNIC
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {uploadedFiles.backImage ? (
                          <div className="relative">
                            <img 
                              src={uploadedFiles.backImage} 
                              alt="Back ID" 
                              className="mx-auto h-32 w-auto rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedFiles(prev => ({ ...prev, backImage: undefined }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="back-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input
                                  id="back-upload"
                                  name="back-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleFileChange(e, 'back')}
                                  disabled={uploadingFiles.back}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                        {uploadingFiles.back && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.backImage && <p className="mt-1 text-sm text-red-600">{errors.backImage[0]}</p>}
                  </div>
                )}

                {/* Government ID Upload (for non-CNIC) */}
                {formData.documentType !== 'CNIC' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Government ID Document
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {uploadedFiles.governmentId ? (
                          <div className="relative">
                            <img 
                              src={uploadedFiles.governmentId} 
                              alt="Government ID" 
                              className="mx-auto h-32 w-auto rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedFiles(prev => ({ ...prev, governmentId: undefined }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="government-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input
                                  id="government-upload"
                                  name="government-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleFileChange(e, 'governmentId')}
                                  disabled={uploadingFiles.governmentId}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                        {uploadingFiles.governmentId && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.governmentId && <p className="mt-1 text-sm text-red-600">{errors.governmentId[0]}</p>}
                  </div>
                )}
              </div>

              {errors.root && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errors.root[0]}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !uploadedFiles.frontImage || (formData.documentType === 'CNIC' && !uploadedFiles.backImage)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Verification Submitted</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your documents have been submitted for review. You will receive an email notification once the review is complete.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800">What happens next?</h4>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Our team will review your documents within 24-48 hours</li>
                    <li>You will receive email notifications about the review status</li>
                    <li>Once approved, you'll be able to {session.user.role === 'AGENT' ? 'post listings' : 'make inquiries'}</li>
                    <li>You can check your verification status in your profile</li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}