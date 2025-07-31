export class MockupData {
  // Accounts data
  static accounts = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      guid: '550e8400-e29b-41d4-a716-446655440001',
      accountStatus: true, // true = Active, false = Disabled
      twoFactorEnabled: false,
      organizationName: 'TechCorp Industries',
      email: 'admin@techcorp.com',
      createdDate: '2024-01-15',
      userName: 'techcorp_admin',
      isEmailConfirmed: true, // true = Yes, false = No
      deviceId: 'DEV-TC-001',
      isAccountGeneralPublic: false, // true = Yes, false = No
      capacityPool: 50,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      guid: '550e8400-e29b-41d4-a716-446655440002',
      accountStatus: true,
      twoFactorEnabled: true,
      organizationName: 'Global Manufacturing Inc',
      email: 'admin@globalmanuf.com',
      createdDate: '2024-01-20',
      userName: 'global_admin',
      isEmailConfirmed: true,
      deviceId: 'DEV-GM-002',
      isAccountGeneralPublic: false,
      capacityPool: 75,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      guid: '550e8400-e29b-41d4-a716-446655440003',
      accountStatus: true,
      twoFactorEnabled: false,
      organizationName: 'Innovation Labs',
      email: 'admin@innovationlabs.com',
      createdDate: '2024-02-01',
      userName: 'innovation_admin',
      isEmailConfirmed: false,
      deviceId: 'DEV-IL-003',
      isAccountGeneralPublic: true,
      capacityPool: 30,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      guid: '550e8400-e29b-41d4-a716-446655440004',
      accountStatus: false,
      twoFactorEnabled: false,
      organizationName: 'Beta Testing Corp',
      email: 'admin@betatesting.com',
      createdDate: '2024-02-10',
      userName: 'beta_admin',
      isEmailConfirmed: true,
      deviceId: 'DEV-BT-004',
      isAccountGeneralPublic: false,
      capacityPool: 25,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      guid: '550e8400-e29b-41d4-a716-446655440005',
      accountStatus: true,
      twoFactorEnabled: true,
      organizationName: 'Future Tech Solutions',
      email: 'admin@futuretech.com',
      createdDate: '2024-02-15',
      userName: 'future_admin',
      isEmailConfirmed: false,
      deviceId: 'DEV-FT-005',
      isAccountGeneralPublic: true,
      capacityPool: 100,
    }
  ];

  // Courses data
  static courses = [
    {
      id: 'P001',
      code: 'P001',
      title: 'Automotive Engineering',
      description: 'Complete automotive engineering course covering all major vehicle systems, diagnostics, and modern automotive technology.',
      image: '/MobiusBackGround.jpg',
      numberOfModules: 10,
      targetSample: 150,
      targetTime: '8 hours',
      enrolled: 245,
      isPublic: true,
      organizationId: undefined
    },
    {
      id: 'P002',
      code: 'P002',
      title: 'Electrical Engineering',
      description: 'Comprehensive electrical engineering training covering circuit analysis, power systems, and modern electrical technologies.',
      image: '/ElectricalEng.jpg',
      numberOfModules: 10,
      targetSample: 180,
      targetTime: '10 hours',
      enrolled: 189,
      isPublic: true,
      organizationId: undefined
    },
    {
      id: 'P003',
      code: 'P003',
      title: 'Mechanical Engineering',
      description: 'Advanced mechanical engineering course covering thermodynamics, materials science, and manufacturing processes.',
      image: '/mechanics.jpg',
      numberOfModules: 10,
      targetSample: 200,
      targetTime: '9 hours',
      enrolled: 156,
      isPublic: true,
      organizationId: undefined
    },
    {
      id: 'P004',
      code: 'P004',
      title: 'Plumbing Course',
      description: 'Professional plumbing training covering all aspects of residential and commercial plumbing systems.',
      image: '/plumbing.jpg',
      numberOfModules: 10,
      targetSample: 120,
      targetTime: '6 hours',
      enrolled: 98,
      isPublic: true,
      organizationId: undefined
    },
    {
      id: 'P005',
      code: 'P005',
      title: 'TechCorp Safety Training',
      description: 'Organization-specific safety training protocols and procedures for TechCorp Industries employees.',
      image: '/MobiusBackGround.jpg',
      numberOfModules: 5,
      targetSample: 50,
      targetTime: '3 hours',
      enrolled: 25,
      isPublic: false,
      organizationId: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      id: 'P006',
      code: 'P006',
      title: 'Advanced Manufacturing Processes',
      description: 'Specialized manufacturing training for Global Manufacturing Inc operations.',
      image: '/mechanics.jpg',
      numberOfModules: 8,
      targetSample: 80,
      targetTime: '5 hours',
      enrolled: 15,
      isPublic: false,
      organizationId: '550e8400-e29b-41d4-a716-446655440002'
    }
  ];

  // Course modules data
  static courseModules: { [courseId: string]: any[] } = {
    'P001': [
      {
        id: 'A001',
        title: 'Engine Fundamentals',
        description: 'Understanding internal combustion engines, components, and basic operation principles.',
        longDescription: 'This comprehensive module provides in-depth coverage of internal combustion engines. Students will engage with hands-on VR simulations that replicate real-world engine scenarios, allowing for practical application of theoretical concepts. The module includes interactive assessments, progress tracking, and personalized feedback to ensure optimal learning outcomes. Advanced visualization techniques and immersive environments enhance understanding and retention of complex engine concepts.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 8,
        estimatedTime: '45 min',
        status: 'available'
      },
      {
        id: 'A002',
        title: 'Fuel Systems',
        description: 'Learn about fuel injection systems, carburetors, and fuel delivery mechanisms.',
        longDescription: 'Explore the intricacies of automotive fuel systems through immersive VR training. This module covers fuel injection systems, carburetors, fuel pumps, and delivery mechanisms. Students will practice diagnosing fuel system problems, performing maintenance procedures, and understanding fuel efficiency optimization techniques in a safe virtual environment.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 6,
        estimatedTime: '40 min',
        status: 'available'
      },
      {
        id: 'A003',
        title: 'Transmission Systems',
        description: 'Manual and automatic transmission systems, clutches, and drivetrain components.',
        longDescription: 'Master transmission systems through interactive VR simulations. This module provides comprehensive training on manual and automatic transmissions, clutch systems, and drivetrain components. Students will learn assembly, disassembly, troubleshooting, and repair procedures while understanding the mechanical principles behind power transmission.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 10,
        estimatedTime: '55 min',
        status: 'available'
      },
      {
        id: 'A004',
        title: 'Brake Systems',
        description: 'Hydraulic brake systems, ABS, and modern braking technologies.',
        longDescription: 'Comprehensive brake system training using advanced VR technology. Students will learn about hydraulic brake systems, anti-lock braking systems (ABS), electronic stability control, and modern braking technologies. The module includes hands-on practice with brake maintenance, troubleshooting, and safety procedures.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 7,
        estimatedTime: '35 min',
        status: 'available'
      },
      {
        id: 'A005',
        title: 'Electrical Systems',
        description: 'Automotive electrical systems, wiring, and electronic control units.',
        longDescription: 'Advanced automotive electrical systems training through immersive VR experiences. This module covers automotive wiring, electronic control units, sensors, actuators, and diagnostic procedures. Students will practice electrical troubleshooting, circuit analysis, and modern automotive electronics in a risk-free virtual environment.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 9,
        estimatedTime: '50 min',
        status: 'available'
      },
      {
        id: 'A006',
        title: 'Suspension & Steering',
        description: 'Suspension systems, steering mechanisms, and wheel alignment principles.',
        longDescription: 'Detailed suspension and steering system training using VR technology. Students will learn about different suspension types, steering mechanisms, wheel alignment procedures, and handling characteristics. The module includes practical exercises in suspension tuning, alignment procedures, and diagnostic techniques.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 8,
        estimatedTime: '45 min',
        status: 'available'
      },
      {
        id: 'A007',
        title: 'Cooling Systems',
        description: 'Engine cooling systems, radiators, and thermal management.',
        longDescription: 'Comprehensive cooling system training through VR simulations. This module covers engine cooling systems, radiators, water pumps, thermostats, and thermal management principles. Students will practice cooling system maintenance, troubleshooting overheating issues, and understanding heat transfer principles.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 5,
        estimatedTime: '30 min',
        status: 'available'
      },
      {
        id: 'A008',
        title: 'Diagnostic Tools',
        description: 'Using OBD scanners and diagnostic equipment for troubleshooting.',
        longDescription: 'Master automotive diagnostic tools and techniques through hands-on VR training. Students will learn to use OBD scanners, multimeters, oscilloscopes, and other diagnostic equipment. The module includes practical exercises in reading diagnostic codes, interpreting data, and systematic troubleshooting approaches.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 12,
        estimatedTime: '60 min',
        status: 'available'
      },
      {
        id: 'A009',
        title: 'Hybrid Technology',
        description: 'Hybrid vehicle systems, battery technology, and electric motors.',
        longDescription: 'Advanced hybrid vehicle technology training using cutting-edge VR simulations. This module covers hybrid powertrains, battery systems, electric motors, regenerative braking, and energy management systems. Students will learn safety procedures, diagnostic techniques, and maintenance practices for hybrid vehicles.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 15,
        estimatedTime: '75 min',
        status: 'coming-soon'
      },
      {
        id: 'A010',
        title: 'Safety Systems',
        description: 'Modern safety systems including airbags, collision avoidance, and ADAS.',
        longDescription: 'Comprehensive automotive safety systems training through immersive VR technology. Students will learn about airbag systems, collision avoidance technologies, advanced driver assistance systems (ADAS), and safety protocols. The module includes hands-on practice with safety system diagnostics and calibration procedures.',
        thumbnail: '/MobiusBackGround.jpg',
        sampleSize: 10,
        estimatedTime: '50 min',
        status: 'coming-soon'
      }
    ],

    'P002': [
      {
        id: 'E001',
        title: 'Circuit Analysis Fundamentals',
        description: 'Basic circuit analysis, Ohms law, and electrical measurements.',
        longDescription: 'Foundational circuit analysis training using interactive VR simulations. Students will master Ohms law, Kirchhoffs laws, circuit analysis techniques, and electrical measurement procedures. The module includes hands-on practice with virtual instruments and circuit building exercises.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 10,
        estimatedTime: '60 min',
        status: 'available'
      },
      {
        id: 'E002',
        title: 'AC/DC Power Systems',
        description: 'Understanding alternating and direct current power systems.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 12,
        estimatedTime: '70 min',
        status: 'available'
      },
      {
        id: 'E003',
        title: 'Digital Electronics',
        description: 'Logic gates, digital circuits, and microprocessor fundamentals.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 15,
        estimatedTime: '80 min',
        status: 'available'
      },
      {
        id: 'E004',
        title: 'Motor Control Systems',
        description: 'Electric motor types, control circuits, and variable frequency drives.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 8,
        estimatedTime: '50 min',
        status: 'available'
      },
      {
        id: 'E005',
        title: 'Power Distribution',
        description: 'Electrical power distribution systems, transformers, and switchgear.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 10,
        estimatedTime: '65 min',
        status: 'available'
      },
      {
        id: 'E006',
        title: 'Control Systems',
        description: 'PLC programming, automation systems, and industrial controls.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 18,
        estimatedTime: '90 min',
        status: 'available'
      },
      {
        id: 'E007',
        title: 'Electrical Safety',
        description: 'Electrical safety procedures, lockout/tagout, and hazard identification.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 6,
        estimatedTime: '40 min',
        status: 'available'
      },
      {
        id: 'E008',
        title: 'Renewable Energy Systems',
        description: 'Solar panels, wind turbines, and renewable energy integration.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 12,
        estimatedTime: '70 min',
        status: 'available'
      },
      {
        id: 'E009',
        title: 'Smart Grid Technology',
        description: 'Modern electrical grid systems, smart meters, and grid automation.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 20,
        estimatedTime: '100 min',
        status: 'coming-soon'
      },
      {
        id: 'E010',
        title: 'Electrical Testing & Troubleshooting',
        description: 'Advanced testing techniques and systematic troubleshooting methods.',
        thumbnail: '/ElectricalEng.jpg',
        sampleSize: 14,
        estimatedTime: '75 min',
        status: 'coming-soon'
      }
    ],

    'P003': [
      {
        id: 'M001',
        title: 'Thermodynamics Principles',
        description: 'Heat transfer, energy conversion, and thermodynamic cycles.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 12,
        estimatedTime: '65 min',
        status: 'available'
      },
      {
        id: 'M002',
        title: 'Materials Science',
        description: 'Properties of materials, stress analysis, and material selection.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 10,
        estimatedTime: '55 min',
        status: 'available'
      },
      {
        id: 'M003',
        title: 'Fluid Mechanics',
        description: 'Fluid properties, flow dynamics, and hydraulic systems.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 14,
        estimatedTime: '70 min',
        status: 'available'
      },
      {
        id: 'M004',
        title: 'Machine Design',
        description: 'Mechanical design principles, gears, bearings, and machine elements.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 16,
        estimatedTime: '80 min',
        status: 'available'
      },
      {
        id: 'M005',
        title: 'Manufacturing Processes',
        description: 'Machining, welding, casting, and modern manufacturing techniques.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 18,
        estimatedTime: '85 min',
        status: 'available'
      },
      {
        id: 'M006',
        title: 'CAD/CAM Systems',
        description: 'Computer-aided design and manufacturing software applications.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 20,
        estimatedTime: '90 min',
        status: 'available'
      },
      {
        id: 'M007',
        title: 'Quality Control',
        description: 'Measurement techniques, statistical process control, and quality assurance.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 8,
        estimatedTime: '45 min',
        status: 'available'
      },
      {
        id: 'M008',
        title: 'Robotics & Automation',
        description: 'Industrial robotics, automation systems, and mechatronics.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 22,
        estimatedTime: '95 min',
        status: 'available'
      },
      {
        id: 'M009',
        title: 'HVAC Systems',
        description: 'Heating, ventilation, and air conditioning system design and maintenance.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 15,
        estimatedTime: '75 min',
        status: 'coming-soon'
      },
      {
        id: 'M010',
        title: 'Project Management',
        description: 'Engineering project management, scheduling, and resource allocation.',
        thumbnail: '/mechanics.jpg',
        sampleSize: 10,
        estimatedTime: '60 min',
        status: 'coming-soon'
      }
    ],

    'P004': [
      {
        id: 'P001',
        title: 'Plumbing Basics',
        description: 'Introduction to plumbing systems, tools, and safety procedures.',
        longDescription: 'Comprehensive introduction to plumbing fundamentals through VR training. Students will learn about plumbing systems, tools, safety procedures, and basic installation techniques. The module includes hands-on practice with pipe cutting, fitting, and basic repair procedures in a safe virtual environment.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 5,
        estimatedTime: 30, // in minutes
        status: 'available'
      },
      {
        id: 'P002',
        title: 'Pipe Materials & Fittings',
        description: 'Different types of pipes, fittings, and their applications.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 8,
        estimatedTime: 40, // in minutes
        status: 'available'
      },
      {
        id: 'P003',
        title: 'Water Supply Systems',
        description: 'Water supply installation, pressure systems, and distribution.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 10,
        estimatedTime: 50, // in minutes
        status: 'available'
      },
      {
        id: 'P004',
        title: 'Drainage Systems',
        description: 'Waste water drainage, venting systems, and sewage disposal.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 12,
        estimatedTime: 55, // in minutes
        status: 'available'
      },
      {
        id: 'P005',
        title: 'Fixture Installation',
        description: 'Installing toilets, sinks, bathtubs, and other plumbing fixtures.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 15,
        estimatedTime: 65, // in minutes
        status: 'available'
      },
      {
        id: 'P006',
        title: 'Leak Detection & Repair',
        description: 'Identifying and repairing various types of plumbing leaks.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 8,
        estimatedTime: 45, // in minutes
        status: 'available'
      },
      {
        id: 'P007',
        title: 'Water Heater Systems',
        description: 'Installation and maintenance of water heating systems.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 10,
        estimatedTime: 50, // in minutes
        status: 'available'
      },
      {
        id: 'P008',
        title: 'Plumbing Codes & Regulations',
        description: 'Understanding local plumbing codes and regulatory requirements.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 6,
        estimatedTime: 35, // in minutes
        status: 'available'
      },
      {
        id: 'P009',
        title: 'Green Plumbing Technologies',
        description: 'Water conservation systems and eco-friendly plumbing solutions.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 12,
        estimatedTime: 60, // in minutes
        status: 'coming-soon'
      },
      {
        id: 'P010',
        title: 'Commercial Plumbing',
        description: 'Large-scale plumbing systems for commercial and industrial buildings.',
        thumbnail: '/plumbing.jpg',
        sampleSize: 18,
        estimatedTime: 80, // in minutes
        status: 'coming-soon'
      }
    ]
  };

  // Enrollment data
  static enrollments = [
    {
      id: 'ENR001',
      virtualUserId: '550e8400-e29b-41d4-a716-446655440001',
      courseId: 'P001',
      enrollmentDate: '2024-01-15',
      userName: 'John Doe'
    },
    {
      id: 'ENR002',
      virtualUserId: '550e8400-e29b-41d4-a716-446655440002',
      courseId: 'P001',
      enrollmentDate: '2024-01-16',
      userName: 'Jane Smith'
    },
    {
      id: 'ENR003',
      virtualUserId: '550e8400-e29b-41d4-a716-446655440003',
      courseId: 'P002',
      enrollmentDate: '2024-01-17',
      userName: 'Mike Johnson'
    },
    {
      id: 'ENR004',
      virtualUserId: '550e8400-e29b-41d4-a716-446655440004',
      courseId: 'P002',
      enrollmentDate: '2024-01-18',
      userName: 'Sarah Wilson'
    },
    {
      id: 'ENR005',
      virtualUserId: '550e8400-e29b-41d4-a716-446655440005',
      courseId: 'P003',
      enrollmentDate: '2024-01-19',
      userName: 'David Brown'
    }
  ];

  // Device data
  static devices = [
    {
      id: 'DEV001',
      deviceName: 'Meta Quest 3',
      brand: 'Meta',
      model: 'Quest 3',
      country: 'United States',
      city: 'New York',
      ram: '8GB',
      storage: '128GB',
      status: 'Active' as const,
      osVersion: 'Quest OS 5.2.1',
      lastSeen: '2024-01-22 14:30',
      userId: 'A123'
    },
    {
      id: 'DEV002',
      deviceName: 'Meta Quest 3S',
      brand: 'Meta',
      model: 'Quest 3S',
      country: 'Canada',
      city: 'Toronto',
      ram: '6GB',
      storage: '256GB',
      status: 'Blocked' as const,
      osVersion: 'Quest OS 5.1.8',
      lastSeen: '2024-01-21 09:15',
      userId: 'B456'
    },
    {
      id: 'DEV003',
      deviceName: 'Meta Quest 2',
      brand: 'Meta',
      model: 'Quest 2',
      country: 'United Kingdom',
      city: 'London',
      ram: '6GB',
      storage: '128GB',
      status: 'Active' as const,
      osVersion: 'Quest OS 4.8.3',
      lastSeen: '2024-01-22 16:45',
      userId: 'C789'
    },
    {
      id: 'DEV004',
      deviceName: 'Meta Quest 2',
      brand: 'Meta',
      model: 'Quest 2',
      country: 'Germany',
      city: 'Berlin',
      ram: '6GB',
      storage: '256GB',
      status: 'Active' as const,
      osVersion: 'Quest OS 4.8.3',
      lastSeen: '2024-01-22 11:20',
      userId: 'D012'
    }
  ];

  // Training data
  static trainingData = [
    { name: 'John Smith', userCode: 'A123', trainedTime: '2h 45m', elapsedTime: '3h 12m', accumulatedSample: 85, courseCode: 'C001', id: 'A123' },
    { name: 'Sarah Johnson', userCode: 'B456', trainedTime: '1h 30m', elapsedTime: '2h 05m', accumulatedSample: 92, courseCode: 'C002', id: 'B456' },
    { name: 'Mike Davis', userCode: 'C789', trainedTime: '3h 15m', elapsedTime: '4h 22m', accumulatedSample: 78, courseCode: 'C001', id: 'C789' },
    { name: 'Emily Brown', userCode: 'D012', trainedTime: '2h 20m', elapsedTime: '2h 55m', accumulatedSample: 88, courseCode: 'C003', id: 'D012' },
    { name: 'Alex Wilson', userCode: 'E345', trainedTime: '1h 45m', elapsedTime: '2h 18m', accumulatedSample: 95, courseCode: 'C002', id: 'E345' },
    { name: 'Lisa Chen', userCode: 'F678', trainedTime: '3h 30m', elapsedTime: '4h 15m', accumulatedSample: 82, courseCode: 'C001', id: 'F678' },
    { name: 'David Rodriguez', userCode: 'G901', trainedTime: '2h 10m', elapsedTime: '2h 45m', accumulatedSample: 90, courseCode: 'C004', id: 'G901' },
    { name: 'Jennifer Lee', userCode: 'H234', trainedTime: '1h 55m', elapsedTime: '2h 30m', accumulatedSample: 87, courseCode: 'C002', id: 'H234' },
    { name: 'Robert Taylor', userCode: 'I567', trainedTime: '2h 35m', elapsedTime: '3h 20m', accumulatedSample: 79, courseCode: 'C003', id: 'I567' },
    { name: 'Maria Garcia', userCode: 'J890', trainedTime: '1h 40m', elapsedTime: '2h 15m', accumulatedSample: 93, courseCode: 'C001', id: 'J890' },
    { name: 'James Anderson', userCode: 'K123', trainedTime: '3h 05m', elapsedTime: '3h 50m', accumulatedSample: 84, courseCode: 'C004', id: 'K123' },
    { name: 'Linda Martinez', userCode: 'L456', trainedTime: '2h 25m', elapsedTime: '3h 10m', accumulatedSample: 86, courseCode: 'C002', id: 'L456' },
    { name: 'Christopher White', userCode: 'M789', trainedTime: '1h 50m', elapsedTime: '2h 25m', accumulatedSample: 91, courseCode: 'C003', id: 'M789' },
    { name: 'Patricia Thompson', userCode: 'N012', trainedTime: '2h 40m', elapsedTime: '3h 25m', accumulatedSample: 83, courseCode: 'C001', id: 'N012' },
    { name: 'Daniel Harris', userCode: 'O345', trainedTime: '1h 35m', elapsedTime: '2h 10m', accumulatedSample: 94, courseCode: 'C004', id: 'O345' },
    { name: 'Barbara Clark', userCode: 'P678', trainedTime: '3h 20m', elapsedTime: '4h 05m', accumulatedSample: 81, courseCode: 'C002', id: 'P678' },
    { name: 'Matthew Lewis', userCode: 'Q901', trainedTime: '2h 15m', elapsedTime: '2h 50m', accumulatedSample: 89, courseCode: 'C003', id: 'Q901' },
    { name: 'Susan Walker', userCode: 'R234', trainedTime: '1h 45m', elapsedTime: '2h 20m', accumulatedSample: 92, courseCode: 'C001', id: 'R234' },
    { name: 'Anthony Hall', userCode: 'S567', trainedTime: '2h 50m', elapsedTime: '3h 35m', accumulatedSample: 85, courseCode: 'C004', id: 'S567' },
    { name: 'Nancy Allen', userCode: 'T890', trainedTime: '1h 25m', elapsedTime: '2h 00m', accumulatedSample: 96, courseCode: 'C002', id: 'T890' },
    { name: 'Mark Young', userCode: 'U123', trainedTime: '3h 10m', elapsedTime: '3h 55m', accumulatedSample: 80, courseCode: 'C003', id: 'U123' },
    { name: 'Betty King', userCode: 'V456', trainedTime: '2h 30m', elapsedTime: '3h 15m', accumulatedSample: 87, courseCode: 'C001', id: 'V456' },
    { name: 'Steven Wright', userCode: 'W789', trainedTime: '1h 55m', elapsedTime: '2h 30m', accumulatedSample: 90, courseCode: 'C004', id: 'W789' },
    { name: 'Helen Lopez', userCode: 'X012', trainedTime: '2h 45m', elapsedTime: '3h 30m', accumulatedSample: 84, courseCode: 'C002', id: 'X012' },
    { name: 'Paul Hill', userCode: 'Y345', trainedTime: '1h 40m', elapsedTime: '2h 15m', accumulatedSample: 93, courseCode: 'C003', id: 'Y345' }
  ];

  // Graduated users data
  static graduatedUsers = [
    { name: 'Alice Cooper', userCode: 'G001', courseId: 'C001', dateIssued: '2024-01-15', certificateId: 'CERT001' },
    { name: 'Bob Wilson', userCode: 'G002', courseId: 'C002', dateIssued: '2024-01-20', certificateId: 'CERT002' },
    { name: 'Carol Davis', userCode: 'G003', courseId: 'C003', dateIssued: '2024-01-22', certificateId: 'CERT003' },
    { name: 'Frank Miller', userCode: 'G004', courseId: 'C001', dateIssued: '2024-01-25', certificateId: 'CERT004' },
    { name: 'Grace Turner', userCode: 'G005', courseId: 'C004', dateIssued: '2024-01-28', certificateId: 'CERT005' },
    { name: 'Henry Moore', userCode: 'G006', courseId: 'C002', dateIssued: '2024-02-01', certificateId: 'CERT006' },
    { name: 'Irene Jackson', userCode: 'G007', courseId: 'C003', dateIssued: '2024-02-03', certificateId: 'CERT007' },
    { name: 'Jack Brown', userCode: 'G008', courseId: 'C001', dateIssued: '2024-02-05', certificateId: 'CERT008' },
    { name: 'Karen White', userCode: 'G009', courseId: 'C004', dateIssued: '2024-02-08', certificateId: 'CERT009' },
    { name: 'Larry Green', userCode: 'G010', courseId: 'C002', dateIssued: '2024-02-10', certificateId: 'CERT010' },
    { name: 'Monica Blue', userCode: 'G011', courseId: 'C003', dateIssued: '2024-02-12', certificateId: 'CERT011' },
    { name: 'Nathan Gray', userCode: 'G012', courseId: 'C001', dateIssued: '2024-02-15', certificateId: 'CERT012' },
    { name: 'Olivia Black', userCode: 'G013', courseId: 'C004', dateIssued: '2024-02-17', certificateId: 'CERT013' },
    { name: 'Peter Red', userCode: 'G014', courseId: 'C002', dateIssued: '2024-02-20', certificateId: 'CERT014' },
    { name: 'Quinn Silver', userCode: 'G015', courseId: 'C003', dateIssued: '2024-02-22', certificateId: 'CERT015' },
    { name: 'Rachel Gold', userCode: 'G016', courseId: 'C001', dateIssued: '2024-02-25', certificateId: 'CERT016' },
    { name: 'Samuel Pink', userCode: 'G017', courseId: 'C004', dateIssued: '2024-02-27', certificateId: 'CERT017' },
    { name: 'Tina Orange', userCode: 'G018', courseId: 'C002', dateIssued: '2024-03-01', certificateId: 'CERT018' },
    { name: 'Victor Purple', userCode: 'G019', courseId: 'C003', dateIssued: '2024-03-03', certificateId: 'CERT019' },
    { name: 'Wendy Yellow', userCode: 'G020', courseId: 'C001', dateIssued: '2024-03-05', certificateId: 'CERT020' },
    { name: 'Xavier Cyan', userCode: 'G021', courseId: 'C004', dateIssued: '2024-03-08', certificateId: 'CERT021' },
    { name: 'Yvonne Magenta', userCode: 'G022', courseId: 'C002', dateIssued: '2024-03-10', certificateId: 'CERT022' },
    { name: 'Zachary Lime', userCode: 'G023', courseId: 'C003', dateIssued: '2024-03-12', certificateId: 'CERT023' },
    { name: 'Amanda Rose', userCode: 'G024', courseId: 'C001', dateIssued: '2024-03-15', certificateId: 'CERT024' },
    { name: 'Brian Violet', userCode: 'G025', courseId: 'C004', dateIssued: '2024-03-17', certificateId: 'CERT025' }
  ];

  // Virtual users data
  static virtualUsers = [
    { name: 'John Doe', userCode: 'A123', dateAdded: '2024-01-15', stage: 'Beginner', email: 'john@example.com', lastLogin: '2024-01-20', coursesCompleted: 3, totalTrainingTime: '12h 30m', averageScore: 85, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440001' },
    { name: 'Jane Smith', userCode: 'B456', dateAdded: '2024-01-16', stage: 'Intermediate', email: 'jane@example.com', lastLogin: '2024-01-22', coursesCompleted: 7, totalTrainingTime: '28h 45m', averageScore: 92, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440001' },
    { name: 'Mike Johnson', userCode: 'C789', dateAdded: '2024-01-17', stage: 'Advanced', email: 'mike@example.com', lastLogin: '2024-01-19', coursesCompleted: 12, totalTrainingTime: '45h 20m', averageScore: 88, status: 'Inactive', accountId: '550e8400-e29b-41d4-a716-446655440002' },
    { name: 'Sarah Wilson', userCode: 'D012', dateAdded: '2024-01-18', stage: 'Beginner', email: 'sarah@example.com', lastLogin: '2024-01-21', coursesCompleted: 2, totalTrainingTime: '8h 15m', averageScore: 78, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440002' },
    { name: 'David Brown', userCode: 'E345', dateAdded: '2024-01-19', stage: 'Intermediate', email: 'david@example.com', lastLogin: '2024-01-23', coursesCompleted: 5, totalTrainingTime: '22h 10m', averageScore: 89, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440003' },
    { name: 'Lisa Garcia', userCode: 'F678', dateAdded: '2024-01-20', stage: 'Advanced', email: 'lisa@example.com', lastLogin: '2024-01-24', coursesCompleted: 15, totalTrainingTime: '52h 30m', averageScore: 94, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440003' },
    { name: 'Robert Lee', userCode: 'G901', dateAdded: '2024-01-21', stage: 'Beginner', email: 'robert@example.com', lastLogin: '2024-01-25', coursesCompleted: 1, totalTrainingTime: '4h 45m', averageScore: 72, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440004' },
    { name: 'Emily Davis', userCode: 'H234', dateAdded: '2024-01-22', stage: 'Intermediate', email: 'emily@example.com', lastLogin: '2024-01-26', coursesCompleted: 8, totalTrainingTime: '35h 20m', averageScore: 91, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440004' },
    { name: 'James Miller', userCode: 'I567', dateAdded: '2024-01-23', stage: 'Advanced', email: 'james@example.com', lastLogin: '2024-01-27', coursesCompleted: 18, totalTrainingTime: '68h 15m', averageScore: 96, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440005' },
    { name: 'Maria Rodriguez', userCode: 'J890', dateAdded: '2024-01-24', stage: 'Beginner', email: 'maria@example.com', lastLogin: '2024-01-28', coursesCompleted: 3, totalTrainingTime: '11h 30m', averageScore: 80, status: 'Inactive', accountId: '550e8400-e29b-41d4-a716-446655440005' },
    { name: 'Christopher Taylor', userCode: 'K123', dateAdded: '2024-01-25', stage: 'Intermediate', email: 'chris@example.com', lastLogin: '2024-01-29', coursesCompleted: 6, totalTrainingTime: '26h 45m', averageScore: 87, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440001' },
    { name: 'Jennifer Anderson', userCode: 'L456', dateAdded: '2024-01-26', stage: 'Advanced', email: 'jennifer@example.com', lastLogin: '2024-01-30', coursesCompleted: 14, totalTrainingTime: '48h 20m', averageScore: 93, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440002' },
    { name: 'Daniel Thomas', userCode: 'M789', dateAdded: '2024-01-27', stage: 'Beginner', email: 'daniel@example.com', lastLogin: '2024-01-31', coursesCompleted: 2, totalTrainingTime: '7h 15m', averageScore: 75, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440003' },
    { name: 'Patricia Jackson', userCode: 'N012', dateAdded: '2024-01-28', stage: 'Intermediate', email: 'patricia@example.com', lastLogin: '2024-02-01', coursesCompleted: 9, totalTrainingTime: '38h 30m', averageScore: 90, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440004' },
    { name: 'Matthew White', userCode: 'O345', dateAdded: '2024-01-29', stage: 'Advanced', email: 'matthew@example.com', lastLogin: '2024-02-02', coursesCompleted: 16, totalTrainingTime: '58h 45m', averageScore: 95, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440005' },
    { name: 'Linda Harris', userCode: 'P678', dateAdded: '2024-01-30', stage: 'Beginner', email: 'linda@example.com', lastLogin: '2024-02-03', coursesCompleted: 1, totalTrainingTime: '3h 20m', averageScore: 68, status: 'Inactive', accountId: '550e8400-e29b-41d4-a716-446655440001' },
    { name: 'Anthony Martin', userCode: 'Q901', dateAdded: '2024-01-31', stage: 'Intermediate', email: 'anthony@example.com', lastLogin: '2024-02-04', coursesCompleted: 7, totalTrainingTime: '31h 15m', averageScore: 88, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440002' },
    { name: 'Barbara Thompson', userCode: 'R234', dateAdded: '2024-02-01', stage: 'Advanced', email: 'barbara@example.com', lastLogin: '2024-02-05', coursesCompleted: 13, totalTrainingTime: '44h 30m', averageScore: 92, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440003' },
    { name: 'Mark Garcia', userCode: 'S567', dateAdded: '2024-02-02', stage: 'Beginner', email: 'mark@example.com', lastLogin: '2024-02-06', coursesCompleted: 4, totalTrainingTime: '15h 45m', averageScore: 82, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440004' },
    { name: 'Susan Martinez', userCode: 'T890', dateAdded: '2024-02-03', stage: 'Intermediate', email: 'susan@example.com', lastLogin: '2024-02-07', coursesCompleted: 10, totalTrainingTime: '42h 20m', averageScore: 89, status: 'Active', accountId: '550e8400-e29b-41d4-a716-446655440005' }
  ];

  // Dashboard chart data
  static improvementData = [
    { month: 'Jan', improvement: 65, errors: 35 },
    { month: 'Feb', improvement: 72, errors: 28 },
    { month: 'Mar', improvement: 78, errors: 22 },
    { month: 'Apr', improvement: 85, errors: 15 },
    { month: 'May', improvement: 88, errors: 12 },
    { month: 'Jun', improvement: 92, errors: 8 },
  ];

  // Alerts data
  static alerts: { [accountId: string]: any[] } = {
    '550e8400-e29b-41d4-a716-446655440001': [ // TechCorp Industries
      {
        id: 'alert001',
        type: 'training',
        title: 'New Training Data Added',
        message: 'John Smith completed Automotive Engineering training',
        timestamp: '2024-01-22 14:30',
        isRead: false
      },
      {
        id: 'alert002',
        type: 'course',
        title: 'New Course Added',
        message: 'TechCorp Safety Training course has been created',
        timestamp: '2024-01-21 10:15',
        isRead: false
      },
      {
        id: 'alert003',
        type: 'module',
        title: 'New Module Added',
        message: 'Safety Protocols module added to TechCorp Safety Training',
        timestamp: '2024-01-20 16:45',
        isRead: true
      }
    ],
    '550e8400-e29b-41d4-a716-446655440002': [ // Global Manufacturing Inc
      {
        id: 'alert004',
        type: 'enrollment',
        title: 'New Enrollment',
        message: 'Sarah Wilson enrolled in Advanced Manufacturing Processes',
        timestamp: '2024-01-22 09:20',
        isRead: false
      }
    ]
  };

  // Training steps data for specific training records
  static trainingSteps: { [trainingId: string]: any } = {
    'A123': {
      userId: 'A123',
      userName: 'John Smith',
      courseCode: 'C001',
      stepsData: [
        { step: 1, errorRate: 25, successRate: 75 },
        { step: 2, errorRate: 20, successRate: 80 },
        { step: 3, errorRate: 15, successRate: 85 },
        { step: 4, errorRate: 10, successRate: 90 },
        { step: 5, errorRate: 8, successRate: 92 },
      ],
      timeData: [
        { step: 1, elapsedTime: 15, expectedTime: 12 },
        { step: 2, elapsedTime: 18, expectedTime: 15 },
        { step: 3, elapsedTime: 22, expectedTime: 20 },
        { step: 4, elapsedTime: 25, expectedTime: 22 },
        { step: 5, elapsedTime: 28, expectedTime: 25 },
      ],
      summaryData: [
        {
          stepNumber: 1,
          elapsedTime: '15 min',
          expectedTime: '12 min',
          errorSum: 5,
          errorRate: '25%',
          errorSummary: 'Navigation errors',
          successRate: '75%'
        },
        {
          stepNumber: 2,
          elapsedTime: '18 min',
          expectedTime: '15 min',
          errorSum: 3,
          errorRate: '20%',
          errorSummary: 'Interaction delays',
          successRate: '80%'
        },
        {
          stepNumber: 3,
          elapsedTime: '22 min',
          expectedTime: '20 min',
          errorSum: 2,
          errorRate: '15%',
          errorSummary: 'Minor hesitations',
          successRate: '85%'
        },
        {
          stepNumber: 4,
          elapsedTime: '25 min',
          expectedTime: '22 min',
          errorSum: 1,
          errorRate: '10%',
          errorSummary: 'Timing adjustment',
          successRate: '90%'
        },
        {
          stepNumber: 5,
          elapsedTime: '28 min',
          expectedTime: '25 min',
          errorSum: 1,
          errorRate: '8%',
          errorSummary: 'Final optimization',
          successRate: '92%'
        }
      ]
    },
    'B456': {
      userId: 'B456',
      userName: 'Sarah Johnson',
      courseCode: 'C002',
      stepsData: [
        { step: 1, errorRate: 30, successRate: 70 },
        { step: 2, errorRate: 22, successRate: 78 },
        { step: 3, errorRate: 18, successRate: 82 },
        { step: 4, errorRate: 12, successRate: 88 },
      ],
      timeData: [
        { step: 1, elapsedTime: 20, expectedTime: 15 },
        { step: 2, elapsedTime: 25, expectedTime: 20 },
        { step: 3, elapsedTime: 30, expectedTime: 25 },
        { step: 4, elapsedTime: 35, expectedTime: 30 },
      ],
      summaryData: [
        {
          stepNumber: 1,
          elapsedTime: '20 min',
          expectedTime: '15 min',
          errorSum: 6,
          errorRate: '30%',
          errorSummary: 'Initial learning curve',
          successRate: '70%'
        },
        {
          stepNumber: 2,
          elapsedTime: '25 min',
          expectedTime: '20 min',
          errorSum: 4,
          errorRate: '22%',
          errorSummary: 'Procedure familiarization',
          successRate: '78%'
        },
        {
          stepNumber: 3,
          elapsedTime: '30 min',
          expectedTime: '25 min',
          errorSum: 3,
          errorRate: '18%',
          errorSummary: 'Skill development',
          successRate: '82%'
        },
        {
          stepNumber: 4,
          elapsedTime: '35 min',
          expectedTime: '30 min',
          errorSum: 2,
          errorRate: '12%',
          errorSummary: 'Competency achieved',
          successRate: '88%'
        }
      ]
    }
  };

  // Utility methods
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get deep copies to prevent mutation
  static getAccounts() {
    return JSON.parse(JSON.stringify(this.accounts));
  }

  static getCourses() {
    return JSON.parse(JSON.stringify(this.courses));
  }

  static getCourseModules() {
    return JSON.parse(JSON.stringify(this.courseModules));
  }

  static getDevices() {
    return JSON.parse(JSON.stringify(this.devices));
  }

  static getTrainingData() {
    return JSON.parse(JSON.stringify(this.trainingData));
  }

  static getGraduatedUsers() {
    return JSON.parse(JSON.stringify(this.graduatedUsers));
  }

  static getVirtualUsers() {
    return JSON.parse(JSON.stringify(this.virtualUsers));
  }

  static getImprovementData() {
    return JSON.parse(JSON.stringify(this.improvementData));
  }

  static getEnrollments() {
    return JSON.parse(JSON.stringify(this.enrollments));
  }

  static getAlerts() {
    return JSON.parse(JSON.stringify(this.alerts));
  }

  static getTrainingSteps() {
    return JSON.parse(JSON.stringify(this.trainingSteps));
  }
}