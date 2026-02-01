/**
 * @typedef {Object} VenueInput
 * @property {string} id
 * @property {string} name
 * @property {string} sportType
 * @property {string} surfaceType
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [elevationM]
 * @property {number} [aspectDeg]
 * @property {string} [maintenanceLevel]
 */

/**
 * @typedef {Object} TimeWindowInput
 * @property {string} startISO
 * @property {string} endISO
 * @property {string} tz
 */

/**
 * @typedef {Object} TelemetryPoint
 * @property {string} tsISO
 * @property {number} value
 */

/**
 * @typedef {Object} TelemetryInput
 * @property {TelemetryPoint[]} temperatureC
 * @property {TelemetryPoint[]} [humidityPct]
 * @property {TelemetryPoint[]} [windMps]
 * @property {TelemetryPoint[]} [precipMm]
 * @property {TelemetryPoint[]} [snowMm]
 */

/**
 * @typedef {Object} OpsLogInput
 * @property {string} tsISO
 * @property {"GROOMING"|"RESURFACE"|"INSPECTION"|"DOWNTIME"|"INCIDENT"} type
 * @property {string} [note]
 */

/**
 * @typedef {Object} SidebarInsightsInput
 * @property {VenueInput} venue
 * @property {TimeWindowInput} timeWindow
 * @property {TelemetryInput} telemetry
 * @property {OpsLogInput[]} [opsLogs]
 */

/**
 * @typedef {Object} KeyDriver
 * @property {string} title
 * @property {"UP"|"DOWN"} impact
 * @property {string} evidence
 */

/**
 * @typedef {Object} RecommendedAction
 * @property {string} action
 * @property {"NOW"|"SOON"|"MONITOR"} urgency
 * @property {string} rationale
 */

/**
 * @typedef {Object} ReportForHashing
 * @property {string} venueId
 * @property {string} windowStartISO
 * @property {string} windowEndISO
 * @property {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"} riskLevel
 * @property {number} stabilityScore
 * @property {string[]} topDrivers
 * @property {string} generatedAtISO
 * @property {string} model
 */

/**
 * @typedef {Object} SidebarInsights
 * @property {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"} riskLevel
 * @property {number} stabilityScore
 * @property {{min:number,max:number}} stabilityWindowMinutes
 * @property {KeyDriver[]} keyDrivers
 * @property {string[]} whatChanged
 * @property {RecommendedAction[]} recommendedActions
 * @property {number} confidence
 * @property {string[]} assumptions
 * @property {string} shortBriefingText
 * @property {string} audioBriefingScript
 * @property {ReportForHashing} reportForHashing
 */

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const IMPACT_TYPES = ['UP', 'DOWN'];
export const URGENCY_TYPES = ['NOW', 'SOON', 'MONITOR'];
