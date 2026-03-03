"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoryCard } from "@/components/stories/story-card";
import { StoryDetailContent } from "@/components/stories/story-detail-content";
import { StoryType, SubmissionStatus } from "@/types/story";
import type { StorySubmission } from "@/types/story";

const mockStories: StorySubmission[] = [
  {
    id: "story-1",
    slug: "grandmothers-cachupa",
    title: "My Grandmother's Cachupa Rica",
    content:
      "Every Sunday morning, the smell of cachupa rica would fill our house in Nova Sintra. My avó Maria would wake before dawn to start preparing the traditional stew. The corn had been soaking since the night before, and she would add hominy, beans, sweet potato, green banana, and whatever fish the men had caught that morning. She always said the secret was patience — low heat, long cooking, and love. Now living in Providence, I make cachupa every Sunday to keep her memory alive.",
    author: "Ana Gomes",
    authorId: "user-1",
    type: StoryType.GUIDED,
    status: SubmissionStatus.PUBLISHED,
    submittedAt: "2024-06-15T10:30:00Z",
    location: "Nova Sintra, Brava",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
    templateType: "FOOD",
  },
  {
    id: "story-2",
    slug: "leaving-brava-1985",
    title: "Leaving Brava: A Journey to New England",
    content:
      "In 1985, I left Brava Island with nothing but a small suitcase and my mother's blessing. The boat to São Vicente took all night, and from there I flew to Boston. My uncle Manel was waiting at the airport with a winter coat — I had never seen snow before. Those first months in New Bedford were the hardest of my life, but the Cape Verdean community there became my second family.",
    author: "Manuel Tavares",
    authorId: "user-2",
    type: StoryType.FULL,
    status: SubmissionStatus.PUBLISHED,
    submittedAt: "2024-05-20T14:00:00Z",
    location: "Fajã d'Água, Brava",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    templateType: "MIGRATION",
  },
  {
    id: "story-3",
    slug: "tabanka-festival-memories",
    title: "Tabanka Festival Memories",
    content:
      "The drums would start at dawn during Tabanka. Children would run through the streets of Cachaço following the procession, the women in their colorful panos singing songs that their grandmothers taught them. It was the one time of year when the whole village came together.",
    author: "Carla Mendes",
    authorId: "user-3",
    type: StoryType.QUICK,
    status: SubmissionStatus.APPROVED,
    submittedAt: "2024-04-10T09:15:00Z",
    location: "Cachaço, Brava",
    templateType: "TRADITIONS",
  },
  {
    id: "story-4",
    slug: "fishing-with-father",
    title: "Fishing with My Father at Furna",
    content:
      "Papa would wake me at 4am to go fishing at Furna. The walk down to the port in the dark, guided only by starlight and the sound of the ocean. He taught me to read the waves, to know when the fish were running. Those mornings are the happiest memories of my childhood on Brava.",
    author: "Pedro Silva",
    authorId: "user-4",
    type: StoryType.GUIDED,
    status: SubmissionStatus.PUBLISHED,
    submittedAt: "2024-03-05T08:00:00Z",
    location: "Furna, Brava",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    templateType: "CHILDHOOD",
  },
];

export default function StoryCardsDevPage() {
  const [selectedStory, setSelectedStory] = useState<StorySubmission | null>(
    null
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Story Cards</h1>
      <p className="text-muted mb-8">
        StoryCard grid display with StoryDetailContent for community narrative
        previews.
      </p>

      <section className="mb-12">
        <h2 className="text-body mb-6 text-lg font-semibold">
          Story Card Grid
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="cursor-pointer"
            >
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-body mb-6 text-lg font-semibold">
          Story Detail Content
          {selectedStory && (
            <span className="text-muted ml-2 text-sm font-normal">
              — showing &ldquo;{selectedStory.title}&rdquo;
            </span>
          )}
        </h2>
        <StoryDetailContent
          story={selectedStory ?? mockStories[0]}
          relatedStories={mockStories.slice(1, 3)}
        />
      </section>
    </div>
  );
}
