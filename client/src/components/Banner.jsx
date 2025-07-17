/* eslint-disable react/prop-types */
// src/components/Banner.js

export function Banner({
  logo = "/logo.svg",
  title = "ChatGPT Development Kit",
  description = "Get all the core features of the ChatGPT API for your applications – fast, simple, and efficient. With few lines of clean code, CoreGPT is a lightweight, boilerplate code that you can easily understand and replicate in your projects.",
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-green-50/50 to-white/30 p-2">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-gray-100/50 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_90%)]" />
      
      <div className="relative flex flex-col items-center justify-center text-center ">
        {/* Logo section with subtle glow effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-green-200/50 rounded-2xl blur-xl transform group-hover:scale-110 transition-transform duration-500" />
          <img
            src={logo}
            alt={`${title} Logo`}
            className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-500 p-2"
            loading="eager"
          />
        </div>

        {/* Title with gradient */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 bg-clip-text text-transparent">
            {title}
          </h1>
          
          {/* Description with improved typography */}
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Optional decorative line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full opacity-50" />
      </div>
    </div>
  );
}

/**
 * Banner.jsx
 * 
 * This component renders a promotional banner commonly used at the top of a page
 * to introduce the application or feature set. It's visually appealing with decorative
 * effects, branding logo, gradient text, and a clear description.
 * 
 * Key Features:
 * - Decorative grid background and blurred glow effect
 * - Prominent branding logo with hover animation
 * - Responsive, centered layout for title and description
 * - Gradient-styled title text for visual emphasis
 * - Tailored for landing pages or onboarding screens
 * 
 * Props:
 * - `logo` (string): URL of the logo image
 * - `title` (string): Title text displayed in large font
 * - `description` (string): Supporting text displayed under the title
 * 
 * Dependencies:
 * - Tailwind CSS (for responsive layout and animation)
 * 
 * Path: //src/components/Banner.js
 */
