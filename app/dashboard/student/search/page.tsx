'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search,
  MapPin,
  Building,
  Users,
  ExternalLink,
  Send,
  Filter,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

type PreceptorType = {
  _id: Id<"preceptors">
  personalInfo?: {
    fullName?: string
    specialty?: string
    licenseType?: string
    statesLicensed?: string[]
  }
  practiceInfo?: {
    practiceName?: string
    practiceSettings?: string[]
    city?: string
    state?: string
    website?: string
  }
  availability?: {
    currentlyAccepting?: boolean
    availableRotations?: string[]
    maxStudentsPerRotation?: string
    rotationDurationPreferred?: string
    daysAvailable?: string[]
  }
}

export default function PreceptorSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedRotationType, setSelectedRotationType] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedPracticeSettings, setSelectedPracticeSettings] = useState<string[]>([])
  const [currentlyAcceptingOnly, setCurrentlyAcceptingOnly] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPreceptor, setSelectedPreceptor] = useState<PreceptorType | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [preferredStartDate, setPreferredStartDate] = useState('')

  const searchResults = useQuery(api.preceptors.searchPreceptors, {
    searchQuery: searchQuery.trim() || undefined,
    specialty: (selectedSpecialty || undefined) as "FNP" | "PNP" | "PMHNP" | "AGNP" | "ACNP" | "WHNP" | "NNP" | "other" | undefined,
    rotationType: (selectedRotationType || undefined) as "family-practice" | "pediatrics" | "psych-mental-health" | "womens-health" | "adult-gero" | "acute-care" | "other" | undefined,
    location: {
      state: selectedState || undefined,
      city: selectedCity.trim() || undefined,
    },
    practiceSettings: (selectedPracticeSettings.length > 0 ? selectedPracticeSettings : undefined) as ("telehealth" | "other" | "private-practice" | "urgent-care" | "hospital" | "clinic")[] | undefined,
    currentlyAccepting: currentlyAcceptingOnly,
    limit: 20,
  })

  const preceptorDetails = useQuery(
    api.preceptors.getPublicPreceptorDetails, 
    selectedPreceptor ? { preceptorId: (selectedPreceptor as {_id: Id<"preceptors">})._id } : "skip"
  )

  const requestMatch = useMutation(api.preceptors.requestPreceptorMatch)

  const specialties = [
    { value: 'FNP', label: 'Family Nurse Practitioner' },
    { value: 'PNP', label: 'Pediatric Nurse Practitioner' },
    { value: 'PMHNP', label: 'Psychiatric Mental Health NP' },
    { value: 'AGNP', label: 'Adult-Gerontology NP' },
    { value: 'ACNP', label: 'Acute Care NP' },
    { value: 'WHNP', label: 'Women\'s Health NP' },
    { value: 'NNP', label: 'Neonatal NP' },
    { value: 'other', label: 'Other' },
  ]

  const rotationTypes = [
    { value: 'family-practice', label: 'Family Practice' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psych-mental-health', label: 'Psychiatric/Mental Health' },
    { value: 'adult-gero', label: 'Adult-Gerontology' },
    { value: 'womens-health', label: 'Women\'s Health' },
    { value: 'acute-care', label: 'Acute Care' },
    { value: 'other', label: 'Other' },
  ]

  const practiceSettings = [
    { value: 'private-practice', label: 'Private Practice' },
    { value: 'urgent-care', label: 'Urgent Care' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'telehealth', label: 'Telehealth' },
    { value: 'other', label: 'Other' },
  ]

  const handlePracticeSettingChange = (setting: string, checked: boolean) => {
    if (checked) {
      setSelectedPracticeSettings(prev => [...prev, setting])
    } else {
      setSelectedPracticeSettings(prev => prev.filter(s => s !== setting))
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSpecialty('')
    setSelectedRotationType('')
    setSelectedState('')
    setSelectedCity('')
    setSelectedPracticeSettings([])
    setCurrentlyAcceptingOnly(true)
  }

  const handleRequestMatch = async () => {
    if (!selectedPreceptor || !selectedRotationType) {
      toast.error('Please select a rotation type')
      return
    }

    try {
      await requestMatch({
        preceptorId: (selectedPreceptor as {_id: Id<"preceptors">})._id,
        message: requestMessage.trim() || undefined,
        preferredStartDate: preferredStartDate || undefined,
        rotationType: selectedRotationType,
      })

      toast.success('Match request sent successfully!')
      setSelectedPreceptor(null)
      setRequestMessage('')
      setPreferredStartDate('')
    } catch (error) {
      console.error('Failed to request match:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send match request')
    }
  }

  const getSpecialtyLabel = (value: string) => 
    specialties.find(s => s.value === value)?.label || value

  const getRotationTypeLabel = (value: string) => 
    rotationTypes.find(r => r.value === value)?.label || value

  const getPracticeSettingLabel = (value: string) => 
    practiceSettings.find(p => p.value === value)?.label || value

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Preceptors</h1>
          <p className="text-muted-foreground">
            Search and request matches with verified preceptors
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, practice, location, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any specialty</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rotation Type</Label>
                <Select value={selectedRotationType} onValueChange={setSelectedRotationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rotation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rotation type</SelectItem>
                    {rotationTypes.map(rotation => (
                      <SelectItem key={rotation.value} value={rotation.value}>
                        {rotation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="e.g., TX"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Enter city name"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Practice Settings</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {practiceSettings.map(setting => (
                  <div key={setting.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={setting.value}
                      checked={selectedPracticeSettings.includes(setting.value)}
                      onCheckedChange={(checked) => 
                        handlePracticeSettingChange(setting.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={setting.value} className="text-sm">
                      {setting.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accepting"
                checked={currentlyAcceptingOnly}
                onCheckedChange={(checked) => setCurrentlyAcceptingOnly(checked as boolean)}
              />
              <Label htmlFor="accepting">
                Only show preceptors currently accepting students
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results {searchResults && `(${searchResults.length})`}
            </h2>
          </div>

          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(preceptor => (
                <Card 
                  key={preceptor._id} 
                  className={`cursor-pointer transition-colors hover:border-primary ${
                    (selectedPreceptor as {_id?: string} | null)?._id === preceptor._id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedPreceptor(preceptor as unknown as PreceptorType)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{preceptor.personalInfo.fullName}</h3>
                          {preceptor.availability.currentlyAccepting ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepting
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Accepting
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {getSpecialtyLabel(preceptor.personalInfo.specialty)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {preceptor.practiceInfo.city}, {preceptor.practiceInfo.state}
                          </span>
                        </div>

                        <div className="text-sm">
                          <p className="font-medium">{preceptor.practiceInfo.practiceName}</p>
                          <p className="text-muted-foreground">
                            {preceptor.practiceInfo.practiceSettings.map(getPracticeSettingLabel).join(', ')}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {preceptor.availability.availableRotations.slice(0, 3).map(rotation => (
                            <Badge key={rotation} variant="outline" className="text-xs">
                              {getRotationTypeLabel(rotation)}
                            </Badge>
                          ))}
                          {preceptor.availability.availableRotations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{preceptor.availability.availableRotations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults === undefined ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No preceptors found matching your criteria</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear filters to see more results
              </Button>
            </div>
          )}
        </div>

        {/* Preceptor Details */}
        <div className="space-y-4">
          {selectedPreceptor ? (
            <>
              <h2 className="text-xl font-semibold">Preceptor Details</h2>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {preceptorDetails?.personalInfo.fullName || selectedPreceptor?.personalInfo?.fullName}
                      {selectedPreceptor?.availability?.currentlyAccepting ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepting Students
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Currently Accepting
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedPreceptor?.practiceInfo?.city}, {selectedPreceptor?.practiceInfo?.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Practice Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Practice:</span> {selectedPreceptor?.practiceInfo?.practiceName}</p>
                      <p><span className="font-medium">Specialty:</span> {getSpecialtyLabel(selectedPreceptor?.personalInfo?.specialty || '')}</p>
                      <p><span className="font-medium">License:</span> {selectedPreceptor?.personalInfo?.licenseType}</p>
                      <p><span className="font-medium">Settings:</span> {selectedPreceptor?.practiceInfo?.practiceSettings?.map(getPracticeSettingLabel).join(', ')}</p>
                      {preceptorDetails?.practiceInfo.website && (
                        <p>
                          <span className="font-medium">Website:</span>{' '}
                          <a 
                            href={preceptorDetails.practiceInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Visit website <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Available Rotations</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPreceptor?.availability?.availableRotations?.map((rotation: string) => (
                        <Badge key={rotation} variant="outline">
                          {getRotationTypeLabel(rotation)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Availability Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Max Students</p>
                        <p className="font-medium">{selectedPreceptor?.availability?.maxStudentsPerRotation}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration Preference</p>
                        <p className="font-medium">{selectedPreceptor?.availability?.rotationDurationPreferred}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground text-sm">Available Days</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPreceptor?.availability?.daysAvailable?.map((day: string) => (
                          <Badge key={day} variant="outline" className="text-xs capitalize">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedPreceptor?.availability?.currentlyAccepting && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Request a Match</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rotation-type">Rotation Type *</Label>
                          <Select value={selectedRotationType} onValueChange={setSelectedRotationType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rotation type" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedPreceptor?.availability?.availableRotations?.map((rotation: string) => (
                                <SelectItem key={rotation} value={rotation}>
                                  {getRotationTypeLabel(rotation)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="start-date">Preferred Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={preferredStartDate}
                            onChange={(e) => setPreferredStartDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself and explain why you'd like to work with this preceptor..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={handleRequestMatch}
                          disabled={!selectedRotationType}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Match Request
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a preceptor to view details and request a match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
