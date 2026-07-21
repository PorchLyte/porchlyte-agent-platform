/**
 * Static presentation content for the portal — agent dashboards and the
 * Foundation wizard. Purposes and interview questions are ported from the
 * plugin SKILL.md files (the source of truth). Prompt libraries are seeded
 * with starters; Tracy fills these in over time (one-click copy in the UI).
 */
import type { FoundationKind, ScheduledAgent, TeamAgent } from "./constants";

export type WizardQuestion = {
  id: string;
  prompt: string;
  hint?: string;
};

export type FoundationContent = {
  kind: FoundationKind;
  label: string;
  tagline: string;
  blurb: string;
  questions: WizardQuestion[];
};

export const FOUNDATIONS: Record<FoundationKind, FoundationContent> = {
  voice: {
    kind: "voice",
    label: "Voice",
    tagline: "How you sound",
    blurb:
      "Your writing voice — the phrasing, rhythm, and personality that make content sound like you and not the agent down the street. Every skill that writes for you reads this first.",
    questions: [
      { id: "q1", prompt: "What do you do and where?", hint: "Your job in your own words." },
      { id: "q2", prompt: "Who do you sell to most?", hint: "Your actual client profile." },
      { id: "q3", prompt: "Why do clients pick you over the agent down the street?", hint: "Your honest differentiator." },
      { id: "q4", prompt: "Give me a line of writing that sounds the most like you.", hint: "One real example from something you've actually written." },
      { id: "q5", prompt: "What was the first line of the last email you wrote a client?", hint: "Tells us how you actually open." },
      { id: "q6", prompt: "A phrase you say all the time without realizing it.", hint: "Your verbal tic. The thing that's uniquely yours." },
      { id: "q7", prompt: "The piece of agent-speak that makes you cringe.", hint: "Tells us what to never, ever write." },
      { id: "q8", prompt: "The kind of agent you never want to sound like.", hint: "Sharpens the contrast." },
      { id: "q9", prompt: "Three things from your real life that are not real estate.", hint: "Your personality outside the job, where the best voice comes from." },
      { id: "q10", prompt: "How you sign off a text to a client.", hint: "Your natural close." },
      { id: "q11", prompt: "What do you want a reader to do after they finish your post?", hint: "Your intent." },
    ],
  },
  brand: {
    kind: "brand",
    label: "Brand",
    tagline: "How you look",
    blurb:
      "Your visual identity — colors, fonts, aesthetic, and the imagery that feels on-brand. Any skill that touches design reads this so what it makes looks like yours.",
    questions: [
      { id: "q1", prompt: "Three words for how your brand should feel.", hint: "Adjectives, vibes, mood." },
      { id: "q2", prompt: "Your brand colors.", hint: "Names and hex codes if you have them. Descriptions are fine." },
      { id: "q3", prompt: "Your fonts.", hint: "Heading font, body font, anything else." },
      { id: "q4", prompt: "The aesthetic closest to yours.", hint: "Minimal, editorial, warm, bold, playful, classic, etc." },
      { id: "q5", prompt: "A brand outside real estate whose vibe you'd copy.", hint: "Magnolia, Glossier, Apple, Aritzia — a reference you can picture." },
      { id: "q6", prompt: "The kind of imagery you use most.", hint: "Lifestyle, listing photos, behind the scenes, personal, abstract, mix." },
      { id: "q7", prompt: "A visual choice in real estate marketing that makes you cringe.", hint: "Tells us what to avoid." },
      { id: "q8", prompt: "Your logo or mark.", hint: "Do you have one? What does it look like? Where do you use it?" },
      { id: "q9", prompt: "How much do you show up in your own content?", hint: "Heavily, occasionally, rarely, never." },
      { id: "q10", prompt: "What would the wrong version of your brand look like?", hint: "Sharpens the contrast." },
    ],
  },
  local: {
    kind: "local",
    label: "Local",
    tagline: "Where you work",
    blurb:
      "Your market knowledge — the neighborhoods, quirks, and on-the-ground truths that make content sound like it came from someone who actually knows the area.",
    questions: [
      { id: "q1", prompt: "The city or metro area you cover." },
      { id: "q2", prompt: "The neighborhoods you sell in most.", hint: "Three to seven specific names." },
      { id: "q3", prompt: "The price range you mostly work in.", hint: "A general band, not exact." },
      { id: "q4", prompt: "The vibe of your area.", hint: "Coastal, mountain town, urban core, suburban family, retirement, college, tech, etc." },
      { id: "q5", prompt: "What locals know that newcomers don't.", hint: "The hidden truths, unwritten rules, seasonal quirks." },
      { id: "q6", prompt: "Three places you'd send a new buyer to feel like a local.", hint: "Specific names. Coffee shop, restaurant, park, view, whatever." },
      { id: "q7", prompt: "The local quirk you find yourself explaining at every showing.", hint: "The thing about the area that's always a question." },
      { id: "q8", prompt: "The market dynamic right now in your honest words.", hint: "Not stats. How it actually feels on the ground." },
      { id: "q9", prompt: "Local sports teams, schools, or events that come up in conversations." },
      { id: "q10", prompt: "An underrated neighborhood you find yourself recommending." },
    ],
  },
};

