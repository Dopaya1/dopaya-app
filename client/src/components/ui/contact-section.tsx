import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { TextArcEffect } from './text-arc-effect';

export function ContactSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Let's Build the Future of Impact Together
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to join our mission? Have questions about the platform? 
            I'd love to hear from you and discuss how we can work together.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <img 
              src="/src/assets/Patrick Widmann_1749545204060.png" 
              alt="Patrick - Building Dopaya" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Middle - About Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg flex flex-col"
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-900">About Me</h3>
            <p className="text-gray-700 leading-relaxed flex-grow">
              I'm Patrick, building Dopaya. Like you, I believe in sustainable solutions over dependency-creating aid. 
              I'm passionate about making impact funding more efficient and transparent. Let's connect and see how we can work together to create real change.
            </p>
          </motion.div>

          {/* Right side - Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg flex flex-col"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Get in Touch
            </h3>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a 
                    href="mailto:hello@dopaya.com" 
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    hello@dopaya.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">LinkedIn</p>
                  <a 
                    href="https://linkedin.com/in/patrick-dopaya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Connect with me
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Instagram</p>
                  <a 
                    href="https://instagram.com/dopayasocial" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    @dopayasocial
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Quick Chat</p>
                  <a 
                    href="https://calendly.com/dopaya/vc-30" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Schedule a call
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
