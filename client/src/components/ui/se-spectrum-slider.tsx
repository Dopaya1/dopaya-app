import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

// Import logo examples
import AppleLogo from "@/assets/SE_explanation/Apple.png";
import NvidiaLogo from "@/assets/SE_explanation/Nvidia.png";
import RedCrossLogo from "@/assets/SE_explanation/Red Cross.png";
import SaveTheChildrenLogo from "@/assets/SE_explanation/Save the children.png";
import GrameenBankLogo from "@/assets/SE_explanation/Grameen Bank.png";
import TOMSLogo from "@/assets/SE_explanation/TOMS.png";
import DopayaLogo from "@/assets/Dopaya Logo.png";

const spectrumStates = [
  {
    // Not for Profit
    bgColor: "#eff6ff",
    indicatorColor: "#2563eb",
    pathColor: "#2563eb",
    iconColor: "#2563eb",
    titleColor: "#2563eb",
    trackColor: "#dbeafe",
    iconSize: 40,
    iconBorderRadius: "100%",
    iconBg: "#2563eb",
    iconRotate: 0,
    indicatorRotate: 0,
    categoryText: "NGO",
    categoryColor: "#2563eb",
    categoryX: "0%",
    indicatorLeft: "0%",
    explanation: "Mission-driven organizations that rely on donations and grants to create social impact. Extremely important for first aid, emergency response, and implementation partnerships.",
    examples: [
      { name: "Red Cross", logo: RedCrossLogo },
      { name: "Save the Children", logo: SaveTheChildrenLogo }
    ]
  },
  {
    // Impact-driven Business
    bgColor: "#fff7ed",
    indicatorColor: "#f2662d",
    pathColor: "#f2662d", 
    iconColor: "#f2662d",
    titleColor: "#f2662d",
    trackColor: "#fed7aa",
    iconSize: 60,
    iconBorderRadius: "100%",
    iconBg: "#f2662d",
    iconRotate: 0,
    indicatorRotate: 0,
    categoryText: "Impact-driven Business",
    categoryColor: "#f2662d",
    categoryX: "-100%",
    indicatorLeft: "50%",
    explanation: "Organizations that combine social mission with business sustainability. Create lasting impact through market-based solutions and sustainable revenue models.",
    examples: [
      { name: "Grameen Bank", logo: GrameenBankLogo },
      { name: "TOMS", logo: TOMSLogo }
    ]
  },
  {
    // For Profit Business
    bgColor: "#f0fdf4",
    indicatorColor: "#16a34a",
    pathColor: "#16a34a",
    iconColor: "#16a34a", 
    titleColor: "#16a34a",
    trackColor: "#bbf7d0",
    iconSize: 50,
    iconBorderRadius: "100%",
    iconBg: "#16a34a",
    iconRotate: 0,
    indicatorRotate: 0,
    categoryText: "For Profit Business",
    categoryColor: "#16a34a",
    categoryX: "-200%",
    indicatorLeft: "100%",
    explanation: "Profit-driven businesses focused on market success and shareholder returns. Social impact primarily through corporate social responsibility and sustainable business practices.",
    examples: [
      { name: "Apple", logo: AppleLogo },
      { name: "Nvidia", logo: NvidiaLogo }
    ]
  },
];

const HandDrawnSmileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path
      d="M10 30 Q50 70 90 30"
      strokeWidth="12"
      strokeLinecap="round"
    />
  </motion.svg>
);

const SmileyIcon = ({ happiness = 0.5, ...props }: React.SVGProps<SVGSVGElement> & { happiness?: number }) => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Face circle */}
    <motion.circle
      cx="50"
      cy="50"
      r="45"
      strokeWidth="4"
      fill="none"
    />
    {/* Eyes */}
    <motion.circle
      cx="35"
      cy="40"
      r="6"
      fill="currentColor"
    />
    <motion.circle
      cx="65"
      cy="40"
      r="6"
      fill="currentColor"
    />
    {/* Smile - changes based on happiness */}
    <motion.path
      d={`M 30 65 Q 50 ${65 + (happiness - 0.5) * 20} 70 65`}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </motion.svg>
);

