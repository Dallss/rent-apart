import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-8xl px-6 py-12">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
              YourBrand
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              Simple, modern platform for finding great places and experiences.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-neutral-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">

          <p>© {year} YourBrand. All rights reserved.</p>

          <div className="flex gap-4">
            <Link href="#" className="hover:text-neutral-900">Terms</Link>
            <Link href="#" className="hover:text-neutral-900">Privacy</Link>
            <Link href="#" className="hover:text-neutral-900">Cookies</Link>
          </div>

        </div>

      </div>
    </footer>
  );
}