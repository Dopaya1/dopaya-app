import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Gift } from "lucide-react";

export function ImpactValueDemo() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark font-heading mb-4">
            Your Impact Journey
          </h2>
          <p className="text-lg text-neutral max-w-2xl mx-auto">
            See how your donation creates real impact while earning you rewards
          </p>
        </div>

        {/* Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Step 1: You Invest */}
          <Card className="text-center p-6 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">You Invest</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">$100</div>
              <p className="text-sm text-neutral">
                Support a social enterprise fighting poverty
              </p>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-8 w-8 text-gray-400" />
          </div>

          {/* Step 2: Impact Created */}
          <Card className="text-center p-6 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Impact Created</h3>
              <div className="text-lg font-bold text-green-600 mb-1">25 People</div>
              <div className="text-sm text-green-600 mb-2">Access to Clean Water</div>
              <p className="text-sm text-neutral">
                Verified impact tracking with real outcomes
              </p>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-8 w-8 text-gray-400" />
          </div>

          {/* Step 3: You Receive */}
          <Card className="text-center p-6 bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">You Receive</h3>
              <div className="text-lg font-bold text-purple-600 mb-1">$120 Value</div>
              <div className="text-sm text-purple-600 mb-2">Brand Rewards</div>
              <p className="text-sm text-neutral">
                Discounts, products, and exclusive experiences
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Summary */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
            <h4 className="font-semibold text-gray-800 mb-3">Value Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Your donation:</span>
                <span className="font-bold">$100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Social impact created:</span>
                <span className="font-bold text-green-600">25 people helped</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rewards received:</span>
                <span className="font-bold text-purple-600">$120 value</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Net result:</span>
                <span className="font-bold text-green-700">+$20 value + impact</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral mt-4 max-w-md mx-auto">
            *Example based on current partner network. Actual impact and rewards vary by project and time.
          </p>
        </div>
      </div>
    </section>
  );
}