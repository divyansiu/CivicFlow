// Canonical mock datasets adhering strictly to the PS04 PRD specifications
// All records are explicitly identified as seed/prototype demo data.

export const SEED_ASSETS = [
  {
    asset_id: "RD-021",
    name: "Central Arterial Corridor - Segment 4",
    asset_type: "road",
    location: "Ward 4, North Sector (KM 14.2 - 18.0)",
    coordinates: [12.9716, 77.5946],
    age_years: 12,
    condition_score: 42, // out of 100
    complaints_30d: 8,
    previous_repairs: 3,
    rainfall_30d: 220, // mm
    usage_level: "high",
    surface_type: "Dense Bituminous Macadam",
    pci_index: 44,
    traffic_pcu: 28500,
    risk_score: 87,
    risk_level: "CRITICAL",
    urgency_score: 82,
    impact_score: 91,
    priority_score: 87,
    rank: 1,
    recommended_action: "Priority structural inspection & milling patch",
    action_deadline_days: 7,
    cost_estimate_band: "Band 3 (₹4.2L - ₹6.5L)",
    reasons: [
      "Poor current condition score (42/100)",
      "High recent complaint frequency (8 in past 30 days)",
      "Multiple previous repairs recorded in segment history (3)",
      "High environmental exposure (220mm rainfall in last 30d)",
      "High arterial usage level with heavy commercial traffic"
    ],
    last_inspected: "2026-09-18",
    status: "Requires Attention"
  },
  {
    asset_id: "RD-014",
    name: "Industrial Outer Ring - Flyover Approach",
    asset_type: "road",
    location: "Ward 9, South Industrial Zone",
    coordinates: [12.9352, 77.6245],
    age_years: 15,
    condition_score: 48,
    complaints_30d: 6,
    previous_repairs: 4,
    rainfall_30d: 195,
    usage_level: "high",
    surface_type: "Asphalt Concrete",
    pci_index: 49,
    traffic_pcu: 34000,
    risk_score: 81,
    risk_level: "CRITICAL",
    urgency_score: 78,
    impact_score: 88,
    priority_score: 82,
    rank: 2,
    recommended_action: "Joint sealing and structural drainage clearance",
    action_deadline_days: 10,
    cost_estimate_band: "Band 3 (₹3.8L - ₹5.4L)",
    reasons: [
      "Substandard condition rating (48/100)",
      "High recurring freight axle load",
      "Overdue cyclical drainage desiltation",
      "Spike in road depression complaints"
    ],
    last_inspected: "2026-08-30",
    status: "Requires Attention"
  },
  {
    asset_id: "RD-038",
    name: "Market Access Link Road - Junction B",
    asset_type: "road",
    location: "Ward 2, Central Commercial District",
    coordinates: [12.9804, 77.5852],
    age_years: 9,
    condition_score: 55,
    complaints_30d: 5,
    previous_repairs: 2,
    rainfall_30d: 180,
    usage_level: "high",
    surface_type: "Bituminous Concrete",
    pci_index: 56,
    traffic_pcu: 21000,
    risk_score: 74,
    risk_level: "HIGH",
    urgency_score: 72,
    impact_score: 76,
    priority_score: 74,
    rank: 3,
    recommended_action: "Pothole patch & subsurface moisture check",
    action_deadline_days: 14,
    cost_estimate_band: "Band 2 (₹1.5L - ₹2.8L)",
    reasons: [
      "Moderate-high water logging propensity",
      "Surface aggregate raveling detected",
      "5 citizen grievances registered within 30 days"
    ],
    last_inspected: "2026-09-02",
    status: "Scheduled"
  },
  {
    asset_id: "RD-005",
    name: "Transit Feeder Boulevard - West Extension",
    asset_type: "road",
    location: "Ward 11, West Suburbs",
    coordinates: [12.9611, 77.5385],
    age_years: 7,
    condition_score: 62,
    complaints_30d: 3,
    previous_repairs: 1,
    rainfall_30d: 140,
    usage_level: "medium",
    surface_type: "Asphalt Concrete",
    pci_index: 64,
    traffic_pcu: 14200,
    risk_score: 63,
    risk_level: "HIGH",
    urgency_score: 59,
    impact_score: 65,
    priority_score: 62,
    rank: 4,
    recommended_action: "Routine crack sealing prior to monsoon",
    action_deadline_days: 21,
    cost_estimate_band: "Band 2 (₹1.2L - ₹2.0L)",
    reasons: [
      "Transverse thermal cracking beginning",
      "Scheduled preventative maintenance window opening",
      "Medium vehicular transit volume"
    ],
    last_inspected: "2026-07-15",
    status: "Under Review"
  },
  {
    asset_id: "SL-104",
    name: "Ring Road Interchange Smart Luminaire Array",
    asset_type: "streetlights",
    location: "Ward 9, Junction 4 Overpass",
    coordinates: [12.9388, 77.6299],
    age_years: 5,
    condition_score: 58,
    complaints_30d: 7,
    previous_repairs: 2,
    rainfall_30d: 195,
    usage_level: "high",
    surface_type: "LED 120W High-Mast",
    pci_index: 60,
    traffic_pcu: 32000,
    risk_score: 71,
    risk_level: "HIGH",
    urgency_score: 79,
    impact_score: 68,
    priority_score: 72,
    rank: 5,
    recommended_action: "Feeder pillar circuit check & driver replacements",
    action_deadline_days: 7,
    cost_estimate_band: "Band 1 (₹45k - ₹90k)",
    reasons: [
      "Recurring phase trip complaints (7 reported)",
      "High speed interchange safety critical corridor",
      "Moisture ingress in distribution box"
    ],
    last_inspected: "2026-09-24",
    status: "Scheduled"
  },
  {
    asset_id: "RD-052",
    name: "Collector Road 8 - Residential Sector 5",
    asset_type: "road",
    location: "Ward 7, East Colony",
    coordinates: [12.9892, 77.6412],
    age_years: 4,
    condition_score: 78,
    complaints_30d: 1,
    previous_repairs: 0,
    rainfall_30d: 110,
    usage_level: "low",
    surface_type: "Bituminous Concrete",
    pci_index: 80,
    traffic_pcu: 4500,
    risk_score: 28,
    risk_level: "LOW",
    urgency_score: 20,
    impact_score: 30,
    priority_score: 26,
    rank: 6,
    recommended_action: "Cyclical visual inspection only",
    action_deadline_days: 90,
    cost_estimate_band: "Band 0 (Routine Inspection)",
    reasons: [
      "Stable subgrade and good surface profile",
      "Low citizen complaint count",
      "Standard preventative monitoring cycle"
    ],
    last_inspected: "2026-08-11",
    status: "Operational"
  },
  {
    asset_id: "BR-003",
    name: "Canal Cross Bridge - South Span Abutment",
    asset_type: "bridges",
    location: "Ward 12, River Canal Zone",
    coordinates: [12.9214, 77.5810],
    age_years: 22,
    condition_score: 69,
    complaints_30d: 2,
    previous_repairs: 3,
    rainfall_30d: 210,
    usage_level: "medium",
    surface_type: "Prestressed Concrete Girder",
    pci_index: 71,
    traffic_pcu: 18500,
    risk_score: 49,
    risk_level: "MEDIUM",
    urgency_score: 45,
    impact_score: 64,
    priority_score: 52,
    rank: 7,
    recommended_action: "Expansion joint cleaning and bearing check",
    action_deadline_days: 45,
    cost_estimate_band: "Band 2 (₹1.8L - ₹3.0L)",
    reasons: [
      "Age of structure exceeds 20 years",
      "Moderate joint spalling observed",
      "Essential conduit for cross-ward connectivity"
    ],
    last_inspected: "2026-06-20",
    status: "Operational"
  }
];

