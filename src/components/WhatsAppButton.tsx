import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = '+8801234567890'; // Replace with real number
  const message = 'Hello! I have a query about a product.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="ml-2 hidden md:inline font-medium">Chat with us</span>
    </motion.a>
  );
};

export default WhatsAppButton;
