'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Star,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [api, setApi] = useState<CarouselApi | null>(null)
  const router = useRouter()

  const carouselSlides = [
    {
      image: '/products/pdt1.jpeg',
      title: 'Handmade Door Mats',
      description: 'Beautiful traditional African sisal door mats crafted with precision and care. Each piece tells a story of heritage and skilled craftsmanship.',
      features: ['Traditional Techniques', 'Durable Material', 'Unique Designs']
    },
    {
      image: '/products/pdt2.jpeg',
      title: 'Artisan Chairs',
      description: 'Comfortable and stylish chairs made from premium sisal fiber. Perfect blend of tradition and modern comfort for your home.',
      features: ['Ergonomic Design', 'Premium Materials', 'Handcrafted Quality']
    },
    {
      image: '/products/pdt3.jpeg',
      title: 'Decorative Items',
      description: 'Elegant decorative pieces that add warmth and character to any space. Each item is uniquely crafted by skilled artisans.',
      features: ['Unique Designs', 'Home Decor', 'Artisan Made']
    },
    {
      image: '/products/pdt4.jpeg',
      title: 'Traditional Crafts',
      description: 'Authentic traditional African crafts that preserve cultural heritage while providing functional beauty for modern homes.',
      features: ['Cultural Heritage', 'Functional Beauty', 'Traditional Methods']
    },
    {
      image: '/products/pdt5.jpeg',
      title: 'Premium Collection',
      description: 'Our finest collection of handmade crafts, showcasing the highest level of artistry and attention to detail.',
      features: ['Premium Quality', 'Artistic Excellence', 'Limited Edition']
    },
    {
      image: '/products/pdt6.jpeg',
      title: 'Order Management',
      description: 'Track and process customer orders efficiently with our comprehensive order management system. Stay organized and never miss a sale.',
      features: ['Order Tracking', 'Customer Management', 'Inventory Control']
    },
    {
      image: '/products/pdt7.jpeg',
      title: 'Sales Analytics',
      description: 'Monitor your business growth and performance with detailed analytics and reporting tools. Make data-driven decisions.',
      features: ['Sales Reports', 'Performance Metrics', 'Growth Tracking']
    },
    {
      image: '/products/pdt8.jpeg',
      title: 'Customer Insights',
      description: 'Understand your customers and their preferences with comprehensive customer analytics and behavior tracking.',
      features: ['Customer Analytics', 'Behavior Tracking', 'Preferences']
    },
    {
      image: '/products/pdt9.jpeg',
      title: 'Secure Access',
      description: 'Protected admin portal with role-based access control. Your business data is secure with enterprise-grade security.',
      features: ['Secure Login', 'Role-Based Access', 'Data Protection']
    }
  ]


  // Auto-sliding carousel effect
  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0) // Reset to first slide
      }
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [api])

  // Track current slide
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    onSelect() // Set initial slide

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // Fade in animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    router.push('/admin/login')
  }

  const handleLogin = () => {
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden overflow-y-auto relative">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-100/40 to-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

        {/* Fixed Header with Logo, Name, and Login */}
        <div className="relative z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo and Business Name */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200">
                  <Image
                    src="/craft-logo.jpeg"
                    alt="JulieCraft Logo"
                    width={28}
                    height={28}
                    className="rounded-lg object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    JulieCraft
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Handmade Business Management</p>
                </div>
              </div>

              {/* Login Button */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleLogin}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-3 md:px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm"
                >
                  <Star className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
                <Button
                  onClick={handleGetStarted}
                  variant="outline"
                  size="sm"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 font-semibold px-3 md:px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </Button>
              </div>
            </div>
          </div>
        </div>


      <div className="relative z-10 pt-2 pb-4 min-h-screen overflow-y-auto">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Main Content Box */}
          <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-gray-200 shadow-2xl mx-2 md:mx-4 lg:mx-0 p-3 md:p-4 lg:p-6 min-h-full">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-full">
              
              {/* Left Column - Welcome Message */}
              <div className="flex items-center justify-center min-h-full">
                <div className="w-full max-w-lg min-h-full flex flex-col justify-center">
                  <div className="space-y-3 md:space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent leading-tight mb-3 md:mb-4">
                        Welcome to JulieCraft
                      </h2>
                      <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                        <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-blue-400"></div>
                        <span className="text-blue-500 font-semibold text-xs md:text-sm uppercase tracking-wider">Est. 2024</span>
                        <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-blue-400"></div>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        Professional admin portal for managing your beautiful handmade craft business with precision and care
                      </p>
                    </div>

                    {/* Welcome Description */}
                    <div className="pt-3 md:pt-4">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-blue-100">
                        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-2 md:mb-3 flex items-center">
                          <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2" />
                          Why Choose JulieCraft?
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Our comprehensive admin portal provides everything you need to manage your handmade craft business efficiently. From inventory tracking to customer management, we&apos;ve got you covered.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Carousel */}
              <div className="flex items-center justify-center min-h-full">
                <div className="w-full max-w-lg min-h-full flex flex-col justify-center">
                  <div className="relative">
                    <Carousel 
                      setApi={setApi}
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-1">
                        {carouselSlides.map((slide, index) => (
                          <CarouselItem key={index} className="pl-1">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group relative">
                              {/* Image Section */}
                              <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
                                <Image
                                  src={slide.image}
                                  alt={slide.title}
                                  fill
                                  className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                                  priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                
                                {/* Slide counter */}
                                <div className="absolute top-3 right-3">
                                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 border border-gray-200 shadow-sm">
                                    <span className="text-xs font-semibold text-gray-700">
                                      {index + 1} / {carouselSlides.length}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Category badge */}
                                <div className="absolute bottom-3 left-3">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full px-2.5 py-1 shadow-sm">
                                    <span className="text-xs font-semibold text-white uppercase tracking-wide">
                                      {index < 5 ? 'Products' : 'Admin Tools'}
                                    </span>
                                  </div>
                                </div>

                                {/* Navigation Dots Inside Carousel */}
                                <div className="absolute bottom-3 right-3">
                                  <div className="flex space-x-1">
                                    {carouselSlides.map((_, dotIndex) => (
                                      <button
                                        key={dotIndex}
                                        onClick={() => api?.scrollTo(dotIndex)}
                                        className={`transition-all duration-300 rounded-full ${
                                          dotIndex === currentSlide 
                                            ? 'w-2 h-2 bg-white shadow-md' 
                                            : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80 hover:scale-125'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content Section */}
                              <div className="p-3 md:p-4">
                                <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                  {slide.title}
                                </h4>
                                <p className="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                                  {slide.description}
                                </p>
                                
                                {/* Features */}
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  {slide.features.slice(0, 2).map((feature, featureIndex) => (
                                    <span 
                                      key={featureIndex}
                                      className="bg-blue-50 text-blue-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