export const MOCK_CITIZEN_COMPLAINTS = [
  {
    id: "CMP-2026-8801",
    asset_id: "RD-021",
    title: "Large deep pothole causing vehicle damage near Metro Pillar 128",
    category: "Pothole / Road Depression",
    location: "Central Arterial Corridor - Segment 4",
    ward: "Ward 4",
    submitted_at: "2026-10-02 09:30",
    status: "Verified & Assigned to Queue",
    urgency_flag: "High",
    upvotes: 24,
    citizen_name: "Ramesh Sharma",
    notes: "Integrated with AI priority queue ranking."
  },
  {
    id: "CMP-2026-8794",
    asset_id: "SL-104",
    title: "Overpass streetlights flickering and dark between 9 PM and midnight",
    category: "Streetlight Malfunction",
    location: "Ring Road Interchange Junction 4",
    ward: "Ward 9",
    submitted_at: "2026-10-01 21:15",
    status: "Inspection Scheduled",
    urgency_flag: "Medium",
    upvotes: 18,
    citizen_name: "Anita Verma",
    notes: "Correlated with feeder pillar voltage surge data."
  },
  {
    id: "CMP-2026-8742",
    asset_id: "RD-014",
    title: "Severe water-logging and asphalt stripping after recent heavy rain",
    category: "Drainage / Surface Stripping",
    location: "Industrial Outer Ring Road",
    ward: "Ward 9",
    submitted_at: "2026-09-28 14:00",
    status: "Pending Action",
    urgency_flag: "High",
    upvotes: 31,
    citizen_name: "K. Mohan",
    notes: "Prioritized into 10-day maintenance queue."
  },
  {
    id: "CMP-2026-8610",
    asset_id: "RD-052",
    title: "Faded lane markings at residential crossroads",
    category: "Road Signage / Markings",
    location: "Collector Road 8, Sector 5",
    ward: "Ward 7",
    submitted_at: "2026-09-15 11:20",
    status: "Resolved",
    urgency_flag: "Low",
    upvotes: 4,
    citizen_name: "Pooja Hegde",
    notes: "Routine work order completed on 2026-09-20."
  }
];

