export type WorkshopStatus = 'future' | 'ongoing' | 'past' | 'canceled';

export const getWorkshopStatus = (startDate: Date, endDate: Date, canceled: boolean = false): WorkshopStatus => {
  if (canceled) {
    return 'canceled';
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'future';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'past';
  }
};

export const getStatusColor = (status: WorkshopStatus): string => {
  switch (status) {
    case 'future':
      return 'bg-blue-500';
    case 'ongoing':
      return 'bg-green-500';
    case 'past':
      return 'bg-gray-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};