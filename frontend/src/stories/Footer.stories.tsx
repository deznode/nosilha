import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "@/components/ui/footer";

const meta = {
  title: "Nos Ilha/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="bg-background-primary">
        <Story />
      </div>
    ),
  ],
};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark" data-theme="dark">
        <div className="bg-gray-950 text-white">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const TranslatedPortuguese: Story = {
  args: {
    copy: {
      exploreHeading: "Explora Brava",
      cultureHeading: "Cultura & História",
      connectHeading: "Conecta",
      newsletterHeading: "Recebe novidades culturais",
      newsletterDescription:
        "Envianu histórias, eventos e dicas de viagem para Brava toda semana.",
      legal: "Tudu direitu reservadu.",
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background-primary">
        <Story />
      </div>
    ),
  ],
};
