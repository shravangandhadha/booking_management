// app/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Ticket, CalendarDays, Users, Activity as ActivityIcon, Settings,
  Plus, Search, Trash2, X, Menu, Pencil, Clock, CheckCircle2, Circle, AlertTriangle,
  ArrowLeft, ArrowRight, Flag, MessageSquare, Download, RotateCcw, ChevronLeft, ChevronRight,
  DollarSign, MapPin, Tag, UserCheck, Eye, ShieldCheck, Film, Music, Sparkles
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type EventStatus = 'upcoming' | 'selling' | 'sold-out' | 'ended';
type Category = 'Concert' | 'Movie' | 'Tech Conference' | 'Workshop' | 'Theater';
type View = 'dashboard' | 'events' | 'selling' | 'soldout' | 'mybookings' | 'calendar' | 'customers' | 'activity' | 'settings' | 'event';

type Customer = { id: string; name: string; email: string; role: string; avatarColor: string };
type Booking = { id: string; customerId: string; ticketsCount: number; totalPrice: number; bookedAt: string; status: 'confirmed' | 'cancelled' };
type Review = { id: string; authorId: string; text: string; rating: number; at: string };
type EventItem = {
  id: string; title: string; category: Category; description: string; status: EventStatus;
  date: string; location: string; price: number; capacity: number; bookedSeats: number;
  organizerId: string; bookings: Booking[]; reviews: Review[]; createdAt: string;
};
type LogEntry = { id: string; text: string; at: string };
type SystemSettings = { workspace: string; currentUserId: string };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = 'ticketting_hub:v1';
const COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500'];

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d); };
const daysUntil = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - now.getTime()) / 86400000);
};
const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const EVENT_META: Record<EventStatus, { label: string; badge: string; dot: string }> = {
  upcoming: { label: 'Upcoming', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  selling: { label: 'Selling Now', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', dot: 'bg-sky-400' },
  'sold-out': { label: 'Sold Out', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
  ended: { label: 'Ended', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};

function fillRate(e: EventItem) {
  return e.capacity ? Math.round((e.bookedSeats / e.capacity) * 100) : 0;
}

function dueInfo(date: string) {
  const d = daysUntil(date);
  if (d < 0) return { label: `${-d}d ago`, tone: 'text-slate-500', urgent: false };
  if (d === 0) return { label: 'Happening Today', tone: 'text-emerald-400', urgent: true };
  if (d <= 3) return { label: `In ${d} days`, tone: 'text-amber-400', urgent: true };
  return { label: `In ${d} days`, tone: 'text-slate-400', urgent: false };
}

function buildSeed(): { customers: Customer[]; events: EventItem[]; log: LogEntry[]; settings: SystemSettings } {
  const customers: Customer[] = [
    { id: 'c1', name: 'Alex Rivera', email: 'alex.r@university.edu', role: 'VIP Member', avatarColor: COLORS[0] },
    { id: 'c2', name: 'Sarah Chen', email: 'sarah.c@techhub.org', role: 'Event Organizer', avatarColor: COLORS[1] },
    { id: 'c3', name: 'Rahul Mehta', email: 'rahul.m@devs.io', role: 'Student', avatarColor: COLORS[2] },
    { id: 'c4', name: 'Maya Patel', email: 'maya.p@designlab.co', role: 'Student', avatarColor: COLORS[3] },
  ];

  const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
  
  const events: EventItem[] = [
    {
      id: 'e1', title: 'AI & Next.js Masterclass 2026', category: 'Tech Conference',
      description: 'Comprehensive hands-on workshop building AI-powered web applications using Next.js 16 and Tailwind CSS.',
      status: 'selling', date: addDays(5), location: 'Auditorium A & Virtual Stream', price: 49, capacity: 100, bookedSeats: 82,
      organizerId: 'c2', createdAt: addDays(-10),
      bookings: [
        { id: uid(), customerId: 'c1', ticketsCount: 2, totalPrice: 98, bookedAt: ago(120), status: 'confirmed' },
        { id: uid(), customerId: 'c3', ticketsCount: 1, totalPrice: 49, bookedAt: ago(300), status: 'confirmed' },
      ],
      reviews: [{ id: uid(), authorId: 'c1', text: 'Super excited for the live demonstration!', rating: 5, at: ago(100) }],
    },
    {
      id: 'e2', title: 'Cyberpunk World Premiere Movie', category: 'Movie',
      description: 'Exclusive early screening of the futuristic sci-fi action thriller with director Q&A session.',
      status: 'sold-out', date: addDays(2), location: 'Grand Cinema Hall 1', price: 25, capacity: 60, bookedSeats: 60,
      organizerId: 'c2', createdAt: addDays(-15),
      bookings: [
        { id: uid(), customerId: 'c4', ticketsCount: 3, totalPrice: 75, bookedAt: ago(400), status: 'confirmed' }
      ],
      reviews: [],
    },
    {
      id: 'e3', title: 'Indie Rock Live Concert', category: 'Concert',
      description: 'Night of high-energy music performance featuring local bands and surprise guest appearances.',
      status: 'selling', date: addDays(12), location: 'Open Air Arena Stage B', price: 35, capacity: 200, bookedSeats: 110,
      organizerId: 'c1', createdAt: addDays(-8),
      bookings: [], reviews: [],
    },
    {
      id: 'e4', title: 'UI/UX Design Systems Workshop', category: 'Workshop',
      description: 'Learn step-by-step methods to design scalable tokenized component libraries in Figma.',
      status: 'upcoming', date: addDays(20), location: 'Design Studio Room 304', price: 15, capacity: 40, bookedSeats: 5,
      organizerId: 'c4', createdAt: addDays(-2),
      bookings: [], reviews: [],
    },
  ];

  const log: LogEntry[] = [
    { id: uid(), text: 'Alex Rivera purchased 2 tickets for "AI & Next.js Masterclass 2026"', at: ago(120) },
    { id: uid(), text: 'Sarah Chen created new event "Cyberpunk World Premiere Movie"', at: ago(60 * 24 * 3) },
  ];

  return { customers, events, log, settings: { workspace: 'Campus Ticket Hub', currentUserId: 'c1' } };
}

const emptyEventForm = {
  title: '', category: 'Tech Conference' as Category, description: '', status: 'selling' as EventStatus,
  date: '', location: '', price: '0', capacity: '50', organizerId: ''
};

/* ------------------------------------------------------------------ */
/* Small Components                                                     */
/* ------------------------------------------------------------------ */
function Avatar({ c, size = 'w-7 h-7 text-[11px]' }: { c?: Customer; size?: string }) {
  if (!c) return <span className={`${size} rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold`}>?</span>;
  return <span title={c.name} className={`${size} ${c.avatarColor} rounded-full text-white flex items-center justify-center font-bold ring-2 ring-slate-900`}>{c.name.slice(0, 1).toUpperCase()}</span>;
}

function StatusBadge({ status }: { status: EventStatus }) {
  const m = EVENT_META[status];
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${m.badge}`}>{m.label}</span>;
}

function ProgressBar({ value, color = 'bg-indigo-500' }: { value: number; color?: string }) {
  return <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

/* ------------------------------------------------------------------ */
/* Main Dashboard Page                                                  */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ workspace: 'Campus Ticket Hub', currentUserId: '' });

  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popular'>('date');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', role: '' });
  const [cal, setCal] = useState({ y: 2026, m: 10 });

  useEffect(() => {
    const n = new Date();
    setCal({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  /* ---- Persistence ---- */
  useEffect(() => {
    const load = (s: ReturnType<typeof buildSeed>) => { setCustomers(s.customers); setEvents(s.events); setLog(s.log); setSettings(s.settings); };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      load(raw ? JSON.parse(raw) : buildSeed());
    } catch { load(buildSeed()); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ customers, events, log, settings })); } catch { /* ignore */ }
  }, [customers, events, log, settings, hydrated]);

  /* ---- Derived Data ---- */
  const customerOf = (id: string) => customers.find(c => c.id === id);
  const me = customerOf(settings.currentUserId);
  const currentEvent = events.find(e => e.id === openId) ?? null;

  const totalRevenue = events.reduce((acc, curr) => acc + (curr.bookedSeats * curr.price), 0);
  const totalTicketsSold = events.reduce((acc, curr) => acc + curr.bookedSeats, 0);
  const sellingEvents = events.filter(e => e.status === 'selling');
  const soldOutEvents = events.filter(e => e.status === 'sold-out');

  const myBookings = events.flatMap(e => 
    e.bookings.filter(b => b.customerId === settings.currentUserId).map(b => ({ ...b, event: e }))
  );

  const listFor = (fixedStatus?: EventStatus) => {
    const q = search.toLowerCase();
    return events
      .filter(e => (!fixedStatus || e.status === fixedStatus) &&
                   (categoryFilter === 'all' || e.category === categoryFilter) &&
                   (!q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'popular') return b.bookedSeats - a.bookedSeats;
        return a.date.localeCompare(b.date);
      });
  };

  /* ---- Actions & Mutations ---- */
  const addLog = (text: string) => setLog(l => [{ id: uid(), text, at: new Date().toISOString() }, ...l].slice(0, 100));
  const who = me?.name ?? 'Someone';
  const updateEvent = (id: string, fn: (e: EventItem) => EventItem) => setEvents(es => es.map(e => (e.id === id ? fn(e) : e)));

  const handleBookTicket = (eItem: EventItem, count: number = 1) => {
    if (eItem.bookedSeats + count > eItem.capacity || !me) return;
    
    const newBooking: Booking = {
      id: uid(),
      customerId: me.id,
      ticketsCount: count,
      totalPrice: eItem.price * count,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    };

    updateEvent(eItem.id, evt => {
      const updatedBooked = evt.bookedSeats + count;
      const isFull = updatedBooked >= evt.capacity;
      return {
        ...evt,
        bookedSeats: updatedBooked,
        status: isFull ? 'sold-out' : evt.status,
        bookings: [newBooking, ...evt.bookings]
      };
    });

    addLog(`${who} booked ${count} ticket(s) for "${eItem.title}"`);
  };

  const deleteEvent = (eItem: EventItem) => {
    if (!window.confirm(`Delete event "${eItem.title}"?`)) return;
    setEvents(es => es.filter(x => x.id !== eItem.id));
    addLog(`${who} deleted event "${eItem.title}"`);
    setOpenId(null); setView('events');
  };

  const addReview = (eItem: EventItem) => {
    if (!reviewText.trim() || !me) return;
    const rev: Review = { id: uid(), authorId: me.id, text: reviewText.trim(), rating: 5, at: new Date().toISOString() };
    updateEvent(eItem.id, x => ({ ...x, reviews: [...x.reviews, rev] }));
    addLog(`${who} left a review on ${eItem.title}`);
    setReviewText('');
  };

  const openCreate = () => {
    setEditingId(null);
    setEventForm({ ...emptyEventForm, organizerId: me?.id ?? customers[0]?.id ?? '' });
    setFormOpen(true);
  };

  const openEdit = (eItem: EventItem) => {
    setEditingId(eItem.id);
    setEventForm({
      title: eItem.title, category: eItem.category, description: eItem.description,
      status: eItem.status, date: eItem.date, location: eItem.location,
      price: String(eItem.price), capacity: String(eItem.capacity), organizerId: eItem.organizerId
    });
    setFormOpen(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date) return;
    
    if (editingId) {
      updateEvent(editingId, evt => ({
        ...evt,
        title: eventForm.title.trim(),
        category: eventForm.category,
        description: eventForm.description,
        status: eventForm.status,
        date: eventForm.date,
        location: eventForm.location,
        price: Number(eventForm.price) || 0,
        capacity: Number(eventForm.capacity) || 50,
        organizerId: eventForm.organizerId
      }));
      addLog(`${who} updated event details for "${eventForm.title.trim()}"`);
    } else {
      const created: EventItem = {
        id: uid(),
        title: eventForm.title.trim(),
        category: eventForm.category,
        description: eventForm.description,
        status: eventForm.status,
        date: eventForm.date,
        location: eventForm.location || 'Main Auditorium',
        price: Number(eventForm.price) || 0,
        capacity: Number(eventForm.capacity) || 50,
        bookedSeats: 0,
        organizerId: eventForm.organizerId || me?.id || '',
        bookings: [],
        reviews: [],
        createdAt: toISO(new Date())
      };
      setEvents(es => [created, ...es]);
      addLog(`${who} created new event "${created.title}"`);
    }
    setFormOpen(false);
  };

  const addCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;
    const c: Customer = {
      id: uid(),
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim() || `${newCustomer.name.toLowerCase().replace(/\s+/g, '')}@ticket.io`,
      role: newCustomer.role.trim() || 'Attendee',
      avatarColor: COLORS[customers.length % COLORS.length]
    };
    setCustomers(cs => [...cs, c]);
    addLog(`${who} registered user ${c.name}`);
    setNewCustomer({ name: '', email: '', role: '' });
  };

  /* ---- Navigation Config ---- */
  const nav: { id: View; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'events', label: 'All Events', icon: <Ticket className="w-4 h-4" />, count: events.length },
    { id: 'selling', label: 'Selling Now', icon: <Sparkles className="w-4 h-4" />, count: sellingEvents.length },
    { id: 'soldout', label: 'Sold Out', icon: <Clock className="w-4 h-4" />, count: soldOutEvents.length },
    { id: 'mybookings', label: 'My Bookings', icon: <CheckCircle2 className="w-4 h-4" />, count: myBookings.length },
    { id: 'calendar', label: 'Schedule', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'customers', label: 'Users & Attendees', icon: <Users className="w-4 h-4" />, count: customers.length },
    { id: 'activity', label: 'Activity Logs', icon: <ActivityIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const go = (v: View) => { setView(v); setSidebarOpen(false); setSearch(''); setOpenId(null); };
  const openEvent = (id: string) => { setOpenId(id); setView('event'); setSidebarOpen(false); };
  const titles: Record<View, string> = {
    dashboard: 'Dashboard', events: 'All Events', selling: 'Available Events', soldout: 'Sold Out Events',
    mybookings: 'My Booked Tickets', calendar: 'Event Schedule', customers: 'Users & Attendees',
    activity: 'Activity Logs', settings: 'Platform Settings', event: currentEvent?.title ?? 'Event Details',
  };
  const activeNav: View = view === 'event' ? 'events' : view;

  const calendarCells = useMemo(() => {
    const first = new Date(cal.y, cal.m, 1);
    const days = new Date(cal.y, cal.m + 1, 0).getDate();
    const cells: (string | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= days; d++) cells.push(toISO(new Date(cal.y, cal.m, d)));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [cal]);

  if (!hydrated) return <div className="min-h-screen bg-slate-950" />;

  const inputCls = 'w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500';

  /* ---- Card Component ---- */
  const EventCard = ({ e }: { e: EventItem }) => {
    const rate = fillRate(e);
    const dl = dueInfo(e.date);
    const isSoldOut = e.bookedSeats >= e.capacity;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
              {e.category}
            </span>
            <span className="text-base font-bold text-emerald-400">
              {e.price === 0 ? 'FREE' : `$${e.price}`}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{e.title}</h3>
            <p className="text-slate-400 text-xs line-clamp-2 mt-1">{e.description}</p>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{e.bookedSeats}/{e.capacity} booked</span>
              <span>{rate}% seats taken</span>
            </div>
            <ProgressBar value={rate} color={isSoldOut ? 'bg-rose-500' : 'bg-indigo-500'} />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1 text-slate-400"><MapPin className="w-3.5 h-3.5" /> {e.location}</span>
            <span className={`flex items-center gap-1 font-medium ${dl.tone}`}>{dl.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
          <button onClick={() => openEvent(e.id)} className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-medium border border-slate-800 transition">
            View Details
          </button>
          <button 
            disabled={isSoldOut} 
            onClick={() => handleBookTicket(e, 1)} 
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${isSoldOut ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
            {isSoldOut ? 'Sold Out' : 'Book Ticket'}
          </button>
        </div>
      </div>
    );
  };

  const eventGrid = (list: EventItem[]) => list.length === 0
    ? <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">No events found matching criteria.</div>
    : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{list.map(e => <EventCard key={e.id} e={e} />)}</div>;

  const toolbar = (showFilters: boolean) => (
    <div className="flex flex-col lg:flex-row gap-3 justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event or venue..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {showFilters && ['all', 'Tech Conference', 'Movie', 'Concert', 'Workshop'].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none">
          <option value="date">Sort: Date</option>
          <option value="popular">Sort: Most Popular</option>
          <option value="price">Sort: Ticket Price</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-40 w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-7 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">T</div>
              <div><h2 className="font-bold text-white text-base leading-none">TicketHub</h2><span className="text-xs text-slate-400">{settings.workspace}</span></div>
            </div>
            <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <nav className="space-y-1">
            {nav.map(n => (
              <button key={n.id} onClick={() => go(n.id)} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${activeNav === n.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <span className="flex items-center gap-3">{n.icon}{n.label}</span>
                {n.count !== undefined && <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeNav === n.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{n.count}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <Avatar c={me} size="w-8 h-8 text-xs" />
          <div className="min-w-0"><p className="text-xs font-semibold text-white truncate">{me?.name ?? 'No user'}</p><p className="text-[10px] text-slate-400">{me?.role ?? 'Attendee'}</p></div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-5 md:p-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 bg-slate-900 border border-slate-800 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              {view === 'event' && <button onClick={() => go('events')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-1"><ArrowLeft className="w-3 h-3" /> All events</button>}
              <h1 className="text-2xl font-bold text-white">{titles[view]}</h1>
              <p className="text-slate-400 text-xs">Manage events, bookings, and student registrations</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        </div>

        {/* ===== DASHBOARD ===== */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: 'Total Revenue', v: `$${totalRevenue.toLocaleString()}`, c: 'text-emerald-400' },
                { l: 'Tickets Sold', v: totalTicketsSold, c: 'text-indigo-400' },
                { l: 'Active Events', v: sellingEvents.length, c: 'text-sky-400' },
                { l: 'Registered Users', v: customers.length, c: 'text-amber-400' },
              ].map(s => (
                <div key={s.l} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400 mb-2">{s.l}</p>
                  <p className={`text-3xl font-bold ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Popular Events & Seat Occupancy</h3>
                  <div className="space-y-4">
                    {events.slice(0, 4).map(e => {
                      const rate = fillRate(e);
                      return (
                        <div key={e.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white font-medium">{e.title}</span>
                            <span className="text-slate-400">{e.bookedSeats}/{e.capacity} ({rate}%)</span>
                          </div>
                          <ProgressBar value={rate} color={rate >= 100 ? 'bg-rose-500' : 'bg-indigo-500'} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-white mb-3">Upcoming Events Schedule</h3>
                  <div className="space-y-2">
                    {events.slice(0, 3).map(e => {
                      const dl = dueInfo(e.date);
                      return (
                        <button key={e.id} onClick={() => openEvent(e.id)} className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-left transition">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{e.title}</p>
                            <p className="text-[11px] text-slate-400">{e.location}</p>
                          </div>
                          <span className={`text-[11px] font-medium ${dl.tone}`}>{dl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-white">Live Activity Stream</h3>
                  <button onClick={() => go('activity')} className="text-xs text-indigo-400">View all</button>
                </div>
                <div className="space-y-3">
                  {log.slice(0, 6).map(l => (
                    <div key={l.id} className="flex gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-300">{l.text}</p>
                        <p className="text-[10px] text-slate-500">{timeAgo(l.at)}</p>
                      </div>
                    </div>
                  ))}
                  {log.length === 0 && <p className="text-xs text-slate-500">No recent activity.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== EVENT LIST VIEWS ===== */}
        {view === 'events' && <div className="space-y-5">{toolbar(true)}{eventGrid(listFor())}</div>}
        {view === 'selling' && <div className="space-y-5">{toolbar(false)}{eventGrid(listFor('selling'))}</div>}
        {view === 'soldout' && <div className="space-y-5">{toolbar(false)}{eventGrid(listFor('sold-out'))}</div>}

        {/* ===== SINGLE EVENT DETAIL ===== */}
        {view === 'event' && currentEvent && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
                    {currentEvent.category}
                  </span>
                  <StatusBadge status={currentEvent.status} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(currentEvent)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => deleteEvent(currentEvent)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 hover:bg-rose-500/20"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>

              <p className="text-sm text-slate-300">{currentEvent.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div><p className="text-slate-400 mb-1">Ticket Price</p><p className="text-emerald-400 font-bold text-base">{currentEvent.price === 0 ? 'FREE' : `$${currentEvent.price}`}</p></div>
                <div><p className="text-slate-400 mb-1">Date & Schedule</p><p className="text-white font-semibold">{currentEvent.date}</p></div>
                <div><p className="text-slate-400 mb-1">Venue Location</p><p className="text-white font-semibold">{currentEvent.location}</p></div>
                <div><p className="text-slate-400 mb-1">Occupancy</p><p className="text-white font-semibold">{currentEvent.bookedSeats} / {currentEvent.capacity} seats</p></div>
              </div>

              {/* Instant Ticket Purchase Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <div>
                  <h4 className="text-xs font-semibold text-white">Book Tickets for this Event</h4>
                  <p className="text-[11px] text-slate-400">Instant seat reservation with immediate confirmation</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" max="5" value={ticketQuantity} onChange={e => setTicketQuantity(Math.max(1, Number(e.target.value)))} className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center text-white" />
                  <button 
                    disabled={currentEvent.bookedSeats >= currentEvent.capacity}
                    onClick={() => handleBookTicket(currentEvent, ticketQuantity)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition">
                    {currentEvent.bookedSeats >= currentEvent.capacity ? 'Sold Out' : `Confirm (${ticketQuantity} x $${currentEvent.price})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Event Reviews / Discussion */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-400" /> Event Reviews ({currentEvent.reviews.length})</h3>
              <div className="space-y-3">
                {currentEvent.reviews.map(r => (
                  <div key={r.id} className="flex gap-3">
                    <Avatar c={customerOf(r.authorId)} size="w-8 h-8 text-xs" />
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex-1">
                      <p className="text-[11px] text-slate-400"><span className="font-semibold text-slate-200">{customerOf(r.authorId)?.name ?? 'Attendee'}</span> · {timeAgo(r.at)}</p>
                      <p className="text-xs text-slate-200 mt-1">{r.text}</p>
                    </div>
                  </div>
                ))}
                {currentEvent.reviews.length === 0 && <p className="text-xs text-slate-500">No reviews yet.</p>}
              </div>
              <div className="flex gap-2">
                <input value={reviewText} onChange={e => setReviewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReview(currentEvent)} placeholder="Leave a review or feedback..." className={inputCls} />
                <button onClick={() => addReview(currentEvent)} className="px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold">Post</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MY BOOKINGS ===== */}
        {view === 'mybookings' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
              {myBookings.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">You have no ticket bookings yet.</p>
              ) : (
                myBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{b.event.title}</p>
                        <p className="text-[11px] text-slate-400">{b.event.location} · {b.event.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400">${b.totalPrice} ({b.ticketsCount} tickets)</span>
                      <p className="text-[10px] text-slate-500">{timeAgo(b.bookedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== SCHEDULE / CALENDAR ===== */}
        {view === 'calendar' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{new Date(cal.y, cal.m, 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCal(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 })} className="p-2 bg-slate-950 border border-slate-800 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => { const n = new Date(); setCal({ y: n.getFullYear(), m: n.getMonth() }); }} className="px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg">Today</button>
                <button onClick={() => setCal(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 })} className="p-2 bg-slate-950 border border-slate-800 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="bg-slate-950 text-center text-[11px] text-slate-400 py-2">{d}</div>)}
              {calendarCells.map((date, i) => {
                if (!date) return <div key={i} className="bg-slate-900/40 min-h-[84px]" />;
                const items = events.filter(e => e.date === date);
                const isToday = date === toISO(new Date());
                return (
                  <div key={date} className="bg-slate-900 min-h-[84px] p-1.5 space-y-1">
                    <span className={`text-[11px] inline-flex w-5 h-5 items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{Number(date.slice(8))}</span>
                    {items.slice(0, 2).map(it => <button key={it.id} onClick={() => openEvent(it.id)} className="block w-full truncate text-left text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{it.title}</button>)}
                    {items.length > 2 && <p className="text-[10px] text-slate-500 px-1">+{items.length - 2} more</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== CUSTOMERS / USERS ===== */}
        {view === 'customers' && (
          <div className="space-y-5">
            <form onSubmit={addCustomer} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
              <input value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="Full name" className={inputCls} />
              <input value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="Email address" className={inputCls} />
              <input value={newCustomer.role} onChange={e => setNewCustomer({ ...newCustomer, role: e.target.value })} placeholder="Role (e.g. Student)" className={inputCls} />
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold whitespace-nowrap">Add User</button>
            </form>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <Avatar c={c} size="w-8 h-8 text-xs" />
                        <span className="font-semibold text-white text-xs">{c.name}</span>
                      </td>
                      <td className="p-4 text-xs"><span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{c.role}</span></td>
                      <td className="p-4 text-xs text-slate-400">{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ACTIVITY FEED ===== */}
        {view === 'activity' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-2xl">
            {log.length === 0 && <p className="text-xs text-slate-500">No activity logged.</p>}
            {log.map(l => (
              <div key={l.id} className="flex gap-3 border-b border-slate-800/60 pb-3 last:border-0">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-200">{l.text}</p>
                  <p className="text-[11px] text-slate-500">{timeAgo(l.at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {view === 'settings' && (
          <div className="max-w-xl space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Platform Name</label>
                <input value={settings.workspace} onChange={e => setSettings({ ...settings, workspace: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Active Account</label>
                <select value={settings.currentUserId} onChange={e => setSettings({ ...settings, currentUserId: e.target.value })} className={inputCls}>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== CREATE / EDIT EVENT MODAL ===== */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Event Title *</label>
                <input required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value as Category })} className={inputCls}>
                    <option value="Tech Conference">Tech Conference</option>
                    <option value="Movie">Movie</option>
                    <option value="Concert">Concert</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Theater">Theater</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Date *</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                  <input type="number" value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Capacity Seats</label>
                  <input type="number" value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Location / Venue</label>
                <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Auditorium A / Cinema Hall 1" className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">{editingId ? 'Save Changes' : 'Publish Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}