export const MOCK_SYSTEM_METRICS = {
  totalAssetsMonitored: 842,
  criticalRiskAssets: 28,
  highRiskAssets: 86,
  mediumRiskAssets: 214,
  lowRiskAssets: 514,
  inspectionsOverdue: 14,
  predicted30dInterventions: 34,
  averageResponseTimeDays: 8.4,
  dataPipelineStatus: "Operational (Local SQLite Seed Cache)",
  modelVersion: "RandomForest-v1.4.2-RoadRisk",
  lastBatchRun: "2026-10-05 06:00:00 UTC"
};

export const MOCK_OFFICERS = [
  { id: "OFF-101", name: "Er. A. K. Sundaram", designation: "Chief Road Maintenance Engineer", zone: "North Sector", activeQueues: 12, phone: "+91 98450 11201" },
  { id: "OFF-104", name: "Er. Sunita Rao", designation: "Executive Engineer (Public Works)", zone: "South Sector", activeQueues: 9, phone: "+91 98450 44302" },
  { id: "OFF-109", name: "Er. Vikram Patel", designation: "Electrical Infrastructure Officer", zone: "Central & Ring", activeQueues: 5, phone: "+91 98450 77809" }
];

// Synthetic maintenance history — clearly labeled as prototype/demo data
export const MOCK_MAINTENANCE_HISTORY = {
  "RD-021": [
    { id: "MT-877", date: "2026-08-14", type: "Pothole Patching", severity: "High", cost: "₹2.1L", downtime_days: 2, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Emergency patch applied at KM 15.4 after monsoon damage." },
    { id: "MT-812", date: "2026-04-20", type: "Surface Resurfacing", severity: "Critical", cost: "₹4.8L", downtime_days: 5, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Full DBM resurfacing completed. PCI improved from 28 to 44." },
    { id: "MT-749", date: "2025-11-03", type: "Crack Sealing", severity: "Medium", cost: "₹0.8L", downtime_days: 1, status: "Completed", officer: "Er. Sunita Rao", notes: "Longitudinal and transverse cracks sealed prior to winter." }
  ],
  "RD-014": [
    { id: "MT-863", date: "2026-07-09", type: "Drainage Desiltation", severity: "High", cost: "₹1.4L", downtime_days: 1, status: "Completed", officer: "Er. Sunita Rao", notes: "Catch basin cleared; residual silt removed from sub-drain." },
    { id: "MT-801", date: "2026-02-15", type: "Joint Sealing", severity: "Medium", cost: "₹0.6L", downtime_days: 1, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Expansion joints re-sealed along flyover approach." },
    { id: "MT-720", date: "2025-09-22", type: "Pothole Patching", severity: "High", cost: "₹1.9L", downtime_days: 2, status: "Completed", officer: "Er. Sunita Rao", notes: "Multiple depression patches; temporary repair pending full resurfacing." },
    { id: "MT-644", date: "2025-03-11", type: "Surface Resurfacing", severity: "Critical", cost: "₹5.1L", downtime_days: 6, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Full AC overlay completed on industrial approach span." }
  ],
  "RD-038": [
    { id: "MT-858", date: "2026-06-28", type: "Pothole Patching", severity: "Medium", cost: "₹0.9L", downtime_days: 1, status: "Completed", officer: "Er. Sunita Rao", notes: "Patch applied at commercial junction B approach." },
    { id: "MT-790", date: "2026-01-14", type: "Subsurface Moisture Inspection", severity: "Low", cost: "₹0.3L", downtime_days: 0, status: "Completed", officer: "Er. A. K. Sundaram", notes: "GPR scan conducted; minor moisture ingress detected at sub-base." }
  ],
  "RD-005": [
    { id: "MT-831", date: "2026-05-05", type: "Crack Sealing", severity: "Low", cost: "₹0.4L", downtime_days: 0, status: "Completed", officer: "Er. Sunita Rao", notes: "Preventive thermal crack sealing ahead of monsoon season." }
  ],
  "SL-104": [
    { id: "MT-869", date: "2026-09-10", type: "Driver Replacement", severity: "Medium", cost: "₹0.5L", downtime_days: 0, status: "Completed", officer: "Er. Vikram Patel", notes: "LED drivers replaced on 4 high-mast units after voltage spike." },
    { id: "MT-822", date: "2026-04-01", type: "Feeder Pillar Inspection", severity: "Medium", cost: "₹0.2L", downtime_days: 0, status: "Completed", officer: "Er. Vikram Patel", notes: "Circuit continuity check; moisture seal applied to distribution box." }
  ],
  "RD-052": [],
  "BR-003": [
    { id: "MT-780", date: "2025-12-08", type: "Expansion Joint Cleaning", severity: "Low", cost: "₹0.7L", downtime_days: 1, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Joint debris cleared; bearing condition assessed as fair." },
    { id: "MT-694", date: "2025-06-14", type: "Structural Inspection", severity: "Medium", cost: "₹0.4L", downtime_days: 0, status: "Completed", officer: "Er. Sunita Rao", notes: "Biennial bridge structural inspection. Moderate spalling noted on south abutment." },
    { id: "MT-601", date: "2024-10-20", type: "Protective Coating", severity: "Low", cost: "₹1.1L", downtime_days: 2, status: "Completed", officer: "Er. A. K. Sundaram", notes: "Anti-carbonation coating applied to prestressed girder surfaces." }
  ]
};
