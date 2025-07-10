'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Icon } from '@iconify/react';

interface Workshop {
  _id: string;  // MongoDB uses _id
  name: string;
  nameTranslations?: {
    [key: string]: string;
  };
  description: string;
  startDate: Date;
  endDate: Date;
  imageSrc: string;
  categories: string[];
  level: string;
  location: string;
  instructorId: string;
  instructorIds?: string[]; // Adding instructorIds property
  instructorDetails?: {
    name: string;
    surname?: string;
  };
  capacity: number;
  registeredCount: number;
  bgColor?: string; // Added bgColor property
  canceled?: boolean; // Added canceled property
}

export default function CalendarPage() {
  const t = useTranslations('Calendar');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);
  const [instructingWorkshops, setInstructingWorkshops] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('/api/workshops');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        // Ensure dates are properly parsed
        const workshopsWithDates = data.map((workshop: Workshop) => ({
          ...workshop,
          startDate: new Date(workshop.startDate),
          endDate: new Date(workshop.endDate)
        }));
        setWorkshops(workshopsWithDates);
      } catch (error) {
      }
    };

    const fetchRegisteredWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setRegisteredWorkshops([]);
          return;
        }

        const response = await fetch('/api/workshops/registered', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setRegisteredWorkshops([]);
          return;
        }
        const data = await response.json();
        
        // Handle different response formats
        let workshopIds: string[] = [];
        if (Array.isArray(data)) {
          workshopIds = data.map(workshop => workshop._id || workshop.id).filter(Boolean);
        } else if (data && typeof data === 'object') {
          // If it's a single object or has a different structure
          workshopIds = Object.values(data)
            .map(workshop => (workshop as any)._id || (workshop as any).id)
            .filter(Boolean);
        }
        
        setRegisteredWorkshops(workshopIds);
      } catch (error) {
        setRegisteredWorkshops([]);
      }
    };

    // New function to fetch workshops where the user is an instructor
    const fetchInstructingWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setInstructingWorkshops([]);
          return;
        }

        const response = await fetch('/api/workshops/instructor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setInstructingWorkshops([]);
          return;
        }
        
        const data = await response.json();
        
        // Extract workshop IDs
        let workshopIds: string[] = [];
        if (Array.isArray(data)) {
          workshopIds = data.map(workshop => workshop._id || workshop.id).filter(Boolean);
        } else if (data && typeof data === 'object') {
          workshopIds = Object.values(data)
            .map(workshop => (workshop as any)._id || (workshop as any).id)
            .filter(Boolean);
        }
        
        setInstructingWorkshops(workshopIds);
      } catch (error) {
        setInstructingWorkshops([]);
      }
    };

    fetchWorkshops();
    fetchRegisteredWorkshops();
    fetchInstructingWorkshops(); // Add this call to fetch instructing workshops
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return;
        }
        
        // User data fetched successfully
      } catch (error) {
      }
    };

    fetchUserData();
  }, []);

  // Filter workshops to show only future and ongoing ones, excluding canceled workshops
  const filteredWorkshops = workshops.filter(workshop => {
    const now = new Date();
    const startDate = new Date(workshop.startDate);
    const endDate = new Date(workshop.endDate);
    return !workshop.canceled && (startDate >= now || (startDate <= now && endDate >= now));
  });

  const events = filteredWorkshops.map((workshop, index) => {
    const isRegistered = registeredWorkshops.includes(workshop._id);
    // Instead of checking instructorIds, use the instructingWorkshops state
    const isInstructing = instructingWorkshops.includes(workshop._id);
    
    // Use the stored bgColor from the database, or default to a standard color if not present
    const backgroundColor = workshop.bgColor || "#c3c2fc";
    
    // Get localized title if available
    const localizedTitle = workshop.nameTranslations && workshop.nameTranslations[locale]
      ? workshop.nameTranslations[locale]
      : workshop.name;
    
    return {
      title: localizedTitle,
      start: workshop.startDate,
      end: workshop.endDate,
      backgroundColor: backgroundColor,
      borderColor: backgroundColor,
      textColor: '#2f2f2f',
      display: 'block',
      extendedProps: {
        id: workshop._id,
        description: workshop.description,
        location: workshop.location,
        instructor: workshop.instructorId,
        level: workshop.level,
        categories: workshop.categories,
        isRegistered,
        isInstructing,
      },
    };
  });

