"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SimpleProfilePhotoUpload } from "@/components/ui/simple-profile-photo-upload"
import { useUserProfile } from "@/lib/hooks/use-user-profile"
import { useToast } from "@/components/ui/toast"
import { 
  Save, 
  Upload, 
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Shield,
  Key,
  Bell,
  Globe,
  Settings,
  Palette,
  Loader2,
  AlertCircle
} from "lucide-react"

export default function ProfilePage() {
  const { profile, loading, updateProfile, uploadAvatar, error } = useUserProfile()
  const [photoLoading, setPhotoLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    timezone: "America/Los_Angeles",
    language: "English",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true
    }
  })

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      // Combine first_name and last_name to create full_name
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()
      
      setFormData({
        full_name: fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        timezone: profile.timezone || "America/Los_Angeles",
        language: profile.language || "English",
        notifications: profile.notifications || {
          email: true,
          push: true,
          sms: false,
          marketing: true
        }
      })
    } else if (!loading && !error) {
      // If no profile but not loading and no error, initialize with basic data
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        website: "",
        timezone: "America/Los_Angeles",
        language: "English",
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: true
        }
      })
    }
  }, [profile, loading, error])

  const handleSave = async () => {
    if (saveLoading) return // Prevent multiple saves
    
    setSaveLoading(true)
    setFormError(null)
    
    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        setFormError("Full name is required")
        return
      }
      
      if (!formData.email.trim()) {
        setFormError("Email is required")
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setFormError("Please enter a valid email address")
        return
      }

      // Split full_name into first_name and last_name
      const nameParts = formData.full_name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Prepare update data
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
        website: formData.website.trim() || null,
        timezone: formData.timezone,
        language: formData.language,
        notifications: formData.notifications,
      }

      console.log('Saving profile with data:', updateData)

      // Update profile
      const result = await updateProfile(updateData)
      
      if (result) {
        console.log('Profile updated successfully:', result)
        addToast({
          type: "success",
          title: "Profile Updated",
          description: "Your profile has been saved successfully.",
          duration: 4000
        })
      }
      
    } catch (error) {
      console.error('Error saving profile:', error)
      let errorMessage = 'Failed to save profile'
      
      if (error instanceof Error) {
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          errorMessage = 'Database access denied. Please try again or contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      setFormError(errorMessage)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleReset = () => {
    if (profile) {
      // Combine first_name and last_name to create full_name
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()
      
      setFormData({
        full_name: fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        timezone: profile.timezone || "America/Los_Angeles",
        language: profile.language || "English",
        notifications: profile.notifications || {
          email: true,
          push: true,
          sms: false,
          marketing: true
        }
      })
    }
    setFormError(null)
  }

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return
    
    try {
      setPhotoLoading(true)
      setFormError(null) // Clear any previous errors
      
      console.log('Starting photo upload...')
      const avatarUrl = await uploadAvatar(file)
      console.log('Photo uploaded successfully:', avatarUrl)
      
      addToast({
        type: "success",
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
        duration: 3000
      })
      
      // Don't refetch profile data - the uploadAvatar function already updates it
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      let errorMessage = 'Failed to upload photo'
      
      if (error instanceof Error) {
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          errorMessage = 'Storage access denied. Please try again or contact support.'
        } else if (error.message.includes('size')) {
          errorMessage = 'File size too large. Please choose a smaller image.'
        } else {
          errorMessage = error.message
        }
      }
      
      setFormError(errorMessage)
    } finally {
      setPhotoLoading(false)
    }
  }


  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile Management</h1>
              <p className="text-gray-600 mt-1 text-base">Manage your personal profile and preferences</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="bg-white hover:bg-gray-50 border-gray-300"
                disabled={saveLoading}
              >
                Reset
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
              {/* Error Display */}
              {(error || formError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 font-medium">{error || formError}</span>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-100">
                    <SimpleProfilePhotoUpload
                      currentPhoto={profile?.avatar_url}
                      currentName={profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`.trim()
                        : profile?.first_name || "User"
                      }
                      onPhotoChange={handlePhotoChange}
                      loading={photoLoading}
                      size="lg"
                    />
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        {profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}`.trim()
                          : profile?.first_name || "User"
                        }
                      </h3>
                      <p className="text-gray-600 font-medium">{profile?.email || "No email"}</p>
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                        {profile?.is_admin ? 'Admin' : 'Member'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Full Name *</label>
                      <Input 
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="h-11 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Email Address *</label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        className="h-11 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Phone Number</label>
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="h-11 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Location</label>
                      <Input 
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter your location"
                        className="h-11 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Website</label>
                      <Input 
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://your-website.com"
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Bio</label>
                    <textarea 
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base text-gray-900 resize-none"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Member Info Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Member since</span>
                        <span className="font-medium text-gray-900">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Last updated</span>
                        <span className="font-medium text-gray-900">
                          {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account status</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Timezone</label>
                      <select 
                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base text-gray-900"
                        value={formData.timezone}
                        onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      >
                        <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                        <option value="America/Denver">Mountain Time (UTC-7)</option>
                        <option value="America/Chicago">Central Time (UTC-6)</option>
                        <option value="America/New_York">Eastern Time (UTC-5)</option>
                        <option value="Europe/London">London (UTC+0)</option>
                        <option value="Europe/Paris">Paris (UTC+1)</option>
                        <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                        <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-2 block">Language</label>
                      <select 
                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base text-gray-900"
                        value={formData.language}
                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                    { key: 'push', label: 'Push Notifications', description: 'Browser push notifications', icon: Bell },
                    { key: 'sms', label: 'SMS Notifications', description: 'Text message notifications', icon: Phone },
                    { key: 'marketing', label: 'Marketing Updates', description: 'Product updates and promotions', icon: Globe },
                  ].map((notification) => {
                    const IconComponent = notification.icon
                    return (
                      <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{notification.label}</div>
                            <div className="text-sm text-gray-600">{notification.description}</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.notifications[notification.key as keyof typeof formData.notifications]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [notification.key]: e.target.checked
                              }
                            }))}
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
