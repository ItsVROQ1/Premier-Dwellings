'use client';

import { useState } from 'react';
import { ShellMain, ShellHeader, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';

export default function OverlaysManagementPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    cityId: '',
    name: '',
    geoJsonData: '',
    metadata: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      const response = await fetch('/api/society-overlays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Overlay uploaded successfully!');
        setFormData({
          cityId: '',
          name: '',
          geoJsonData: '',
          metadata: '',
        });
      } else {
        setMessage('Failed to upload overlay');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ShellMain>
      <ShellContainer>
        <ShellHeader
          heading="Society Overlays Management"
          text="Upload and manage GeoJSON overlays for societies and housing schemes"
        />

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Overlay</CardTitle>
              <CardDescription>
                Upload GeoJSON data for society boundaries. You can create GeoJSON using tools like geojson.io
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cityId">City ID</Label>
                  <Input
                    id="cityId"
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    placeholder="Enter city ID"
                    required
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    The ID of the city this overlay belongs to
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Society Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., DHA Phase 5, Bahria Town Sector C"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="geoJsonData">GeoJSON Data</Label>
                  <Textarea
                    id="geoJsonData"
                    value={formData.geoJsonData}
                    onChange={(e) => setFormData({ ...formData, geoJsonData: e.target.value })}
                    placeholder='{"type": "Feature", "geometry": {...}, "properties": {...}}'
                    rows={10}
                    required
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Paste your GeoJSON Feature or FeatureCollection here
                  </div>
                </div>

                <div>
                  <Label htmlFor="metadata">Metadata (Optional)</Label>
                  <Textarea
                    id="metadata"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder='{"developer": "...", "established": "..."}'
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Additional information as JSON
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Overlay
                      </>
                    )}
                  </Button>
                  {message && (
                    <span className={`text-sm ${message.includes('success') ? 'text-success' : 'text-danger'}`}>
                      {message}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Create GeoJSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>1. Visit geojson.io</strong>
                <p className="text-muted-foreground">Go to https://geojson.io to create your overlay</p>
              </div>
              <div>
                <strong>2. Draw the boundary</strong>
                <p className="text-muted-foreground">Use the polygon tool to draw the society boundary on the map</p>
              </div>
              <div>
                <strong>3. Add properties</strong>
                <p className="text-muted-foreground">
                  In the right panel, add a "name" property with the society name
                </p>
              </div>
              <div>
                <strong>4. Copy the GeoJSON</strong>
                <p className="text-muted-foreground">Copy the entire JSON from the right panel and paste it above</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
