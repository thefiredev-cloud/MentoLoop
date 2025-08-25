export interface StateConfig {
  code: string
  name: string
  zipRanges: Array<{ min: number; max: number }>
  metroAreas?: Record<string, {
    counties: string[]
    zipRanges: Array<{ min: number; max: number }>
  }>
}

// Supported states configuration
export const SUPPORTED_STATES: Record<string, StateConfig> = {
  AR: {
    code: 'AR',
    name: 'Arkansas',
    zipRanges: [
      { min: 71601, max: 72959 }
    ],
    metroAreas: {
      'Little Rock': {
        counties: ['Pulaski', 'Saline', 'Faulkner', 'Lonoke'],
        zipRanges: [{ min: 72001, max: 72231 }]
      },
      'Fayetteville-Springdale': {
        counties: ['Washington', 'Benton', 'Madison'],
        zipRanges: [{ min: 72701, max: 72764 }]
      },
      'Fort Smith': {
        counties: ['Sebastian', 'Crawford'],
        zipRanges: [{ min: 72901, max: 72959 }]
      }
    }
  },
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    zipRanges: [
      { min: 85001, max: 86556 }
    ],
    metroAreas: {
      'Phoenix': {
        counties: ['Maricopa', 'Pinal'],
        zipRanges: [
          { min: 85001, max: 85099 },
          { min: 85201, max: 85399 }
        ]
      },
      'Tucson': {
        counties: ['Pima', 'Santa Cruz'],
        zipRanges: [{ min: 85701, max: 85799 }]
      },
      'Flagstaff': {
        counties: ['Coconino'],
        zipRanges: [{ min: 86001, max: 86099 }]
      }
    }
  },
  CA: {
    code: 'CA',
    name: 'California',
    zipRanges: [
      { min: 90001, max: 96162 }
    ],
    metroAreas: {
      'Los Angeles': {
        counties: ['Los Angeles', 'Orange', 'Ventura'],
        zipRanges: [
          { min: 90001, max: 91899 },
          { min: 92501, max: 92899 }
        ]
      },
      'San Francisco Bay Area': {
        counties: ['San Francisco', 'Alameda', 'Contra Costa', 'San Mateo', 'Santa Clara', 'Marin'],
        zipRanges: [
          { min: 94001, max: 94999 },
          { min: 95001, max: 95199 }
        ]
      },
      'San Diego': {
        counties: ['San Diego', 'Imperial'],
        zipRanges: [{ min: 91901, max: 92199 }]
      },
      'Sacramento': {
        counties: ['Sacramento', 'Placer', 'El Dorado', 'Yolo'],
        zipRanges: [{ min: 95601, max: 95899 }]
      }
    }
  },
  CO: {
    code: 'CO',
    name: 'Colorado',
    zipRanges: [
      { min: 80001, max: 81658 }
    ],
    metroAreas: {
      'Denver': {
        counties: ['Denver', 'Arapahoe', 'Jefferson', 'Adams', 'Douglas'],
        zipRanges: [{ min: 80001, max: 80299 }]
      },
      'Colorado Springs': {
        counties: ['El Paso', 'Teller'],
        zipRanges: [{ min: 80901, max: 80951 }]
      },
      'Boulder': {
        counties: ['Boulder'],
        zipRanges: [{ min: 80301, max: 80329 }]
      },
      'Fort Collins': {
        counties: ['Larimer'],
        zipRanges: [{ min: 80521, max: 80549 }]
      }
    }
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    zipRanges: [
      { min: 32003, max: 34997 }
    ],
    metroAreas: {
      'Miami-Fort Lauderdale': {
        counties: ['Miami-Dade', 'Broward', 'Palm Beach'],
        zipRanges: [
          { min: 33001, max: 33299 },
          { min: 33301, max: 33499 }
        ]
      },
      'Tampa-St. Petersburg': {
        counties: ['Hillsborough', 'Pinellas', 'Pasco'],
        zipRanges: [{ min: 33501, max: 33799 }]
      },
      'Orlando': {
        counties: ['Orange', 'Seminole', 'Osceola'],
        zipRanges: [{ min: 32801, max: 32899 }]
      },
      'Jacksonville': {
        counties: ['Duval', 'Clay', 'St. Johns'],
        zipRanges: [{ min: 32201, max: 32299 }]
      }
    }
  },
  LA: {
    code: 'LA',
    name: 'Louisiana',
    zipRanges: [
      { min: 70001, max: 71497 }
    ],
    metroAreas: {
      'New Orleans': {
        counties: ['Orleans', 'Jefferson', 'St. Tammany', 'St. Bernard'],
        zipRanges: [{ min: 70001, max: 70199 }]
      },
      'Baton Rouge': {
        counties: ['East Baton Rouge', 'West Baton Rouge', 'Livingston', 'Ascension'],
        zipRanges: [{ min: 70801, max: 70899 }]
      },
      'Shreveport': {
        counties: ['Caddo', 'Bossier'],
        zipRanges: [{ min: 71101, max: 71199 }]
      },
      'Lafayette': {
        counties: ['Lafayette', 'St. Martin', 'Vermilion'],
        zipRanges: [{ min: 70501, max: 70599 }]
      }
    }
  },
  NM: {
    code: 'NM',
    name: 'New Mexico',
    zipRanges: [
      { min: 87001, max: 88439 }
    ],
    metroAreas: {
      'Albuquerque': {
        counties: ['Bernalillo', 'Sandoval', 'Valencia', 'Torrance'],
        zipRanges: [{ min: 87101, max: 87199 }]
      },
      'Santa Fe': {
        counties: ['Santa Fe'],
        zipRanges: [{ min: 87501, max: 87599 }]
      },
      'Las Cruces': {
        counties: ['Doña Ana'],
        zipRanges: [{ min: 88001, max: 88099 }]
      }
    }
  },
  OK: {
    code: 'OK',
    name: 'Oklahoma',
    zipRanges: [
      { min: 73001, max: 74966 }
    ],
    metroAreas: {
      'Oklahoma City': {
        counties: ['Oklahoma', 'Cleveland', 'Canadian', 'Grady'],
        zipRanges: [{ min: 73001, max: 73199 }]
      },
      'Tulsa': {
        counties: ['Tulsa', 'Rogers', 'Wagoner', 'Osage'],
        zipRanges: [{ min: 74001, max: 74199 }]
      },
      'Norman': {
        counties: ['Cleveland'],
        zipRanges: [{ min: 73019, max: 73072 }]
      }
    }
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    zipRanges: [
      { min: 73301, max: 73344 },
      { min: 75001, max: 75501 },
      { min: 75701, max: 75799 },
      { min: 76001, max: 76798 },
      { min: 77001, max: 77299 },
      { min: 77301, max: 77598 },
      { min: 78101, max: 78799 },
      { min: 79001, max: 79999 },
      { min: 88510, max: 88589 }
    ],
    metroAreas: {
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
        zipRanges: [{ min: 78101, max: 78299 }]
      },
      'Austin': {
        counties: ['Travis', 'Williamson', 'Hays', 'Caldwell', 'Bastrop'],
        zipRanges: [
          { min: 78701, max: 78799 },
          { min: 78613, max: 78681 }
        ]
      },
      'El Paso': {
        counties: ['El Paso'],
        zipRanges: [{ min: 88510, max: 88589 }, { min: 79901, max: 79999 }]
      }
    }
  }
}

