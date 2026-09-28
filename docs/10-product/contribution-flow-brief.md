# Contribution Flow — Design Brief

_Prepared 2026-09-27 for the UX/UI team · Status: ready for design · Next spec: 039_

## What we're asking for

Redesign how a visitor **gives a photograph or a film link to the Nos Ilha archive**, focusing on three things:

1. **Sign-in that doesn't lose the contribution.** A first-time contributor should be able to create an account or sign in (by email or with Google) and finish submitting, without re-picking their photo or re-typing anything.
2. **Richer, easier-to-find contributions.** Contributors can say what the photo shows and where it was taken, and can find the contribute page from anywhere on the site.
3. **Better film-link submissions.** Films get the same "where / when / what" as photos, a preview of the link, and a clear answer when the film is already in the archive.

This brief describes the problems, the people and the constraints. It does not prescribe the solution.

## Who contributes

| Person | Situation | What gets in their way today |
|---|---|---|
| **Diaspora family member** (Boston, Lisbon, Rotterdam) | On a phone, has a photo of a grandparent's print, and has never used Nos Ilha before | Has no account. Account creation sends them away and the photo they picked is lost |
| **Local photographer on Brava** | Has good photos with GPS data, wants credit | Can't say what the photo shows or tie it to a town; the photo goes in with no title |
| **Someone who found a film** | Has a YouTube link to an old festa video | Can only add a title and credit; gets no feedback if the film is already in the archive |

Assume **mobile first**, sometimes on slow connections, sometimes from inside an email or social app's built-in browser, and often an older person sharing a photograph of a printed photograph.

## How it works today

**Where people start:** the "Share a photo / send it to the archive" links in the Instagram section on the home page, the photographs grid, the films section, "Send a copy" in the film player, and the `/contribute` landing page.
- The main **Contribute** button in the top bar goes to `/contribute/story`, a page for the stories feature that has been cut. It does not go to the media form.
- The footer and mobile nav have no link to the media form.

**The form** (`/contribute/media`): one page with two modes.
- **Photo.** Asks for:
  - who took it
  - who is giving it
  - where it was taken (free text, e.g. "Faja d'Agua, by the harbour")
  - roughly when
  - a permission checkbox (CC BY-SA 4.0)
  - the file itself
- **Film link.** Asks for who made it, a title, and a YouTube/Vimeo link.

**Sign-in happens at the end.** Visitors fill in the form signed out, and the button reads "Submit — you sign in at the end". Tapping it opens a dialog: _"Your photograph is held, not lost"_.
- The dialog shows what's being held (photographer, source, place) and asks for **email and password**.
- **"No account yet? Create one"** goes to `/signup`. This leaves the page, and the selected photo is lost.

**After submitting**, a thank-you screen says the item is "pending verification by our team". An editor then reviews it in the admin queue before it appears in the archive.

## The problems to solve

1. **New contributors hit a dead end.** Creating an account means leaving the page and losing the photo. Password-only sign-in is also a barrier for people who rarely use this site. _Highest priority._
2. **There is no way to sign in with Google or an email code** inside the contribution flow, though Google sign-in already exists on `/login`.
3. **A photo arrives without a title or description.** Editors have to guess what it shows.
4. **"Where" is free text only.** A contributor can't pick one of Brava's towns, so the photo isn't linked to that town's page.
5. **The contribute page is hard to find.** The main Contribute button points at the retired story form.
6. **Film submissions are thin.** They have no place, date or description, no preview that the link is right, and no response when the film is already in the archive (it just silently creates a duplicate).
7. **Success feedback is generic.** A toast ("Media uploaded successfully") plus a thank-you screen that doesn't say what happens next or how long review takes.

## States and screens we need designed

**Sign-in inside the flow**
- Start: choose Google or email (password remains a secondary option for existing users).
- Email path: enter email → "check your email" → enter a 6-digit code → signed in. Include:
  - wrong code
  - expired code
  - resend, including a cooldown
  - an email that never arrived
