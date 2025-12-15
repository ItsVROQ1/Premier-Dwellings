'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Upload, X, ArrowLeft, Save } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'PKR',
    propertyType: 'HOUSE',
    transactionType: 'SALE',
    bedrooms: '3',
    bathrooms: '2',
    totalArea: '',
    areaUnit: 'sqft',
    areaInMarla: '',
    yearBuilt: '',
    streetAddress: '',
    cityId: '',
    latitude: '',
    longitude: '',
    plotNumber: '',
    blockNumber: '',
    sector: '',
    phase: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Listing creation functionality will be implemented with API routes');
    router.push('/dashboard/listings');
  };

  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              Create New Listing
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Fill in the details to list your property
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Luxury 3 Bedroom Villa in DHA Phase 5"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property in detail..."
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="VILLA">Villa</option>
                      <option value="TOWNHOUSE">Townhouse</option>
                      <option value="CONDO">Condo</option>
                      <option value="LAND">Land</option>
                      <option value="COMMERCIAL">Commercial</option>
                      <option value="INDUSTRIAL">Industrial</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionType">Listing Type *</Label>
                    <Select
                      id="transactionType"
                      name="transactionType"
                      value={formData.transactionType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="SALE">For Sale</option>
                      <option value="RENTAL">For Rent</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="e.g., 50000000"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="totalArea">Total Area *</Label>
                    <Input
                      id="totalArea"
                      name="totalArea"
                      type="number"
                      placeholder="e.g., 2500"
                      value={formData.totalArea}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaUnit">Unit</Label>
                    <Select
                      id="areaUnit"
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleInputChange}
                    >
                      <option value="sqft">Sq. Ft</option>
                      <option value="sqm">Sq. M</option>
                      <option value="sqyd">Sq. Yd</option>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="areaInMarla">Area in Marla (Optional)</Label>
                    <Input
                      id="areaInMarla"
                      name="areaInMarla"
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.areaInMarla}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built (Optional)</Label>
                    <Input
                      id="yearBuilt"
                      name="yearBuilt"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    name="streetAddress"
                    placeholder="Street address"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cityId">City *</Label>
                    <Select
                      id="cityId"
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a city</option>
                      <option value="city-1">Lahore</option>
                      <option value="city-2">Karachi</option>
                      <option value="city-3">Islamabad</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (Optional)</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="31.5204"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="plotNumber">Plot Number</Label>
                    <Input
                      id="plotNumber"
                      name="plotNumber"
                      placeholder="Plot #"
                      value={formData.plotNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockNumber">Block Number</Label>
                    <Input
                      id="blockNumber"
                      name="blockNumber"
                      placeholder="Block"
                      value={formData.blockNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      name="sector"
                      placeholder="Sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase</Label>
                    <Input
                      id="phase"
                      name="phase"
                      placeholder="Phase"
                      value={formData.phase}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name (Optional)</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Contact person name"
                    value={formData.contactName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="contact@example.com"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    Image upload functionality will be implemented
                  </p>
                  <p className="text-xs text-slate-500">Maximum 20 images, up to 10MB each</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </div>
          </form>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
