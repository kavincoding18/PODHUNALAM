import { 
  Department, 
  AdministrativeUnit, 
  UserProfile, 
  Grievance, 
  GrievanceStatusHistory, 
  GrievanceComment, 
  GrievanceDepartment, 
  ResolutionEvidence, 
  VerificationRecord, 
  AppNotification, 
  AuditLog 
} from '../types';
import roadBeforeImg from '../assets/images/evidence_road_before_1791743003638.jpg';
import roadAfterImg from '../assets/images/evidence_road_after_1791743015421.jpg';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-highways',
    code: 'HIGHWAYS',
    nameEn: 'State Highways & City Roads (Trichy)',
    nameTa: 'மாநில நெடுஞ்சாலைகள் மற்றும் மாநகரச் சாலைகள் (திருச்சி)',
    leadOfficerTitle: 'Divisional Engineer (Highways)',
    leadOfficerTitleTa: 'கோட்டப் பொறியாளர் (நெடுஞ்சாலைகள்)',
    contactEmail: 'de.highways.try@tn.gov.in',
    targetDaysDefault: 7
  },
  {
    id: 'dept-twad',
    code: 'TWAD_WATER',
    nameEn: 'Tiruchirappalli Corporation Cauvery Water Supply & Drainage',
    nameTa: 'திருச்சி மாநகராட்சி காவிரி குடிநீர் வழங்கல் மற்றும் வடிகால்',
    leadOfficerTitle: 'City Engineer (Water Works)',
    leadOfficerTitleTa: 'மாநகரப் பொறியாளர் (குடிநீர் பிரிவு)',
    contactEmail: 'cityengr.water.try@tn.gov.in',
    targetDaysDefault: 5
  },
  {
    id: 'dept-tangedco',
    code: 'TANGEDCO',
    nameEn: 'TANGEDCO Trichy Electricity Distribution Circle (Metro)',
    nameTa: 'தமிழ்நாடு மின் பகிர்மான கழகம் திருச்சி பெருநகர வட்டம்',
    leadOfficerTitle: 'Superintending Engineer (Metro)',
    leadOfficerTitleTa: 'மேற்பார்வைப் பொறியாளர் (மின் பகிர்மானம்)',
    contactEmail: 'se.metro.try@tn.gov.in',
    targetDaysDefault: 3
  },
  {
    id: 'dept-municipality',
    code: 'TRICHY_CORP',
    nameEn: 'Tiruchirappalli City Municipal Corporation',
    nameTa: 'திருச்சிராப்பள்ளி மாநகராட்சி நிர்வாகம்',
    leadOfficerTitle: 'Corporation Commissioner',
    leadOfficerTitleTa: 'மாநகராட்சி ஆணையர்',
    contactEmail: 'commissioner.trichy@tn.gov.in',
    targetDaysDefault: 5
  },
  {
    id: 'dept-sanitation',
    code: 'SANITATION',
    nameEn: 'Corporation Public Health & Solid Waste Management',
    nameTa: 'மாநகராட்சி பொதுச் சுகாதாரம் மற்றும் திடக்கழிவு மேலாண்மை',
    leadOfficerTitle: 'City Health Officer (CHO)',
    leadOfficerTitleTa: 'மாநகர நல அலுவலர்',
    contactEmail: 'cho.trichy@tn.gov.in',
    targetDaysDefault: 3
  },
  {
    id: 'dept-revenue',
    code: 'REVENUE',
    nameEn: 'Revenue & Disaster Management (Collectorate)',
    nameTa: 'வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை (ஆட்சியரகம்)',
    leadOfficerTitle: 'District Revenue Officer (DRO)',
    leadOfficerTitleTa: 'மாவட்ட வருவாய் அலுவலர் (DRO)',
    contactEmail: 'dro.try@tn.gov.in',
    targetDaysDefault: 15
  }
];

