import clsx from "clsx";

export function Divider({
  soft = false,
  className,
  ...props
}: { soft?: boolean } & React.ComponentPropsWithoutRef<"hr">) {
  return (
    <hr
      role="presentation"
      {...props}
      className={clsx(
        className,
        "w-full border-t",
        soft && "border-basalt-900/5 dark:border-white/5",
        !soft && "border-basalt-900/10 dark:border-white/10"
      )}
    />
  );
}
