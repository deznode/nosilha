import type React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertTitle, AlertDescription, AlertActions } from "@/components/catalyst-ui/alert";
import { Button } from "@/components/catalyst-ui/button";

const meta = {
  title: "Catalyst UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs: React.ComponentProps<typeof Alert> = {
  open: true,
  onClose: () => {},
  children: null,
};

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>This is a description of the alert.</AlertDescription>
    </Alert>
  ),
  args: baseArgs,
};

export const WithActions: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>This is a description of the alert.</AlertDescription>
      <AlertActions>
        <Button>Action 1</Button>
        <Button>Action 2</Button>
      </AlertActions>
    </Alert>
  ),
  args: baseArgs,
};

export const Red: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>This is a description of the alert.</AlertDescription>
    </Alert>
  ),
  args: {
    ...baseArgs,
    color: "red",
  },
};
