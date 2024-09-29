'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

const cohortColors = [
  'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 
  'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-teal-200'
]

export default function CohortManager({ cohorts = [], onUpdate }) {
  const [newCohort, setNewCohort] = useState({ name: '', monthlyHours: '' })
  const [editingCohort, setEditingCohort] = useState(null)
  const [error, setError] = useState('')

  const handleAddCohort = () => {
    if (newCohort.name && newCohort.monthlyHours) {
      if (cohorts.some(cohort => cohort.name.toLowerCase() === newCohort.name.toLowerCase())) {
        setError('A cohort with this name already exists.')
        return
      }
      const updatedCohorts = [
        ...cohorts, 
        { 
          ...newCohort, 
          monthlyHours: parseInt(newCohort.monthlyHours),
          color: cohortColors[cohorts.length % cohortColors.length]
        }
      ]
      onUpdate(updatedCohorts)
      setNewCohort({ name: '', monthlyHours: '' })
      setError('')
    }
  }

  const handleEditCohort = (cohort) => {
    setEditingCohort({ ...cohort })
  }

  const handleUpdateCohort = () => {
    if (editingCohort) {
      if (cohorts.some(c => c.name.toLowerCase() === editingCohort.name.toLowerCase() && c.name !== editingCohort.originalName)) {
        setError('A cohort with this name already exists.')
        return
      }
      const updatedCohorts = cohorts.map(c => 
        c.name === editingCohort.originalName ? { ...editingCohort, monthlyHours: parseInt(editingCohort.monthlyHours) } : c
      )
      onUpdate(updatedCohorts)
      setEditingCohort(null)
      setError('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCohort(null)
    setError('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Cohorts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-name">Cohort Name</Label>
              <Input
                id="cohort-name"
                placeholder="Enter cohort name"
                value={newCohort.name}
                onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-hours">Monthly Hours</Label>
              <Input
                id="monthly-hours"
                type="number"
                placeholder="Enter monthly hours"
                value={newCohort.monthlyHours}
                onChange={(e) => setNewCohort({ ...newCohort, monthlyHours: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddCohort} className="w-full">Add Cohort</Button>
          {error && (
            <div className="text-red-500 flex items-center">
              <AlertCircle className="mr-2" size={16} />
              {error}
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Existing Cohorts</h3>
          {cohorts.length === 0 ? (
            <p className="text-gray-500">No cohorts added yet.</p>
          ) : (
            cohorts.map((cohort, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                {editingCohort && editingCohort.originalName === cohort.name ? (
                  <>
                    <Input
                      value={editingCohort.name}
                      onChange={(e) => setEditingCohort({ ...editingCohort, name: e.target.value })}
                      className="w-1/3"
                    />
                    <Input
                      type="number"
                      value={editingCohort.monthlyHours}
                      onChange={(e) => setEditingCohort({ ...editingCohort, monthlyHours: e.target.value })}
                      className="w-1/3"
                    />
                    <div>
                      <Button onClick={handleUpdateCohort} className="mr-2">Save</Button>
                      <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${cohort.color}`} />
                      <span>{cohort.name}</span>
                    </div>
                    <span>{cohort.monthlyHours} hours/month</span>
                    <Button onClick={() => handleEditCohort({ ...cohort, originalName: cohort.name })}>Edit</Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}