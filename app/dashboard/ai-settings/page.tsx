'use client';

import { useState, useEffect } from 'react';
import { ShellMain, ShellHeader, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

export default function AISettingsPage() {
  const [config, setConfig] = useState({
    enabled: true,
    autoGreet: true,
    suggestListings: true,
    moderateContent: true,
    customGreeting: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/ai-assistant?userId=demo-agent-id');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-agent-id',
          ...config,
        }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ShellMain>
        <ShellContainer>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </ShellContainer>
      </ShellMain>
    );
  }

  return (
    <ShellMain>
      <ShellContainer>
        <ShellHeader
          heading="AI Assistant Settings"
          text="Configure your AI assistant to help with inquiries and customer engagement"
        />

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assistant Configuration</CardTitle>
              <CardDescription>
                Control how the AI assistant interacts with potential buyers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Enable AI Assistant</div>
                  <div className="text-sm text-muted-foreground">
                    Turn on automated responses to inquiries
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Auto-Greet New Inquiries</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically send a welcome message to new chats
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoGreet: !config.autoGreet })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.autoGreet ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.autoGreet ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Suggest Similar Listings</div>
                  <div className="text-sm text-muted-foreground">
                    AI will recommend similar properties to buyers
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, suggestListings: !config.suggestListings })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.suggestListings ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.suggestListings ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Content Moderation</div>
                  <div className="text-sm text-muted-foreground">
                    Flag inappropriate messages before they reach you
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, moderateContent: !config.moderateContent })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.moderateContent ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.moderateContent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <Label htmlFor="customGreeting">Custom Greeting (Optional)</Label>
                <Textarea
                  id="customGreeting"
                  value={config.customGreeting || ''}
                  onChange={(e) => setConfig({ ...config, customGreeting: e.target.value })}
                  placeholder="Enter a custom greeting message for new inquiries..."
                  rows={4}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Leave empty to use the default AI-generated greeting
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
                {message && (
                  <span className={`text-sm ${message.includes('success') ? 'text-success' : 'text-danger'}`}>
                    {message}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>• Instant Responses:</strong> The AI assistant responds to buyer inquiries immediately,
                even when you're offline.
              </div>
              <div>
                <strong>• Smart Suggestions:</strong> Based on the listing being viewed, the AI can suggest
                similar properties that match the buyer's criteria.
              </div>
              <div>
                <strong>• Content Safety:</strong> All messages are automatically checked for inappropriate
                content before being delivered to you.
              </div>
              <div>
                <strong>• Always in Control:</strong> You can review all AI conversations and take over
                manually at any time.
              </div>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
