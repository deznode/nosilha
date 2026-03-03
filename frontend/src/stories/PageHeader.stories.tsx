import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageHeader } from '@/components/ui/page-header';

/**
 * PageHeader provides consistent heading sections across Nos Ilha pages,
 * showcasing Brava Island's cultural heritage with elegant typography.
 *
 * Uses serif fonts for titles and sans-serif for subtitles to create
 * visual hierarchy and improve readability on mobile devices.
 */
const meta = {
  title: 'Nos Ilha/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main page title displayed in serif font',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle providing context',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - simple title without subtitle.
 * Commonly used for straightforward pages like "About" or "Contact".
 */
export const Default: Story = {
  args: {
    title: 'Explore Brava Island',
  },
};

/**
 * With Subtitle - includes descriptive subtitle for context.
 * Used on major landing pages and category pages.
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Cultural Heritage',
    subtitle: 'Discover the rich history, traditions, and landmarks that make Brava Island a unique gem in Cape Verde.',
  },
};

/**
 * Directory Page - showcases the directory listing header
 * with engaging subtitle for diaspora visitors.
 */
export const DirectoryPage: Story = {
  args: {
    title: 'Directory',
    subtitle: 'Explore restaurants, hotels, landmarks, and cultural sites that celebrate Brava Island\'s unique heritage.',
  },
};

/**
 * About Page - welcoming header for the about page
 * with mission statement as subtitle.
 */
export const AboutPage: Story = {
  args: {
    title: 'About Nos Ilha',
    subtitle: 'Preserving and celebrating the cultural memory of Brava Island for current and future generations.',
  },
};

/**
 * History Page - historical content header with
 * context-setting subtitle.
 */
export const HistoryPage: Story = {
  args: {
    title: 'Brava Island History',
    subtitle: 'From volcanic origins to vibrant cultural hub, explore the fascinating story of Brava Island through the centuries.',
  },
};

/**
 * Long Title - demonstrates responsive behavior with
 * lengthy title text on mobile viewports.
 */
export const LongTitle: Story = {
  args: {
    title: 'The Complete Guide to Brava Island\'s Cultural Heritage and Historical Landmarks',
    subtitle: 'Everything you need to know about exploring the island.',
  },
};

/**
 * Long Subtitle - shows how the component handles
 * extensive subtitle content while maintaining readability.
 */
export const LongSubtitle: Story = {
  args: {
    title: 'Notable Figures',
    subtitle: 'Brava Island has been home to many influential poets, musicians, sailors, and cultural leaders who have shaped Cape Verdean identity both at home and in the diaspora communities around the world. Explore their stories and contributions to our rich cultural tapestry.',
  },
};

/**
 * Portuguese Title - demonstrates multilingual support
 * for Cape Verdean Portuguese content.
 */
export const PortugueseTitle: Story = {
  args: {
    title: 'Bem-vindo à Ilha Brava',
    subtitle: 'Descubra a rica herança cultural de Cabo Verde através dos olhos da Ilha Brava.',
  },
};

/**
 * Towns Page - geographic category header
 * highlighting different villages.
 */
export const TownsPage: Story = {
  args: {
    title: 'Towns & Villages',
    subtitle: 'From Nova Sintra to Fajã d\'Água, explore the charming settlements that dot Brava Island\'s landscape.',
  },
};

/**
 * Media Gallery - media content header
 * encouraging community contribution.
 */
export const MediaGallery: Story = {
  args: {
    title: 'Photo Gallery',
    subtitle: 'Community-contributed images capturing the beauty, culture, and daily life of Brava Island.',
  },
};