export interface SESpectrumSliderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SESpectrumSlider = React.forwardRef<HTMLDivElement, SESpectrumSliderProps>(
  ({ className, ...props }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(1); // Start with Impact-driven Business
    const currentAnim = spectrumStates[selectedIndex];
    const transition = { type: "spring", stiffness: 300, damping: 30 };

    return (
      <motion.div
        ref={ref}
        className={`relative flex w-full items-center justify-center overflow-hidden py-8 md:py-12 lg:py-14 ${className}`}
        animate={{ backgroundColor: currentAnim.bgColor }}
        transition={transition}
        {...props}
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-black">
              Self-sustainable businesses driving long-term change
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              To make impact investments more effective, we support social enterprises that combine nonprofit missions with business sustainability.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 md:gap-12 lg:gap-16">
            {/* Headlines above slider */}
            <div className="w-full max-w-4xl">
              <div className="flex items-end justify-between w-full px-4 md:px-8">
                <div className="flex-1 text-left">
                  <motion.span 
                    className={`text-base md:text-lg lg:text-xl ${selectedIndex === 0 ? 'font-bold' : 'font-medium'}`}
                    animate={{ 
                      color: selectedIndex === 0 ? "#2563eb" : "#9ca3af",
                      opacity: selectedIndex === 0 ? 1 : 0.6
                    }}
                    transition={transition}
                  >
                    Typically NGOs
                  </motion.span>
                </div>
                
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg shadow-sm p-3 md:p-4 flex items-center justify-center"
                      animate={{ 
                        opacity: selectedIndex === 1 ? 1 : 0.6,
                        scale: selectedIndex === 1 ? 1 : 0.9
                      }}
                      transition={transition}
                    >
                      <img 
                        src={DopayaLogo} 
                        alt="Dopaya"
                        className="max-w-full max-h-full object-contain"
                      />
                    </motion.div>
                    <motion.span 
                      className={`text-base md:text-lg lg:text-xl ${selectedIndex === 1 ? 'font-bold' : 'font-medium'}`}
                      animate={{ 
                        color: selectedIndex === 1 ? currentAnim.titleColor : "#9ca3af",
                        opacity: selectedIndex === 1 ? 1 : 0.6
                      }}
                      transition={transition}
                    >
                      Social Enterprises
                    </motion.span>
                  </div>
                </div>
                
                <div className="flex-1 text-right">
                  <motion.span 
                    className={`text-base md:text-lg lg:text-xl ${selectedIndex === 2 ? 'font-bold' : 'font-medium'}`}
                    animate={{ 
                      color: selectedIndex === 2 ? "#16a34a" : "#9ca3af",
                      opacity: selectedIndex === 2 ? 1 : 0.6
                    }}
                    transition={transition}
                  >
                    For Profit Business
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Slider Track with Clickable Buttons */}
            <div className="w-full max-w-4xl">
              <div className="relative flex w-full items-center justify-center">
                <motion.div
                  className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full"
                  animate={{ backgroundColor: currentAnim.trackColor }}
                  transition={transition}
                />
                
                {/* Clickable buttons */}
                {spectrumStates.map((_, i) => (
                  <button
                    key={i}
                    className="z-[2] h-6 w-6 md:h-7 md:w-7 rounded-full absolute top-1/2 -translate-y-1/2 border-3 border-white shadow-md hover:scale-110 transition-transform"
                    onClick={() => setSelectedIndex(i)}
                    style={{ 
                      left: `${i * 50}%`,
                      backgroundColor: i === selectedIndex ? currentAnim.indicatorColor : currentAnim.trackColor,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
                
                <motion.div
                  className="absolute z-[3] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full p-2 shadow-lg"
                  animate={{
                    left: currentAnim.indicatorLeft,
                    rotate: currentAnim.indicatorRotate,
                    backgroundColor: currentAnim.indicatorColor,
                  }}
                  transition={transition}
                >
                  <HandDrawnSmileIcon
                    style={{ color: 'white' }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Legend below slider */}
            <div className="w-full max-w-4xl -mt-2">
              <div className="flex items-center justify-between w-full px-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Not for Profit</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">For Profit</span>
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description below slider */}
            <div className="w-full max-w-4xl">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.p
                  className="text-lg text-black max-w-2xl mx-auto leading-relaxed mb-8"
                  transition={transition}
                >
                  {currentAnim.explanation}
                </motion.p>
                
                {/* Logo Examples */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center gap-6"
                >
                  <h4 className="text-lg font-semibold text-gray-700">Examples</h4>
                  <div className="flex justify-center items-center gap-8 flex-wrap">
                    {currentAnim.examples.map((example, index) => (
                      <div key={index} className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-white rounded-lg shadow-sm p-3 flex items-center justify-center">
                          <img 
                            src={example.logo} 
                            alt={example.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{example.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

SESpectrumSlider.displayName = "SESpectrumSlider";

export default SESpectrumSlider;
