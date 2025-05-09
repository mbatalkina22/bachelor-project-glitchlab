/**
 * Utility functions for navigation
 */

/**
 * Creates a URL for viewing a workshop's reviews section
 * @param workshopId The ID of the workshop
 * @param locale The current locale (optional)
 * @returns URL string with the proper format to navigate to the reviews section
 */
export const getWorkshopReviewsUrl = (workshopId: string, locale?: string): string => {
  const basePath = locale ? `/${locale}/workshops/${workshopId}` : `/workshops/${workshopId}`;
  return `${basePath}#reviews`;
}; 