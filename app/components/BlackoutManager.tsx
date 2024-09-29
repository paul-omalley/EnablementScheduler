'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addDays, subDays, startOfQuarter, endOfQuarter, eachDayOfInterval } from 'date-fns'

export default function BlackoutManager({ onBlackoutUpdate }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleAddBlackout = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const blackoutDates = eachDayOfInterval({ start, end })
      onBlackoutUpdate(blackoutDates)
      setStartDate('')
      setEndDate('')
    }
  }

  const handleQuarterEndBlackout = () => {
    const currentYear = new Date().getFullYear()
    const quarterEnds = [
      endOfQuarter(new Date(currentYear, 2, 31)), // Q1 end
      endOfQuarter(new Date(currentYear, 5, 30)), // Q2 end
      endOfQuarter(new Date(currentYear, 8, 30)), // Q3 end
      endOfQuarter(new Date(currentYear, 11, 31)) // Q4 end
    ]

    const blackoutDates = quarterEnds.flatMap(quarterEnd => {
      const blackoutStart = subDays(quarterEnd, 13) // Start 14 days before quarter end (inclusive)
      return eachDayOfInterval({ start: blackoutStart, end: quarterEnd })
    })

    onBlackoutUpdate(blackoutDates)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Blackout Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
          <Button onClick={handleAddBlackout} className="w-full">Add Blackout Period</Button>
          <Button onClick={handleQuarterEndBlackout} className="w-full">Add Quarter-End Blackouts</Button>
        </div>
      </CardContent>
    </Card>
  )
}