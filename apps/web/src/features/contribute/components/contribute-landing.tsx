import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Camera, Film } from "lucide-react";

/** The two ways in, E1. Spec 039 entry points. Text is under `contribute.landing.{key}`. */
const CHOICES = [
  {
    key: "photo",
    Icon: Camera,
    href: "/contribute/media",
  },
  {
    key: "film",
    Icon: Film,
    href: "/contribute/media?kind=film",
  },
] as const;

/**
 * `/contribute` (E1): two choices, no third "story" path any more.
 *
 * A server component — nothing here reads state or an event handler, so it
 * costs nothing beyond the static shell. Direction 1a moved sign-in to the
 * form itself, so this landing page's only job is to route to the right kind.
 */
export async function ContributeLanding() {
  const t = await getTranslations("contribute.landing");
  return (
    <div className="px-[18px] pt-[22px] pb-8 md:px-14 md:pt-11 md:pb-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex max-w-[820px] flex-col gap-5 md:gap-[26px]">
          <div className="flex flex-col gap-3.5">
            <h1 className="text-body font-serif text-[25px] leading-[1.12] font-normal md:text-[34px]">
              {t("title")}
            </h1>
            <p className="text-muted max-w-[56ch] text-[14px] leading-[1.55] md:text-[15.5px]">
              {t("lead")}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
            {CHOICES.map(({ key, Icon, href }) => (
              <Link
                key={key}
                href={href}
                className="focus-ring border-hairline bg-card group overflow-hidden rounded-[14px] border"
              >
                <div className="bg-surface-alt flex h-[130px] items-center justify-center md:h-[170px]">
                  <Icon
                    className="text-muted h-10 w-10"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px]">
                  <span className="text-body font-serif text-[22px]">
                    {t(`${key}.title`)}
                  </span>
                  <p className="text-muted text-sm leading-[1.5]">
                    {t(`${key}.body`)}
                  </p>
                  <span className="text-ocean-blue mt-1.5 text-sm font-semibold group-hover:underline">
                    {t(`${key}.cta`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="border-hairline text-muted border-t pt-4 text-[13.5px] leading-[1.6]">
            {t.rich("footer", {
              link: (chunks) => (
                <Link
                  href="/contact"
                  className="text-ocean-blue font-semibold hover:underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
