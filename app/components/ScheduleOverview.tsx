import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isSameMonth } from 'date-fns'

export default function ScheduleOverview({ schedules, cohorts, currentMonth }) {
  const calculateRemainingHours = (cohortName) => {
    const cohort = cohorts.find(c => c.name === cohortName)
    if (!cohort) return 0

    const usedHours = schedules.reduce((total, schedule) => {
      if (schedule.selectedCohorts.includes(cohortName)) {
        return total + schedule.sessions.reduce((sessionTotal, session) => {
          if (isSameMonth(new Date(session.date), currentMonth)) {
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

  const currentMonthSchedules = schedules.filter(schedule => 
    schedule.sessions.some(session => isSameMonth(new Date(session.date), currentMonth))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Overview for {format(currentMonth, 'MMMM yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Scheduled Sessions</h3>
            {currentMonthSchedules.length === 0 ? (
              <p className="text-gray-500">No sessions scheduled for this month.</p>
            ) : (
              <ul className="space-y-2">
                {currentMonthSchedules.map((schedule, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-semibold">{schedule.title}</p>
                    <p className="text-sm text-gray-600">
                      Cohorts: {schedule.selectedCohorts.join(', ')}
                    </p>
                    {schedule.sessions
                      .filter(session => isSameMonth(new Date(session.date), currentMonth))
                      .map((session, sessionIndex) => (
                        <p key={sessionIndex} className="text-sm">
                          {format(new Date(session.date), 'MMM d, yyyy')} - {session.startTime} to {session.endTime}
                        </p>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Remaining Cohort Budgets</h3>
            <ul className="space-y-2">
              {cohorts.map((cohort, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{cohort.name}</span>
                  <span>{calculateRemainingHours(cohort.name)} hours remaining</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}