// ==============================================================================
// SEED SCRIPT: UK CARE HOME SHIFT & VACANCY MANAGEMENT PLATFORM
// ==============================================================================
// Seeds:
// - 12 Fictional UK Care Homes
// - 10 Synthetic Staff Profiles (for demo selection workflow)
// - 16 Diverse Shifts across OPEN, PARTIALLY_FILLED, FILLED, CANCELLED, EXPIRED
// ==============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const careHomesData = [
  {
    name: 'Riverside Care Home',
    address: '14 Riverbank Road',
    town: 'Lisburn',
    postcode: 'BT28 1XN',
    county: 'County Antrim',
    numberOfBeds: 48,
    managerName: 'Claire Campbell',
    managerEmail: 'claire.campbell@riverside-demo.co.uk',
    phone: '+44 7700 900101',
    careType: 'Residential Elderly & Dementia',
  },
  {
    name: 'Meadow View Nursing Home',
    address: '88 Meadow Road',
    town: 'Belfast',
    postcode: 'BT9 5AB',
    county: 'County Antrim',
    numberOfBeds: 60,
    managerName: 'Mark O\'Neill',
    managerEmail: 'mark.oneill@meadowview-demo.co.uk',
    phone: '+44 7700 900102',
    careType: 'Dementia Nursing & Palliative',
  },
  {
    name: 'Greenfield Residential Care',
    address: '22 Greenfield Way',
    town: 'Newry',
    postcode: 'BT34 2TT',
    county: 'County Down',
    numberOfBeds: 36,
    managerName: 'Fiona Kelly',
    managerEmail: 'fiona.kelly@greenfield-demo.co.uk',
    phone: '+44 7700 900103',
    careType: 'Elderly Residential',
  },
  {
    name: 'Oakwood Care Centre',
    address: '5 Woodside Avenue',
    town: 'Londonderry',
    postcode: 'BT48 7PQ',
    county: 'County Londonderry',
    numberOfBeds: 52,
    managerName: 'David Hughes',
    managerEmail: 'david.hughes@oakwood-demo.co.uk',
    phone: '+44 7700 900104',
    careType: 'Dual Registered Nursing & Residential',
  },
  {
    name: 'Willow Gardens Care Home',
    address: '10 Willow Lane',
    town: 'Ballymena',
    postcode: 'BT43 6AA',
    county: 'County Antrim',
    numberOfBeds: 40,
    managerName: 'Sinead Doherty',
    managerEmail: 'sinead.doherty@willowgardens-demo.co.uk',
    phone: '+44 7700 900105',
    careType: 'Dementia Memory Wing',
  },
  {
    name: 'Cedar Court Dementia Care',
    address: '3 Cedar Park',
    town: 'Armagh',
    postcode: 'BT60 4EE',
    county: 'County Armagh',
    numberOfBeds: 32,
    managerName: 'Patrick Gallagher',
    managerEmail: 'patrick.g@cedarcourt-demo.co.uk',
    phone: '+44 7700 900106',
    careType: 'Specialist Dementia Residential',
  },
  {
    name: 'St. Jude\'s Nursing Home',
    address: '77 Church Hill',
    town: 'Coleraine',
    postcode: 'BT52 1JH',
    county: 'County Londonderry',
    numberOfBeds: 64,
    managerName: 'Helena Murphy',
    managerEmail: 'helena.m@stjudes-demo.co.uk',
    phone: '+44 7700 900107',
    careType: 'Complex Nursing Care',
  },
  {
    name: 'Heather View Care Centre',
    address: '45 Hilltop Road',
    town: 'Craigavon',
    postcode: 'BT64 3BB',
    county: 'County Armagh',
    numberOfBeds: 44,
    managerName: 'Brian Johnston',
    managerEmail: 'brian.j@heatherview-demo.co.uk',
    phone: '+44 7700 900108',
    careType: 'Elderly & Respite Support',
  },
  {
    name: 'Beechwood Manor Residence',
    address: '12 Forest Drive',
    town: 'Bangor',
    postcode: 'BT19 1DD',
    county: 'County Down',
    numberOfBeds: 50,
    managerName: 'Niamh Quinn',
    managerEmail: 'niamh.quinn@beechwood-demo.co.uk',
    phone: '+44 7700 900109',
    careType: 'Residential & Rehabilitation',
  },
  {
    name: 'Abbeyfield Care Residence',
    address: '9 Abbey Walk',
    town: 'Enniskillen',
    postcode: 'BT74 6GG',
    county: 'County Fermanagh',
    numberOfBeds: 30,
    managerName: 'Colin Boyd',
    managerEmail: 'colin.boyd@abbeyfield-demo.co.uk',
    phone: '+44 7700 900110',
    careType: 'Supported Living & Residential',
  },
  {
    name: 'Primrose Hill Care Haven',
    address: '19 Meadowfield Lane',
    town: 'Belfast',
    postcode: 'BT15 3JJ',
    county: 'County Antrim',
    numberOfBeds: 55,
    managerName: 'Emma McLaughlin',
    managerEmail: 'emma.m@primrosehill-demo.co.uk',
    phone: '+44 7700 900111',
    careType: 'Dementia Nursing Care',
  },
  {
    name: 'Castleview Care Home',
    address: '2 Castle Road',
    town: 'Lisburn',
    postcode: 'BT27 4UU',
    county: 'County Antrim',
    numberOfBeds: 42,
    managerName: 'Gareth Smyth',
    managerEmail: 'gareth.s@castleview-demo.co.uk',
    phone: '+44 7700 900112',
    careType: 'Residential Elderly',
  },
];

