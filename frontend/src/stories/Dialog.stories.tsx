
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/catalyst-ui/dialog";
import { Button } from "@/components/catalyst-ui/button";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import { Input } from "@/components/catalyst-ui/input";

const meta = {
  title: "Catalyst UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a description of the dialog.
      </DialogDescription>
      <DialogBody>
        <p>This is the body of the dialog.</p>
      </DialogBody>
      <DialogActions>
        <Button onClick={() => args.onClose(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  ),
};

export const WithForm: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTitle>Sign Up</DialogTitle>
      <DialogDescription>
        Enter your email address to sign up for our newsletter.
      </DialogDescription>
      <DialogBody>
        <Field>
          <Label>Email</Label>
          <Input type="email" />
        </Field>
      </DialogBody>
      <DialogActions>
        <Button onClick={() => args.onClose(false)}>Cancel</Button>
        <Button onClick={() => args.onClose(false)}>Sign Up</Button>
      </DialogActions>
    </Dialog>
  ),
};