// Mobile Calendar Component
const MobileCalendarView = ({ workshops, registeredWorkshops, instructingWorkshops, locale, t, router }: {
  workshops: Workshop[];
  registeredWorkshops: string[];
  instructingWorkshops: string[];
  locale: string;
  t: any;
  router: any;
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group workshops by date
  const workshopsByDate = workshops.reduce((acc, workshop) => {
    const date = new Date(workshop.startDate).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workshop);
    return acc;
  }, {} as Record<string, Workshop[]>);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayKey = current.toDateString();
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const isSelected = current.toDateString() === selectedDate.toDateString();
      const hasWorkshops = workshopsByDate[dayKey] && workshopsByDate[dayKey].length > 0;

      days.push({
        date: new Date(current),
        isCurrentMonth,
        isToday,
        isSelected,
        hasWorkshops,
        workshops: workshopsByDate[dayKey] || []
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDayWorkshops = workshopsByDate[selectedDate.toDateString()] || [];

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-secularone text-gray-900">
            {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentMonth)}
          </h2>
          
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="heroicons:chevron-right" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`
                p-2 text-sm relative transition-all duration-200
                ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${day.isToday ? 'bg-[#7471f9] text-white rounded-full' : ''}
                ${day.isSelected && !day.isToday ? 'bg-[#c3c2fc] text-gray-900 rounded-full' : ''}
                ${!day.isSelected && !day.isToday ? 'hover:bg-gray-100 rounded-full' : ''}
              `}
            >
              {day.date.getDate()}
              {day.hasWorkshops && !day.isToday && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#7471f9] rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date Workshops */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {formatDate(selectedDate)}
        </h3>

        {selectedDayWorkshops.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="heroicons:calendar-days" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No workshops scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayWorkshops.map((workshop) => {
              const isRegistered = registeredWorkshops.includes(workshop._id);
              const isInstructing = instructingWorkshops.includes(workshop._id);
              const localizedTitle = workshop.nameTranslations && workshop.nameTranslations[locale]
                ? workshop.nameTranslations[locale]
                : workshop.name;

              return (
                <div
                  key={workshop._id}
                  onClick={() => router.push(`/${locale}/workshops/${workshop._id}`)}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderLeftColor: workshop.bgColor || '#c3c2fc', borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                      {localizedTitle}
                    </h4>
                    <div className="flex flex-col gap-1">
                      {isRegistered && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                          <Icon icon="heroicons:check-circle" className="w-3 h-3 mr-1" />
                          {t('registered')}
                        </span>
                      )}
                      {isInstructing && (
                        <span className="text-xs bg-[#7471f9] text-white px-2 py-1 rounded-full flex items-center">
                          <Icon icon="heroicons:academic-cap" className="w-3 h-3 mr-1" />
                          {t('instructing')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Icon icon="heroicons:clock" className="w-4 h-4 mr-2 text-gray-400" />
                      {formatTime(new Date(workshop.startDate))} - {formatTime(new Date(workshop.endDate))}
                    </div>
                    
                    {workshop.location && (
                      <div className="flex items-center">
                        <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-2 text-gray-400" />
                        {workshop.location}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600 text-sm">{t('subtitle')}</p>
          </div>
          <MobileCalendarView 
            workshops={filteredWorkshops}
            registeredWorkshops={registeredWorkshops}
            instructingWorkshops={instructingWorkshops}
            locale={locale}
            t={t}
            router={router}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-lg shadow-lg p-4">
          <style jsx global>{`
            .fc-toolbar-title {
              font-family: 'Secular One', sans-serif !important;
              font-size: 1.5rem !important;
              text-transform: capitalize;
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            locale={locale}
            titleFormat={{ month: 'long', year: 'numeric' }}
            events={events}
            eventContent={(eventInfo) => {
              const start = eventInfo.event.start;
              const end = eventInfo.event.end;
              const isShortEvent = start && end ? (end.getTime() - start.getTime() < 30 * 60 * 1000) : false; // 30 minutes
              const isWeekView = eventInfo.view.type === 'timeGridWeek';
              const isDayView = eventInfo.view.type === 'timeGridDay';
              const showLocation = !isShortEvent && !isWeekView && !isDayView;
              const isRegistered = eventInfo.event.extendedProps.isRegistered;
              const isInstructing = eventInfo.event.extendedProps.isInstructing;

              return (
                <div 
                  className="p-1 min-h-[24px] cursor-pointer hover:bg-opacity-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    const workshopId = eventInfo.event.extendedProps.id;
                    if (workshopId) {
                      router.push(`/${locale}/workshops/${workshopId}`);
                    }
                  }}
                >
                  <div className="font-semibold text-[#2f2f2f] break-words whitespace-normal">
                    {eventInfo.event.title}
                  </div>
                  {showLocation && (
                    <div className="text-sm text-gray-600 break-words whitespace-normal">
                      {eventInfo.event.extendedProps.location}
                    </div>
                  )}
                  {isRegistered && (
                    <div className="text-xs text-white bg-green-500 px-1.5 py-0.5 rounded-full mt-1 inline-flex items-center">
                      <Icon icon="heroicons:check-circle" className="w-3 h-3 mr-1" />
                      {t('registered')}
                    </div>
                  )}
                  {isInstructing && (
                    <div className="text-xs text-white bg-[#7471f9] px-1.5 py-0.5 rounded-full mt-1 inline-flex items-center">
                      <Icon icon="heroicons:academic-cap" className="w-3 h-3 mr-1" />
                      {t('instructing')}
                    </div>
                  )}
                </div>
              );
            }}
            height="auto"
            eventClick={(info) => {
              const workshopId = info.event.extendedProps.id;
              if (workshopId) {
                router.push(`/${locale}/workshops/${workshopId}`);
              }
            }}
            dayHeaderFormat={{ weekday: 'long' }}
            dayMaxEvents={true}
            eventMaxStack={2}
            themeSystem="standard"
            buttonText={{
              today: t('today'),
              month: t('month'),
              week: t('week'),
              day: t('day')
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventDisplay="block"
            displayEventTime={true}
            eventMinHeight={24}
            eventShortHeight={24}
            slotMinTime="10:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            views={{
              timeGridWeek: {
                dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric' }
              },
              timeGridDay: {
                dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
              }
            }}
            eventDidMount={(info) => {
              info.el.style.backgroundColor = info.event.backgroundColor;
              info.el.style.borderColor = info.event.borderColor;
            }}
          />
          <style jsx global>{`
            .fc {
              color: #2f2f2f;
            }
            .fc .fc-toolbar-title {
              color: #2f2f2f;
              font-size: 1.5rem;
              font-weight: 600;
            }
            .fc .fc-button {
              color: #2f2f2f;
              background-color: white;
              border: 1px solid #e5e7eb;
              padding: 0.5rem 1rem;
              font-weight: 500;
              border-radius: 0.375rem;
              transition: all 0.2s;
              text-transform: capitalize;
              font-size: 0.875rem;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            .fc .fc-button:hover {
              background-color: #f3f4f6;
              border-color: #d1d5db;
              transform: translateY(-1px);
            }
            .fc .fc-button-primary:not(:disabled).fc-button-active {
              background-color: #c3c2fc;
              color: #2f2f2f;
              border-color: #c3c2fc;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .fc .fc-button-primary:not(:disabled):hover {
              background-color: #a9a8f9;
              border-color: #a9a8f9;
            }
            .fc .fc-button-group {
              gap: 0.5rem;
              background-color: #f3f4f6;
              padding: 0.25rem;
              border-radius: 0.5rem;
            }
            .fc .fc-button-group .fc-button {
              border: none;
              background-color: transparent;
              box-shadow: none;
              padding: 0.5rem 1rem;
              color: #2f2f2f;
            }
            .fc .fc-button-group .fc-button:hover {
              background-color: #e5e7eb;
              transform: none;
              color: #2f2f2f;
            }
            .fc .fc-button-group .fc-button-active {
              background-color: white !important;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
              color: #2f2f2f;
            }
            .fc .fc-toolbar {
              gap: 1rem;
              margin-bottom: 2rem !important;
            }
            .fc .fc-prev-button,
            .fc .fc-next-button {
              padding: 0.5rem;
              background-color: white;
              border: 1px solid #e5e7eb;
              border-radius: 0.375rem;
              color: #2f2f2f;
              transition: all 0.2s;
            }
            .fc .fc-prev-button:hover,
            .fc .fc-next-button:hover {
              background-color: #f3f4f6;
              border-color: #d1d5db;
              transform: translateY(-1px);
            }
            .fc .fc-today-button {
              padding: 0.5rem 1rem;
              background-color: #c3c2fc;
              border: none;
              color: white;
              font-weight: 700;
              border-radius: 0.5rem;
              transition: all 0.2s;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-size: 0.75rem;
            }
            .fc .fc-today-button:hover {
              background-color: #a9a8f9;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              color: white;
              font-weight: 700;
            }
            .fc .fc-today-button:disabled {
              background-color: #e5e7eb;
              border-color: #e5e7eb;
              color: #9ca3af;
              cursor: not-allowed;
              box-shadow: none;
            }
            .fc .fc-col-header-cell {
              color: #2f2f2f;
              font-weight: 500;
            }
            .fc .fc-daygrid-day-number {
              color: #2f2f2f;
              font-weight: 500;
            }
            .fc .fc-timegrid-slot-label {
              color: #2f2f2f;
            }
            .fc .fc-timegrid-axis {
              color: #2f2f2f;
            }
            .fc .fc-day-other {
              background-color: #f3f4f6;
            }
            .fc .fc-day-other .fc-daygrid-day-number {
              color: #4b5563;
            }
            .fc .fc-day-today {
              background-color: transparent !important;
            }
            .fc .fc-day-today .fc-daygrid-day-number {
              background-color: #c3c2fc;
              color: #2f2f2f;
              border-radius: 9999px;
              width: 1.75rem;
              height: 1.75rem;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0.25rem;
            }
            .fc .fc-timegrid-slot {
              height: 3em;
            }
            .fc .fc-timegrid-slot-label-frame {
              text-align: center;
            }
            .fc .fc-timegrid-slot-label {
              font-size: 0.875rem;
            }
            .fc .fc-timegrid-event {
              min-height: 2em;
            }
            .fc .fc-timegrid-event .fc-event-main {
              padding: 0.25rem;
            }
            .fc .fc-timegrid-event .fc-event-time {
              font-size: 0.875rem;
              font-weight: 500;
            }
            .fc .fc-timegrid-event .fc-event-title {
              font-size: 0.875rem;
              font-weight: 500;
            }
            .fc .fc-timegrid-now-indicator-line {
              border-color: #c3c2fc;
            }
            .fc .fc-timegrid-now-indicator-arrow {
              border-color: #c3c2fc;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}