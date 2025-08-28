import { z } from 'zod'
import { 
  SUPPORTED_STATE_CODES, 
  isSupportedZipCode, 
  isSupportedState,
  getStateFromZip,
  getMetroAreaFromZip as getMetroFromZip,
  getCountyFromZip as getCountyFromZipConfig
} from './states-config'

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

// Re-export functions from states-config for backward compatibility
export const getMetroAreaFromZip = getMetroFromZip
export const getCountyFromZip = getCountyFromZipConfig

// Legacy function for backward compatibility
export function isTexasZipCode(zipCode: string): boolean {
  const state = getStateFromZip(zipCode)
  return state === 'TX'
}

export const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.enum(SUPPORTED_STATE_CODES as [string, ...string[]], { 
    errorMap: () => ({ message: 'State must be one of the supported states' }) 
  }),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').refine(
    (zip) => isSupportedZipCode(zip),
    { message: 'ZIP code must be in a supported state' }
  ),
  county: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export async function getLocationFromIP(ipAddress: string): Promise<LocationData | null> {
  try {
    // Debug logging
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Fetching location for IP:', ipAddress)
    }
    
    // Using ipapi.co for IP geolocation (free tier available)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    
    if (!response.ok) {
      console.error(`[Location] API response not OK: ${response.status} ${response.statusText}`)
      throw new Error('Failed to fetch location data')
    }
    
    const data: IPLocationResponse = await response.json()
    
    // Debug logging
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] API Response:', {
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        country_code: data.country_code,
        postal: data.postal,
        org: data.org,
        asn: data.asn
      })
    }
    
    // Check if response indicates an error
    const dataWithError = data as IPLocationResponse & { error?: boolean }
    if (dataWithError.error) {
      console.error('[Location] API Error:', dataWithError)
      return null
    }
    
    // Only allow locations in supported states
    if (!isSupportedState(data.region_code) || data.country_code !== 'US') {
      if (process.env.DEBUG_LOCATION === 'true') {
        console.log('[Location] Location not in supported state:', {
          state: data.region_code,
          country: data.country_code,
          isSupported: isSupportedState(data.region_code),
          supportedStates: SUPPORTED_STATE_CODES
        })
      }
      return null
    }
    
    const locationData = {
      city: data.city,
      state: data.region_code,
      zipCode: data.postal,
      county: getCountyFromZip(data.postal) || undefined,
      ipAddress,
      lat: data.latitude,
      lng: data.longitude,
    }
    
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Returning location data:', locationData)
    }
    
    return locationData
  } catch (error) {
    console.error('[Location] Error fetching location from IP:', error)
    return null
  }
}

export function validateSupportedLocation(location: Partial<LocationData>): boolean {
  try {
    locationSchema.parse(location)
    return true
  } catch {
    return false
  }
}

// Legacy function for backward compatibility
export function validateTexasLocation(location: Partial<LocationData>): boolean {
  return validateSupportedLocation(location) && location.state === 'TX'
}

export function getClientIP(request: Request): string | undefined {
  // Debug logging of all headers if enabled
  if (process.env.DEBUG_LOCATION === 'true') {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('ip') || 
          key.toLowerCase().includes('forwarded') || 
          key.toLowerCase().includes('client') ||
          key.toLowerCase().includes('x-nf') ||
          key.toLowerCase().includes('x-bb')) {
        headers[key] = value
      }
    })
    console.log('[Location] Request headers containing IP info:', headers)
  }
  
  // Check Netlify-specific headers first (for production on Netlify)
  const netlifyIP = request.headers.get('x-nf-client-connection-ip')
  const bbIP = request.headers.get('x-bb-ip')
  const clientIP = request.headers.get('client-ip')
  
  if (netlifyIP) {
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using Netlify IP:', netlifyIP)
    }
    return netlifyIP
  }
  
  if (bbIP) {
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using BB IP:', bbIP)
    }
    return bbIP
  }
  
  if (clientIP) {
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using Client IP:', clientIP)
    }
    return clientIP
  }
  
  // Check standard headers for other hosting providers
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    const firstIP = xForwardedFor.split(',')[0].trim()
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using X-Forwarded-For IP:', firstIP, 'from:', xForwardedFor)
    }
    return firstIP
  }
  
  if (xRealIP) {
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using X-Real-IP:', xRealIP)
    }
    return xRealIP
  }
  
  if (cfConnectingIP) {
    if (process.env.DEBUG_LOCATION === 'true') {
      console.log('[Location] Using CF-Connecting-IP:', cfConnectingIP)
    }
    return cfConnectingIP
  }
  
  // Fallback - this won't work in production behind a proxy
  if (process.env.DEBUG_LOCATION === 'true') {
    console.log('[Location] No IP headers found, using fallback 127.0.0.1')
  }
  return '127.0.0.1'
}

// Legacy - Texas regions for analytics display
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

// All supported regions for analytics display
export const SUPPORTED_REGIONS = [
  // Texas
  'Dallas-Fort Worth',
  'Houston',
  'San Antonio',
  'Austin',
  'El Paso',
  // Arizona
  'Phoenix',
  'Tucson',
  'Flagstaff',
  // California
  'Los Angeles',
  'San Francisco Bay Area',
  'San Diego',
  'Sacramento',
  // Colorado
  'Denver',
  'Colorado Springs',
  'Boulder',
  'Fort Collins',
  // Florida
  'Miami-Fort Lauderdale',
  'Tampa-St. Petersburg',
  'Orlando',
  'Jacksonville',
  // Louisiana
  'New Orleans',
  'Baton Rouge',
  'Shreveport',
  'Lafayette',
  // New Mexico
  'Albuquerque',
  'Santa Fe',
  'Las Cruces',
  // Oklahoma
  'Oklahoma City',
  'Tulsa',
  'Norman',
  // Arkansas
  'Little Rock',
  'Fayetteville-Springdale',
  'Fort Smith'
]

export function getRegionFromMetro(metroArea: string): string {
  // This now returns the metro area itself as the region
  // since we're supporting multiple states with different regional structures
  return metroArea || 'Other'
}