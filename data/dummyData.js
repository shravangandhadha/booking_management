// data/dummyData.js

export const DUMMY_USERS = [
  {
    id: "usr_1",
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    ticketsBooked: 3,
    totalSpent: 197
  },
  {
    id: "usr_2",
    name: "Sarah Chen",
    email: "sarah.c@techhub.org",
    role: "Event Organizer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    ticketsBooked: 0,
    totalSpent: 0
  },
  {
    id: "usr_3",
    name: "Marcus Johnson",
    email: "marcus.j@devschool.io",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    ticketsBooked: 2,
    totalSpent: 120
  },
  {
    id: "usr_4",
    name: "Emily Watson",
    email: "emily.w@designlab.co",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    ticketsBooked: 1,
    totalSpent: 49
  }
];

export const INITIAL_EVENTS = [
  {
    id: 1,
    title: "AI & Machine Learning Bootcamp 2026",
    category: "Technology",
    date: "2026-11-15",
    location: "Auditorium A / Zoom",
    price: 49,
    capacity: 100,
    bookedSeats: 84,
    organizer: "Sarah Chen",
    description: "Hands-on workshop covering LLMs, Python pipeline building, and cloud deployment."
  },
  {
    id: 2,
    title: "Full-Stack React & Next.js Masterclass",
    category: "Development",
    date: "2026-11-20",
    location: "Lab 304",
    price: 99,
    capacity: 50,
    bookedSeats: 50,
    organizer: "Alex Rivera",
    description: "Build robust full-stack applications with SSR, Server Actions, and Tailwind CSS."
  },
  {
    id: 3,
    title: "UI/UX Design Systems Workshop",
    category: "Design",
    date: "2026-12-02",
    location: "Design Studio B",
    price: 29,
    capacity: 40,
    bookedSeats: 18,
    organizer: "Emily Watson",
    description: "Learn to construct scalable Figma design tokens and component libraries."
  },
  {
    id: 4,
    title: "Startup Pitch & Freelance Bootcamp",
    category: "Business",
    date: "2026-12-10",
    location: "Main Hall",
    price: 0,
    capacity: 150,
    bookedSeats: 112,
    organizer: "Marcus Johnson",
    description: "Learn client negotiation, pricing strategies, and proposal crafting."
  }
];

export const RECENT_BOOKINGS = [
  { id: "bk_101", userName: "Alex Rivera", eventTitle: "AI & Machine Learning Bootcamp 2026", amount: 49, date: "2 mins ago" },
  { id: "bk_102", userName: "Marcus Johnson", eventTitle: "Full-Stack React & Next.js Masterclass", amount: 99, date: "1 hour ago" },
  { id: "bk_103", userName: "Emily Watson", eventTitle: "UI/UX Design Systems Workshop", amount: 29, date: "3 hours ago" }
];