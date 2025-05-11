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
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  instructor: string;
  level: string;
  categories: string[];
}

export default function CalendarPage() {
  const t = useTranslations('Calendar');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registeredWorkshops, setRegisteredWorkshops] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('/api/workshops');
        if (!response.ok) {
          console.error('Failed to fetch workshops:', response.status);
          return;
        }
        const data = await response.json();
        console.log('Fetched workshops:', data);
        // Ensure dates are properly parsed
        const workshopsWithDates = data.map((workshop: Workshop) => ({
          ...workshop,
          startDate: new Date(workshop.startDate),
          endDate: new Date(workshop.endDate)
        }));
        setWorkshops(workshopsWithDates);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      }
    };

    const fetchRegisteredWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping registered workshops fetch');
          setRegisteredWorkshops([]);
          return;
        }

        const response = await fetch('/api/workshops/registered', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch registered workshops:', response.status);
          setRegisteredWorkshops([]);
          return;
        }
        const data = await response.json();
        console.log('Registered workshops response:', data);
        
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
        
        console.log('Processed workshop IDs:', workshopIds);
        setRegisteredWorkshops(workshopIds);
      } catch (error) {
        console.error('Error fetching registered workshops:', error);
        setRegisteredWorkshops([]);
      }
    };

    fetchWorkshops();
    fetchRegisteredWorkshops();
  }, []);

  // Function to get background color based on index (matching workshop cards)
  const getBgColor = (index: number) => {
    const colors = ["#c3c2fc", "#f8c5f4", "#fee487", "#aef9e1"];
    return colors[index % colors.length];
  };

  // Filter workshops to show only future and ongoing ones
  const filteredWorkshops = workshops.filter(workshop => {
    const now = new Date();
    const startDate = new Date(workshop.startDate);
    const endDate = new Date(workshop.endDate);
    return startDate >= now || (startDate <= now && endDate >= now);
  });

  const events = filteredWorkshops.map((workshop, index) => {
    const isRegistered = registeredWorkshops.includes(workshop._id);
    console.log('Creating event for workshop:', {
      id: workshop._id,
      title: workshop.name,
      isRegistered,
      registeredWorkshops
    });
    return {
      title: workshop.name,
      start: workshop.startDate,
      end: workshop.endDate,
      backgroundColor: getBgColor(index),
      borderColor: getBgColor(index),
      textColor: '#2f2f2f',
      display: 'block',
      extendedProps: {
        id: workshop._id,
        description: workshop.description,
        location: workshop.location,
        instructor: workshop.instructor,
        level: workshop.level,
        categories: workshop.categories,
        isRegistered,
      },
    };
  });

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4">
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

              return (
                <div 
                  className="p-1 min-h-[24px] cursor-pointer hover:bg-opacity-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    const workshopId = eventInfo.event.extendedProps.id;
                    console.log('Workshop clicked:', workshopId, eventInfo.event.extendedProps);
                    if (workshopId) {
                      router.push(`/workshops/${workshopId}`);
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
                </div>
              );
            }}
            height="auto"
            eventClick={(info) => {
              console.log('Event clicked:', info.event.extendedProps);
              const workshopId = info.event.extendedProps.id;
              if (workshopId) {
                router.push(`/workshops/${workshopId}`);
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
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventDisplay="block"
            displayEventTime={true}
            eventMinHeight={24}
            eventShortHeight={24}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
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