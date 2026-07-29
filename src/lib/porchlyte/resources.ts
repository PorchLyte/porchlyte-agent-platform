/**
 * Course companion content from Tracy — lives in the hub alongside agent
 * dashboards. The GHL course remains the primary delivery; this is the
 * always-on copy/paste home for the same prompts and frameworks.
 */

export type ResourceLink = {
  label: string;
  href: string;
};

export type DayMoment = {
  time: string;
  agent: string;
  title: string;
  body: string;
  toMakeThisWork: string[];
  sayThis: string;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  agents: string;
  blurb: string;
  featured?: boolean;
  instructions: string;
  knowledge: string[];
};

export type TrifectaSkill = {
  id: string;
  moment: string;
  name: string;
  tagline: string;
  builds: string;
  starterPrompt: string;
};

export const RESOURCE_LINKS = {
  dayInTheLife:
    "https://porchlyte.com/wp-content/uploads/2026/07/a-day-in-the-life-with-claude.html",
  projectsWorkbook:
    "https://porchlyte.com/wp-content/uploads/2026/07/Work-in-Projects-Workbook-Module-3-1.pdf",
  trifecta:
    "https://porchlyte.com/wp-content/uploads/2026/07/The-Trifecta-Agent-AI-Studio.html",
  chromeSheet:
    "https://docs.google.com/spreadsheets/d/16Yyn6qdcuxPYPrpP2PPITOmetJkALM_2ckv70Ycwu3Y/edit?usp=sharing",
} as const;

