'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  Home,
  FileText,
  Upload,
  CreditCard,
  Settings,
  LogOut,
  User,
  Sparkles
} from 'lucide-react'
import { useUser } from '@/lib/providers'
import { useClerk } from '@clerk/nextjs'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const commands = [
    {
      group: 'Navigation', items: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: FileText, label: 'My Projects', href: '/dashboard/projects' },
        { icon: Upload, label: 'Upload Video', href: '/dashboard/upload-v2' },
      ]
    },
    {
      group: 'Account', items: [
        { icon: User, label: 'Profile', href: '/dashboard/settings' },
        { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
      ]
    },
    {
      group: 'Actions', items: [
        { icon: LogOut, label: 'Sign Out', action: handleSignOut },
      ]
    },
  ]

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: any) => {
    setOpen(false)
    if (command.action) {
      command.action()
    } else if (command.href) {
      router.push(command.href)
    }
  }, [router])

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        loop
        label="Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <Command className="max-w-2xl w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <Search className="w-5 h-5 text-neutral-500" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-500">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-neutral-500">
              No results found.
            </Command.Empty>
            {commands.map((group) => (
              <React.Fragment key={group.group}>
                <Command.Group
                  heading={<div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase">{group.group}</div>}
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.label}
                      onSelect={() => runCommand(item)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors aria-selected:bg-subit-50 dark:aria-selected:bg-subit-900/20 aria-selected:text-subit-600 dark:aria-selected:text-subit-400"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.label === 'Sign Out' && (
                        <Sparkles className="w-3 h-3 ml-auto text-neutral-400" />
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </React.Fragment>
            ))}
          </Command.List>
        </Command>
      </Command.Dialog>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search className="w-4 h-4 text-neutral-500 group-hover:text-subit-600 dark:group-hover:text-subit-400 transition-colors" />
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-2 font-mono text-xs font-medium text-neutral-600 dark:text-neutral-400">
            ⌘K
          </kbd>
        </button>
      </div>
    </>
  )
}

