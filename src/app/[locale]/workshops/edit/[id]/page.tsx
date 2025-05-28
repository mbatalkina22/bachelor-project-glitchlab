"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import HeroButton from "@/components/HeroButton";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

// Add instructor interface
interface Instructor {
  _id: string;
  name: string;
  surname?: string;
  avatar?: string;
  description?: string;
}

interface Workshop {
  _id: string;
  name: string;
  nameTranslations?: {
    en: string;
    it: string;
  };
  description: string;
  descriptionTranslations?: {
    en: string;
    it: string;
  };
  startDate: Date;
  endDate: Date;
  imageSrc: string;
  badgeName?: string;
  badgeNameTranslations?: {
    en: string;
    it: string;
  };
  categories: string[];
  level: string;
  location: string;
  instructorIds: string[];
  capacity: number;
  registeredCount: number;
  bgColor?: string;
  canceled?: boolean;
}

const EditWorkshopPage = () => {
  const t = useTranslations("WorkshopsPage");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const { user, isAuthenticated, isInstructor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [isWorkshopInstructor, setIsWorkshopInstructor] = useState(false);

  // Add time options state for dropdowns
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  // Default workshop data state
  const [workshopData, setWorkshopData] = useState({
    name: "",
    nameTranslations: {
      en: "",
      it: ""
    },
    description: "",
    descriptionTranslations: {
      en: "",
      it: ""
    },
    imageSrc: "/images/workshop.jpg",
    badgeName: "",
    badgeNameTranslations: {
      en: "",
      it: ""
    },
    startDate: "",
    startTime: "10:00",
    endTime: "11:00",
    level: "beginner",
    location: "",
    capacity: 10,
    categories: [] as string[],
    ageRanges: [] as string[],
    instructorIds: [] as string[],
    bgColor: "#c3c2fc",
    canceled: false, // Initialize canceled state
  });

  // Age options
  const ageOptions = ["6-8", "9-11", "12-13", "14-16", "16+"];

  // Generate time options for dropdowns (restricted to 10:00-19:00)
  useEffect(() => {
    const options: string[] = [];
    // Start from 10:00 (10 AM) and end at exactly 19:00 (7 PM)
    for (let hour = 10; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip times after 19:00
        if (hour === 19 && minute > 0) continue;
        
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    setTimeOptions(options);
  }, []);

  // Redirect to workshops page if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/workshops`);
    }
  }, [isAuthenticated, isInstructor, router, locale]);

  // Fetch workshop data
  useEffect(() => {
    const fetchWorkshopData = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        const response = await fetch(`/api/workshops/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workshop details');
        }
        
        const data = await response.json();
        
        // Format dates for the form
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        // Format date as YYYY-MM-DD for the date input
        const formattedDate = startDate.toISOString().split('T')[0];
        
        // Format times as HH:MM for the time inputs
        const formattedStartTime = startDate.toTimeString().substring(0, 5);
        const formattedEndTime = endDate.toTimeString().substring(0, 5);
        
        // Separate categories into main categories, age ranges, and tech types
        const mainCategories = data.categories.filter((cat: string) => 
          ["design", "test", "prototype", "in-class", "out-of-class", "plug", "unplug"].includes(cat)
        );
        
        const ageRanges = data.categories.filter((cat: string) => 
          ageOptions.includes(cat)
        );
        
        // Always set to true - allow any instructor to edit any workshop
        setIsWorkshopInstructor(true);
        
        // Set workshop data
        setWorkshopData({
          name: data.name || "",
          nameTranslations: {
            en: data.nameTranslations?.en || data.name || "",
            it: data.nameTranslations?.it || ""
          },
          description: data.description || "",
          descriptionTranslations: {
            en: data.descriptionTranslations?.en || data.description || "",
            it: data.descriptionTranslations?.it || ""
          },
          imageSrc: data.imageSrc || "/images/workshop.jpg",
          badgeName: data.badgeName || data.name || "",
          badgeNameTranslations: {
            en: data.badgeNameTranslations?.en || data.badgeName || data.name || "",
            it: data.badgeNameTranslations?.it || ""
          },
          startDate: formattedDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          level: data.level || "beginner",
          location: data.location || "",
          capacity: data.capacity || 10,
          categories: mainCategories || [],
          ageRanges: ageRanges || [],
          instructorIds: data.instructorIds || [],
          bgColor: data.bgColor || "#c3c2fc",
          canceled: data.canceled || false,  // Explicitly add the canceled property
        });
      } catch (error: any) {
        console.error('Error fetching workshop:', error);
        setError(error.message || 'Failed to load workshop details');
      } finally {
        setIsFetching(false);
      }
    };
    
    if (id && isAuthenticated) {
      fetchWorkshopData();
    }
  }, [id, isAuthenticated, user]);

  // Add effect to fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const response = await fetch('/api/instructors');
        if (!response.ok) {
          throw new Error('Failed to fetch instructors');
        }
        const data = await response.json();
        setInstructors(data.instructors);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors');
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setWorkshopData({
      ...workshopData,
      [name]: value,
    });
  };
  
  const handleInstructorToggle = (instructorId: string) => {
    const updatedInstructorIds = [...workshopData.instructorIds];
    const index = updatedInstructorIds.indexOf(instructorId);
    
    if (index !== -1) {
      // If already selected, remove it
      updatedInstructorIds.splice(index, 1);
    } else {
      // If not selected, add it
      updatedInstructorIds.push(instructorId);
    }
    
    setWorkshopData({
      ...workshopData,
      instructorIds: updatedInstructorIds,
    });
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWorkshopData({
        ...workshopData,
        capacity: value,
      });
    }
  };

  const handleAgeChange = (age: string) => {
    const updatedAgeRanges = [...workshopData.ageRanges];
    const index = updatedAgeRanges.indexOf(age);

    if (index !== -1) {
      // If already selected, remove it
      updatedAgeRanges.splice(index, 1);
    } else {
      // If not selected, add it
      updatedAgeRanges.push(age);
    }

    setWorkshopData({
      ...workshopData,
      ageRanges: updatedAgeRanges,
    });
  };

  const handleCategoryChange = (category: string) => {
    const updatedCategories = [...workshopData.categories];
    const mainCategories = ["design", "test", "prototype"];
    
    // Only for main categories (design, test, prototype)
    if (mainCategories.includes(category)) {
      const index = updatedCategories.indexOf(category);
      
      if (index !== -1) {
        // If already selected, remove it
        updatedCategories.splice(index, 1);
      } else {
        // If not selected, add it
        updatedCategories.push(category);
      }
      
      setWorkshopData({
        ...workshopData,
        categories: updatedCategories,
      });
    }
  };

  const handleTechChange = (tech: string) => {
    // Determine the group the tech belongs to
    const isLocationType = ["in-class", "out-of-class"].includes(tech);
    const isTechType = ["plug", "unplug"].includes(tech);
    
    // Get the current categories
    const updatedCategories = [...workshopData.categories];
    
    // Remove any existing selection from the same group
    if (isLocationType) {
      // Remove any existing location type
      ["in-class", "out-of-class"].forEach(locType => {
        const index = updatedCategories.indexOf(locType);
        if (index !== -1) {
          updatedCategories.splice(index, 1);
        }
      });
    } else if (isTechType) {
      // Remove any existing tech type
      ["plug", "unplug"].forEach(techType => {
        const index = updatedCategories.indexOf(techType);
        if (index !== -1) {
          updatedCategories.splice(index, 1);
        }
      });
    }
    
    // If this tech was not already selected (which means we just removed it), add it
    if (!workshopData.categories.includes(tech)) {
      updatedCategories.push(tech);
    }
    
    setWorkshopData({
      ...workshopData,
      categories: updatedCategories,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setWorkshopData({
            ...workshopData,
            imageSrc: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate form
    if (!workshopData.nameTranslations.en || !workshopData.nameTranslations.it) {
      setError("Please provide a workshop name in both English and Italian");
      return;
    }

    if (!workshopData.descriptionTranslations.en || !workshopData.descriptionTranslations.it) {
      setError("Please provide a workshop description in both English and Italian");
      return;
    }

    if (!workshopData.badgeNameTranslations.en || !workshopData.badgeNameTranslations.it) {
      setError("Please provide a badge name in both English and Italian");
      return;
    }

    if (!workshopData.startDate) {
      setError("Please provide a start date");
      return;
    }

    if (workshopData.ageRanges.length === 0) {
      setError("Please select at least one age range");
      return;
    }

    if (workshopData.categories.filter(cat => ["design", "test", "prototype"].includes(cat)).length === 0) {
      setError("Please select at least one category");
      return;
    }

    if (workshopData.instructorIds.length === 0) {
      setError("Please select at least one instructor");
      return;
    }

    try {
      setIsLoading(true);

      // Calculate start and end dates from date and time fields
      const startDateTime = new Date(
        `${workshopData.startDate}T${workshopData.startTime}`
      );
      const endDateTime = new Date(
        `${workshopData.startDate}T${workshopData.endTime}`
      );

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }

      if (endDateTime <= startDateTime) {
        throw new Error("End time must be after start time");
      }

      // Prepare workshop data
      const workshopPayload = {
        // Set base name and description from English translations as fallbacks
        name: workshopData.nameTranslations.en,
        nameTranslations: {
          en: workshopData.nameTranslations.en,
          it: workshopData.nameTranslations.it
        },
        description: workshopData.descriptionTranslations.en,
        descriptionTranslations: {
          en: workshopData.descriptionTranslations.en,
          it: workshopData.descriptionTranslations.it
        },
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        imageSrc: workshopData.imageSrc,
        badgeName: workshopData.badgeNameTranslations.en,
        badgeNameTranslations: {
          en: workshopData.badgeNameTranslations.en,
          it: workshopData.badgeNameTranslations.it
        },
        categories: [...workshopData.categories, ...workshopData.ageRanges],
        level: workshopData.level,
        location: workshopData.location,
        instructorIds: workshopData.instructorIds,
        capacity: workshopData.capacity,
        bgColor: workshopData.bgColor,
      };

      // Send request to update workshop
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to update a workshop");
      }

      const response = await fetch(`/api/workshops/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workshopPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update workshop");
      }

      const data = await response.json();
      setSuccessMessage("Workshop updated successfully!");

      // Redirect to the workshop page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/workshops/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error updating workshop:", err);
      setError(err.message || "Failed to update workshop");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle translation field changes
  const handleTranslationChange = (
    field: 'nameTranslations' | 'descriptionTranslations' | 'badgeNameTranslations',
    language: 'en' | 'it',
    value: string
  ) => {
    setWorkshopData({
      ...workshopData,
      [field]: {
        ...workshopData[field],
        [language]: value
      }
    });
  };

  const handleCancelWorkshop = async () => {
    if (!confirm(t("confirmCancelWorkshop") || "Are you sure you want to cancel this workshop?")) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Send request to cancel workshop
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to cancel a workshop");
      }

      const response = await fetch(`/api/workshops/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel workshop");
      }

      setSuccessMessage(t("workshopCanceled") || "Workshop canceled successfully!");

      // Redirect to the workshop page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/workshops/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error canceling workshop:", err);
      setError(err.message || "Failed to cancel workshop");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (!user || !isInstructor) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="heroicons:exclamation-circle"
            className="w-12 h-12 mx-auto text-red-500 mb-4"
          />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You must be an instructor to edit workshops.
          </p>
          <Link href={`/${locale}/workshops`}>
            <button className="mt-4 px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]">
              Back to Workshops
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isWorkshopInstructor && !isFetching) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="heroicons:exclamation-circle"
            className="w-12 h-12 mx-auto text-red-500 mb-4"
          />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Not Authorized
          </h3>
          <p className="text-gray-500">
            You are not authorized to edit this workshop.
          </p>
          <Link href={`/${locale}/workshops/${id}`}>
            <button className="mt-4 px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]">
              Back to Workshop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/workshops/${id}`}
            className="flex items-center text-[#7471f9] hover:text-[#5f5dd6]"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-1" />
            {t("backToWorkshop")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-secularone text-gray-900">
              {t("editWorkshop") || "Edit Workshop"}
            </h2>
            <p className="text-gray-500 text-sm">
              {t("editWorkshopDesc") ||
                "Update the workshop details below."}
            </p>
          </div>

          {error && (
            <div className="mx-6 my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 my-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p className="font-medium">Success</p>
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="imageSrc"
              >
                {t("workshopImage") || "Workshop Image"}
              </label>
              <div className="flex items-center">
                <div className="relative h-40 w-64 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={workshopData.imageSrc}
                    alt="Workshop image"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/workshop.jpg";
                    }}
                  />
                </div>
                <div className="ml-5">
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                      onClick={triggerFileInput}
                    >
                      {t("uploadImage") || "Upload Image"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t("imageRequirements") ||
                      "Upload a clear image for your workshop (JPG, PNG, max 5MB)."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="badgeName"
              >
                {t("badgeName") || "Badge Name"}
              </label>
              
              {/* Badge Name Translations - Language fields */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                    <Icon icon="emojione:flag-for-united-kingdom" className="w-5 h-5" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <input
                      type="text"
                      value={workshopData.badgeNameTranslations.en}
                      onChange={(e) => handleTranslationChange('badgeNameTranslations', 'en', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                      placeholder="English badge name"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                    <Icon icon="emojione:flag-for-italy" className="w-5 h-5" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <input
                      type="text"
                      value={workshopData.badgeNameTranslations.it}
                      onChange={(e) => handleTranslationChange('badgeNameTranslations', 'it', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                      placeholder="Italian badge name"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                {t("badgeNameDesc") ||
                  "Give a name to the badge that participants will earn."}
              </p>
            </div>

            {/* Basic Workshop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="name"
                >
                  {t("workshopName") || "Workshop Name"}
                </label>
                
                {/* Workshop Name Translations - Only language fields */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                      <Icon icon="emojione:flag-for-united-kingdom" className="w-5 h-5" />
                    </div>
                    <div className="ml-2 flex-grow">
                      <input
                        type="text"
                        id="name"
                        value={workshopData.nameTranslations.en}
                        onChange={(e) => handleTranslationChange('nameTranslations', 'en', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                        placeholder="English workshop name"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                      <Icon icon="emojione:flag-for-italy" className="w-5 h-5" />
                    </div>
                    <div className="ml-2 flex-grow">
                      <input
                        type="text"
                        value={workshopData.nameTranslations.it}
                        onChange={(e) => handleTranslationChange('nameTranslations', 'it', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                        placeholder="Italian workshop name"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="level"
                >
                  {t("requiredLevel")}
                </label>
                <select
                  id="level"
                  name="level"
                  value={workshopData.level}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base bg-white appearance-none"
                  required
                >
                  <option value="beginner">{t("beginner")}</option>
                  <option value="intermediate">{t("intermediate")}</option>
                  <option value="advanced">{t("advanced")}</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="description"
              >
                {t("workshopDescription") || "Workshop Description"}
              </label>
              
              {/* Description Translations - Language fields */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                    <Icon icon="emojione:flag-for-united-kingdom" className="w-5 h-5" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <textarea
                      id="description-en"
                      value={workshopData.descriptionTranslations.en}
                      onChange={(e) => handleTranslationChange('descriptionTranslations', 'en', e.target.value)}
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                      placeholder="English description"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center">
                    <Icon icon="emojione:flag-for-italy" className="w-5 h-5" />
                  </div>
                  <div className="ml-2 flex-grow">
                    <textarea
                      id="description-it"
                      value={workshopData.descriptionTranslations.it}
                      onChange={(e) => handleTranslationChange('descriptionTranslations', 'it', e.target.value)}
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                      placeholder="Italian description"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="startDate"
                >
                  {t("date") || "Date"}
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={workshopData.startDate}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="startTime"
                >
                  {t("startTime") || "Start Time"}
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  value={workshopData.startTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base bg-white appearance-none"
                  required
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="endTime"
                >
                  {t("endTime") || "End Time"}
                </label>
                <select
                  id="endTime"
                  name="endTime"
                  value={workshopData.endTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base bg-white appearance-none"
                  required
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="capacity"
              >
                {t("capacity") || "Maximum Capacity"}
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                value={workshopData.capacity}
                onChange={handleCapacityChange}
                className="w-full md:w-1/3 border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                required
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="location"
              >
                {t("location") || "Location"}
              </label>
              <input
                id="location"
                name="location"
                value={workshopData.location}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
              ></input>
            </div>

            {/* Instructor Selection */}
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                htmlFor="instructorIds"
              >
                {t("instructors") || "Instructors"}
              </label>
              
              {loadingInstructors ? (
                <div className="flex items-center justify-center p-6 border rounded-md">
                  <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin text-[#7471f9]" />
                  <span>{t("loadingInstructors") || "Loading instructors..."}</span>
                </div>
              ) : instructors.length === 0 ? (
                <div className="p-4 border rounded-md bg-gray-50 text-gray-500">
                  {t("noInstructorsFound") || "No instructors found."}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {instructors.map((instructor) => (
                      <div 
                        key={instructor._id}
                        onClick={() => handleInstructorToggle(instructor._id)}
                        className={`
                          flex items-center p-3 rounded-lg border cursor-pointer transition-all
                          ${workshopData.instructorIds.includes(instructor._id) 
                            ? "border-[#7471f9] bg-[#7471f9]/5 shadow-sm" 
                            : "border-gray-300 hover:border-[#7471f9] hover:bg-gray-50"}
                        `}
                      >
                        <div className="flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <Image 
                            src={instructor.avatar || "/images/avatar.jpg"} 
                            alt={`${instructor.name} ${instructor.surname || ''}`}
                            fill
                            className="object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/avatar.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="font-medium text-gray-900 text-sm">
                            {instructor.name} {instructor.surname || ''}
                          </p>
                        </div>
                        {workshopData.instructorIds.includes(instructor._id) && (
                          <div className="flex-shrink-0 ml-2">
                            <Icon icon="heroicons:check-circle" className="w-5 h-5 text-[#7471f9]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {workshopData.instructorIds.length > 0 && (
                    <div className="mt-3 text-sm">
                      <p className="font-medium text-gray-900">
                        {t("selectedInstructors") || "Selected instructors"}:{" "}
                        <span className="text-[#7471f9]">{workshopData.instructorIds.length}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t("multipleInstructorsNote") || "You can select multiple instructors for the workshop"}
              </p>
            </div>

            {/* Age Range */}
            <div className="filter-group mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("ageRange") || "Age Range"}
              </h3>
              <div className="flex flex-wrap gap-1.5 max-w-full">
                {ageOptions.map((age) => (
                  <button
                    key={age}
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      workshopData.ageRanges.includes(age)
                        ? "bg-[#7471f9] text-white border-[#7471f9]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]"
                    }`}
                    onClick={() => handleAgeChange(age)}
                  >
                    {age}
                  </button>
                ))}
              </div>
              {workshopData.ageRanges.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {t("selectedAgeRanges") || "Selected age ranges"}:{" "}
                    <span className="text-[#7471f9]">{workshopData.ageRanges.length}</span>
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t("multipleAgeRangesNote") || "You can select multiple age ranges for the workshop"}
              </p>
            </div>

            {/* Location Type (In-Class / Out-of-Class) */}
            <div className="filter-group mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("locationType")}
              </h3>
              <div className="flex flex-wrap gap-1.5 max-w-full">
                {["in-class", "out-of-class"].map((classType) => (
                  <button
                    key={classType}
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      workshopData.categories.includes(classType)
                        ? "bg-[#7471f9] text-white border-[#7471f9]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]"
                    }`}
                    onClick={() => handleTechChange(classType)}
                  >
                    {classType.charAt(0).toUpperCase() + classType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("category") || "Category"}
              </h3>
              <div className="flex flex-wrap gap-1.5 max-w-full">
                {["design", "test", "prototype"].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      workshopData.categories.includes(category)
                        ? "bg-[#7471f9] text-white border-[#7471f9]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]"
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              {/* Display count of selected main categories */}
              {workshopData.categories.filter(cat => ["design", "test", "prototype"].includes(cat)).length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {t("selectedCategories") || "Selected categories"}:{" "}
                    <span className="text-[#7471f9]">{
                      workshopData.categories.filter(cat => ["design", "test", "prototype"].includes(cat)).length
                    }</span>
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t("multipleCategoriesNote") || "You can select multiple categories for the workshop"}
              </p>
            </div>

            {/* Tech Type Filter */}
            <div className="filter-group mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("techType") || "Tech Type"}
              </h3>
              <div className="flex flex-wrap gap-1.5 max-w-full">
                {["plug", "unplug"].map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      workshopData.categories.includes(tech)
                        ? "bg-[#7471f9] text-white border-[#7471f9]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]"
                    }`}
                    onClick={() => handleTechChange(tech)}
                  >
                    {tech.charAt(0).toUpperCase() + tech.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("cardColor") || "Card Color"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "#c3c2fc", // Soft purple
                  "#f8c5f4", // Soft pink
                  "#fee487", // Soft yellow
                  "#aef9e1"  // Soft mint
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      workshopData.bgColor === color
                        ? "border-[#7471f9] scale-110 shadow-md"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setWorkshopData({
                      ...workshopData,
                      bgColor: color
                    })}
                    aria-label={`Select ${color} as card background color`}
                  >
                    {workshopData.bgColor === color && (
                      <Icon
                        icon="heroicons:check"
                        className="w-5 h-5 text-[#7471f9] mx-auto"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <div 
                  className="p-3 rounded-md border border-gray-200 shadow-sm"
                  style={{ backgroundColor: workshopData.bgColor }}
                >
                  <p className="text-xs text-gray-600">
                    {t("cardPreview") || "Card Preview"} - {t("selectedColor") || "Selected color"}: <span className="font-medium">{workshopData.bgColor}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <HeroButton
                text={
                  isLoading
                    ? t("updating") || "Updating..."
                    : t("updateWorkshop") || "Update Workshop"
                }
                backgroundColor="#4CAF50"
                textColor="white"
                disabled={isLoading}
              />
            </div>
          </form>

          {/* Cancel/Uncancel Workshop Button */}
          {workshopData.canceled ? (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("uncancelWorkshop") || "Uncancel Workshop"}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {t("uncancelWorkshopDesc") || "If you need to uncancel this workshop, you can do it here."}
              </p>
              <div className="flex justify-end">
                <HeroButton
                  text={isLoading ? t("processing") || "Processing..." : t("uncancelWorkshop") || "Uncancel Workshop"}
                  backgroundColor="#4CAF50"
                  textColor="white"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      setError("");
                      setSuccessMessage("");
                      
                      const token = localStorage.getItem("token");
                      if (!token) {
                        throw new Error("You must be logged in to uncancel a workshop");
                      }

                      // Calculate dates from the form fields
                      const startDateTime = new Date(`${workshopData.startDate}T${workshopData.startTime}`);
                      const endDateTime = new Date(`${workshopData.startDate}T${workshopData.endTime}`);

                      const response = await fetch(`/api/workshops/uncancel`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          workshopId: id,
                          newStartDate: startDateTime.toISOString(),
                          newEndDate: endDateTime.toISOString(),
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to uncancel workshop");
                      }

                      setSuccessMessage(t("workshopUncanceledSuccessfully") || "Workshop uncanceled successfully!");
                      
                      // Redirect to the workshop page after a short delay
                      setTimeout(() => {
                        router.push(`/${locale}/workshops/${id}`);
                      }, 2000);
                    } catch (err) {
                      console.error("Error uncanceling workshop:", err);
                      setError(err.message || t("failedToUncancelWorkshop") || "Failed to uncancel workshop");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t("cancelWorkshop") || "Cancel Workshop"}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {t("cancelWorkshopDesc") || "If you need to cancel this workshop, you can do it here."}
              </p>
              <div className="flex justify-end">
                <HeroButton
                  text={t("cancelWorkshop") || "Cancel Workshop"}
                  backgroundColor="#FF0000"
                  textColor="white"
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Custom confirmation modals */}
          <ConfirmationModal
            isOpen={isCancelModalOpen}
            title={t("cancelWorkshop") || "Cancel Workshop"}
            message={t("confirmCancelWorkshop") || "Are you sure you want to cancel this workshop? This action cannot be undone, and all registered users will be notified."}
            confirmText={t("cancelWorkshop") || "Cancel Workshop"}
            cancelText={t("goBack") || "Go Back"}
            onConfirm={async () => {
              setIsLoading(true);
              setError("");
              setSuccessMessage("");
              setIsCancelModalOpen(false);

              try {
                // Send request to cancel workshop
                const token = localStorage.getItem("token");
                if (!token) {
                  throw new Error("You must be logged in to cancel a workshop");
                }

                const response = await fetch(`/api/workshops/${id}/cancel`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to cancel workshop");
                }

                setSuccessMessage(t("workshopCanceled") || "Workshop canceled successfully!");

                // Redirect to the workshop page after a short delay
                setTimeout(() => {
                  router.push(`/${locale}/workshops/${id}`);
                }, 2000);
              } catch (err) {
                console.error("Error canceling workshop:", err);
                setError(err.message || "Failed to cancel workshop");
              } finally {
                setIsLoading(false);
              }
            }}
            onCancel={() => setIsCancelModalOpen(false)}
            isProcessing={isLoading}
            processingText={t("cancelling") || "Cancelling..."}
            iconName="heroicons:exclamation-triangle"
            iconColor="text-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EditWorkshopPage;