// Get array of supported state codes
export const SUPPORTED_STATE_CODES = Object.keys(SUPPORTED_STATES)

// Get array of state options for dropdowns
export const STATE_OPTIONS = SUPPORTED_STATE_CODES.map(code => ({
  value: code,
  label: `${SUPPORTED_STATES[code].name} (${code})`
}))

// Check if a ZIP code belongs to any supported state
export function isSupportedZipCode(zipCode: string): boolean {
  const cleanZip = zipCode.replace(/-.*/, '')
  const zipNum = parseInt(cleanZip, 10)
  
  if (isNaN(zipNum)) return false
  
  for (const state of Object.values(SUPPORTED_STATES)) {
    const isInRange = state.zipRanges.some(range => 
      zipNum >= range.min && zipNum <= range.max
    )
    if (isInRange) return true
  }
  
  return false
}

// Get state code from ZIP code
export function getStateFromZip(zipCode: string): string | null {
  const cleanZip = zipCode.replace(/-.*/, '')
  const zipNum = parseInt(cleanZip, 10)
  
  if (isNaN(zipNum)) return null
  
  for (const [stateCode, state] of Object.entries(SUPPORTED_STATES)) {
    const isInRange = state.zipRanges.some(range => 
      zipNum >= range.min && zipNum <= range.max
    )
    if (isInRange) return stateCode
  }
  
  return null
}

// Get metro area from ZIP code
export function getMetroAreaFromZip(zipCode: string): string | null {
  const cleanZip = zipCode.replace(/-.*/, '')
  const zipNum = parseInt(cleanZip, 10)
  
  if (isNaN(zipNum)) return null
  
  const stateCode = getStateFromZip(zipCode)
  if (!stateCode) return null
  
  const state = SUPPORTED_STATES[stateCode]
  if (!state.metroAreas) return null
  
  for (const [metroName, metroData] of Object.entries(state.metroAreas)) {
    const inRange = metroData.zipRanges.some(range => 
      zipNum >= range.min && zipNum <= range.max
    )
    if (inRange) return metroName
  }
  
  return `Other ${state.name}`
}

// Get county from ZIP code
export function getCountyFromZip(zipCode: string): string | null {
  const metro = getMetroAreaFromZip(zipCode)
  if (!metro || metro.startsWith('Other')) return null
  
  const stateCode = getStateFromZip(zipCode)
  if (!stateCode) return null
  
  const state = SUPPORTED_STATES[stateCode]
  if (!state.metroAreas) return null
  
  for (const [metroName, metroData] of Object.entries(state.metroAreas)) {
    if (metroName === metro) {
      return metroData.counties[0] // Return primary county
    }
  }
  
  return null
}

// Validate if a state code is supported
export function isSupportedState(stateCode: string): boolean {
  return stateCode in SUPPORTED_STATES
}

// Get display name for state
export function getStateName(stateCode: string): string {
  return SUPPORTED_STATES[stateCode]?.name || stateCode
}