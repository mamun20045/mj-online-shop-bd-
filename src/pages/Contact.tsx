import React from 'react';
import { Mail, Phone, MapPin, Facebook } from 'lucide-react';

const Contact: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <p className="text-gray-600 text-lg">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Phone className="h-6 w-6" /></div>
            <div>
              <p className="font-bold text-gray-900">Phone</p>
              <p className="text-gray-600">+880 1234 567890</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Mail className="h-6 w-6" /></div>
            <div>
              <p className="font-bold text-gray-900">Email</p>
              <p className="text-gray-600">info@mjonlineshopbd.com</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Facebook className="h-6 w-6" /></div>
            <div>
              <p className="font-bold text-gray-900">Facebook</p>
              <a href="https://www.facebook.com/mjonlineshopbd1" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">mjonlineshopbd1</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><MapPin className="h-6 w-6" /></div>
            <div>
              <p className="font-bold text-gray-900">Address</p>
              <p className="text-gray-600">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
      <form className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your Name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your Email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your Message"></textarea>
        </div>
        <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors">Send Message</button>
      </form>
    </div>
  </div>
);

export default Contact;