export type AgentPrompt = {
  title: string;
  text: string;
};

export type AgentContent = {
  agent: TeamAgent;
  name: string;
  role: string;
  scheduled: boolean;
  purpose: string;
  intro: string;
  waysToUse: string[];
  tips: string[];
  prompts: AgentPrompt[];
};

const PLACEHOLDER_NOTE =
  "More ready-to-use prompts are on the way from Tracy — they'll show up here to copy in one click.";

export const AGENTS: Record<TeamAgent, AgentContent> = {
  darla: {
    agent: "darla",
    name: "Darla",
    role: "Daily briefing",
    scheduled: true,
    purpose: "Your morning desk read — inbox triaged, calendar surfaced, market and competitors summarized, one intentional action for the day.",
    intro:
      "Most agents start the day already behind — 47 unread emails, a panic scroll, and by 9am nothing intentional has happened. Darla pulls together one short brief over coffee: inbox triaged, today's calendar, what competitors are up to, what's moving in the market, and one suggested action. Done in five minutes.",
    waysToUse: [
      "Ask for your morning brief to triage the inbox and surface today's calendar",
      "Have her flag anything time-sensitive — showings, signed contracts, inspection scheduling",
      "Get a quick read on what competitors posted and what's moving in your market",
      "Ask 'catch me up' any time you've been heads-down and lost the thread",
    ],
    tips: [
      "Darla pulls from Gmail, Google Calendar, and web search — connect those in Cowork for the full brief.",
      "The more specific your VIP list and noise filters, the sharper the triage.",
      "She runs on a schedule you set — pause or resume it from the panel below.",
    ],
    prompts: [
      { title: "Morning brief", text: "Darla, give me my morning brief." },
      { title: "Catch me up", text: "Darla, I've been heads-down all day — catch me up on anything I missed." },
    ],
  },
  chloe: {
    agent: "chloe",
    name: "Chloe",
    role: "Content strategist",
    scheduled: false,
    purpose: "Removes the friction at every moment you freeze on social — post ideas, captions, hooks, Reel and Story scripts, DM and comment replies, grid audits.",
    intro:
      "Most agents don't have a content problem, they have a clarity problem. They sit down to post, rewrite three versions, give up, and post nothing — or post something so generic it gets scrolled past. Chloe removes the friction at every moment where you freeze or where you're about to send something that doesn't sound like you.",
    waysToUse: [
      "Get a week of post ideas built around your voice and market",
      "Turn a rough thought into a caption, hook, or Reel script",
      "Draft DM responses and comment replies that sound like you",
      "Run a grid audit or analyze your Insights for what's working",
    ],
    tips: [
      "Chloe reads your Voice and Brand foundations — the more complete those are, the more it sounds like you.",
      "Paste a rough voice-note transcript and let her shape it into a post.",
    ],
    prompts: [
      { title: "Week of content", text: "Chloe, give me a week of content ideas for Instagram based on my voice and market." },
      { title: "Reel script", text: "Chloe, write me a 30-second Reel script about why now is a good time to buy in my area." },
    ],
  },
  ella: {
    agent: "ella",
    name: "Ella",
    role: "Email expert",
    scheduled: false,
    purpose: "Drafts the campaign, writes the subject lines, and gives you something real to send — drips, nurtures, past-client check-ins, one-off drafts.",
    intro:
      "Email is where most agents go to die — they stare at the screen and either rewrite three versions or send something so generic it should have been a postcard. Ella removes that friction. She drafts the campaign, writes the subject lines, and gives you something real to work with so you hit send instead of close.",
    waysToUse: [
      "Build a buyer or seller nurture sequence from scratch",
      "Write a past-client check-in or sphere stay-in-touch series",
      "Get subject lines that actually get opened",
      "Draft a one-off email you've been avoiding",
    ],
    tips: [
      "For transaction-stage emails (under contract, closing day), that's Treena's desk.",
      "Ella reads your Voice foundation so the drafts open the way you actually open.",
    ],
    prompts: [
      { title: "Nurture sequence", text: "Ella, write me a 5-email nurture sequence for new buyer leads." },
      { title: "Past-client check-in", text: "Ella, draft a warm check-in email to past clients I haven't talked to in a while." },
    ],
  },
  poppy: {
    agent: "poppy",
    name: "Poppy",
    role: "Podcast producer",
    scheduled: false,
    purpose: "Takes the podcast workload off your plate — episode ideas, outlines, interview questions, show notes, descriptions, and repurposing into other formats.",
    intro:
      "A podcast can be one of the highest-leverage things an agent does — one episode becomes show notes, social posts, an email teaser, three Reels, and a newsletter. But most agents never start, or burn out by episode 12 doing everything themselves. Poppy takes that workload off your plate so you can focus on showing up and recording.",
    waysToUse: [
      "Brainstorm episode ideas that fit your market and audience",
      "Get an episode outline and interview questions before you record",
      "Turn a recorded episode into show notes and a description",
      "Repurpose one episode into Reels, posts, and an email teaser",
    ],
    tips: [
      "Bring a rough topic and let Poppy shape the whole episode arc.",
      "Feed her the transcript after recording to spin up a week of promo.",
    ],
    prompts: [
      { title: "Episode ideas", text: "Poppy, give me 10 podcast episode ideas for first-time buyers in my market." },
      { title: "Repurpose episode", text: "Poppy, here's my episode transcript — turn it into show notes, 3 Reels, and an email teaser." },
    ],
  },
  treena: {
    agent: "treena",
    name: "Treena",
    role: "Transaction coordinator",
    scheduled: false,
    purpose: "Keeps clients from feeling forgotten under contract — client updates, milestone emails, deadline tracking, and turning long documents into readable summaries.",
    intro:
      "A transaction is where most client relationships get damaged — the agent gets busy, the updates stop, the client feels forgotten, and by closing day they're not sure they'd refer you. Treena makes sure that never happens. She drafts the updates, tracks the deadlines, and turns a 40-page inspection report into a one-page summary the client can actually read.",
    waysToUse: [
      "Draft weekly client updates while a deal is under contract",
      "Get milestone and closing-day emails written",
      "Turn an inspection report, closing disclosure, or contract into a plain-language summary",
      "Recover gracefully when you've gone quiet on a client",
    ],
    tips: [
      "Upload the contract or report and ask for a one-page summary or a checklist.",
      "Treena covers under-contract email; general nurtures are Ella's.",
    ],
    prompts: [
      { title: "Weekly update", text: "Treena, draft this week's update for my client who's under contract." },
      { title: "Summarize inspection", text: "Treena, here's the inspection report — give me a one-page summary my buyer can actually read." },
    ],
  },
  lia: {
    agent: "lia",
    name: "Lia",
    role: "Listing amplifier",
    scheduled: false,
    purpose: "Extracts every last piece of mileage from each listing — just-listed posts, descriptions, lifestyle pitches, Reels, open-house promos, just-sold celebrations.",
    intro:
      "Every listing is a content opportunity most agents waste — one Instagram post and that's it. That single property could have been a week of content: a neighborhood spotlight, a lifestyle pitch, a Reel, an open-house promo, an under-contract post, a just-sold celebration, a referral nudge. Lia extracts every last piece of mileage without you having to think about it.",
    waysToUse: [
      "Turn a new listing into a full week of content",
      "Write the listing description and a lifestyle-driven pitch",
      "Get an open-house promo and a Reel script for the property",
      "Celebrate a just-sold and nudge for referrals",
    ],
    tips: [
      "Upload the MLS sheet or paste the listing and Lia takes it from there.",
      "She reads your Local foundation for neighborhood context.",
    ],
    prompts: [
      { title: "Week from one listing", text: "Lia, here's my new listing — build me a week of content from it." },
      { title: "Listing description", text: "Lia, write a listing description for this property that doesn't sound like everyone else's." },
    ],
  },
  sloane: {
    agent: "sloane",
    name: "Sloane",
    role: "Sphere manager",
    scheduled: false,
    purpose: "Protects the relationships your best business comes from — who hasn't been touched, drip schedules, birthday and home-anniversary notes, re-engaging cold contacts.",
    intro:
      "The sphere is where most agents say their best business comes from, and where they spend the least intentional time. They mean to stay in touch, they forget, they feel awkward after months of silence. Sloane knows who hasn't been touched, drafts messages that sound like a friend rather than an agent, and protects the relationship without making you feel like you're working a list.",
    waysToUse: [
      "Find out who in your sphere has gone too long without a touch",
      "Draft birthday and home-anniversary messages that sound human",
      "Build a stay-in-touch drip schedule for A/B/C tiers",
      "Re-engage a cold contact without it feeling awkward",
    ],
    tips: [
      "Sloane manages the tiers and cadence; general email copy is Ella's.",
      "The client roster lives in your Drive — Sloane reads from there.",
    ],
    prompts: [
      { title: "Who to reach", text: "Sloane, who in my sphere haven't I reached out to in a while, and what should I say?" },
      { title: "Anniversary note", text: "Sloane, write a home-anniversary message for a past client — warm, not salesy." },
    ],
  },
  rhonda: {
    agent: "rhonda",
    name: "Rhonda",
    role: "Relocation expert",
    scheduled: true,
    purpose: "Attracts and converts out-of-town buyers — moving guides, cost-of-living comparisons, discovery-call packets, long-distance follow-ups, monthly traffic scans.",
    intro:
      "Relocation buyers are gold — higher commitment, less price-sensitive, more loyal once they find an agent who knows the area. But most agents write generic 'moving to' content nobody reads, miss the employer announcement about to bring 200 families to town, and treat long-distance leads like local ones. Rhonda fixes all of that.",
    waysToUse: [
      "Build a moving guide or cost-of-living comparison for your market",
      "Create neighborhood-matchmaker and 'don't move here unless' posts",
      "Prep a discovery-call agenda and pre-call relocation packet",
      "Get a monthly scan of relocation traffic signals for your area",
    ],
    tips: [
      "Rhonda's monthly traffic scan runs on a schedule — manage it from the panel below.",
      "She reads your Local foundation heavily; keep it current.",
    ],
    prompts: [
      { title: "Moving guide", text: "Rhonda, write me a moving guide for people relocating to my area." },
      { title: "Relocation packet", text: "Rhonda, build a pre-call relocation packet for an out-of-town buyer considering my market." },
    ],
  },
  olivia: {
    agent: "olivia",
    name: "Olivia",
    role: "Objection vault",
    scheduled: false,
    purpose: "Gives you a real response — not a scripted line — in the moments deals get made or lost, and helps you practice out loud so the real moment doesn't catch you flat.",
    intro:
      "Objections are where deals get made or lost. The seller wants too much, the buyer offers too little, the co-op agent gets aggressive, the client says 'we want to think about it.' In those moments you either have a response ready or you freeze and the deal drifts. Olivia gives you the response — not a scripted sales line, a real one, in your voice — and helps you practice out loud.",
    waysToUse: [
      "Get a real response to a seller or buyer objection",
      "Handle a difficult co-op agent or an unfair counteroffer",
      "Role-play a high-pressure conversation before it happens",
      "Build and update your personal Objection Vault",
    ],
    tips: [
      "Ask Olivia to role-play as the other side so you can rehearse out loud.",
      "She writes in your Voice — responses sound like you, not a script.",
    ],
    prompts: [
      { title: "Handle an objection", text: "Olivia, my seller thinks their home is worth more than the comps support — how do I respond?" },
      { title: "Role-play", text: "Olivia, role-play a buyer who wants to lowball, and let me practice my response." },
    ],
  },
};

export const AGENT_ORDER: TeamAgent[] = [
  "darla",
  "chloe",
  "ella",
  "poppy",
  "treena",
  "lia",
  "sloane",
  "rhonda",
  "olivia",
];

export const FOUNDATION_ORDER: FoundationKind[] = ["voice", "brand", "local"];

export function isScheduled(agent: TeamAgent): agent is ScheduledAgent {
  return AGENTS[agent].scheduled;
}

export { PLACEHOLDER_NOTE };
