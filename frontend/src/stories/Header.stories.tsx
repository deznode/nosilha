import { useEffect, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "@/components/ui/header";
import {
  createMockAuthUser,
  createMockSession,
  createMockSupabaseUser,
  setAuthState,
} from "@/stories/storybook-auth-helpers";
import { StorybookRouterProvider } from "@/stories/storybook-router-context";

const meta = {
  title: "Nos Ilha/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const authState = context.args.__authState;
      const pathname = context.args.__pathname ?? "/";
      return (
        <StorybookRouterProvider pathname={pathname}>
          <AuthStatePreview authState={authState}>
            <div className="bg-background-primary min-h-screen">
              <Story />
            </div>
          </AuthStatePreview>
        </StorybookRouterProvider>
      );
    },
  ],
  args: {
    __authState: {
      session: null,
      user: null,
    },
    __pathname: "/",
  },
  argTypes: {
    __authState: {
      table: { disable: true },
    },
    __pathname: {
      control: "text",
      description: "Mock pathname for Storybook router context",
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

type AuthState = {
  session: ReturnType<typeof createMockSession> | null;
  user: ReturnType<typeof createMockAuthUser> | null;
};

function AuthStatePreview({
  authState,
  children,
}: {
  authState?: AuthState;
  children: ReactNode;
}) {
  useEffect(() => {
    if (authState) {
      setAuthState({ session: authState.session, user: authState.user });
    }
    return () => {
      setAuthState({ session: null, user: null });
    };
  }, [authState]);

  return children;
}

const memberSession = createMockSession({
  user: createMockSupabaseUser({ email: "querida@nosilha.org" }),
});
const memberUser = createMockAuthUser({
  email: "querida@nosilha.org",
  role: "MEMBER",
});

const adminSession = createMockSession({
  user: createMockSupabaseUser({
    email: "admin@nosilha.org",
    role: "service_role",
  }),
});
const adminUser = createMockAuthUser({
  email: "admin@nosilha.org",
  role: "ADMIN",
});

export const GuestNavigation: Story = {
  name: "Guest",
};

export const LoggedInMember: Story = {
  args: {
    __authState: {
      session: memberSession,
      user: memberUser,
    },
    __pathname: "/directory/restaurant",
  },
};

export const AdminWithAddEntry: Story = {
  args: {
    __authState: {
      session: adminSession,
      user: adminUser,
    },
    __pathname: "/add-entry",
  },
};

export const MobileMenuOpen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
  args: {
    defaultMobileMenuOpen: true,
    __authState: {
      session: memberSession,
      user: memberUser,
    },
  },
};

export const MobileMenuClosed: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
  args: {
    defaultMobileMenuOpen: false,
    __authState: {
      session: null,
      user: null,
    },
  },
};