export const DAY_IN_THE_LIFE: DayMoment[] = [
  {
    time: "7:00 AM",
    agent: "Darla",
    title: "Get your bearings",
    body: "You ask Darla to catch you up. One short read: what's in your inbox, what's on your calendar, what's moving in your market. No opening five tabs to hunt for it. Your day has a shape before the coffee's gone.",
    toMakeThisWork: [
      "Connect your Google or Microsoft account so Darla can see your email and calendar.",
      "Turn on the Daily Brief scheduled task.",
      "Let Darla summarize your inbox, appointments, and market updates each morning.",
    ],
    sayThis:
      "Darla, give me my morning brief. Pull anything in my inbox that needs a reply today, tell me what's on my calendar and whether anything needs prep before it, and flag anything moving in my local market. Then sort it for me: what's time-sensitive, what can wait, and what I can safely ignore. Keep it short, and end with the one thing you'd handle first if you were me.",
  },
  {
    time: "8:30 AM",
    agent: "Chloe",
    title: "Today's post, without the spiral",
    body: "It's time for the daily post. You know this routine. Staring at the blinking cursor. Writing three different openings. Deleting them all. Walking away. You give Chloe one angle and get back a caption that actually sounds like you. Two edits later, it's scheduled.",
    toMakeThisWork: [
      "Complete your Foundation so Chloe writes in your voice.",
      "Open Claude, or use Claude in Chrome, while you're looking at a listing, article, or market report.",
      "Tell Chloe what you're trying to say. Let her write the first draft.",
    ],
    sayThis:
      "Chloe, write me an Instagram post for today. The angle is [your topic], and I'm talking to [who you serve]. Give me the caption plus two hook options, keep it in my voice, and don't let it get salesy. Add a simple call to action at the end, and suggest a photo or video I could pair it with so I'm not stuck on that part either.",
  },
  {
    time: "11:00 AM",
    agent: "Treena",
    title: "Where does my deal stand",
    body: "You have a deal under contract and the moving parts are piling up. Treena walks the file and flags what's coming next: what's on your plate, what the buyer needs to do, and the deadlines that can't slip. Then she drafts the client update so nobody's left wondering where things stand.",
    toMakeThisWork: [
      "Open your transaction file in your browser.",
      "Use Claude in Chrome to read the contract, timeline, and notes right on the page, or upload them into Claude.",
      "Ask Treena to flag the upcoming deadlines and draft your client update.",
    ],
    sayThis:
      "Treena, here's my deal. We're under contract, accepted [date], closing [date], and here are the terms and conditions: [paste]. Walk the transaction and flag what's coming up. Tell me what's on my plate and what the buyer needs to do next, each with its deadline, and call out anything at risk of slipping. Then draft a short, warm update I can send the buyer so they know exactly where things stand.",
  },
  {
    time: "2:00 PM",
    agent: "Sloane",
    title: "Who am I forgetting",
    body: "The quiet work that always slips through the cracks. Sloane surfaces a past client you haven't talked to in a while and drafts a warm check-in. No sales pitch. Just a thoughtful note that keeps the relationship alive.",
    toMakeThisWork: [
      "Connect your contacts or open your CRM.",
      "Use Claude in Chrome while viewing your database, or upload a list into Claude.",
      "Ask Sloane to identify people you haven't talked to recently and draft personal check-ins.",
    ],
    sayThis:
      "Sloane, help me stay in touch today. Surface anyone I've fallen out of touch with, plus anyone with a birthday or home anniversary coming up. Pick one person, tell me why now's a good moment to reach out, and draft a warm, no-agenda check-in. No pitch, no ask, just a real note that keeps me top of mind. Keep it short enough that it still feels personal, like I actually typed it myself.",
  },
  {
    time: "4:30 PM",
    agent: "Listing Presentation",
    title: "Walk in ready tomorrow",
    body: "You have a listing appointment first thing tomorrow morning. Instead of throwing together a generic CMA, you bring the comps and seller details into the Listing Presentation. It builds the pricing story, marketing plan, and polished leave-behind the seller gets to keep.",
    toMakeThisWork: [
      "Have your Brand and Local Foundation set up so everything comes out on-brand.",
      "Export your CMA and gather your seller notes.",
      "Run the Listing Presentation Builder in Cowork.",
      "Review, personalize, and you're ready for tomorrow.",
    ],
    sayThis:
      "Build my listing presentation for tomorrow's appointment. Here are my comps: [paste]. Seller and property details: [paste]. Give me a pricing story built from these comps, a marketing plan the seller can actually picture, and a reason to choose me that isn't a discount. Anticipate the objections this seller is likely to raise and give me a line for each. I want two pieces: the presentation for the table and a leave-behind the seller keeps while they decide.",
  },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "monthly-market-update",
    name: "Monthly Market Update",
    agents: "Darla, Local, Chloe",
    blurb:
      "The recurring room — post, email, and short video script from one ask. Remembers what you sent last month so it never repeats.",
    featured: true,
    instructions: `This project is where I build my monthly market update for [my area]. The social post, the email, and a short video script, from one ask.

What's already handled: my Voice, Brand, and Local are installed as skills. This room holds my local stats sources and every past update I've saved. Read them first.

Your role: work like Darla and Local to read the numbers, and Chloe to turn them into content.

How to handle this: match my Voice. Use only the real numbers I give you or that are in this room. Keep my usual sections: [what I always include].

Standing rules: check the past updates in this room and don't repeat last month's angle or headline. Give me the post, the email, and the video script unless I ask for less.

Do NOT: no em dashes. Never invent a stat. Don't recycle a hook or headline I've already used.`,
    knowledge: [
      "Your local stats source (MLS export or board report)",
      "This month's numbers: sales, inventory, days on market, prices",
      "Your usual market-update sections",
      "Past updates, saved back into the room each month",
    ],
  },
  {
    id: "content-hq",
    name: "Content HQ",
    agents: "Chloe, Ella, Lia",
    blurb: "Captions, hooks, scripts and emails in your voice. The blank-page killer.",
    featured: true,
    instructions: `This project is where I create my social content and the emails that go with it. Captions, hooks, Reel scripts, Stories, email.

What's already handled: my Voice, Brand, and Local are installed as skills, so you already know how I sound. This room holds my content pillars, my best past posts, and the competitors I watch.

Your role: you're my content team. Work like Chloe for social and Ella for email. Bring me angles when I'm stuck, not just execution.

How to write: match my Voice exactly. Warm, direct, second person. Every post should make my audience feel like they belong here, not like they're being sold to.

Standing rules: when I ask for a post, give me the hook first so I can approve the angle. Default to [my platforms]. Keep captions [my length].

Do NOT: no hype or salesy language. No em dashes. Don't invent stats, listings, or client details I haven't given you. Don't flatten my voice.`,
    knowledge: [
      "Your content pillars",
      "Three or four of your best past posts",
      "Your competitor / accounts-to-watch list",
      "Any campaign or launch notes for this month",
    ],
  },
  {
    id: "listing-hub",
    name: "Listing Hub",
    agents: "Lia, Treena, Listing Presentation",
    blurb: "Drop the MLS sheet in once; spin the whole marketing set and keep the deal moving.",
    instructions: `This project is for marketing a specific listing and keeping the deal moving.

What's already handled: my Voice, Brand, and Local are installed as skills. This room holds the listing's MLS sheet, feature list, and seller notes. Read them first.

Your role: work like Lia for listing content and Treena for transaction updates. When I'm prepping to win the listing, work like the Listing Presentation skill.

How to write: match my Voice. Ground every post in this actual property and neighbourhood, not generic listing language.

Standing rules: when I drop a new MLS sheet in, ask me what I need first (just-listed, open house, price change, just-sold) rather than assuming.

Do NOT: no em dashes. Don't overpromise on the property. Don't share client or seller details in anything public-facing.`,
    knowledge: [
      "The MLS sheet for the listing",
      "The feature list and seller notes",
      "Seller's timeline and motivation",
      "Neighbourhood data for the area",
    ],
  },
  {
    id: "sphere-relationships",
    name: "Sphere & Relationships",
    agents: "Sloane, Ella",
    blurb: "Check-ins that reference the real relationship, not a template.",
    instructions: `This project is for staying in touch with my past clients and my sphere.

What's already handled: my Voice is installed as a skill. This room holds my contact notes organized by tier (A, B, C), birthdays, and home anniversaries.

Your role: work like Sloane for sphere outreach and Ella for the email side. Help me sound like a friend checking in, not an agent farming for business.

How to write: match my Voice. Warm and personal. Reference the actual relationship when I've given you notes on it.

Standing rules: keep check-ins short. Give me the message ready to send, not a template I have to finish.

Do NOT: no em dashes. No hard sell. Never put sensitive client details into anything public. First names and tiers only in this project, nothing private.`,
    knowledge: [
      "Contact notes by tier (A / B / C)",
      "Birthdays and home anniversaries",
      "Relationship context and notes",
      "How you first met each person",
    ],
  },
  {
    id: "relocation-funnel",
    name: "Relocation Funnel",
    agents: "Rhonda, Local",
    blurb: "One area knowledge base feeding moving guides and call prep.",
    instructions: `This project is for attracting and converting buyers moving to my area from somewhere else.

What's already handled: my Voice, Brand, and Local are installed as skills, so lean on what you know about my market. This room holds my cost-of-living comparisons, neighbourhood guides, and relocation FAQs.

Your role: work like Rhonda. Lean on my Local hard. These people don't know the area, so I'm their guide.

How to write: match my Voice. Helpful and specific. Answer the real question underneath ("will my family fit here") not just the surface one.

Standing rules: when I ask for relocation content, pull from the area knowledge already in here rather than generic facts.

Do NOT: no em dashes. Don't guess at local details that aren't in this room's knowledge. Ask me instead.`,
    knowledge: [
      "Cost-of-living comparisons",
      "Neighbourhood matchmaker guides",
      "Relocation FAQs",
      "The area's selling points and drawbacks",
    ],
  },
  {
    id: "command-center",
    name: "Command Center",
    agents: "Darla, Olivia",
    blurb: "Daily briefings that know your goals, plus objection practice.",
    instructions: `This project is my daily operations and practice room.

What's already handled: my Voice is installed as a skill. This room holds my goals and priorities, the competitors I track, and my Objection Vault.

Your role: work like Darla for my morning briefing and Olivia when I want to practise objections.

How to handle this: brief and direct for briefings. For objection practice, be honest, not soft. Push me the way a real seller or buyer would.

Standing rules: keep the daily briefing tight. When I handle an objection well, add the response to my Objection Vault so it builds over time.

Do NOT: no em dashes. Don't let me off easy in role-play. Don't pad the briefing with filler.`,
    knowledge: [
      "Your goals and current priorities",
      "Competitors and accounts to track",
      "Your Objection Vault",
      "Anything you want in the daily read",
    ],
  },
  {
    id: "newsletter-drip",
    name: "Monthly Newsletter & Drip",
    agents: "Ella",
    blurb: "Recurring email that remembers your format and every edition sent.",
    instructions: `This project is where I build my recurring email: my monthly newsletter and my drip sequences. Same format every time, fresh content each round.

What's already handled: my Voice and Brand are installed as skills. This room holds my newsletter structure, my last several editions, and any drip sequences I've already written. Read them before you draft.

Your role: work like Ella. You know my format cold, so I shouldn't have to re-explain it each month.

How to write: match my Voice. Put [my platform] merge fields where the personalization goes, using [my merge field syntax]. Stick to my usual sections and length.

Standing rules: before you write a new edition, check the past editions in this room and don't repeat angles I've already used. When a drip email is finished, I'll save it back into the knowledge so the next one knows what came before.

Do NOT: no em dashes. No hype. Don't recycle a subject line or a hook I've already sent.`,
    knowledge: [
      "Your newsletter structure / template",
      "Your last several editions",
      "Any drip sequences already written",
      "Your merge-field / personalization setup",
    ],
  },
];

