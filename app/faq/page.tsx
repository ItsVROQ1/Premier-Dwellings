import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'FAQ | Premium Estate',
  description: 'Frequently Asked Questions about Premium Estate',
};

const faqs = [
  {
    question: 'How do I list my property?',
    answer:
      'Create an account, navigate to your dashboard, and click "Create Listing". Fill in the property details, upload images, and submit for review.',
  },
  {
    question: 'Is there a fee to list properties?',
    answer:
      'We offer various plans including a free tier with limited listings. Premium plans provide additional features and unlimited listings.',
  },
  {
    question: 'How long does moderation take?',
    answer:
      'Our team typically reviews new listings within 24-48 hours. You will be notified once your listing is approved or if changes are needed.',
  },
  {
    question: 'Can I edit my listing after it is published?',
    answer:
      'Yes, you can edit your listings at any time from your dashboard. Major changes may require re-moderation.',
  },
  {
    question: 'How do I contact sellers or agents?',
    answer:
      'Each property listing has contact information and an inquiry form. You can reach out directly through the platform.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit cards, debit cards, and bank transfers for subscription payments.',
  },
];

export default function FAQPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Find answers to common questions about Premium Estate
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-gold-500 bg-gold-50 dark:bg-gold-950">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                Still have questions?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Can't find the answer you're looking for? Please{' '}
                <a href="/contact" className="font-semibold text-gold-600 hover:underline">
                  contact us
                </a>{' '}
                and we'll be happy to help.
              </p>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