const demoStaffData = [
  {
    name: 'Aoife Gallagher',
    role: 'Care Assistant',
    experience: '3+ years',
    skills: 'Personal Care, Dementia Care, Manual Handling',
    email: 'aoife.g@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900201',
    location: 'Lisburn',
    availability: 'Immediate',
  },
  {
    name: 'Sean Murphy',
    role: 'Senior Care Assistant',
    experience: '5+ years',
    skills: 'Medication Support, Safeguarding, Dementia Care, Team Leadership',
    email: 'sean.m@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900202',
    location: 'Belfast',
    availability: 'Immediate',
  },
  {
    name: 'Chloe Smith',
    role: 'Registered Nurse',
    experience: '4+ years',
    skills: 'Vital Signs, Wound Care, Catheter Care, NEWS2, Medication Support',
    email: 'chloe.s@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900203',
    location: 'Belfast',
    availability: 'Immediate',
  },
  {
    name: 'Conor O\'Neill',
    role: 'Healthcare Assistant',
    experience: '2+ years',
    skills: 'Basic Life Support, Patient Observation, Personal Care',
    email: 'conor.o@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900204',
    location: 'Londonderry',
    availability: 'Immediate',
  },
  {
    name: 'Sarah Patel',
    role: 'Support Worker',
    experience: '3+ years',
    skills: 'Learning Disability Support, Mental Health Support, Hoist Operation',
    email: 'sarah.p@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900205',
    location: 'Newry',
    availability: 'Immediate',
  },
  {
    name: 'Liam Kelly',
    role: 'Night Care Assistant',
    experience: '5+ years',
    skills: 'Dementia Care, Infection Control, First Aid, Moving and Handling',
    email: 'liam.k@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900206',
    location: 'Ballymena',
    availability: 'Immediate',
  },
  {
    name: 'Hannah Wilson',
    role: 'Registered Nurse',
    experience: '7+ years',
    skills: 'Palliative Care, PEG Feeding, Clinical Documentation, NEWS2',
    email: 'hannah.w@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900207',
    location: 'Lisburn',
    availability: 'Immediate',
  },
  {
    name: 'James Doherty',
    role: 'Care Assistant',
    experience: '1+ years',
    skills: 'Personal Care, Manual Handling, Communication',
    email: 'james.d@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900208',
    location: 'Armagh',
    availability: 'Immediate',
  },
  {
    name: 'Niamh Sharma',
    role: 'Senior Healthcare Assistant',
    experience: '4+ years',
    skills: 'Medication Support, First Aid, Care Planning, Vital Signs',
    email: 'niamh.s@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900209',
    location: 'Coleraine',
    availability: 'Immediate',
  },
  {
    name: 'Daniel Adeyemi',
    role: 'Night Care Assistant',
    experience: '2+ years',
    skills: 'Moving and Handling, Dementia Care, Safeguarding',
    email: 'daniel.a@synthetic-staff.demo.co.uk',
    phone: '+44 7700 900210',
    location: 'Craigavon',
    availability: 'Immediate',
  },
];