export const INITIAL_ADMIN_UNITS: AdministrativeUnit[] = [
  { id: 'unit-dist', nameEn: 'Tiruchirappalli District', nameTa: 'திருச்சிராப்பள்ளி மாவட்டம்', type: 'District', code: 'TRY_DIST' },
  
  // Revenue Divisions
  { id: 'unit-div-try', nameEn: 'Tiruchirappalli Revenue Division', nameTa: 'திருச்சிராப்பள்ளி வருவாய் கோட்டம்', type: 'Division', parentId: 'unit-dist', code: 'DIV_TRY' },
  { id: 'unit-div-lal', nameEn: 'Lalgudi Revenue Division', nameTa: 'லால்குடி வருவாய் கோட்டம்', type: 'Division', parentId: 'unit-dist', code: 'DIV_LAL' },
  { id: 'unit-div-mus', nameEn: 'Musiri Revenue Division', nameTa: 'முசிறி வருவாய் கோட்டம்', type: 'Division', parentId: 'unit-dist', code: 'DIV_MUS' },
  
  // Taluks & Corporation Zones
  { id: 'unit-zone-sri', nameEn: 'Srirangam Zone (Zone 1) / Srirangam Taluk', nameTa: 'ஸ்ரீரங்கம் மண்டலம் (மண்டலம் 1) / வட்டம்', type: 'Taluk', parentId: 'unit-div-try', code: 'ZONE_SRI' },
  { id: 'unit-zone-ariya', nameEn: 'Ariyamangalam Zone (Zone 2) / Trichy East', nameTa: 'அரியமங்கலம் மண்டலம் (மண்டலம் 2) / கிழக்கு வட்டம்', type: 'Taluk', parentId: 'unit-div-try', code: 'ZONE_ARIYA' },
  { id: 'unit-zone-pon', nameEn: 'Ponmalai (Golden Rock Zone 3)', nameTa: 'பொன்மலை மண்டலம் (மண்டலம் 3)', type: 'Taluk', parentId: 'unit-div-try', code: 'ZONE_PON' },
  { id: 'unit-zone-abi', nameEn: 'K.Abishekapuram Zone (Zone 4) / Trichy West', nameTa: 'கே.அபிஷேகபுரம் மண்டலம் (மண்டலம் 4) / மேற்கு வட்டம்', type: 'Taluk', parentId: 'unit-div-try', code: 'ZONE_ABI' },
  { id: 'unit-zone-kot', nameEn: 'Kottai / Fort Zone (Zone 5)', nameTa: 'கோட்டை மண்டலம் (மண்டலம் 5)', type: 'Taluk', parentId: 'unit-div-try', code: 'ZONE_KOT' },
  { id: 'unit-taluk-thiru', nameEn: 'Thiruverumbur Taluk', nameTa: 'திருவெறும்பூர் வட்டம்', type: 'Taluk', parentId: 'unit-div-try', code: 'TLK_THIRU' },
  { id: 'unit-taluk-man', nameEn: 'Manapparai Taluk', nameTa: 'மணப்பாறை வட்டம்', type: 'Taluk', parentId: 'unit-div-try', code: 'TLK_MAN' },
  { id: 'unit-taluk-lal', nameEn: 'Lalgudi Taluk', nameTa: 'லால்குடி வட்டம்', type: 'Taluk', parentId: 'unit-div-lal', code: 'TLK_LAL' },
  { id: 'unit-taluk-mus', nameEn: 'Musiri Taluk', nameTa: 'முசிறி வட்டம்', type: 'Taluk', parentId: 'unit-div-mus', code: 'TLK_MUS' }
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-citizen',
    email: 'meenakshi.citizen@example.com',
    fullName: 'S. Meenakshi',
    fullNameTa: 'எஸ். மீனாட்சி',
    phone: '+91 94431 87654',
    role: 'citizen',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'user-operator',
    email: 'arumugam.operator@try.gov.in',
    fullName: 'M. Arumugam',
    fullNameTa: 'மு. ஆறுமுகம்',
    phone: '+91 94433 11224',
    role: 'operator',
    designation: 'Tiruchirappalli Collectorate Grievance Camp Operator',
    designationTa: 'திருச்சி மாவட்ட மக்கள் குறைதீர்க்கும் முகாம் உதவியாளர்',
    administrativeUnitId: 'unit-div-try',
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'user-ao',
    email: 'ao.tahsildar.trywest@tn.gov.in',
    fullName: 'K. Saravanan',
    fullNameTa: 'கே. சரவணன்',
    phone: '+91 94440 22334',
    role: 'ao',
    departmentId: 'dept-revenue',
    administrativeUnitId: 'unit-zone-abi',
    designation: 'Tahsildar / AO (Tiruchirappalli West & Corporation)',
    designationTa: 'வட்டாட்சியர் / வட்டார நிர்வாக அலுவலர் (திருச்சி மேற்கு)',
    createdAt: '2026-01-05T09:00:00Z'
  },
  {
    id: 'user-rdo',
    email: 'rdo.try@tn.gov.in',
    fullName: 'Dr. M. Anandhan',
    fullNameTa: 'மருத்துவர் எம். ஆனந்தன்',
    phone: '+91 94450 66778',
    role: 'rdo',
    departmentId: 'dept-revenue',
    administrativeUnitId: 'unit-div-try',
    designation: 'Revenue Divisional Officer (RDO Trichy)',
    designationTa: 'வருவாய் கோட்ட அலுவலர் (RDO திருச்சி)',
    createdAt: '2026-01-01T09:00:00Z'
  },
  {
    id: 'user-dro',
    email: 'dro.try@tn.gov.in',
    fullName: 'Tmt. R. Rajalakshmi',
    fullNameTa: 'திருமதி ஆர். ராஜலட்சுமி',
    phone: '+91 94455 88990',
    role: 'dro',
    departmentId: 'dept-revenue',
    administrativeUnitId: 'unit-dist',
    designation: 'District Revenue Officer (DRO Tiruchirappalli)',
    designationTa: 'மாவட்ட வருவாய் அலுவலர் (DRO திருச்சி)',
    createdAt: '2025-12-01T09:00:00Z'
  },
  {
    id: 'user-collector',
    email: 'collector.try@tn.gov.in',
    fullName: 'Thiru Pratik Tayal, IAS',
    fullNameTa: 'திரு பிரதீக் தயாள், இ.ஆ.ப.',
    phone: '+91 94450 00010',
    role: 'collector',
    administrativeUnitId: 'unit-dist',
    designation: 'District Collector & District Magistrate, Tiruchirappalli',
    designationTa: 'மாவட்ட ஆட்சித் தலைவர் மற்றும் நடுவர், திருச்சிராப்பள்ளி',
    createdAt: '2025-11-01T09:00:00Z'
  },
  {
    id: 'user-admin',
    email: 'admin.podhunalam.try@tn.gov.in',
    fullName: 'Tiruchirappalli District Informatics Officer (DIO)',
    fullNameTa: 'திருச்சி மாவட்ட தகவல் தொழில்நுட்ப அலுவலர்',
    role: 'admin',
    designation: 'Platform Administrator (NIC Trichy)',
    designationTa: 'தள நிர்வாகி (NIC திருச்சி)',
    createdAt: '2025-10-01T09:00:00Z'
  }
];

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'gr-01',
    referenceNumber: 'TN-TRY-2026-0842',
    title: 'Hazardous road asphalt crater near Rockfort Main Guard Gate bus stand junction',
    titleTa: 'மலைக்கோட்டை மெயின் கார்டு கேட் பேருந்து சந்திப்பில் விபத்துகளை ஏற்படுத்தும் பெரும் பள்ளம்',
    description: 'A deep pothole of over 1.6 meters diameter near the Main Guard Gate junction has damaged vehicle axles and caused 3 two-wheeler falls. Heavy bus transit creates severe bottlenecks during peak hours.',
    descriptionTa: 'மெயின் கார்டு கேட் சந்திப்பில் பேருந்துகள் திரும்பும் இடத்தில் பெரிய பள்ளம் ஏற்பட்டுள்ளது. நேற்று 3 இருசக்கர வாகனங்கள் சறுக்கி விழுந்து விபத்துக்குள்ளாகின. உடனே தார் சீரமைப்பு தேவை.',
    category: 'roads',
    priority: 'High',
    status: 'Closed',
    citizenId: 'user-citizen',
    citizenName: 'S. Meenakshi',
    citizenPhone: '+91 94431 87654',
    citizenEmail: 'meenakshi.citizen@example.com',
    district: 'Tiruchirappalli',
    taluk: 'Tiruchirappalli West',
    locality: 'Main Guard Gate, Rockfort Kottai Zone',
    address: 'Near Teppakulam Bazaar Arch, NSB Road Entry',
    latitude: 10.8271,
    longitude: 78.6976,
    leadDepartmentId: 'dept-highways',
    assignedOfficerId: 'user-ao',
    photos: [
      roadBeforeImg
    ],
    targetResolutionDate: '2026-03-25T18:00:00Z',
    createdAt: '2026-03-18T10:15:00Z',
    updatedAt: '2026-03-24T16:30:00Z',
    closedAt: '2026-03-24T16:30:00Z',
    satisfactionRating: 5,
    feedbackComment: 'Inspected and repaired promptly under the instructions of District Collector Mr. Pratik Tayal IAS. Bitumen overlay is smooth and safe.'
  },
  {
    id: 'gr-02',
    referenceNumber: 'TN-TRY-2026-0843',
    title: 'Cauvery drinking water main distribution line burst and wastage in Thillai Nagar',
    titleTa: 'தில்லை நகர் 7-வது கிராஸில் காவிரி பிரதான குடிநீர் விநியோகக் குழாய் உடைந்து நீர் வீணாகுதல்',
    description: 'The underground 250mm ductile iron feeder pipe connected to the Cauvery collector well has ruptured. Hundreds of litres of clean potable water are overflowing into commercial store fronts in Thillai Nagar.',
    descriptionTa: 'காவிரி ஆற்றுப் படுகை குடிநீர் பிரதான குழாய் உடைந்து தில்லை நகர் வணிக வளாகங்கள் மற்றும் குடியிருப்புகளுக்குள் நீர் புகுந்து பெருமளவில் குடிநீர் வீணாகிறது.',
    category: 'drinking_water',
    priority: 'High',
    status: 'In Progress',
    citizenName: 'P. Ramanujam',
    citizenPhone: '+91 94435 67890',
    district: 'Tiruchirappalli',
    taluk: 'Tiruchirappalli West',
    locality: 'Thillai Nagar 7th Cross, K.Abishekapuram Zone',
    address: 'Near Shastri Road Junction, Ward 32',
    latitude: 10.8222,
    longitude: 78.6835,
    leadDepartmentId: 'dept-twad',
    assignedOfficerId: 'user-ao',
    photos: [],
    targetResolutionDate: '2026-03-26T18:00:00Z',
    createdAt: '2026-03-21T08:30:00Z',
    updatedAt: '2026-03-22T11:00:00Z'
  },
  {
    id: 'gr-03',
    referenceNumber: 'TN-TRY-2026-0844',
    title: 'Cluster of 14 LED smart streetlights failing on Srirangam Mela Chithirai Street',
    titleTa: 'ஸ்ரீரங்கம் மேல சித்திரை வீதியில் 14 தெருவிளக்குகள் எரியாமல் இருளில் மூழ்கிய பகுதி',
    description: 'All decorative streetlights around the Sri Ranganathaswamy temple outer heritage circumambulation path are dark due to a junction box short circuit. Pilgrim safety affected at night.',
    descriptionTa: 'ஸ்ரீரங்கம் திருக்கோயில் வெளிப்புற மேல சித்திரை வீதியில் உள்ள விளக்குகள் பழுதாகி பக்தர்கள் மற்றும் பொதுமக்கள் இரவு நேரத்தில் செல்ல அஞ்சுகின்றனர்.',
    category: 'streetlights',
    priority: 'Medium',
    status: 'Resolution Submitted',
    citizenName: 'K. Rengarajan',
    citizenPhone: '+91 94432 54321',
    district: 'Tiruchirappalli',
    taluk: 'Srirangam',
    locality: 'Mela Chithirai Veedhi, Srirangam Zone 1',
    address: 'Near North Gopuram Approach Corridor',
    latitude: 10.8624,
    longitude: 78.6908,
    leadDepartmentId: 'dept-tangedco',
    assignedOfficerId: 'user-ao',
    photos: [],
    targetResolutionDate: '2026-03-24T18:00:00Z',
    createdAt: '2026-03-19T14:40:00Z',
    updatedAt: '2026-03-23T15:20:00Z'
  },
  {
    id: 'gr-04',
    referenceNumber: 'TN-TRY-2026-0845',
    title: 'Commercial vegetable refuse overflow near Gandhi Market & Palakkarai drainage',
    titleTa: 'காந்தி சந்தை மற்றும் பாலக்கரை கால்வாய் அருகே தேங்கியுள்ள அழுகிய காய்கறி கழிவுகள்',
    description: 'Rotting vegetable garbage heaps have spilled onto the road shoulder, causing severe air pollution, fly breeding, and drainage choking near Palakkarai canal. Requires urgent compactor deployment.',
    descriptionTa: 'காந்தி சந்தை கழிவுகள் முறையாக அள்ளப்படாமல் பாலக்கரை வடிகால் வரை தேங்கி தொற்றுநோய் பரவும் அபாயம் ஏற்பட்டுள்ளது. மாநகராட்சி உடனடியாக நடவடிக்கை எடுக்க வேண்டும்.',
    category: 'waste_management',
    priority: 'Emergency',
    status: 'Escalated',
    isOfflineEntry: true,
    operatorId: 'user-operator',
    campName: 'Trichy Collectorate Monday Grievance Day Camp',
    citizenName: 'T. Murugesan (Traders Association Secretary)',
    citizenPhone: '+91 98424 55667',
    district: 'Tiruchirappalli',
    taluk: 'Tiruchirappalli East',
    locality: 'Gandhi Market & Palakkarai, Ariyamangalam Zone',
    address: 'Near East Boulevard Road & Sub-Jail Road junction',
    latitude: 10.8143,
    longitude: 78.7032,
    leadDepartmentId: 'dept-sanitation',
    assignedOfficerId: 'user-ao',
    photos: [],
    targetResolutionDate: '2026-03-22T18:00:00Z',
    createdAt: '2026-03-17T09:10:00Z',
    updatedAt: '2026-03-23T17:00:00Z',
    isEscalated: true,
    escalationReason: 'Target resolution date lapsed without sanitary supervisor deployment. Escalated from AO to RDO and Collector Mr. Pratik Tayal IAS for urgent corporation action.'
  },
  {
    id: 'gr-05',
    referenceNumber: 'TN-TRY-2026-0846',
    title: 'Silt blockage in stormwater culvert near Ponmalai Golden Rock Railway Colony',
    titleTa: 'பொன்மலை ரயில்வே காலனி பிரதான சாலையில் மழைநீர் வடிகால் அடைப்பால் நீர் தேங்குதல்',
    description: 'Culvert inlet blocked by silt and dry leaves causing rainwater backflow onto Ponmalai main road. Pedestrian movement to the railway workshop and hospital impeded.',
    descriptionTa: 'மழைநீர் வடிகாலில் மணல் அடைத்து கழிவுநீர் சாலையோர நடைபாதையில் தேங்கி நிற்கிறது. பள்ளி மாணவர்கள் மற்றும் ரயில்வே ஊழியர்கள் சிரமப்படுகின்றனர்.',
    category: 'drainage',
    priority: 'Medium',
    status: 'Assigned',
    citizenName: 'M. Jayachandran',
    citizenPhone: '+91 97871 33445',
    district: 'Tiruchirappalli',
    taluk: 'Tiruchirappalli East',
    locality: 'Ponmalai (Golden Rock) Main Road, Zone 3',
    address: 'Opposite Railway Mixed Higher Secondary School',
    latitude: 10.7850,
    longitude: 78.7180,
    leadDepartmentId: 'dept-municipality',
    assignedOfficerId: 'user-ao',
    photos: [],
    targetResolutionDate: '2026-03-28T18:00:00Z',
    createdAt: '2026-03-22T11:20:00Z',
    updatedAt: '2026-03-22T14:00:00Z'
  }
];

