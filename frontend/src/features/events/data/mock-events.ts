import type { Event } from "../types";

/**
 * Mock events data for development
 * TODO: Replace with API integration when backend is ready
 */
export const EVENTS_DATA: Event[] = [
  {
    id: "1",
    title: "Festa de São João Baptista",
    date: "2024-06-24",
    time: "All Day",
    location: "Vila Nova Sintra",
    description:
      "The biggest festival of the year! Processions, horse racing, drumming (Tamboreiros), and the traditional Colá San Jon.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nova_Sintra_-_Pra%C3%A7a_Eug%C3%A9nio_Tavares_03.jpg",
    type: "Festival",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Nossa Senhora do Monte",
    date: "2024-08-15",
    time: "10:00 AM",
    location: "Nossa Senhora do Monte",
    description:
      "A major religious pilgrimage and celebration featuring mass, music, and community feasting.",
    image:
      "https://images.unsplash.com/photo-1542345754-52d373e21c32?q=80&w=2000&auto=format&fit=crop",
    type: "Religious",
  },
  {
    id: "3",
    title: "Morna Night at Kaza d'Morno",
    date: "2024-07-15",
    time: "8:00 PM",
    location: "Furna",
    description:
      "An intimate evening of acoustic Morna and Coladeira featuring local artists.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    type: "Music",
  },
  {
    id: "4",
    title: "Eugénio Tavares Poetry Reading",
    date: "2024-10-18",
    time: "6:00 PM",
    location: "Museum Eugénio Tavares, Nova Sintra",
    description:
      "Celebrating the birthday of Brava's most famous poet with readings and discussions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Eug%C3%A9nio_Tavares.jpg",
    type: "Community",
  },
  {
    id: "5",
    title: "Fajã d'Agua Beach Cleanup",
    date: "2024-09-21",
    time: "9:00 AM",
    location: "Fajã d'Agua Bay",
    description:
      "Community volunteer event to keep our beautiful natural pools clean. Lunch provided.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faj%C3%A3_de_%C3%81gua_02.jpg/1280px-Faj%C3%A3_de_%C3%81gua_02.jpg",
    type: "Community",
  },
  {
    id: "6",
    title: "Brava Day USA 2024",
    date: "2024-07-05",
    time: "12:00 PM",
    location: "Pawtucket, RI (USA)",
    description:
      "The largest annual gathering of the Brava diaspora in the United States. Music, traditional food, and reconnecting with roots.",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop",
    type: "Diaspora",
  },
];
