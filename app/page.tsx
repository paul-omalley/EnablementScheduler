'use client'

import { useState, useEffect } from 'react'
import { startOfYear, endOfYear, eachDayOfInterval, isSaturday, isSunday, startOfMonth, endOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Calendar from './components/Calendar'
import CohortManager from './components/CohortManager'
import ScheduleForm from './components/ScheduleForm'
import BlackoutManager from './components/BlackoutManager'
import ScheduleOverview from './components/ScheduleOverview'

const cohortColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#AED581', '#7986CB'
]

export default function EnablementScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [cohorts, setCohorts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [blackoutDates, setBlackoutDates] = useState([])

  useEffect(() => {
    // Add weekends to blackout dates
    const currentYear = new Date().getFullYear()
    const yearStart = startOfYear(new Date(currentYear, 0, 1))
    const yearEnd = endOfYear(new Date(currentYear, 11, 31))
    const allDaysOfYear = eachDayOfInterval({ start: yearStart, end: yearEnd })
    const weekends = allDaysOfYear.filter(day => isSaturday(day) || isSunday(day))
    setBlackoutDates(weekends)
  }, [])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleMonthChange = (date) => {
    setCurrentMonth(date)
  }

  const handleCohortUpdate = (updatedCohorts) => {
    const cohortsWithColors = updatedCohorts.map((cohort, index) => ({
      ...cohort,
      color: cohortColors[index % cohortColors.length]
    }))
    setCohorts(cohortsWithColors)
  }

  const handleScheduleCreate = async (newSchedule) => {
    setSchedules(prevSchedules => [...prevSchedules, newSchedule])
  }

  const handleBlackoutUpdate = (updatedBlackouts) => {
    setBlackoutDates(prevBlackouts => [...prevBlackouts, ...updatedBlackouts])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enablement Scheduler</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar 
                selectedDate={selectedDate} 
                onSelectDate={handleDateSelect}
                onMonthChange={handleMonthChange}
                schedules={schedules}
                blackoutDates={blackoutDates}
                cohorts={cohorts}
              />
            </CardContent>
          </Card>
          <ScheduleOverview 
            schedules={schedules} 
            cohorts={cohorts} 
            currentMonth={currentMonth}
          />
        </div>
        <div className="space-y-4">
          <ScheduleForm 
            cohorts={cohorts}
            selectedDate={selectedDate}
            onScheduleCreate={handleScheduleCreate}
            blackoutDates={blackoutDates}
            schedules={schedules}
            currentMonth={currentMonth}
          />
          <BlackoutManager onBlackoutUpdate={handleBlackoutUpdate} />
          <CohortManager 
            cohorts={cohorts} 
            onUpdate={handleCohortUpdate} 
          />
        </div>
      </div>
    </div>
  )
}