- Google path: leaving for Google, then **returning to the form with the contribution restored**. The returning screen needs to reassure the person that it's their photo and it hasn't been sent yet.
- A new account created this way, where the email has never been seen before. Should this feel any different from signing in?
- Error cases: sign-in cancelled, the Google popup blocked, and the contribution could not be saved on this device (Safari private mode, for example).

**Photo form**
- New fields: **title** and **description**.
- A **place picker**: choose one of Brava's towns or type free text. Picking a town should also work well on mobile.
- Keep the current fields and the permission/licence wording.

**Film form**
- New fields: place, approximate date, description.
- A **link preview**: show a YouTube thumbnail once the link is recognised. Vimeo has no thumbnail, so it needs a placeholder design.
- States: link not recognised, and **"Already in the archive"**. The second has two variants: already public (link to it) and waiting for review.
- The rate limit: too many submissions in a short time.

**Entry points**
- Where "Contribute" lives in the top bar, mobile nav and footer.
- Invitations on the photographs and films pages, sized for a sparse archive.

**After submitting**
- A confirmation that explains the review step and roughly how long it takes.
- A next step: give another, or go see the archive.

## Constraints (technical facts that shape the design)

- **A selected photo can't follow the user to another page.** Anything that leaves the page (Google sign-in, a separate signup page, a link in an email) means the draft has to be saved on the device and restored on return. It can be restored only in **the same browser on the same device**.
- **Email links are unreliable on phones.** Tapping a sign-in link in Gmail or Outlook often opens the email app's built-in browser, and sign-in fails there. So we plan to lead with a **6-digit code typed into the page**, with the link as a fallback. The design should make the code the obvious path.
- **Email sending is rate limited.** Resending should be guarded (cooldown, clear messaging).
- **For now, places are towns only.** Linking a photo to an individual directory place (a restaurant or a church) would currently hide it from the photo archive. The picker should cover Brava's towns plus free text; linking to specific places is a later project.
- **Nothing publishes automatically.** Every contribution is reviewed before it appears, and the copy must say so.
- **Licence.** Photos are shared under CC BY-SA 4.0 and the contributor keeps copyright. The existing promise stays: _"we will not publish it without that credit attached."_
- **Video is links only.** YouTube and Vimeo only; no video file uploads in this round.
- **Out of scope for this round:**
  - automatic handling of iPhone HEIC files and resizing
  - uploading several photos at once
  - a "my contributions" page
  - email notifications on approval

## Voice and design system

- Match the voice of the current copy: plain, warm and specific. For example:
  - _"Give a photograph to the archive"_
  - _"You keep the copyright. We record who took it and who gave it."_
  - _"A name, or 'not known'"_
- Avoid generic SaaS phrasing like "Media uploaded successfully".
- Use the existing design system: the Slate palette, Fraunces headings, and the site chrome from spec 037. Tokens and components are documented in `docs/10-product/design-system.md`.
- Design for light and dark themes. Dark mode hasn't been audited, so please check contrast in both.

## Open questions for design

1. Should sign-in move to the **start** of the flow, or stay at the end ("you sign in at the end")?
2. How prominent should the password option be, now that email code and Google are available?
3. Should picking a town show anything back, such as a mini map or the town's photo?
4. When a film is already in the archive, should we invite the contributor to add information to it (a correction or a better title)?
5. What should the `/contribute` landing page become, now that stories are gone?

## Handoff we need back

- A high-fidelity handoff in the same format as previous ones (`.claude-design/design_handoff_*`: a README plus a `.dc.html` with artboards). We implement from it pixel for pixel.
- Artboards: desktop and mobile (≤700px) for each state listed above, plus copy for every message and error.

## Reference

- Current form: `apps/web/src/app/(main)/contribute/media/page.tsx`
- Current sign-in dialog: `apps/web/src/components/auth/sign-in-dialog.tsx`
- Contribute landing: `apps/web/src/components/pages/contribute-page-content.tsx`
- Top bar Contribute button: `apps/web/src/components/navigation/chrome-parts.tsx`
