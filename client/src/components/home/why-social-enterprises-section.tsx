import { CheckCircle, TrendingUp, Eye, Users } from "lucide-react";

export function WhySocialEnterprisesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a1a3a] mb-4">
            Why Social Enterprises?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Understanding the difference between sustainable solutions and traditional approaches
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Traditional NGOs Column */}
          <div className="bg-white rounded-lg p-8 shadow-sm border-l-4 border-gray-300">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <Users className="h-6 w-6 mr-3 text-gray-500" />
              Traditional NGOs
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600">Need recurring donations to operate</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600">Often create dependency on aid</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600">Limited transparency in fund usage</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-600">Focus on emergency aid and relief</span>
              </li>
            </ul>
          </div>

          {/* Social Enterprises Column */}
          <div className="bg-white rounded-lg p-8 shadow-sm border-l-4 border-[#e94e35]">
            <h3 className="text-xl font-bold text-[#1a1a3a] mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-[#e94e35]" />
              Social Enterprises
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Self-sustaining business models</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Build independence and empowerment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Full impact tracking and transparency</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Long-term solution building</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Context */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-start">
            <Eye className="h-6 w-6 text-blue-500 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Both Have Essential Roles</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                NGOs excel at emergency relief and immediate aid during crises. Social enterprises create sustainable solutions that grow impact over time. 
                Our social enterprises have sustained meaningful impact for 2+ years on average, building lasting change rather than temporary relief.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}