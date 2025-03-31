"use client";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, Users } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white text-blue-950 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Farova Logo" className="w-52 h-28" />
        </div>
        <div className="space-x-6 hidden md:flex">
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 hover:text-blue-950 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-blue-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 hover:text-blue-950 transition-colors"
          >
            Register
          </button>
        </div>
        <div className="md:hidden flex items-center">
          <button className="text-blue-950 hover:text-yellow focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-blue-950 text-white py-20 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://plus.unsplash.com/premium_photo-1726862923860-85b81439d225?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGJsYWNrJTIwY29tbXVuaXR5fGVufDB8fDB8fHww"
            alt="Community Support"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Effective as of 1st April 2025
          </p>
        </div>
      </header>

      {/* Privacy Policy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-950">Our Privacy Policy</h2>
          <div className="space-y-6">
            <p className="text-gray-700">
              <strong>Effective Date:</strong> 1st April 2025
            </p>
            <p className="text-gray-700">
              <strong>1. Introduction</strong>
            </p>
            <p className="text-gray-700">
              Farova Welfare ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information in accordance with the <strong>Data Protection Act, 2019</strong> of Kenya.
            </p>
            <p className="text-gray-700">
              <strong>2. Information We Collect</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li><strong>Personal Data:</strong> We may collect personal identifiers such as your name, email address, phone number, and physical address when you interact with our services.</li>
              <li><strong>Usage Data:</strong> Information about your interactions with our website, including IP addresses, browser types, and pages visited.</li>
            </ul>
            <p className="text-gray-700">
              <strong>3. How We Use Your Information</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you, including customer service and support.</li>
              <li>Ensure compliance with legal obligations.</li>
            </ul>
            <p className="text-gray-700">
              <strong>4. Legal Basis for Processing</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li><strong>Consent:</strong> When you have given clear consent for us to process your personal data for a specific purpose.</li>
              <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of a contract with you.</li>
              <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with a legal obligation.</li>
            </ul>
            <p className="text-gray-700">
              <strong>5. Data Sharing and Disclosure</strong>
            </p>
            <p className="text-gray-700">
              We do not sell or rent your personal data. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li><strong>Service Providers:</strong> Third parties who perform services on our behalf, under confidentiality agreements.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights.</li>
            </ul>
            <p className="text-gray-700">
              <strong>6. Data Security</strong>
            </p>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-gray-700">
              <strong>7. Your Rights</strong>
            </p>
            <p className="text-gray-700">
              Under the Data Protection Act, 2019, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Access your personal data.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to the processing of your personal data.</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, please contact us at <a href="mailto:info@farova.co.ke" className="text-blue-950 underline">info@farova.co.ke</a>.
            </p>
            <p className="text-gray-700">
              <strong>8. Changes to This Privacy Policy</strong>
            </p>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. We will notify you of any significant changes through our website or other communication channels.
            </p>
            <p className="text-gray-700">
              <strong>9. Contact Us</strong>
            </p>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              Farova Welfare<br />
              Moi Avenue, Nairobi<br />
              <a href="mailto:info@farova.co.ke" className="text-blue-950 underline">info@farova.co.ke</a><br />
              +254795958448
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Farova Welfare</h3>
              <p className="text-gray-300">Empowering Communities. Enhancing Lives.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/benefits" className="text-gray-300 hover:text-yellow transition-colors">Benefits</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-yellow transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-yellow transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="text-gray-300">info@farova.co.ke</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-gray-300">+254795958448</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-gray-300">Moi Avenue, Nairobi</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-yellow transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-yellow transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-yellow transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">© 2025 Farova Welfare. All rights reserved. Powered by Diversiworks Times Group</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
