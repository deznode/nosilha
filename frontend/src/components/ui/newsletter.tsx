export default function NewsletterSignup() {
  return (
    <section className="bg-background-primary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="from-ocean-blue via-ocean-blue/80 to-ocean-blue/60 border-ocean-blue/30 relative isolate overflow-hidden rounded-lg border bg-gradient-to-br px-6 py-24 shadow-lg transition-shadow hover:shadow-xl sm:px-24 xl:py-32">
          {/* Ocean-inspired radial gradient overlay */}
          <div
            className="absolute inset-0 -z-10 opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Stay Connected with Brava Island
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-center font-sans text-lg text-white/90">
              Get updates on cultural events, new heritage sites, and stories
              from our island community.
            </p>

            {/* Newsletter Form */}
            <form className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row sm:gap-x-4">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                aria-label="Email address for newsletter subscription"
                className="focus:ring-offset-ocean-blue min-w-0 flex-auto rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-sans text-base text-white transition-all placeholder:text-white/60 focus:border-white/40 focus:bg-white/20 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                className="text-ocean-blue flex-none rounded-lg bg-white px-6 py-3 font-sans text-sm font-semibold shadow-sm transition-all hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>

            {/* Privacy Note */}
            <p className="mx-auto mt-4 max-w-md text-center font-sans text-xs text-white/70">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Decorative Ocean Blue Glow - Nos Ilha Brand Identity */}
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 opacity-10"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#nos-ilha-newsletter-gradient)"
              fillOpacity="0.4"
            />
            <defs>
              <radialGradient
                id="nos-ilha-newsletter-gradient"
                cx={0}
                cy={0}
                r={1}
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(512 512) rotate(90) scale(512)"
              >
                <stop stopColor="var(--color-ocean-blue)" />
                <stop offset={0.5} stopColor="var(--color-valley-green)" />
                <stop offset={1} stopColor="transparent" stopOpacity={0} />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
