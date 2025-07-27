"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react"
import { useAuth } from "@/lib/auth/better-hook"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { DropdownMenu } from "@/components/ui/DropdownMenu"
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Users, 
  Building,
  ChevronDown 
} from "lucide-react"

export function UserMenu() {
  const { user, signOut, activeOrganization, organizations, switchOrganization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      await switchOrganization(organizationId)
    } catch (error) {
      console.error("Switch organization error:", error)
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2">
          <Avatar src={user.image} alt={user.name} size="sm" />
          <div className="text-left">
            <p className="text-sm font-medium">{user.name}</p>
            {activeOrganization && (
              <p className="text-xs text-gray-500">{activeOrganization.organization.name}</p>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" className="w-56">
        <DropdownMenu.Label>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </DropdownMenu.Label>

        <DropdownMenu.Separator />

        {/* Organization Switcher */}
        {organizations.length > 1 && (
          <>
            <DropdownMenu.Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Switch Organization
            </DropdownMenu.Label>
            {organizations.map((org: { id: Key | null | undefined; organizationId: string; organization: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined } }) => (
              <DropdownMenu.Item
                key={org.id}
                onClick={() => handleSwitchOrganization(org.organizationId)}
                className={activeOrganization?.id === org.id ? "bg-gray-100" : ""}
              >
                <Building className="w-4 h-4 mr-2" />
                {org.organization.name}
                {activeOrganization?.id === org.id && (
                  <span className="ml-auto text-xs text-blue-600">Current</span>
                )}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator />
          </>
        )}

        <DropdownMenu.Item onClick={() => window.location.href = "/profile"}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={() => window.location.href = "/settings"}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={() => window.location.href = "/billing"}>
          <CreditCard className="w-4 h-4 mr-2" />
          Billing
        </DropdownMenu.Item>

        {activeOrganization && (
          <DropdownMenu.Item onClick={() => window.location.href = "/organization"}>
            <Users className="w-4 h-4 mr-2" />
            Organization
          </DropdownMenu.Item>
        )}

        <DropdownMenu.Separator />

        <DropdownMenu.Item onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="w-4 h-4 mr-2" />
          {isLoading ? "Signing out..." : "Sign out"}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}