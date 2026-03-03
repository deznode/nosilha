import clsx from "clsx";
import { Link } from "./link";

export function Text({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(
        className,
        "dark:text-text-secondary text-base/6 text-basalt-500 sm:text-sm/6"
      )}
    />
  );
}

export function TextLink({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        "dark:text-text-primary dark:decoration-text-primary/50 dark:data-hover:decoration-text-primary text-basalt-900 underline decoration-basalt-900/50 data-hover:decoration-basalt-900"
      )}
    />
  );
}

export function Strong({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"strong">) {
  return (
    <strong
      {...props}
      className={clsx(
        className,
        "dark:text-text-primary font-medium text-basalt-900"
      )}
    />
  );
}

export function Code({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        "dark:border-border-primary/20 dark:bg-background-primary/5 dark:text-text-primary rounded-sm border border-basalt-900/10 bg-basalt-900/2.5 px-0.5 text-sm font-medium text-basalt-900 sm:text-[0.8125rem]"
      )}
    />
  );
}
