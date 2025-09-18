export interface Organization {
  id: string
  name: string
  description: string
  contactEmail: string
  contactPhone?: string
  website?: string
  location: string
  establishedDate?: string
  tags: string[]
  logoUrl?: string
  isVerified: boolean
  ownerId: string
  ownerName: string
  memberCount: number
  activePostCount: number
  createdAt: any
  updatedAt: any
}

export interface CreateOrganization {
  name: string
  description: string
  contactEmail: string
  contactPhone?: string
  website?: string
  location: string
  establishedDate?: string
  tags: string[]
}

export interface UpdateOrganization {
  name?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  location?: string
  establishedDate?: string
  tags?: string[]
}