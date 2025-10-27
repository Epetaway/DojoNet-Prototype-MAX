// Static demo events for GitHub Pages deployment
const DEMO_EVENTS = [
  {
    id: 'evt_1',
    title: 'Open Mat Sunday',
    description: 'All levels welcome! Come roll and work on your game. Bring a friend!',
    discipline: 'BJJ',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Gracie Barra LA',
    address: '123 Main St, Los Angeles, CA 90012',
    organizer: 'Gracie Barra LA',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    attendees: 24,
    maxAttendees: 50,
    price: 0,
    tags: ['bjj', 'openmat', 'gi'],
    isOnline: false,
  },
  {
    id: 'evt_2',
    title: 'IBJJF Los Angeles Championship',
    description: 'Compete against the best in Southern California. All belt levels and age divisions.',
    discipline: 'BJJ',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    location: 'Long Beach Convention Center',
    address: '300 E Ocean Blvd, Long Beach, CA 90802',
    organizer: 'IBJJF',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    attendees: 156,
    maxAttendees: 500,
    price: 120,
    tags: ['bjj', 'competition', 'gi', 'nogi'],
    isOnline: false,
  },
  {
    id: 'evt_3',
    title: 'Muay Thai Fundamentals Workshop',
    description: 'Learn the fundamentals of the art of 8 limbs. Bring wraps and gloves.',
    discipline: 'Muay Thai',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Tiger Muay Thai LA',
    address: '456 Sunset Blvd, Los Angeles, CA 90028',
    organizer: 'Tiger Muay Thai',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    attendees: 12,
    maxAttendees: 20,
    price: 40,
    tags: ['muaythai', 'workshop', 'fundamentals'],
    isOnline: false,
  },
  {
    id: 'evt_4',
    title: 'Wrestling for BJJ - Takedown Clinic',
    description: 'Master takedowns and top control. Led by NCAA Division 1 wrestler.',
    discipline: 'Wrestling',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: '10th Planet Jiu-Jitsu',
    address: '789 Venice Blvd, Los Angeles, CA 90015',
    organizer: '10th Planet Jiu-Jitsu',
    imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800',
    attendees: 18,
    maxAttendees: 25,
    price: 35,
    tags: ['wrestling', 'bjj', 'takedowns', 'clinic'],
    isOnline: false,
  },
  {
    id: 'evt_5',
    title: 'Black Belt Seminar - Advanced Guard Passing',
    description: 'Learn high-level pressure passing concepts from 4th degree black belt Professor Mike.',
    discipline: 'BJJ',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Renzo Gracie LA',
    address: '321 Hollywood Blvd, Los Angeles, CA 90028',
    organizer: 'Renzo Gracie LA',
    imageUrl: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?w=800',
    attendees: 32,
    maxAttendees: 40,
    price: 75,
    tags: ['bjj', 'seminar', 'advanced', 'blackbelt'],
    isOnline: false,
  },
  {
    id: 'evt_6',
    title: 'Kids BJJ Tournament',
    description: 'Youth competition for ages 5-15. All experience levels welcome!',
    discipline: 'BJJ',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    location: 'Alliance BJJ',
    address: '555 Pacific Ave, San Diego, CA 92101',
    organizer: 'Alliance BJJ',
    imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
    attendees: 45,
    maxAttendees: 100,
    price: 50,
    tags: ['bjj', 'kids', 'competition', 'youth'],
    isOnline: false,
  },
];

export async function searchEvents(params = {}) {
  // Static mode: filter demo events based on params
  console.log('[Static Mode] Loading demo events with filters:', params);
  
  let filtered = [...DEMO_EVENTS];
  
  // Filter by discipline
  if (params.discipline && params.discipline !== 'all') {
    filtered = filtered.filter(e => 
      e.discipline.toLowerCase() === params.discipline.toLowerCase()
    );
  }
  
  // Filter by search query
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.location.toLowerCase().includes(query)
    );
  }
  
  // Filter by location/city
  if (params.city) {
    filtered = filtered.filter(e =>
      e.address.toLowerCase().includes(params.city.toLowerCase())
    );
  }
  
  // Filter by date range
  if (params.startDate) {
    filtered = filtered.filter(e => new Date(e.startDate) >= new Date(params.startDate));
  }
  
  if (params.endDate) {
    filtered = filtered.filter(e => new Date(e.endDate) <= new Date(params.endDate));
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    events: filtered,
    total: filtered.length,
    page: 1,
    limit: filtered.length,
  };
}
