import { useEffect } from "react";
import type { ReactNode } from "react";
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
      const authState =
        (context.parameters.__authState as AuthState | undefined) ??
        defaultAuthState;
      const pathname =
        (context.parameters.__pathname as string | undefined) ?? "/";
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
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof Header>;
const defaultAuthState: AuthState = {
  session: null,
  user: null,
};

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
  parameters: {
    __authState: defaultAuthState,
    __pathname: "/",
  },
};

export const LoggedInMember: Story = {
  parameters: {
    __authState: {
      session: memberSession,
      user: memberUser,
    },
    __pathname: "/directory/restaurant",
  },
};

export const AdminWithAddEntry: Story = {
  parameters: {
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
    __authState: {
      session: memberSession,
      user: memberUser,
    },
  },
  args: {
    defaultMobileMenuOpen: true,
  },
};

export const MobileMenuClosed: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
    __authState: defaultAuthState,
  },
  args: {
    defaultMobileMenuOpen: false,
  },
};