export const INITIAL_STATUS_HISTORY: GrievanceStatusHistory[] = [
  {
    id: 'sh-01',
    grievanceId: 'gr-01',
    previousStatus: 'Submitted',
    newStatus: 'Under Review',
    actorId: 'user-operator',
    actorName: 'M. Arumugam',
    actorRole: 'operator',
    reason: 'Initial verification completed; categorized under Trichy City Highways & Corporation jurisdiction.',
    createdAt: '2026-03-18T11:00:00Z'
  },
  {
    id: 'sh-02',
    grievanceId: 'gr-01',
    previousStatus: 'Under Review',
    newStatus: 'Assigned',
    actorId: 'user-ao',
    actorName: 'K. Saravanan (AO Trichy West)',
    actorRole: 'ao',
    reason: 'Assigned to Assistant Executive Engineer (Highways City Sub-division) & Ward 32 Junior Engineer.',
    createdAt: '2026-03-18T14:20:00Z'
  },
  {
    id: 'sh-03',
    grievanceId: 'gr-01',
    previousStatus: 'Assigned',
    newStatus: 'In Progress',
    actorId: 'user-ao',
    actorName: 'K. Saravanan (AO Trichy West)',
    actorRole: 'ao',
    reason: 'Cold mix asphalt leveling and roller compaction initiated during non-peak traffic hours.',
    createdAt: '2026-03-20T09:30:00Z'
  },
  {
    id: 'sh-04',
    grievanceId: 'gr-01',
    previousStatus: 'In Progress',
    newStatus: 'Resolution Submitted',
    actorId: 'user-ao',
    actorName: 'K. Saravanan (AO Trichy West)',
    actorRole: 'ao',
    reason: 'Pavement patchwork completed with 50mm dense bituminous macadam. Verified site photos uploaded.',
    createdAt: '2026-03-23T16:00:00Z'
  },
  {
    id: 'sh-05',
    grievanceId: 'gr-01',
    previousStatus: 'Resolution Submitted',
    newStatus: 'Closed',
    actorId: 'user-rdo',
    actorName: 'Dr. M. Anandhan (RDO Trichy)',
    actorRole: 'rdo',
    reason: 'Supervisory field inspection completed. Bitumen leveling approved per standards of Collectorate oversight.',
    createdAt: '2026-03-24T16:30:00Z'
  }
];

