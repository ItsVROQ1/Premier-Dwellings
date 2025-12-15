import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Premium Estate</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your trusted partner in finding the perfect property
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-gold-600 dark:text-slate-400"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} Premium Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
