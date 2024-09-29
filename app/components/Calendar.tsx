import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format,
  addMonths,
  subMonths,
  isSameMonth
} from 'date-fns'

export default function Calendar({ selectedDate, onSelectDate, onMonthChange, schedules = [], blackoutDates = [], cohorts = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    onMonthChange(currentMonth)
  }, [currentMonth, onMonthChange])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const daysFromPrevMonth = monthStart.getDay()
  
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
  }

  const getSchedulesForDay = (day) => {
    return schedules.filter(schedule => 
      schedule.sessions.some(session => isSameDay(new Date(session.date), day))
    )
  }

  const getDateStyle = (day) => {
    const daySchedules = getSchedulesForDay(day)
    const cohortColors = daySchedules.flatMap(schedule => 
      schedule.selectedCohorts.map(cohortName => 
        cohorts.find(c => c.name === cohortName)?.color
      )
    ).filter((color, index, self) => color && self.indexOf(color) === index)

    if (cohortColors.length === 0) return {}
    if (cohortColors.length === 1) return { backgroundColor: cohortColors[0] }

    const gradient = cohortColors.map((color, index) => 
      `${color} ${index * (100 / cohortColors.length)}%, ${color} ${(index + 1) * (100 / cohortColors.length)}%`
    ).join(', ')

    return { background: `linear-gradient(45deg, ${gradient})` }
  }

  const selectedDaySchedules = getSchedulesForDay(selectedDate)

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevMonth} variant="ghost" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button onClick={handleNextMonth} variant="ghost" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
        {Array.from({ length: daysFromPrevMonth }).map((_, index) => (
          <div key={`prev-${index}`} className="text-gray-300" />
        ))}
        {monthDays.map((day, index) => {
          const isSelected = isSameDay(selectedDate, day)
          const isBlackout = blackoutDates.some(blackoutDate => isSameDay(new Date(blackoutDate), day))
          const dateStyle = getDateStyle(day)
          return (
            <Button
              key={index}
              onClick={() => onSelectDate(day)}
              variant={isSelected ? "default" : "ghost"}
              className={`h-14 w-full p-1 flex flex-col items-center justify-start ${
                isBlackout ? 'bg-gray-300 cursor-not-allowed' : ''
              } ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : ''}`}
              style={dateStyle}
              disabled={isBlackout}
            >
              <span className="text-sm">{format(day, 'd')}</span>
            </Button>
          )
        })}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Cohort Legend</h3>
        <div className="flex flex-wrap">
          {cohorts.map((cohort, index) => (
            <div key={index} className="flex items-center mr-4 mb-2">
              <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: cohort.color }} />
              <span className="text-xs">{cohort.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Sessions for {format(selectedDate, 'MMMM d, yyyy')}</h3>
        {selectedDaySchedules.length === 0 ? (
          <p className="text-sm text-gray-500">No sessions scheduled for this day.</p>
        ) : (
          <ul className="space-y-2">
            {selectedDaySchedules.map((schedule, index) => (
              <li key={index} className="text-sm">
                <span className="font-semibold">{schedule.title}</span>
                <br />
                Cohorts: {schedule.selectedCohorts.join(', ')}
                <br />
                Time: {schedule.sessions.find(s => isSameDay(new Date(s.date), selectedDate))?.startTime} - 
                      {schedule.sessions.find(s => isSameDay(new Date(s.date), selectedDate))?.endTime}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}