export const INITIAL_COMMENTS: GrievanceComment[] = [
  {
    id: 'cm-01',
    grievanceId: 'gr-01',
    authorId: 'user-ao',
    authorName: 'K. Saravanan (AO)',
    authorRole: 'ao',
    authorDepartment: 'Tiruchirappalli West Taluk Administration',
    content: 'Field inspection completed near Rockfort Teppakulam gate with Corporation Assistant Engineer. Required premix bitumen aggregate mobilized.',
    isInternal: true,
    createdAt: '2026-03-19T10:30:00Z'
  },
  {
    id: 'cm-02',
    grievanceId: 'gr-01',
    authorId: 'user-ao',
    authorName: 'K. Saravanan (AO)',
    authorRole: 'ao',
    authorDepartment: 'Highways / Corporation Division',
    content: 'Road repair team finished asphalt compaction under traffic barricades. Road opened smoothly for buses.',
    isInternal: false,
    createdAt: '2026-03-20T11:00:00Z'
  },
  {
    id: 'cm-03',
    grievanceId: 'gr-04',
    authorId: 'user-rdo',
    authorName: 'Dr. M. Anandhan (RDO)',
    authorRole: 'rdo',
    authorDepartment: 'Tiruchirappalli Revenue Division',
    content: 'Reviewed Gandhi Market complaint on Collector Mr. Pratik Tayal IAS instructions. Corporation Sanitation Officers summoned for immediate night clearance.',
    isInternal: true,
    createdAt: '2026-03-23T17:15:00Z'
  }
];

