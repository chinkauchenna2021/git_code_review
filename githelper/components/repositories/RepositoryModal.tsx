// 'use client'

// import React, { useState } from 'react'
// import { Modal } from '@/components/ui/Modal'
// import { Button } from '@/components/ui/Button'
// import { Input } from '@/components/ui/Input'
// import { Switch } from '@/components/ui/Switch'
// import { Badge } from '@/components/ui/Badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
// import { GitBranch, Settings, Webhook, Shield, AlertTriangle } from 'lucide-react'

// interface Repository {
//   id: string
//   name: string
//   fullName: string
//   description?: string
//   language: string
//   isActive: boolean
//   isPrivate: boolean
//   webhookStatus: string
//   settings?: {
//     autoReview: boolean
//     reviewOnPush: boolean
//     blockMergeOnIssues: boolean
//     notifyOnCompletion: boolean
//     customPrompt?: string
//   }
// }

// interface RepositoryModalProps {
//   repository: Repository | null
//   open: boolean
//   onClose: () => void
//   onSave: () => void
// }

// export function RepositoryModal({ repository, open, onClose, onSave }: RepositoryModalProps) {
