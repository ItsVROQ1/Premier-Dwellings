import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Premium Estate',
  description: 'Get in touch with Premium Estate',
};

export default function ContactPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Your message..." rows={6} />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-5 w-5 text-gold-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Email</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          info@premiumestate.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-1 h-5 w-5 text-gold-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Phone</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          +92 300 1234567
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-gold-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Address</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Lahore, Pakistan
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
