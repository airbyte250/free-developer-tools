import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from 'lucide-react';
import { calendarEvents, users } from '../data/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 2, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 2, 15));
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(e => isSameDay(new Date(e.startDate), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your events, meetings, and deadlines</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> New Event</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button onClick={() => setView('month')} className={`px-3 py-1 rounded-md text-xs font-medium ${view === 'month' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Month</button>
              <button onClick={() => setView('week')} className={`px-3 py-1 rounded-md text-xs font-medium ${view === 'week' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Week</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date(2024, 2, 15));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`bg-white p-2 min-h-[80px] text-left hover:bg-gray-50 transition-colors relative ${
                    !inMonth ? 'opacity-40' : ''
                  } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                >
                  <span className={`text-sm font-medium inline-flex w-7 h-7 items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ backgroundColor: event.color + '20', color: event.color }}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-1">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">{selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}</p>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                      <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {event.attendees.length} attendees
                      </div>
                    </div>
                    <div className="flex -space-x-2 mt-2">
                      {event.attendees.slice(0, 5).map(id => (
                        <div key={id} className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-white" title={getUserName(id)}>
                          {users.find(u => u.id === id)?.avatar}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No events for this day</p>
                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add event</button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {calendarEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{format(new Date(event.startDate), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
