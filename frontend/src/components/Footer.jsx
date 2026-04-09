import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Pizza } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-contrast text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">

          {/* Brand */}
          <div className="space-y-8">
            <div className="flex items-center group">
              <div className="bg-primary text-white p-2 rounded-2xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <Pizza size={24} />
              </div>

              <span className="ml-3 text-white text-2xl font-black tracking-tighter">
                Slice<span className="text-primary">Hub</span>
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Bringing the best local restaurants straight to your doorstep.
              Fast, fresh, and delicious. Experience the future of food delivery.
            </p>

            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-white/5 p-3 rounded-xl hover:bg-primary hover:text-white transition-all text-gray-400"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-xs text-primary">
              Quick Links
            </h4>

            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-xs text-primary">
              Categories
            </h4>

            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Pizza Delivery</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Burger Joints</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Asian Cuisine</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Desserts & Sweets</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-xs text-primary">
              Contact Us
            </h4>

            <ul className="space-y-6 text-gray-400 text-sm font-bold">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>123 Foodie St, New York, NY 10001</span>
              </li>

              <li className="flex items-center gap-4">
                <Phone size={20} className="text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>

              <li className="flex items-center gap-4">
                <Mail size={20} className="text-primary shrink-0" />
                <span>support@slicehub.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="h-px bg-white/5 mb-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs font-black uppercase tracking-widest">
          <p>© 2026 Slice Hub. All rights reserved.</p>

          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
