import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Pizza,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 pt-20 text-white">
      <div className="page-shell">
        <div className="grid grid-cols-1 gap-14 pb-14 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-7">
            <div className="flex items-center">
              <div className="rounded-[1.2rem] bg-gradient-to-br from-[#FF4F40] to-[#E63E30] p-3 text-white shadow-lg shadow-[#FF4F40]/20">
                <Pizza size={22} fill="currentColor" />
              </div>
              <div className="ml-3">
                <span className="font-display block text-3xl font-bold tracking-tight">
                  Slice<span className="text-[#FF4F40]">Hub</span>
                </span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Delivery Marketplace
                </span>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              A cleaner food ordering workspace for customers, sellers, and
              admins. Browse local restaurants, manage fulfillment, and keep the
              full flow visible in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-primary/30 hover:bg-primary hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-[#FF4F40]/80">
              Explore
            </h4>
            <ul className="mt-7 space-y-4 text-sm text-slate-400">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="transition hover:text-white">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="transition hover:text-white">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-[#FF4F40]/80">
              Workspaces
            </h4>
            <ul className="mt-7 space-y-4 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="transition hover:text-white">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <Link to="/seller/orders" className="transition hover:text-white">
                  Seller Orders
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="transition hover:text-white">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-[#FF4F40]/80">
              Contact
            </h4>
            <ul className="mt-7 space-y-5 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[#FF4F40]" />
                <span>123 Foodie Street, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#FF4F40]" />
                <a href="tel:+94112345678" className="transition hover:text-white">
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#FF4F40]" />
                <a
                  href="mailto:support@slicehub.com"
                  className="transition hover:text-white"
                >
                  support@slicehub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-divider" />

        <div className="flex flex-col gap-4 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 SliceHub. Built for a polished end-to-end demo.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/restaurants" className="transition hover:text-white">
              Browse
            </Link>
            <Link to="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <a href="mailto:support@slicehub.com" className="transition hover:text-white">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
