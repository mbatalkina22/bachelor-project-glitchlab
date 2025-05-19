"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import HeroButton from "@/components/HeroButton";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Add instructor interface
interface Instructor {
  _id: string;
  name: string;
  surname?: string;
  avatar?: string;
  description?: string;
}

const CreateWorkshopPage = () => {
  const t = useTranslations("WorkshopsPage");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, isInstructor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add state for instructors
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  // Redirect to workshops page if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/workshops`);
    }
  }, [isAuthenticated, isInstructor, router, locale]);

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

  // Workshop data state - update to include instructorId
  const [workshopData, setWorkshopData] = useState({
    name: "",
    description: "",
    imageSrc: "/images/workshop.jpg",
    badgeName: "",
    startDate: "",
    startTime: "09:00",
    endTime: "10:00",
    level: "beginner",
    location: "",
    capacity: 10,
    categories: [] as string[],
    ageRange: "",
    instructorId: "", // Added field for instructor ID
  });

  // Age options
  const ageOptions = ["6-8", "9-11", "12-13", "14-16", "16+"];

  // Category options
  const categoryOptions = {
    design: false,
    test: false,
    code: false,
  };

  // Tech options
  const techOptions = {
    plug: false,
    unplug: false,
  };

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
    setWorkshopData({
      ...workshopData,
      ageRange: workshopData.ageRange === age ? "" : age,
    });
  };

  const handleCategoryChange = (category: string) => {
    const updatedCategories = [...workshopData.categories];
    const categoryOptions = ["design", "test", "code"];
    
    // Remove any existing category selection
    categoryOptions.forEach(cat => {
      const index = updatedCategories.indexOf(cat);
      if (index !== -1) {
        updatedCategories.splice(index, 1);
      }
    });
    
    // Add the new category if it wasn't already selected
    if (!categoryOptions.some(cat => updatedCategories.includes(cat))) {
      updatedCategories.push(category);
    }
    
    setWorkshopData({
      ...workshopData,
      categories: updatedCategories,
    });
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
    if (!workshopData.name) {
      setError("Please provide a workshop name");
      return;
    }

    if (!workshopData.description) {
      setError("Please provide a workshop description");
      return;
    }

    if (!workshopData.startDate) {
      setError("Please provide a start date");
      return;
    }

    if (!workshopData.badgeName) {
      setError("Please provide a badge name");
      return;
    }

    if (!workshopData.ageRange) {
      setError("Please select an age range");
      return;
    }

    if (workshopData.categories.length === 0) {
      setError("Please select at least one category");
      return;
    }

    if (!workshopData.instructorId) {
      setError("Please select an instructor");
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
        name: workshopData.name,
        description: workshopData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        imageSrc: workshopData.imageSrc,
        badgeName: workshopData.badgeName,
        categories: [...workshopData.categories, workshopData.ageRange],
        level: workshopData.level,
        location: workshopData.location,
        instructorId: workshopData.instructorId,
        capacity: workshopData.capacity,
      };

      // Send request to create workshop
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to create a workshop");
      }

      const response = await fetch("/api/workshops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workshopPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create workshop");
      }

      const data = await response.json();
      setSuccessMessage("Workshop created successfully!");

      // Redirect to the workshop page after a short delay
      setTimeout(() => {
        router.push(`/${locale}/workshops/${data._id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating workshop:", err);
      setError(err.message || "Failed to create workshop");
    } finally {
      setIsLoading(false);
    }
  };

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
            You must be an instructor to create workshops.
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/workshops`}
            className="flex items-center text-[#7471f9] hover:text-[#5f5dd6]"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-1" />
            {t("backToWorkshops")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-secularone text-gray-900">
              {t("createWorkshop")}
            </h2>
            <p className="text-gray-500 text-sm">
              {t("createWorkshopDesc") ||
                "Fill out the form below to create a new workshop."}
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
              <input
                type="text"
                id="badgeName"
                name="badgeName"
                value={workshopData.badgeName}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-2 px-4"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
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
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={workshopData.name}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                  required
                />
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
              <textarea
                id="description"
                name="description"
                value={workshopData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                required
              ></textarea>
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
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={workshopData.startTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-900 mb-1"
                  htmlFor="endTime"
                >
                  {t("endTime") || "End Time"}
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={workshopData.endTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                  required
                />
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
                className="block text-sm font-medium text-gray-900 mb-1"
                htmlFor="instructorId"
              >
                {t("instructor") || "Instructor"}
              </label>
              <select
                id="instructorId"
                name="instructorId"
                value={workshopData.instructorId}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base bg-white appearance-none"
                required
              >
                <option value="" disabled>
                  {loadingInstructors
                    ? t("loadingInstructors") || "Loading instructors..."
                    : t("selectInstructor") || "Select an instructor"}
                </option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} {instructor.surname}
                  </option>
                ))}
              </select>
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
                      workshopData.ageRange === age
                        ? "bg-[#7471f9] text-white border-[#7471f9]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]"
                    }`}
                    onClick={() => handleAgeChange(age)}
                  >
                    {age}
                  </button>
                ))}
              </div>
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
                {["design", "test", "code"].map((category) => (
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

            <div className="flex justify-end">
              <HeroButton
                text={
                  isLoading
                    ? t("creating") || "Creating..."
                    : t("createWorkshop") || "Create Workshop"
                }
                backgroundColor="#7471f9"
                textColor="white"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshopPage;
