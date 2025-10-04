import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent runtime error modal from JSON parsing issues
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Check if it's a JSON parsing error
  if (error instanceof Error && 
      (error.message.includes('JSON') || 
       error.message.includes('Unexpected token') ||
       error.message.includes('SyntaxError'))) {
    console.error('Handled JSON parsing error:', error);
    event.preventDefault(); // Prevent the runtime error modal
    return;
  }
  
  // For other unhandled rejections, let them pass through normally
  console.error('Unhandled rejection:', error);
});

window.addEventListener('error', (event) => {
  const error = event.error;
  
  // Check if it's a JSON parsing error
  if (error instanceof Error && 
      (error.message.includes('JSON') || 
       error.message.includes('Unexpected token') ||
       error.message.includes('SyntaxError'))) {
    console.error('Handled JSON parsing error:', error);
    event.preventDefault(); // Prevent the runtime error modal
    return;
  }
});

const root = document.getElementById("root");
if (!root) throw new Error("No root element found");

document.title = "Dopaya - Make an Impact";

// Disable automatic scroll restoration to ensure pages always load from top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll to top on page load
window.scrollTo(0, 0);

createRoot(root).render(<App />);