export const INITIAL_EVIDENCE: ResolutionEvidence[] = [
  {
    id: 'ev-01',
    grievanceId: 'gr-01',
    submittingOfficerId: 'user-ao',
    submittingOfficerName: 'K. Saravanan (Tahsildar / AO Trichy West)',
    actionTaken: 'Highways and City Corporation joint engineering unit completed full depth bitumen restoration at Rockfort junction. 50mm Dense Bituminous Macadam (DBM) with roller compaction and thermoplastic edge lines.',
    beforePhotoUrl: roadBeforeImg,
    afterPhotoUrl: roadAfterImg,
    workOrderOrGoNumber: 'WO/TRY/CORP/2026/03-112',
    completionDate: '2026-03-23',
    inspectionCoordinates: {
      lat: 10.8271,
      lng: 78.6976
    },
    submittedAt: '2026-03-23T16:00:00Z'
  }
];

export const INITIAL_VERIFICATIONS: VerificationRecord[] = [
  {
    id: 'vr-01',
    grievanceId: 'gr-01',
    evidenceId: 'ev-01',
    reviewerId: 'user-rdo',
    reviewerName: 'Dr. M. Anandhan',
    reviewerRole: 'rdo',
    decision: 'Approved',
    decisionNotes: 'Supervisory check completed. Photographic evidence matches Rockfort Fort Station road coordinates. Quality of pavement certified. Grievance closed.',
    verifiedAt: '2026-03-24T16:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    recipientId: 'user-citizen',
    grievanceId: 'gr-01',
    referenceNumber: 'TN-TRY-2026-0842',
    title: 'Grievance Resolved & Verified',
    message: 'Your complaint regarding Rockfort Main Guard Gate road crater has been verified by the RDO under Collectorate oversight and closed.',
    type: 'verified',
    isRead: false,
    createdAt: '2026-03-24T16:30:00Z'
  },
  {
    id: 'notif-02',
    recipientId: 'user-rdo',
    recipientRole: 'rdo',
    grievanceId: 'gr-04',
    referenceNumber: 'TN-TRY-2026-0845',
    title: 'Gandhi Market Grievance Escalated',
    message: 'Urgent: Vegetable waste accumulation at Gandhi Market exceeded SLA. Flagged for review by Collector Mr. Pratik Tayal IAS.',
    type: 'escalation',
    isRead: false,
    createdAt: '2026-03-23T17:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    action: 'GRIEVANCE_REGISTERED',
    entityType: 'grievance',
    entityId: 'gr-01',
    performedBy: 'S. Meenakshi',
    userRole: 'citizen',
    details: 'Citizen registered Rockfort Main Guard Gate road complaint with geo-coordinates.',
    timestamp: '2026-03-18T10:15:00Z'
  },
  {
    id: 'aud-02',
    action: 'EVIDENCE_SUBMITTED',
    entityType: 'evidence',
    entityId: 'ev-01',
    performedBy: 'K. Saravanan (AO Trichy West)',
    userRole: 'ao',
    details: 'Bitumen restoration evidence and Work Order WO/TRY/CORP/2026/03-112 attached.',
    timestamp: '2026-03-23T16:00:00Z'
  },
  {
    id: 'aud-03',
    action: 'VERIFICATION_APPROVED',
    entityType: 'verification',
    entityId: 'vr-01',
    performedBy: 'Dr. M. Anandhan (RDO Trichy)',
    userRole: 'rdo',
    details: 'Approved resolution and formally authorized closure of TN-TRY-2026-0842.',
    timestamp: '2026-03-24T16:30:00Z'
  }
];
