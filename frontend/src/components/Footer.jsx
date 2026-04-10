import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Pizza } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-20 pb-10 border-t border-white/10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">

          {/* Brand */}

          <div className="space-y-8">

            <div className="flex items-center">

              <div className="bg-[#FF3B30] text-white p-2 rounded-xl shadow-lg">
                <Pizza size={22} />
              </div>

              <span className="ml-3 text-2xl font-black tracking-tight">
                Slice<span className="text-[#FF3B30]">Hub</span>
              </span>

            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Bringing the best local restaurants straight to your doorstep.
              Fast, fresh, and delicious.
            </p>

            {/* Social */}

            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-[#1a1a1a] p-3 rounded-lg hover:bg-[#FF3B30] transition-all text-gray-400 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

          </div>

          {/* Quick Links */}

          <div>
            <h4 className="text-[#FF3B30] font-bold mb-8 text-sm uppercase tracking-widest">
              Quick Links
            </h4>

            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Our Services</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          {/* Categories */}

          <div>
            <h4 className="text-[#FF3B30] font-bold mb-8 text-sm uppercase tracking-widest">
              Categories
            </h4>

            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-[#FF3B30]">Pizza Delivery</a></li>
              <li><a href="#" className="hover:text-[#FF3B30]">Burger Joints</a></li>
              <li><a href="#" className="hover:text-[#FF3B30]">Asian Cuisine</a></li>
              <li><a href="#" className="hover:text-[#FF3B30]">Desserts & Sweets</a></li>
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h4 className="text-[#FF3B30] font-bold mb-8 text-sm uppercase tracking-widest">
              Contact
            </h4>

            <ul className="space-y-6 text-gray-400 text-sm">

              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-[#FF3B30]" />
                <span>123 Foodie St, New York, NY</span>
              </li>

              <li className="flex items-center gap-4">
                <Phone size={18} className="text-[#FF3B30]" />
                <span>+1 (555) 123-4567</span>
              </li>

              <li className="flex items-center gap-4">
                <Mail size={18} className="text-[#FF3B30]" />
                <span>support@slicehub.com</span>
              </li>

            </ul>
          </div>

        </div>

        <div className="h-px bg-white/10 mb-8"></div>

        {/* Bottom */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs">

          <p>© 2026 SliceHub. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
