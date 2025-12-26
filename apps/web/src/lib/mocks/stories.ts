/**
 * Stories Mock Data
 *
 * Mock data for community stories and the story submission system.
 */

import type { StorySubmission, StoryTemplate } from "@/types/story";
import { StoryType, SubmissionStatus } from "@/types/story";
import type { AdminQueueResponse } from "@/types/admin";

export const MOCK_STORIES: StorySubmission[] = [
  {
    id: "101",
    slug: "my-grandmothers-cachupa",
    title: "My grandmother's cachupa",
    content:
      "Every Sunday morning, the smell would wake us up. It wasn't just food; it was a ritual. The corn had to be prepared days in advance, soaking in water until it was just right. My avó would wake before dawn, and by the time we children stumbled into the kitchen, the pot was already simmering with beans, corn, and whatever meat we could afford that week.\n\nThe secret, she always said, was patience. You can't rush cachupa. It needs time to let all the flavors come together, just like a good family needs time to grow strong.",
    author: "Maria Silva",
    authorId: "u1",
    type: StoryType.QUICK,
    status: SubmissionStatus.APPROVED,
    submittedAt: "2 days ago",
    location: "Nova Sintra",
  },
  {
    id: "102",
    slug: "leaving-in-1975",
    title: "Leaving in 1975",
    content:
      "The ship was crowded, but our hearts were heavy with hope and sadness. I remember standing at the rail, watching Brava disappear into the morning mist. My mother held my hand so tight it almost hurt. We didn't know if we would ever see our island again.\n\nBoston was cold, colder than anything I had ever imagined. But we found our people there - other Bravans who had made the journey before us. They helped us find our way in this new world while never letting us forget where we came from.",
    author: "João Mendes",
    authorId: "u2",
    type: StoryType.FULL,
    status: SubmissionStatus.PENDING,
    submittedAt: "1 week ago",
    location: "Furna",
    templateType: "migration",
  },
  {
    id: "103",
    slug: "the-festival-of-sao-joao",
    title: "The Festival of São João",
    content:
      "The drums never stopped. For three days, the sound of the 'Tambor' echoed through the valley. I was only 10, but I remember the colorful flags strung between the houses, the smell of grilled fish and corn, and the way the whole community came together.\n\nMy father carried me on his shoulders so I could see the procession. The statue of São João passed by, carried by the strongest men in the village. Everyone was singing, and for those three days, all the hardships of daily life seemed to disappear.",
    author: "Ana Gomes",
    authorId: "u3",
    type: StoryType.FULL,
    status: SubmissionStatus.APPROVED,
    submittedAt: "3 weeks ago",
    location: "Nossa Senhora do Monte",
    templateType: "traditions",
  },
  {
    id: "104",
    slug: "fishing-at-dawn",
    title: "Fishing at dawn",
    content:
      "The Atlantic is cold before the sun rises. My father taught me how to read the waves, to know when the fish would come close to shore. We would sit in silence, waiting, watching the sky turn from black to purple to gold.\n\nThose mornings taught me patience and respect for the sea. Even now, living thousands of miles away, I still wake up before dawn sometimes, remembering the sound of the waves.",
    author: "Carlos Baptista",
    authorId: "u4",
    type: StoryType.QUICK,
    status: SubmissionStatus.APPROVED,
    submittedAt: "1 month ago",
    location: "Fajã d'Água",
  },
  {
    id: "105",
    slug: "view-from-the-road-to-furna",
    title: "View from the road to Furna",
    content:
      "Stopped the car just to take this picture. The clouds were so low today.",
    author: "Pedro Nunes",
    authorId: "u5",
    type: StoryType.PHOTO,
    status: SubmissionStatus.PENDING,
    submittedAt: "3 hours ago",
    location: "Furna Road",
    imageUrl: "https://picsum.photos/id/49/800/600",
  },
];

export const STORY_TEMPLATES: Record<
  StoryTemplate,
  { name: string; description: string; prompts: string[] }
> = {
  narrative: {
    name: "Free Narrative",
    description: "Tell your story in your own words",
    prompts: [
      "What moment do you want to share?",
      "What makes this memory special to you?",
    ],
  },
  recipe: {
    name: "Food & Recipes",
    description: "Share a traditional recipe and its story",
    prompts: [
      "What dish do you want to share?",
      "Who taught you this recipe?",
      "What makes this dish special in your family?",
      "Share the recipe steps",
    ],
  },
  migration: {
    name: "Migration Journey",
    description: "Share your or your family's emigration story",
    prompts: [
      "When did you or your family leave Brava?",
      "Where did you go?",
      "What do you remember about leaving?",
      "How did you adapt to your new home?",
    ],
  },
  childhood: {
    name: "Childhood Memories",
    description: "Remember growing up on Brava",
    prompts: [
      "Where did you grow up on Brava?",
      "Who were the important people in your childhood?",
      "What games did you play?",
      "What sounds remind you of home?",
    ],
  },
  family: {
    name: "Family History",
    description: "Share your family's Brava roots",
    prompts: [
      "How long has your family been on Brava?",
      "What did your ancestors do?",
      "What family traditions have been passed down?",
      "What stories were told about your family?",
    ],
  },
  traditions: {
    name: "Traditions & Customs",
    description: "Share cultural practices you know",
    prompts: [
      "What tradition do you want to share?",
      "How is it practiced?",
      "What does it mean to the community?",
      "How has it changed over time?",
    ],
  },
};

// Mock API functions
export const mockStoriesApi = {
  getStories: async (status?: SubmissionStatus): Promise<StorySubmission[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (status) {
      return MOCK_STORIES.filter((s) => s.status === status);
    }
    return MOCK_STORIES.filter((s) => s.status === SubmissionStatus.APPROVED);
  },

  getStoryById: async (id: string): Promise<StorySubmission | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_STORIES.find((s) => s.id === id) || null;
  },

  getStoryBySlug: async (slug: string): Promise<StorySubmission | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_STORIES.find((s) => s.slug === slug) || null;
  },

  submitStory: async (
    story: Omit<StorySubmission, "id" | "slug" | "status" | "submittedAt">
  ): Promise<StorySubmission> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Generate slug from title
    const slug = story.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return {
      ...story,
      id: `new-${Date.now()}`,
      slug,
      status: SubmissionStatus.PENDING,
      submittedAt: "Just now",
    };
  },

  getStoriesForAdmin: async (
    status?: SubmissionStatus | "ALL"
  ): Promise<AdminQueueResponse<StorySubmission>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const filtered =
      status && status !== "ALL"
        ? MOCK_STORIES.filter((s) => s.status === status)
        : MOCK_STORIES;
    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
  },

  updateStoryStatus: async (
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<StorySubmission> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const story = MOCK_STORIES.find((s) => s.id === id);
    if (!story) throw new Error("Story not found");
    return {
      ...story,
      status,
      adminNotes: notes,
      reviewedBy: "admin",
      reviewedAt: new Date().toISOString(),
    };
  },
};
