"use client";

import {
  Users,
  Sparkles,
  Plane,
  Music,
  UtensilsCrossed,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { listStagger, listItem } from "@/lib/animation/variants";
import type { StoryTemplate } from "@/types/story";

interface TemplateSelectorProps {
  onSelect: (template: StoryTemplate) => void;
  onBack: () => void;
}

interface TemplateConfig {
  type: StoryTemplate;
  title: string;
  description: string;
  icon: typeof Users;
  iconBgClass: string;
  iconClass: string;
  estimatedTime: string;
  starterPrompt: string;
}

const GUIDED_TEMPLATES: Record<string, TemplateConfig> = {
  FAMILY: {
    type: "FAMILY",
    title: "Family History",
    description: "Share your family's connection to Brava across generations.",
    icon: Users,
    iconBgClass: "bg-bougainvillea-pink/10",
    iconClass: "text-bougainvillea-pink",
    estimatedTime: "~15 minutes",
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
    description: "Recall the sights, sounds, and adventures of growing up.",
    icon: Sparkles,
    iconBgClass: "bg-sobrado-ochre/10",
    iconClass: "text-sobrado-ochre",
    estimatedTime: "~15 minutes",
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
    description: "Tell the story of leaving, adapting, and staying connected.",
    icon: Plane,
    iconBgClass: "bg-ocean-blue/10",
    iconClass: "text-ocean-blue",
    estimatedTime: "~20 minutes",
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
    description:
      "Document the customs, celebrations, and practices you cherish.",
    icon: Music,
    iconBgClass: "bg-valley-green/10",
    iconClass: "text-valley-green",
    estimatedTime: "~15 minutes",
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
    description: "Share the flavors and recipes that taste like home.",
    icon: UtensilsCrossed,
    iconBgClass: "bg-sobrado-ochre/10",
    iconClass: "text-sobrado-ochre",
    estimatedTime: "~15 minutes",
    starterPrompt: `## The Dish
What is this dish called? When is it traditionally eaten?

## Ingredients & Method
- List ingredients here
- Describe preparation steps

## The Memory
Who taught you this recipe? What memories does the smell bring back?`,
  },
};

export { GUIDED_TEMPLATES };

export function TemplateSelector({ onSelect, onBack }: TemplateSelectorProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="text-muted hover:text-body mb-6 flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to story types
      </button>

      <h2 className="text-body mb-2 text-2xl font-bold">
        Choose Your Template
      </h2>
      <p className="text-muted mb-8">
        Select a template that best fits the story you want to tell. Each
        provides structured prompts to guide your writing.
      </p>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={listStagger}
        initial="hidden"
        animate="show"
      >
        {Object.values(GUIDED_TEMPLATES).map((template) => {
          const Icon = template.icon;
          return (
            <motion.button
              key={template.type}
              onClick={() => onSelect(template.type)}
              className="border-hairline bg-canvas rounded-card group hover:border-ocean-blue hover:shadow-lift relative flex flex-col border p-6 text-left"
              variants={listItem}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className={`rounded-card mb-4 inline-flex p-3 ${template.iconBgClass}`}
              >
                <Icon className={`h-6 w-6 ${template.iconClass}`} />
              </div>
              <h3 className="text-body mb-2 font-semibold">{template.title}</h3>
              <p className="text-muted mb-4 flex-1 text-sm">
                {template.description}
              </p>
              <span className="text-muted text-xs">
                {template.estimatedTime}
              </span>
              <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <Check className="text-ocean-blue h-5 w-5" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
