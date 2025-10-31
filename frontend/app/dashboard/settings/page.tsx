'use client'

import { useUser } from '@/lib/providers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { user } = useUser()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input placeholder="Your name" defaultValue={user?.name || ''} />
          </div>
          <Button className="mt-4">Update Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="dark-mode" className="h-4 w-4" />
            <label htmlFor="dark-mode" className="text-sm font-medium">
              Dark Mode
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="notifications" className="h-4 w-4" defaultChecked />
            <label htmlFor="notifications" className="text-sm font-medium">
              Email Notifications
            </label>
          </div>
          <Button className="mt-4">Save Preferences</Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all data
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
