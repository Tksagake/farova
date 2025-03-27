"use client";
import { useRouter } from "next/navigation";
import { Users, Shield, BookOpen } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const benefits = [
    { title: 'Member Protection', icon: Shield, description: 'Access to legal aid, health coverage, and emergency funds.' },
    { title: 'Career & Training', icon: BookOpen, description: 'Skill workshops, mentorship, and job opportunities tailored for members.' },
    { title: 'Community Support', icon: Users, description: 'A strong network of members supporting each other’s growth and welfare.' }
  ];

  const testimonials = [
    {
      name: "Jane Doe",
      role: "Member",
      content: "Farova Welfare has been a lifesaver for me. The support and resources they provide are unmatched.",
      image: "https://via.placeholder.com/150"
    },
    {
      name: "John Smith",
      role: "Member",
      content: "The career training programs have significantly boosted my skills and confidence.",
      image: "https://via.placeholder.com/150"
    }
  ];

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
            className="bg-yellow-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-blue-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Empowering Communities with Farova Welfare</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We are dedicated to enhancing the welfare of our members through exclusive perks, financial support, and community-driven initiatives.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-yellow-400 text-blue-950 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors shadow-lg"
          >
            Join Us Today
          </button>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-950">Our Welfare Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition duration-300">
                <benefit.icon className="h-12 w-12 text-yellow-400 mb-4 mx-auto" />
                <h3 className="text-2xl font-semibold mb-2 text-blue-950 text-center">{benefit.title}</h3>
                <p className="text-gray-700 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-950">What Our Members Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-blue-950">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join Farova Welfare?</h2>
          <p className="text-xl mb-8">Take the first step towards a better future with our comprehensive welfare programs.</p>
          <button
            onClick={() => router.push("/register")}
            className="inline-block bg-yellow-400 text-blue-950 px-8 py-3 rounded-md font-semibold hover:bg-white transition shadow-lg"
          >
            Get Started
          </button>
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
                  <span className="text-gray-300">info@farovawelfare.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-gray-300">+254-702-501-135</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-gray-300">Giwa House, Moi Avenue, Nairobi</span>
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
            <p className="text-gray-300">© 2025 Farova Welfare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
