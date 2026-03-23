"use client";

import { Users, Sparkles, Plane, Music, UtensilsCrossed } from "lucide-react";
import type { StoryTemplate } from "@/types/story";

interface TemplateChipsProps {
  selectedTemplate: StoryTemplate | null;
  onSelect: (template: StoryTemplate | null) => void;
}

interface TemplateConfig {
  type: StoryTemplate;
  title: string;
  shortTitle: string;
  icon: typeof Users;
  iconClass: string;
  starterPrompt: string;
}

export const GUIDED_TEMPLATES: Record<StoryTemplate, TemplateConfig> = {
  FAMILY: {
    type: "FAMILY",
    title: "Family History",
    shortTitle: "Family",
    icon: Users,
    iconClass: "text-bougainvillea-pink",
    starterPrompt: `## My Family's Roots
When did your family first come to Brava? What stories were passed down?

## Generations
Who are the elders you remember? What did they teach you?

## Legacy
What traditions does your family keep alive today?`,
  },
  CHILDHOOD: {
    type: "CHILDHOOD",
    title: "Childhood Memories",
    shortTitle: "Childhood",
    icon: Sparkles,
    iconClass: "text-sobrado-ochre",
    starterPrompt: `## Where I Played
Describe your favorite places as a child...

## The People
Who were your friends and neighbors?

## Special Moments
What events do you remember most vividly?`,
  },
  DIASPORA: {
    type: "DIASPORA",
    title: "Diaspora Journey",
    shortTitle: "Diaspora",
    icon: Plane,
    iconClass: "text-ocean-blue",
    starterPrompt: `## Leaving Brava
When did you leave? What do you remember about the departure?

## Finding Home Abroad
How did you adapt? What was hardest?

## Staying Connected
How do you maintain your connection to Brava today?`,
  },
  TRADITIONS: {
    type: "TRADITIONS",
    title: "Cultural Traditions",
    shortTitle: "Traditions",
    icon: Music,
    iconClass: "text-valley-green",
    starterPrompt: `## The Tradition
What practice or celebration are you sharing?

## How It's Done
Describe the steps, sounds, and sensations...

## Why It Matters
What does this tradition mean to your community?`,
  },
  FOOD: {
    type: "FOOD",
    title: "Food & Recipes",
    shortTitle: "Food",
    icon: UtensilsCrossed,
    iconClass: "text-sobrado-ochre",
    starterPrompt: `## The Dish
What is this dish called? When is it traditionally eaten?

## Ingredients & Method
- List ingredients here
- Describe preparation steps

## The Memory
Who taught you this recipe? What memories does the smell bring back?`,
  },
  // Legacy types - kept for backward compatibility
  NARRATIVE: {
    type: "NARRATIVE",
    title: "General Narrative",
    shortTitle: "Narrative",
    icon: Users,
    iconClass: "text-ocean-blue",
    starterPrompt: `## The Beginning
Where does this story start? (e.g., Nova Sintra, 1980...)

## The Event
Describe what happened in detail. Who was there? What did you see, hear, and smell?

## The Impact
Why is this memory important to you? How does it make you feel today?`,
  },
  RECIPE: {
    type: "RECIPE",
    title: "Family Recipe",
    shortTitle: "Recipe",
    icon: UtensilsCrossed,
    iconClass: "text-sobrado-ochre",
    starterPrompt: `## The Dish
What is the name of this dish? When is it usually eaten?

## Ingredients
- Item 1
- Item 2

## The Secret
Is there a special technique or ingredient that makes this specific to your family?

## The Story
Who taught you to cook this? What memories does this smell bring back?`,
  },
  MIGRATION: {
    type: "MIGRATION",
    title: "Migration Journey",
    shortTitle: "Migration",
    icon: Plane,
    iconClass: "text-ocean-blue",
    starterPrompt: `## Leaving Brava
When did you leave? What do you remember about the departure (the boat, the plane, the goodbyes)?

## The Journey
How was the trip? What were your first impressions of the new country?

## Adaptation
What was the hardest thing to get used to? What did you miss the most?

## Looking Back
How do you stay connected to Brava today?`,
  },
};

// Primary templates shown as chips (the 5 main categories)
const PRIMARY_TEMPLATES: StoryTemplate[] = [
  "FAMILY",
  "CHILDHOOD",
  "DIASPORA",
  "TRADITIONS",
  "FOOD",
];

export function TemplateChips({
  selectedTemplate,
  onSelect,
}: TemplateChipsProps) {
  const handleChipClick = (template: StoryTemplate) => {
    if (selectedTemplate === template) {
      // Deselect if already selected
      onSelect(null);
    } else {
      onSelect(template);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-muted mb-3 text-sm">
        Need a starting point? <span className="text-muted/60">(optional)</span>
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Story template selection"
      >
        {PRIMARY_TEMPLATES.map((templateKey) => {
          const template = GUIDED_TEMPLATES[templateKey];
          const Icon = template.icon;
          const isSelected = selectedTemplate === templateKey;

          return (
            <button
              key={templateKey}
              type="button"
              onClick={() => handleChipClick(templateKey)}
              aria-pressed={isSelected}
              className={`focus:ring-ocean-blue inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                isSelected
                  ? "bg-ocean-blue shadow-subtle text-white"
                  : "bg-surface-alt text-muted hover:bg-surface-alt/80 hover:text-body"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isSelected ? "text-white" : template.iconClass}`}
              />
              <span>{template.shortTitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
