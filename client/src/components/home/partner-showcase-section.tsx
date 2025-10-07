import { useState } from "react";
import { ExternalLink, Shield, Award, Leaf } from "lucide-react";
import bonjiLogo from "@/assets/Bonji - beyond just natural.png";

export function PartnerShowcaseSection() {
  const [selectedProduct, setSelectedProduct] = useState(0);

  // Sample products - Replace with real Bonji partnership data
  const products = [
    {
      name: "Organic Face Serum",
      description: "Natural skincare with verified sustainable ingredients",
      pointCost: "[Points based on real partnership terms]",
      benefit: "[Actual discount available to members]",
      image: "/placeholder-product-1.jpg"
    },
    {
      name: "Herbal Body Oil",
      description: "Traditional Ayurvedic formulation for wellness",
      pointCost: "[Points based on real partnership terms]",
      benefit: "[Actual discount available to members]",
      image: "/placeholder-product-2.jpg"
    },
    {
      name: "Natural Lip Care",
      description: "Chemical-free lip care with organic ingredients",
      pointCost: "[Points based on real partnership terms]",
      benefit: "[Actual discount available to members]",
      image: "/placeholder-product-3.jpg"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a1a3a] mb-4">
            Partner Spotlight
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Featuring verified sustainable brands that align with our mission
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 max-w-5xl mx-auto">
          {/* Brand Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <img 
                src={bonjiLogo} 
                alt="Bonji - Beyond Just Natural" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#1a1a3a] mb-2">
                Bonji - Beyond Just Natural
              </h3>
              <p className="text-gray-600 mb-4">
                Committed to creating natural, sustainable wellness products that honor traditional knowledge 
                while meeting modern quality standards. Their mission aligns with our vision of supporting 
                enterprises that create lasting positive impact.
              </p>
              <a 
                href="https://bonji.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#e94e35] hover:text-[#cc4530] font-medium"
              >
                Visit Bonji Website
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>

          {/* Partnership Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 text-center">
              <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Sustainability Focus</h4>
              <p className="text-sm text-gray-600">Organic ingredients, eco-friendly packaging</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Quality Verified</h4>
              <p className="text-sm text-gray-600">Rigorous testing and quality assurance</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Partnership Verified</h4>
              <p className="text-sm text-gray-600">Transparent terms and authentic collaboration</p>
            </div>
          </div>

          {/* Product Showcase */}
          <div>
            <h4 className="text-lg font-semibold text-[#1a1a3a] mb-4">
              Available to Community Members
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 border-2 ${
                    selectedProduct === index 
                      ? 'border-[#e94e35] shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProduct(index)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Product Image</span>
                  </div>
                  <h5 className="font-medium text-gray-800 mb-2">{product.name}</h5>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      <strong>Points:</strong> {product.pointCost}
                    </p>
                    <p className="text-xs text-[#e94e35]">
                      <strong>Benefit:</strong> {product.benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How We Verify Partners */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-[#1a1a3a] mb-3">
              How We Verify Partners
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="mb-2">• Sustainability credentials and practices review</p>
                <p className="mb-2">• Product quality and safety verification</p>
              </div>
              <div>
                <p className="mb-2">• Transparent partnership terms and pricing</p>
                <p className="mb-2">• Alignment with our social impact mission</p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All partnership terms and benefits shown are based on verified agreements. 
              Actual discounts and point costs will be confirmed at launch with real partnership data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}