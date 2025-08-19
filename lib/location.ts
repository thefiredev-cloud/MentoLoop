import { z } from 'zod'

export interface LocationData {
  city: string
  state: string
  zipCode: string
  county?: string
  ipAddress?: string
  lat?: number
  lng?: number
}

export interface IPLocationResponse {
  city: string
  region: string
  region_code: string
  country: string
  country_code: string
  postal: string
  latitude: number
  longitude: number
  in_eu: boolean
  timezone: string
  utc_offset: string
  country_calling_code: string
  currency: string
  currency_name: string
  languages: string
  org: string
  asn: string
}

// Texas ZIP code ranges
const TEXAS_ZIP_RANGES = [
  { min: 73301, max: 73344 }, // West Texas
  { min: 75001, max: 75501 }, // North Texas (Dallas area)
  { min: 75701, max: 75799 }, // East Texas
  { min: 76001, max: 76798 }, // Central Texas
  { min: 77001, max: 77299 }, // Houston area
  { min: 77301, max: 77598 }, // Greater Houston
  { min: 78101, max: 78799 }, // South/Central Texas (Austin/San Antonio)
  { min: 79001, max: 79999 }, // West Texas/Panhandle
  { min: 88510, max: 88589 }, // El Paso area
]

// Major Texas metropolitan areas
export const TEXAS_METRO_AREAS = {
  'Dallas-Fort Worth': {
    counties: ['Dallas', 'Tarrant', 'Collin', 'Denton', 'Rockwall', 'Ellis', 'Johnson', 'Parker', 'Wise', 'Kaufman', 'Hunt'],
    zipRanges: [
      { min: 75001, max: 75501 },
      { min: 76001, max: 76199 }
    ]
  },
  'Houston': {
    counties: ['Harris', 'Fort Bend', 'Montgomery', 'Brazoria', 'Galveston', 'Liberty', 'Waller', 'Chambers'],
    zipRanges: [
      { min: 77001, max: 77299 },
      { min: 77301, max: 77598 }
    ]
  },
  'San Antonio': {
    counties: ['Bexar', 'Comal', 'Guadalupe', 'Wilson', 'Medina', 'Kendall', 'Bandera'],
    zipRanges: [
      { min: 78101, max: 78299 }
    ]
  },
  'Austin': {
    counties: ['Travis', 'Williamson', 'Hays', 'Caldwell', 'Bastrop'],
    zipRanges: [
      { min: 78701, max: 78799 },
      { min: 78613, max: 78681 }
    ]
  }
}

export const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.literal('TX', { errorMap: () => ({ message: 'Only Texas locations are supported' }) }),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').refine(
    (zip) => isTexasZipCode(zip),
    { message: 'ZIP code must be in Texas' }
  ),
  county: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export function isTexasZipCode(zipCode: string): boolean {
  const cleanZip = zipCode.replace(/-.*/, '') // Remove ZIP+4 extension
  const zipNum = parseInt(cleanZip, 10)
  
  if (isNaN(zipNum)) return false
  
  return TEXAS_ZIP_RANGES.some(range => 
    zipNum >= range.min && zipNum <= range.max
  )
}

export function getMetroAreaFromZip(zipCode: string): string | null {
  const cleanZip = zipCode.replace(/-.*/, '')
  const zipNum = parseInt(cleanZip, 10)
  
  if (isNaN(zipNum)) return null
  
  for (const [metroName, metroData] of Object.entries(TEXAS_METRO_AREAS)) {
    const inRange = metroData.zipRanges.some(range => 
      zipNum >= range.min && zipNum <= range.max
    )
    if (inRange) return metroName
  }
  
  return 'Other Texas'
}

export function getCountyFromZip(zipCode: string): string | null {
  // This would normally use a comprehensive ZIP to county database
  // For now, returning based on metro area mapping
  const metro = getMetroAreaFromZip(zipCode)
  if (!metro || metro === 'Other Texas') return null
  
  const metroData = TEXAS_METRO_AREAS[metro as keyof typeof TEXAS_METRO_AREAS]
  return metroData.counties[0] // Return primary county
}

export async function getLocationFromIP(ipAddress: string): Promise<LocationData | null> {
  try {
    // Using ipapi.co for IP geolocation (free tier available)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }
    
    const data: IPLocationResponse = await response.json()
    
    // Only allow Texas locations
    if (data.region_code !== 'TX' || data.country_code !== 'US') {
      return null
    }
    
    return {
      city: data.city,
      state: data.region_code,
      zipCode: data.postal,
      county: getCountyFromZip(data.postal),
      ipAddress,
      lat: data.latitude,
      lng: data.longitude,
    }
  } catch (error) {
    console.error('Error fetching location from IP:', error)
    return null
  }
}

export function validateTexasLocation(location: Partial<LocationData>): boolean {
  try {
    locationSchema.parse(location)
    return true
  } catch {
    return false
  }
}

export function getClientIP(request: Request): string | undefined {
  // Check various headers for the real IP address
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIP) {
    return xRealIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback - this won't work in production behind a proxy
  return '127.0.0.1'
}

// Texas regions for analytics display
export const TEXAS_REGIONS = [
  'Dallas-Fort Worth',
  'Houston',
  'San Antonio',
  'Austin',
  'East Texas',
  'West Texas',
  'Central Texas',
  'South Texas',
  'North Texas',
  'Panhandle'
]

export function getRegionFromMetro(metroArea: string): string {
  switch (metroArea) {
    case 'Dallas-Fort Worth':
      return 'North Texas'
    case 'Houston':
      return 'East Texas'
    case 'San Antonio':
      return 'South Texas'
    case 'Austin':
      return 'Central Texas'
    default:
      return 'Other Texas'
  }
}