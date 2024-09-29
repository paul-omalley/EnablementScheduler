'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addDays, format, isSameDay, isSameMonth, startOfMonth, endOfMonth, e

achDayOfInterval } from 'date-fns'

export default function ScheduleForm({ cohorts = [], selectedDate, onScheduleCreate, blackoutDates = [], schedules = [], currentMonth }) {
  const [schedule, setSchedule] = useState({
    title: '',
    sessions: [{ date: selectedDate, startTime: '09:00', endTime: '17:00' }],
    selectedCohorts: []
  })
  const [suggestedDates, setSuggestedDates] = useState([])

  useEffect(() => {
    setSchedule(prev => ({
      ...prev,
      sessions: [{ date: selectedDate, startTime: '09:00', endTime: '17:00' }]
    }))
  }, [selectedDate])

  const isBlackoutDate = (date) => blackoutDates.some(blackoutDate => isSameDay(new Date(blackoutDate), date))

  const handleAddSession = () => {
    const newSession = {
      date: addDays(new Date(schedule.sessions[schedule.sessions.length - 1].date), 1),
      startTime: '09:00',
      endTime: '17:00'
    }
    setSchedule(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }))
  }

  const handleRemoveSession = (index) => {
    setSchedule(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }))
  }

  const handleSessionChange = (index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }))
  }

  const calculateTotalHours = (sessions) => {
    return sessions.reduce((total, session) => {
      const start = new Date(`1970-01-01T${session.startTime}:00`)
      const end = new Date(`1970-01-01T${session.endTime}:00`)
      const hours = (end - start) / (1000 * 60 * 60)
      return total + hours
    }, 0)
  }

  const calculateRemainingHours = (cohortName, month) => {
    const cohort = cohorts.find(c => c.name === cohortName)
    if (!cohort) return 0

    const usedHours = schedules.reduce((total, schedule) => {
      if (schedule.selectedCohorts.includes(cohortName)) {
        return total + schedule.sessions.reduce((sessionTotal, session) => {
          if (isSameMonth(new Date(session.date), month)) {
            const start = new Date(`1970-01-01T${session.startTime}:00`)
            const end = new Date(`1970-01-01T${session.endTime}:00`)
            return sessionTotal + (end - start) / (1000 * 60 * 60)
          }
          return sessionTotal
        }, 0)
      }
      return total
    }, 0)

    return Math.max(0, cohort.monthlyHours - usedHours)
  }

  const checkCohortLimits = () => {
    const totalHours = calculateTotalHours(schedule.sessions)
    return schedule.selectedCohorts.map(cohortName => {
      const remainingHours = calculateRemainingHours(cohortName, currentMonth)
      return {
        name: cohortName,
        overLimit: totalHours > remainingHours,
        availableHours: Math.max(0, remainingHours - totalHours)
      }
    })
  }

  const findOptimalDates = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const availableDates = allDaysInMonth.filter(day => 
      !isBlackoutDate(day) && !schedules.some(schedule => 
        schedule.sessions.some(session => isSameDay(new Date(session.date), day))
      )
    )

    const totalHoursNeeded = calculateTotalHours(schedule.sessions)
    const suggestedDates = []

    for (let i = 0; i < availableDates.length; i++) {
      const startDate = availableDates[i]
      const endDate = addDays(startDate, schedule.sessions.length - 1)
      
      if (endDate <= monthEnd) {
        const possibleDates = eachDayOfInterval({ start: startDate, end: endDate })
        const isAvailable = possibleDates.every(date => availableDates.some(d => isSameDay(d, date)))
        
        if (isAvailable) {
          const allCohortsAvailable = schedule.selectedCohorts.every(cohortName => {
            const remainingHours = calculateRemainingHours(cohortName, currentMonth)
            return totalHoursNeeded <= remainingHours
          })

          if (allCohortsAvailable) {
            suggestedDates.push(startDate)
          }
        }
      }
    }

    return suggestedDates.slice(0, 3) // Return top 3 suggestions
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cohortLimits = checkCohortLimits()
    const isOverLimit = cohortLimits.some(cohort => cohort.overLimit)
    if (isOverLimit) {
      alert('Some cohorts exceed their monthly hour limit. Please adjust the schedule.')
      const suggested = findOptimalDates()
      setSuggestedDates(suggested)
      return
    }
    onScheduleCreate(schedule)
    setSchedule({
      title: '',
      sessions: [{ date: selectedDate, startTime: '09:00', endTime: '17:00' }],
      selectedCohorts: []
    })
    setSuggestedDates([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-title">Session Title</Label>
            <Input
              id="session-title"
              value={schedule.title}
              onChange={(e) => setSchedule({ ...schedule, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Sessions</Label>
            {schedule.sessions.map((session, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={format(new Date(session.date), 'yyyy-MM-dd')}
                  onChange={(e) => handleSessionChange(index, 'date', new Date(e.target.value))}
                  className="w-1/3"
                />
                <Input
                  type="time"
                  value={session.startTime}
                  onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                  className="w-1/4"
                />
                <Input
                  type="time"
                  value={session.endTime}
                  onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                  className="w-1/4"
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => handleRemoveSession(index)}
                  disabled={schedule.sessions.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddSession} className="w-full">
              Add Session Day
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Select Cohorts</Label>
            {cohorts.map((cohort, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`cohort-${index}`}
                  checked={schedule.selectedCohorts.includes(cohort.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSchedule({
                        ...schedule,
                        selectedCohorts: [...schedule.selectedCohorts, cohort.name]
                      })
                    } else {
                      setSchedule({
                        ...schedule,
                        selectedCohorts: schedule.selectedCohorts.filter(name => name !== cohort.name)
                      })
                    }
                  }}
                />
                <Label htmlFor={`cohort-${index}`}>{cohort.name}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Cohort Hour Limits</Label>
            {checkCohortLimits().map((cohort, index) => (
              <div key={index} className={`text-sm ${cohort.overLimit ? 'text-red-500' : 'text-green-500'}`}>
                {cohort.name}: {cohort.availableHours} hours available
              </div>
            ))}
          </div>

          {suggestedDates.length > 0 && (
            <div className="space-y-2">
              <Label>Suggested Dates</Label>
              <ul className="list-disc pl-5">
                {suggestedDates.map((date, index) => (
                  <li key={index} className="text-sm">
                    {format(date, 'MMMM d, yyyy')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button type="submit" className="w-full">Schedule Session</Button>
        </form>
      </CardContent>
    </Card>
  )
}