async function main() {
  console.log('--- Starting Care Home Shift Platform Seeding ---');

  // Clear existing
  console.log('Clearing existing data...');
  await prisma.shiftAssignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.careHome.deleteMany();

  // 1. Seed Care Homes
  console.log(`Seeding ${careHomesData.length} Care Homes...`);
  const careHomes = await Promise.all(
    careHomesData.map((ch) => prisma.careHome.create({ data: ch }))
  );

  // 2. Seed Demo Staff
  console.log(`Seeding ${demoStaffData.length} Staff members...`);
  const staffMembers = await Promise.all(
    demoStaffData.map((st) => prisma.staff.create({ data: st }))
  );

  // 3. Seed 16 Realistic Demo Shifts with varied statuses & priorities
  console.log('Seeding 16 synthetic shift/vacancy records...');

  const shiftsToCreate = [
    // 1. OPEN, HIGH priority
    {
      careHomeId: careHomes[0].id,
      jobTitle: 'Care Assistant',
      shiftDate: '2026-10-15',
      startTime: '07:00',
      endTime: '19:00',
      requiredStaff: 3,
      filledStaff: 0,
      location: careHomes[0].town,
      department: 'Elderly Residential Wing',
      careType: careHomes[0].careType,
      requiredSkills: 'Personal Care, Manual Handling, Dementia Care',
      experienceRequired: '1+ years',
      payRate: '£13.50/hr',
      notes: 'Day shift covering annual leave. Meals provided during breaks.',
      status: 'OPEN',
      priority: 'HIGH',
    },
    // 2. PARTIALLY_FILLED, URGENT priority
    {
      careHomeId: careHomes[1].id,
      jobTitle: 'Night Care Assistant',
      shiftDate: '2026-10-16',
      startTime: '20:00',
      endTime: '08:00',
      requiredStaff: 4,
      filledStaff: 2,
      location: careHomes[1].town,
      department: 'Dementia Nursing Unit',
      careType: careHomes[1].careType,
      requiredSkills: 'Dementia Care, Medication Support, Infection Control',
      experienceRequired: '2+ years',
      payRate: '£15.75/hr',
      notes: 'Urgent night rota coverage. Two staff already confirmed.',
      status: 'PARTIALLY_FILLED',
      priority: 'URGENT',
    },
    // 3. FILLED, NORMAL priority
    {
      careHomeId: careHomes[3].id,
      jobTitle: 'Healthcare Assistant',
      shiftDate: '2026-10-17',
      startTime: '08:00',
      endTime: '20:00',
      requiredStaff: 2,
      filledStaff: 2,
      location: careHomes[3].town,
      department: 'Rehabilitation Ward',
      careType: careHomes[3].careType,
      requiredSkills: 'Patient Observation, Basic Life Support, Moving & Handling',
      experienceRequired: '1+ years',
      payRate: '£14.00/hr',
      notes: 'All required staff assigned and confirmed.',
      status: 'FILLED',
      priority: 'NORMAL',
    },
    // 4. OPEN, URGENT priority (Registered Nurse)
    {
      careHomeId: careHomes[1].id,
      jobTitle: 'Registered Nurse',
      shiftDate: '2026-10-18',
      startTime: '07:30',
      endTime: '20:00',
      requiredStaff: 1,
      filledStaff: 0,
      location: careHomes[1].town,
      department: 'Complex Palliative Wing',
      careType: 'Palliative Nursing',
      requiredSkills: 'Vital Signs, NEWS2, Wound Care, Medication Support',
      experienceRequired: '3+ years',
      payRate: '£26.50/hr',
      notes: 'Critical clinical lead shift needed for weekend cover.',
      status: 'OPEN',
      priority: 'URGENT',
    },
    // 5. OPEN, NORMAL priority
    {
      careHomeId: careHomes[2].id,
      jobTitle: 'Care Assistant',
      shiftDate: '2026-10-19',
      startTime: '07:00',
      endTime: '15:00',
      requiredStaff: 2,
      filledStaff: 0,
      location: careHomes[2].town,
      department: 'Residential Unit',
      careType: careHomes[2].careType,
      requiredSkills: 'Personal Care, First Aid, Moving and Handling',
      experienceRequired: 'No experience',
      payRate: '£13.00/hr',
      notes: 'Morning shift. Mentorship available for newer staff.',
      status: 'OPEN',
      priority: 'NORMAL',
    },
    // 6. PARTIALLY_FILLED, HIGH priority
    {
      careHomeId: careHomes[4].id,
      jobTitle: 'Senior Care Assistant',
      shiftDate: '2026-10-20',
      startTime: '08:00',
      endTime: '20:00',
      requiredStaff: 2,
      filledStaff: 1,
      location: careHomes[4].town,
      department: 'Memory Care',
      careType: careHomes[4].careType,
      requiredSkills: 'Medication Support, Dementia Care, Safeguarding',
      experienceRequired: '3+ years',
      payRate: '£16.20/hr',
      notes: 'Shift leader vacancy. 1 of 2 positions confirmed.',
      status: 'PARTIALLY_FILLED',
      priority: 'HIGH',
    },
    // 7. OPEN, URGENT priority
    {
      careHomeId: careHomes[5].id,
      jobTitle: 'Support Worker',
      shiftDate: '2026-10-21',
      startTime: '14:00',
      endTime: '22:00',
      requiredStaff: 2,
      filledStaff: 0,
      location: careHomes[5].town,
      department: 'Learning Disability Wing',
      careType: careHomes[5].careType,
      requiredSkills: 'Learning Disability Support, Mental Health Support',
      experienceRequired: '2+ years',
      payRate: '£14.75/hr',
      notes: 'Community outing support and evening residential routines.',
      status: 'OPEN',
      priority: 'URGENT',
    },
    // 8. FILLED, HIGH priority
    {
      careHomeId: careHomes[6].id,
      jobTitle: 'Registered Nurse',
      shiftDate: '2026-10-22',
      startTime: '19:45',
      endTime: '08:15',
      requiredStaff: 1,
      filledStaff: 1,
      location: careHomes[6].town,
      department: 'Intensive Nursing Ward',
      careType: careHomes[6].careType,
      requiredSkills: 'PEG Feeding, Catheter Care, Clinical Documentation, NEWS2',
      experienceRequired: '5+ years',
      payRate: '£28.00/hr',
      notes: 'Staff confirmed. NMC PIN checked.',
      status: 'FILLED',
      priority: 'HIGH',
    },
    // 9. CANCELLED shift
    {
      careHomeId: careHomes[7].id,
      jobTitle: 'Care Assistant',
      shiftDate: '2026-10-23',
      startTime: '08:00',
      endTime: '16:00',
      requiredStaff: 2,
      filledStaff: 0,
      location: careHomes[7].town,
      department: 'Day Activity Suite',
      careType: careHomes[7].careType,
      requiredSkills: 'Personal Care, Communication',
      experienceRequired: '1+ years',
      payRate: '£13.50/hr',
      notes: 'Cancelled due to planned internal ward refurbishment.',
      status: 'CANCELLED',
      priority: 'NORMAL',
    },
    // 10. EXPIRED shift (past date)
    {
      careHomeId: careHomes[0].id,
      jobTitle: 'Night Care Assistant',
      shiftDate: '2026-09-15',
      startTime: '20:00',
      endTime: '08:00',
      requiredStaff: 2,
      filledStaff: 1,
      location: careHomes[0].town,
      department: 'Night Watch Wing',
      careType: careHomes[0].careType,
      requiredSkills: 'Moving and Handling, Dementia Care',
      experienceRequired: '1+ years',
      payRate: '£15.00/hr',
      notes: 'Historic past shift. Archived as expired.',
      status: 'EXPIRED',
      priority: 'NORMAL',
    },
    // 11. OPEN, HIGH priority
    {
      careHomeId: careHomes[8].id,
      jobTitle: 'Senior Healthcare Assistant',
      shiftDate: '2026-10-24',
      startTime: '07:00',
      endTime: '19:30',
      requiredStaff: 2,
      filledStaff: 0,
      location: careHomes[8].town,
      department: 'Rehab Unit',
      careType: careHomes[8].careType,
      requiredSkills: 'Care Planning, Vital Signs, First Aid',
      experienceRequired: '3+ years',
      payRate: '£16.00/hr',
      notes: 'Supervising student placements during handover.',
      status: 'OPEN',
      priority: 'HIGH',
    },
    // 12. OPEN, URGENT priority
    {
      careHomeId: careHomes[9].id,
      jobTitle: 'Care Assistant',
      shiftDate: '2026-10-25',
      startTime: '07:30',
      endTime: '14:30',
      requiredStaff: 3,
      filledStaff: 0,
      location: careHomes[9].town,
      department: 'Main Residential Area',
      careType: careHomes[9].careType,
      requiredSkills: 'Personal Care, Manual Handling',
      experienceRequired: 'No experience',
      payRate: '£13.25/hr',
      notes: 'Morning personal care rounds.',
      status: 'OPEN',
      priority: 'URGENT',
    },
    // 13. PARTIALLY_FILLED, NORMAL priority
    {
      careHomeId: careHomes[10].id,
      jobTitle: 'Care Assistant',
      shiftDate: '2026-10-26',
      startTime: '15:00',
      endTime: '22:00',
      requiredStaff: 3,
      filledStaff: 1,
      location: careHomes[10].town,
      department: 'Dementia Twilight Wing',
      careType: careHomes[10].careType,
      requiredSkills: 'Dementia Care, Personal Care, First Aid',
      experienceRequired: '1+ years',
      payRate: '£14.20/hr',
      notes: 'Evening tea and bedtime routine assistance.',
      status: 'PARTIALLY_FILLED',
      priority: 'NORMAL',
    },
    // 14. FILLED, NORMAL priority
    {
      careHomeId: careHomes[11].id,
      jobTitle: 'Support Worker',
      shiftDate: '2026-10-27',
      startTime: '09:00',
      endTime: '17:00',
      requiredStaff: 1,
      filledStaff: 1,
      location: careHomes[11].town,
      department: 'Community Social Lounge',
      careType: careHomes[11].careType,
      requiredSkills: 'Communication, Personal Care',
      experienceRequired: '1+ years',
      payRate: '£13.80/hr',
      notes: 'Assisting recreational coordinator with activities.',
      status: 'FILLED',
      priority: 'NORMAL',
    },
    // 15. OPEN, NORMAL priority
    {
      careHomeId: careHomes[0].id,
      jobTitle: 'Registered Nurse',
      shiftDate: '2026-10-28',
      startTime: '07:00',
      endTime: '19:30',
      requiredStaff: 1,
      filledStaff: 0,
      location: careHomes[0].town,
      department: 'General Nursing Bay',
      careType: careHomes[0].careType,
      requiredSkills: 'Catheter Care, Medication Support, Vital Signs, NEWS2',
      experienceRequired: '2+ years',
      payRate: '£25.50/hr',
      notes: 'Regular scheduled ward nursing day shift.',
      status: 'OPEN',
      priority: 'NORMAL',
    },
    // 16. OPEN, HIGH priority
    {
      careHomeId: careHomes[3].id,
      jobTitle: 'Night Care Assistant',
      shiftDate: '2026-10-29',
      startTime: '20:00',
      endTime: '08:00',
      requiredStaff: 2,
      filledStaff: 0,
      location: careHomes[3].town,
      department: 'Elderly Care',
      careType: careHomes[3].careType,
      requiredSkills: 'Moving and Handling, Hoist Operation, Personal Care',
      experienceRequired: '2+ years',
      payRate: '£15.50/hr',
      notes: 'Overnight monitoring and hourly comfort checks.',
      status: 'OPEN',
      priority: 'HIGH',
    },
  ];

  for (const shiftData of shiftsToCreate) {
    const shift = await prisma.shift.create({ data: shiftData });

    // Link demo staff to shifts that have filledStaff > 0
    if (shiftData.filledStaff > 0) {
      for (let i = 0; i < shiftData.filledStaff; i++) {
        const staffIndex = (shift.id + i) % staffMembers.length;
        await prisma.shiftAssignment.create({
          data: {
            shiftId: shift.id,
            staffId: staffMembers[staffIndex].id,
            status: 'CONFIRMED',
          },
        });
      }
    }
  }

  const shiftCount = await prisma.shift.count();
  const careHomeCount = await prisma.careHome.count();
  const staffCount = await prisma.staff.count();

  console.log(`\n✅ Seeding complete!`);
  console.log(`- Care Homes: ${careHomeCount}`);
  console.log(`- Demo Staff: ${staffCount}`);
  console.log(`- Shifts/Vacancies: ${shiftCount}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
