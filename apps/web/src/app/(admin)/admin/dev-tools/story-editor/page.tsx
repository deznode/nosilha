"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoryEditor } from "@/components/story-submission/story-editor";
import { TemplateChips } from "@/components/story-submission/template-chips";
import { StoryPromptsPanel } from "@/components/story-submission/story-prompts-panel";
import { PhotoUpload } from "@/components/story-submission/photo-upload";
import type { StoryTemplate } from "@/types/story";

export default function StoryEditorDevPage() {
  const [title, setTitle] = useState("My Grandmother's Cachupa Recipe");
  const [content, setContent] = useState(
    "Every Sunday morning, the smell of cachupa rica would fill our house in Nova Sintra. My avó Maria would wake before dawn to start preparing..."
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<StoryTemplate | null>("FOOD");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Story Editor</h1>
      <p className="text-muted mb-8">
        StoryEditor with TemplateChips, StoryPromptsPanel, and PhotoUpload for
        community stories.
      </p>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">Template Chips</h2>
        <TemplateChips
          selectedTemplate={selectedTemplate}
          onSelect={setSelectedTemplate}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-10">
            <h2 className="text-body mb-4 text-lg font-semibold">
              Story Editor
            </h2>
            <div className="mb-4">
              <label className="text-body mb-1 block text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-hairline bg-surface rounded-button w-full border px-3 py-2"
              />
            </div>
            <StoryEditor
              title={title}
              content={content}
              onContentChange={setContent}
              author="Maria Gomes"
              location="Nova Sintra, Brava"
              templateType={selectedTemplate ?? undefined}
            />
          </section>

          <section>
            <h2 className="text-body mb-4 text-lg font-semibold">
              Photo Upload
            </h2>
            <PhotoUpload imageUrl={imageUrl} onImageChange={setImageUrl} />
          </section>
        </div>

        <div>
          {selectedTemplate && (
            <section>
              <h2 className="text-body mb-4 text-lg font-semibold">
                Story Prompts Panel
              </h2>
              <StoryPromptsPanel
                templateType={selectedTemplate}
                existingContent={content}
                onInsertPrompt={(prompt) =>
                  setContent((prev) => prev + "\n\n" + prompt)
                }
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