export const TRIFECTA_INSTALL = [
  "Make sure your Foundation is set up (Voice, Brand, Local under Personal plugins).",
  "Add the Trifecta marketplace: Customize → + → Create plugin → Add marketplace → Add from a repository → paste PorchLyte/real-estate-trifecta → Sync.",
  "Install Real Estate Trifecta from that marketplace (+ to activate).",
  "No /set-me-up — just start using it. Each skill asks a short interview the first time, then never again.",
];

export const TRIFECTA_SKILLS: TrifectaSkill[] = [
  {
    id: "buyer-consult",
    moment: "Buyers",
    name: "Buyer Consult",
    tagline: "Win the buyer meeting",
    builds:
      "Your pre-meeting brief, the agenda, discovery questions, and a branded Home Buyer Guide the buyer keeps. Contact saved, meeting booked, follow-up drafted.",
    starterPrompt:
      "I'm meeting a buyer tomorrow at 10. Here's what she said in her inquiry: [paste]. Help me prep for the buyer consultation.",
  },
  {
    id: "listing-presentation",
    moment: "Sellers",
    name: "Listing Presentation",
    tagline: "Win the listing",
    builds:
      "The deck you present at the table and the leave-behind the seller keeps while they decide. Built from your real comps, your marketing plan, and your why-me. Never invents a number.",
    starterPrompt:
      "I have a listing appointment Thursday. Here are the comps: [paste]. Seller and property details: [paste]. Build my listing presentation.",
  },
  {
    id: "closing-day",
    moment: "Under contract",
    name: "Closing Day",
    tagline: "Accepted offer to keys",
    builds:
      "A road-to-closing map in your client's own country and property type, deadline reminders, then the keepsake, celebration, gift note, 30-day check-in, and one-year anniversary touch.",
    starterPrompt:
      "Offer accepted on [address]! Buyers, closing [date]. Build the road to closing.",
  },
];

export const RESOURCE_NAV = [
  {
    id: "day-in-the-life",
    href: "/dashboard/resources/day-in-the-life",
    label: "A Day with Your AI Team",
    blurb: "Five moments in an ordinary day — with the exact prompts to say.",
  },
  {
    id: "projects",
    href: "/dashboard/resources/projects",
    label: "Work in Projects",
    blurb: "Copy-paste custom instructions for Content HQ, Listing Hub, and more.",
  },
  {
    id: "trifecta",
    href: "/dashboard/resources/trifecta",
    label: "The Trifecta",
    blurb: "Buyer Consult, Listing Presentation, Closing Day — the three high-stakes moments.",
  },
  {
    id: "chrome",
    href: "/dashboard/resources/chrome",
    label: "Claude in Chrome",
    blurb: "114 copy-paste scenarios for Claude on the page you're already looking at.",
  },
] as const;
