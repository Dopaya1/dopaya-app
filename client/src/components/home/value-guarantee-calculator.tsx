import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Gift, Zap } from "lucide-react";

export function ValueGuaranteeCalculator() {
  const [donationAmount, setDonationAmount] = useState(100);

  const impactPoints = donationAmount * 10;
  const rewardValue = donationAmount * 1.5; // 150% guarantee
  const roi = ((rewardValue - donationAmount) / donationAmount) * 100;

  const presetAmounts = [25, 50, 100, 200, 500];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-dark font-heading">
              Value Guarantee Calculator
            </h2>
          </div>
          <p className="text-lg text-neutral max-w-2xl mx-auto">
            See exactly how much value you'll receive for your social impact donation. 
            Our <strong>150% value guarantee</strong> means you get more back than you give.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Calculate Your Impact Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount ($)
              </label>
              <Input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value) || 0)}
                className="text-center text-lg font-bold"
                min="1"
                max="10000"
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={donationAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDonationAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Impact Points */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <Zap className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-800">{impactPoints.toLocaleString()}</div>
                <div className="text-sm text-amber-700 font-medium">Impact Points</div>
                <div className="text-xs text-amber-600 mt-1">Never expire</div>
              </div>

              {/* Reward Value */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">${rewardValue.toFixed(0)}</div>
                <div className="text-sm text-green-700 font-medium">Reward Value</div>
                <div className="text-xs text-green-600 mt-1">Brand discounts & experiences</div>
              </div>

              {/* ROI */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-800 mb-2">📈</div>
                <div className="text-2xl font-bold text-blue-800">{roi.toFixed(0)}%</div>
                <div className="text-sm text-blue-700 font-medium">Return Value</div>
                <div className="text-xs text-blue-600 mt-1">Guaranteed minimum</div>
              </div>
            </div>

            {/* Value Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">What You Get:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Your donation to social enterprises:</span>
                  <span className="font-bold text-gray-800">${donationAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impact Points earned (10:1 ratio):</span>
                  <span className="font-bold text-amber-700">{impactPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand rewards & experiences:</span>
                  <span className="font-bold text-green-700">${rewardValue.toFixed(0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Total Value Received:</span>
                  <span className="font-bold text-primary text-lg">${(donationAmount + rewardValue).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Development Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-800 mb-1">🚀 Launching November 2025</div>
                <div className="text-xs text-blue-600">
                  Join our waitlist to be first to access the value guarantee system
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}