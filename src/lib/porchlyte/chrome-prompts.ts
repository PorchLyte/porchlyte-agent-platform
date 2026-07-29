/**
 * Claude in Chrome scenarios — ported from Tracy's spreadsheet
 * (100 Ways + Bonus Advanced Workflows). Generated from sheet export.
 * Total scenarios: 114
 */

export type ChromeScenario = {
  n: number;
  title: string;
  website: string;
  prompt: string;
};

export type ChromeCategory = {
  id: string;
  name: string;
  covers: string;
  tip: string;
  scenarios: ChromeScenario[];
};

export const CHROME_CATEGORIES: ChromeCategory[] = [
  {
    id: "social-content",
    name: "Social Media & Content",
    covers: "Instagram, Reels, captions, trends, comment mining",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 1,
        title: "Turn trending posts into their own voice",
        website: "Instagram — your feed or Explore page",
        prompt: "Look at the posts on this page and pick the 3 strongest ideas. Rewrite each as a caption in a warm, plain-spoken tone with a scroll-stopping first line, short enough to read in one breath. Give me all 3 so I can choose.",
      },
      {
        n: 2,
        title: "Mine competitor comments for content",
        website: "Instagram — the competitor's Reel",
        prompt: "Read the comments on this Reel and pull out the 5 questions or frustrations that come up most. For each one, suggest a post I could make that answers it in a helpful, non-salesy way.",
      },
      {
        n: 3,
        title: "Find their own best-performing posts",
        website: "Instagram — your profile / Insights",
        prompt: "Look at my recent posts on this profile and tell me which 3 got the most saves and comments, and what they have in common. Then give me 5 new post ideas that build on what's already working.",
      },
      {
        n: 4,
        title: "Draft hooks for a trending audio",
        website: "Instagram or TikTok — the trending audio's page",
        prompt: "This audio is trending and here are the top videos using it. Write me 5 Reel hooks for a real estate agent that fit the vibe of this sound, each one short and curiosity-driven.",
      },
      {
        n: 5,
        title: "Answer questions in a local Facebook group",
        website: "Facebook — your local community group",
        prompt: "Read this group feed and find 3 posts I could genuinely help with as the local expert. Draft a warm reply for each that answers the question first and only mentions I'm an agent at the end.",
      },
      {
        n: 6,
        title: "Rewrite their Instagram bio",
        website: "Instagram — your profile",
        prompt: "Here's my profile. Rewrite my bio in 2-3 short lines so a nervous first-time buyer feels safe reaching out. Say who I help and how they'll feel, keep it human, and give me two versions.",
      },
      {
        n: 7,
        title: "Fix their LinkedIn headline and About",
        website: "LinkedIn — your profile",
        prompt: "Read my LinkedIn. Rewrite my headline and About section to sound like a real person who helps people, not a resume. Keep the About to 3 short paragraphs and lead with who I serve.",
      },
      {
        n: 8,
        title: "Batch a week of captions from one idea",
        website: "Instagram — the post with the idea",
        prompt: "Take the topic on this post and spin it into 5 caption angles for the week: one story, one tip, one myth-buster, one question, one behind-the-scenes. Keep each short and in a warm, plain tone.",
      },
      {
        n: 9,
        title: "Write Story scripts from a listing page",
        website: "Realtor.com / Realtor.ca, your MLS, or Zillow — the listing page",
        prompt: "Look at this listing and write a 4-slide Instagram Story script walking a buyer through it. Give me the on-screen text for each slide plus a simple idea for what to film.",
      },
      {
        n: 10,
        title: "Reply to DMs without sounding robotic",
        website: "Instagram — your DMs",
        prompt: "Here's this DM thread. Draft a warm, natural reply that answers their question, keeps the conversation going, and gently offers a quick call. Give me a shorter and a longer option.",
      },
      {
        n: 11,
        title: "Spot the format, not just the post",
        website: "Instagram — top posts in your niche",
        prompt: "Look at these top posts in my niche and tell me the format they share (hook, body, close). Then give me a simple fill-in-the-blank template I can use to make my own version.",
      },
      {
        n: 12,
        title: "Draft a carousel from a blog or article",
        website: "The blog or news article page",
        prompt: "Read this article and turn the main points into a 6-slide Instagram carousel: a punchy title slide, 4 content slides with short scannable text, and a final slide with a soft call to action.",
      },
      {
        n: 13,
        title: "Repurpose a YouTube video into posts",
        website: "YouTube — the video",
        prompt: "Read the transcript on this video page and pull 3 short-form post ideas from it. For each, give me a hook and the 2-3 key points to cover.",
      },
      {
        n: 14,
        title: "Write a poll or question sticker",
        website: "Instagram — your Stories",
        prompt: "Based on this post topic, give me 5 Instagram Story poll or question-sticker prompts that would get my audience tapping and replying. Keep them light and easy to answer.",
      },
      {
        n: 15,
        title: "Comment like a human on others' posts",
        website: "Instagram — the post you're commenting on",
        prompt: "Read this post and draft 3 genuine comment options that actually add something, not just 'love this.' Keep each to one or two sentences in a friendly, natural tone.",
      },
      {
        n: 16,
        title: "Write a 'save this' educational post",
        website: "Instagram — open to post (or the topic's page)",
        prompt: "Based on this topic, write a save-worthy educational post for buyers or sellers: a clear title, 3 to 5 quick tips, and a line telling them to save it for later. Keep it skimmable.",
      },
      {
        n: 17,
        title: "Handle a tough comment two ways",
        website: "Instagram — the comment on your post",
        prompt: "Read this comment on my post. Draft a calm, classy reply that keeps my brand warm, and give me two versions, one friendly and one firm, so I can pick the tone.",
      },
    ],
  },
  {
    id: "crm-follow-up",
    name: "CRM & Database Follow-Up",
    covers: "Nurture sequences, re-engagement, database work",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 18,
        title: "Re-engage cold leads",
        website: "Your CRM — the lead's record (Follow Up Boss, kvCORE, Lofty, BoldTrail)",
        prompt: "Look at this lead's profile and notes and draft a warm re-engagement message that doesn't feel like a chase. Reference something specific to them, keep it under 100 words, and end with one easy next step.",
      },
      {
        n: 19,
        title: "Personalized first touch from notes",
        website: "Your CRM — the contact's notes",
        prompt: "Read the notes on this contact and write a first-touch email that references something specific to them. Keep it short and friendly, and close with a low-pressure invitation to talk.",
      },
      {
        n: 20,
        title: "Home anniversary check-ins",
        website: "Your CRM — the past buyer's record",
        prompt: "Here's this past buyer's record. Write a short, warm 'happy home anniversary' note that feels personal, mentions their home or neighborhood if it's in the notes, and asks for nothing in return.",
      },
      {
        n: 21,
        title: "Build a 5-email nurture sequence",
        website: "Your CRM — the new lead's record",
        prompt: "For a new buyer lead like the one on this screen, draft a 5-email nurture sequence over 3 weeks. Give each email a subject line and short body, moving from helpful to a soft invite to connect.",
      },
      {
        n: 22,
        title: "Soft 'still looking?' nudge",
        website: "Your CRM — the lead's activity feed",
        prompt: "Read this lead's last activity and draft a low-pressure 'are you still looking?' message. Keep it to a few lines, friendly, and easy to reply to with a yes or no.",
      },
      {
        n: 23,
        title: "Segment and message a tagged list",
        website: "Your CRM — the tagged or smart list",
        prompt: "Look at this list of past clients and draft a check-in template I can lightly personalize for each. Leave clear blanks for their name and one personal detail, and keep the tone warm and casual.",
      },
      {
        n: 24,
        title: "Turn call notes into next steps",
        website: "Your CRM — the contact's notes",
        prompt: "Here are my notes from this call. Turn them into 3 clear follow-up actions for me, plus a short recap email to the client confirming what we discussed and what happens next.",
      },
      {
        n: 25,
        title: "Birthday and life-event touches",
        website: "Your CRM — the contact's record",
        prompt: "Based on this contact's details, write a short birthday message that sounds like me, not a greeting card. One or two warm lines, no sales pitch.",
      },
      {
        n: 26,
        title: "Win back a client who ghosted",
        website: "Your CRM or Gmail — the conversation thread",
        prompt: "Read this thread and draft a no-guilt message to reconnect with a client who went quiet. Keep it light, take the pressure off, and give them an easy way back in.",
      },
      {
        n: 27,
        title: "Turn a lead form into a warm reply",
        website: "Your CRM or the portal (Zillow, Realtor.com / Realtor.ca) — the lead",
        prompt: "Here's the lead form on this page. Draft a reply that answers their question, shows I actually read it, and suggests one simple next step. Keep it short and human.",
      },
      {
        n: 28,
        title: "Prioritize the pipeline",
        website: "Your CRM — your leads / pipeline view",
        prompt: "Look at these leads and sort them into hot, warm, and cold based on what's here. Tell me who to contact first and give me a one-line reason for each.",
      },
      {
        n: 29,
        title: "Draft a quarterly sphere email",
        website: "Your CRM or Gmail",
        prompt: "Write a quarterly stay-in-touch email for my past clients that leads with something useful, like a tip or market note, and asks for nothing. Keep it warm, short, and skimmable.",
      },
      {
        n: 30,
        title: "Referral ask that isn't awkward",
        website: "Your CRM — the client's record",
        prompt: "Read this happy client's record and draft a natural referral request I could send after a great closing. Make it feel like a thank-you first, and keep the ask soft and specific.",
      },
      {
        n: 31,
        title: "Follow up after an open house",
        website: "Your CRM — the open house sign-in list",
        prompt: "Here's the open house sign-in list on this page. Draft a friendly same-day follow-up that thanks attendees, offers to answer questions, and mentions I can send similar listings.",
      },
      {
        n: 32,
        title: "Set up a new-lead auto-reply",
        website: "Your CRM — lead settings or a sample lead",
        prompt: "Based on a lead like this, write a friendly instant auto-reply I can save: thank them, set expectations for when I'll follow up, and give one helpful next step or link.",
      },
      {
        n: 33,
        title: "Seasonal 'let's reconnect' touch",
        website: "Your CRM — your past-client list",
        prompt: "Write a short seasonal check-in for my past clients (spring market, holidays, new year) that feels warm and human, shares one useful nugget, and asks for nothing.",
      },
    ],
  },
  {
    id: "listings-marketing",
    name: "Listings & Property Marketing",
    covers: "Descriptions, just-listed content, lifestyle angles",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 34,
        title: "Write a listing description",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Read this MLS listing and write a 150-word public description in a warm, honest tone with no hype. Start with the feeling of the home, then the standout features, then the neighborhood, and give me two versions.",
      },
      {
        n: 35,
        title: "Full just-listed content pack",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "From this listing, write me three things: a just-listed Instagram caption with a strong hook, a short email blast, and a text I can send my sphere. Keep everything warm and easy to skim.",
      },
      {
        n: 36,
        title: "Study a competitor's listing",
        website: "Zillow or Realtor.com / Realtor.ca — the competitor's listing",
        prompt: "Look at this competitor's listing and tell me what their photos and copy do well and where there's a gap. Give me 3 specific things I could do better on my next one.",
      },
      {
        n: 37,
        title: "Lifestyle marketing angles",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Read this listing and give me 3 lifestyle angles to market it beyond the features: who would love living here and why. For each, add a one-line caption idea.",
      },
      {
        n: 38,
        title: "Open house invite",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Turn the details on this listing into a warm open house invite for social and email. Include placeholders for date and time, a reason to come, and a friendly close.",
      },
      {
        n: 39,
        title: "Price-reduction announcement",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "This listing just had a price drop. Write a post and a short email that frame it as a fresh opportunity, not desperation, and create a little urgency without pressure.",
      },
      {
        n: 40,
        title: "Under-contract / pending post",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Write a short 'under contract' post for this listing that still markets me to future sellers. Keep it warm, grateful, and confident, with a soft line inviting others thinking of selling.",
      },
      {
        n: 41,
        title: "Just-sold post that wins sellers",
        website: "Your MLS or Realtor.com / Realtor.ca — the sold listing",
        prompt: "From this sold listing, write a just-sold post aimed at nearby homeowners. Celebrate the result, hint at what it means for their home's value, and invite a no-pressure conversation.",
      },
      {
        n: 42,
        title: "Neighborhood spotlight for a listing",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Based on this listing's location, write a neighborhood spotlight a relocating buyer would love. Cover the feel of the area, a few local highlights, and who it suits best, in a warm and honest tone.",
      },
      {
        n: 43,
        title: "Feature sheet from a listing",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "Read this listing and draft a clean one-page feature sheet in plain language for the open house table. Use short sections a buyer can scan in 20 seconds.",
      },
      {
        n: 44,
        title: "Reel script walking the home",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page (with photos)",
        prompt: "Write me a 30-second Reel script touring this listing room by room. Start with a scroll-stopping hook, give me the line to say for each room, and end with a simple call to action.",
      },
      {
        n: 45,
        title: "Email to buyers who match",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "This is my new listing. Draft an email to buyer leads who might be a fit. Lead with why it matches what they're after, keep it short, and invite them to see it.",
      },
      {
        n: 46,
        title: "Rewrite a dry builder description",
        website: "The builder's or listing's web page",
        prompt: "This new-construction description is flat. Rewrite it in about 120 words so a real family can picture living there: warm, specific, and about the life inside, not just the finishes.",
      },
      {
        n: 47,
        title: "Coming-soon teaser",
        website: "Your MLS — your draft or coming-soon listing",
        prompt: "From this listing, write a coming-soon teaser post that builds anticipation without the full reveal. Tease the best feature, keep it short, and tell people how to get early access.",
      },
      {
        n: 48,
        title: "Open house recap post",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "From this listing, write a warm 'thanks for coming' open house recap that keeps momentum: mention the turnout, note it's still available, and invite anyone still interested to reach out.",
      },
      {
        n: 49,
        title: "Listing email to my sphere",
        website: "Your MLS or Realtor.com / Realtor.ca — the listing page",
        prompt: "From this listing, write a short, personal email to my sphere asking them to think of anyone who'd love this home. Make it feel like a note from a friend, not a mass blast.",
      },
    ],
  },
  {
    id: "lead-gen",
    name: "Lead Generation & Prospecting",
    covers: "FSBO, expired, referral partners, warm outreach",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 50,
        title: "FSBO outreach",
        website: "Zillow, Facebook Marketplace, Craigslist, or Kijiji (Canada) — the FSBO listing",
        prompt: "Read this for-sale-by-owner listing and draft a respectful, helpful outreach message. Acknowledge they're doing it themselves, offer one genuinely useful thing, and keep any pitch soft and brief.",
      },
      {
        n: 51,
        title: "Expired listing outreach",
        website: "Your MLS — your expired listings",
        prompt: "Here's this expired listing. Write an outreach note that acknowledges their frustration without blame, offers a fresh perspective, and invites a low-pressure chat. Keep it warm and short.",
      },
      {
        n: 52,
        title: "Find a real connection point",
        website: "The lead's public profile (Instagram, Facebook, LinkedIn)",
        prompt: "Read this lead's public profile and find one genuine, non-creepy thing I could mention to break the ice. Then draft a short opening message that uses it naturally.",
      },
      {
        n: 53,
        title: "Relocation forum reply",
        website: "The relocation forum or thread (Reddit, City-Data)",
        prompt: "Read this relocation thread and draft a helpful reply that answers their question first and positions me as the local expert. Mention I'm an agent only at the end, and keep it useful, not salesy.",
      },
      {
        n: 54,
        title: "Referral-partner intro",
        website: "The local business's website or Google profile",
        prompt: "Look at this local business's page and draft a friendly intro proposing we refer clients to each other. Lead with what's in it for them, keep it casual, and suggest a quick coffee or call.",
      },
      {
        n: 55,
        title: "Reddit / community helpful reply",
        website: "Reddit — the thread",
        prompt: "Read this post and draft a genuinely useful reply. Answer the question fully, sound like a helpful human, and mention I'm a local agent only in a light closing line.",
      },
      {
        n: 56,
        title: "Warm up a new follower",
        website: "Instagram — the new follower's profile",
        prompt: "Here's this new follower's profile. Draft a low-key welcome DM that starts a real conversation, references something from their profile, and asks an easy question. No pitch.",
      },
      {
        n: 57,
        title: "Open house neighbor invites",
        website: "Realtor.com / Realtor.ca or Google Maps — the listing's address",
        prompt: "From this listing's address, draft a short 'you're invited' note I can hand-deliver to neighbors. Make it friendly, mention the open house, and invite them to bring a friend who might be looking.",
      },
      {
        n: 58,
        title: "Reconnect with a lead who bought elsewhere",
        website: "Your CRM — the old lead's record",
        prompt: "Read this old lead who went another direction or paused. Draft a gracious, no-hard-feelings check-in that keeps the door open for the future.",
      },
    ],
  },
  {
    id: "client-email",
    name: "Client Communication & Email",
    covers: "Client replies, updates, tough conversations",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 59,
        title: "Reply to a long client thread",
        website: "Gmail or Outlook — the email thread",
        prompt: "Read this email thread and draft a calm, clear reply that answers every question they raised. Use short paragraphs, confirm the next steps, and keep the tone reassuring.",
      },
      {
        n: 60,
        title: "Summarize a messy negotiation",
        website: "Gmail — the negotiation thread",
        prompt: "This is a confusing back-and-forth on inspection. Summarize where things actually stand in plain language for me, then draft a short update I can send the client.",
      },
      {
        n: 61,
        title: "'What happens next' email",
        website: "Gmail — reply to the buyer",
        prompt: "We just had an offer accepted. Write the 'here's what happens next' email for the buyer, laying out the next steps and key dates in simple, calm language so they feel taken care of.",
      },
      {
        n: 62,
        title: "Turn a voice note into actions",
        website: "Gmail — paste the voice-note transcript",
        prompt: "Here's the transcript of my client's voice note. Turn it into a tidy list of what they need and what I'll do, then draft a two-line reply confirming I'm on it.",
      },
      {
        n: 63,
        title: "Explain a delay without alarm",
        website: "Gmail — the client thread",
        prompt: "Draft an email telling my client the closing is delayed by about a week. Keep it calm and reassuring, explain the next step, and make clear I'm handling it.",
      },
      {
        n: 64,
        title: "Set expectations on a tough market",
        website: "Gmail — the buyer thread",
        prompt: "Write an honest but hopeful email preparing a buyer for a competitive market. Be straight about what to expect, give them a couple of things they can control, and end on an encouraging note.",
      },
      {
        n: 65,
        title: "Reply to an upset client",
        website: "Gmail — the client's email",
        prompt: "Read this angry email and draft a grounded, non-defensive reply that de-escalates. Acknowledge their frustration first, then calmly lay out how we fix it, and keep it short.",
      },
      {
        n: 66,
        title: "Weekly seller update",
        website: "Gmail or your CRM — the seller thread",
        prompt: "Write a weekly update email for a seller whose listing is getting showings but no offers yet. Share what's happening, what we're learning, and the next step, in a calm and confident tone.",
      },
      {
        n: 67,
        title: "Answer a buyer's list of questions",
        website: "Gmail — the buyer's email",
        prompt: "My buyer sent these questions. Draft clear, reassuring answers in plain language, and flag anything I should double-check before I hit send.",
      },
    ],
  },
  {
    id: "docs-transactions",
    name: "Documents & Transactions",
    covers: "Inspection reports, contracts, strata docs, disclosures",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 68,
        title: "Inspection report to client checklist",
        website: "The inspection report PDF (open in Chrome from Gmail, Drive, or Dotloop)",
        prompt: "Read this home inspection report and turn it into a plain-English checklist for my client, sorted by urgency: must-address, should-look-at, minor. Keep the language simple and non-alarming.",
      },
      {
        n: 69,
        title: "Pull deadlines from a listing agreement",
        website: "The listing agreement PDF (Dotloop, SkySlope, DocuSign)",
        prompt: "Read this listing agreement and pull out every date, deadline, and commitment I need to track. Put them in order and flag anything time-sensitive.",
      },
      {
        n: 70,
        title: "Strata / HOA docs into buyer notes",
        website: "The strata / HOA document PDF",
        prompt: "Read this strata document package and summarize what a buyer should really know before committing: fees, rules, red flags, and upcoming costs. Keep it clear and honest.",
      },
      {
        n: 71,
        title: "Sanity-check a closing disclosure",
        website: "The closing statement PDF (Closing Disclosure in the US; Statement of Adjustments in Canada)",
        prompt: "Read this closing disclosure and flag anything worth double-checking before we sign, like fees that look off or numbers that don't match. Explain each flag in one plain sentence.",
      },
      {
        n: 72,
        title: "Explain a scary clause simply",
        website: "The contract PDF (Dotloop, DocuSign)",
        prompt: "Read this contract clause and explain what it actually means for my client in plain language. Tell me the practical risk or benefit and whether it's standard.",
      },
      {
        n: 73,
        title: "Contract summary for the client",
        website: "The contract PDF",
        prompt: "Summarize the key terms of this contract for my client in a short, friendly email: price, dates, conditions, and what they need to do next.",
      },
      {
        n: 74,
        title: "Compare two offers",
        website: "The two offer PDFs (open in two tabs)",
        prompt: "Here are two offers open in these tabs. Make me a side-by-side of the pros and cons for my seller, covering price, conditions, timeline, and risk, and give me a plain-language bottom line.",
      },
      {
        n: 75,
        title: "Build a closing-day checklist",
        website: "Your transaction page (Dotloop, SkySlope)",
        prompt: "From this transaction page, build a closing-day checklist so nothing slips: documents, funds, keys, utilities, and final steps, in the order they need to happen.",
      },
      {
        n: 76,
        title: "Turn an appraisal into talking points",
        website: "The appraisal PDF",
        prompt: "Read this appraisal. Summarize what it means for my client in plain language and give me 3 talking points for our next call.",
      },
    ],
  },
  {
    id: "market-research",
    name: "Market Research & Local Data",
    covers: "Pricing stories, market updates, neighborhood data",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 77,
        title: "Pricing story from recent solds",
        website: "Your MLS sold listings (or Realtor.com / Realtor.ca / HouseSigma in Canada)",
        prompt: "Look at these recent sold listings and help me build a simple pricing story for my seller. Point out the most comparable sales and give me a defensible range with the reasoning in plain words.",
      },
      {
        n: 78,
        title: "Translate an assessment page",
        website: "The property assessment authority for your area (county, city, or provincial assessment office)",
        prompt: "Read this assessment page and explain what it means for the homeowner in plain language, including why it may differ from market value. Keep it to a few simple points.",
      },
      {
        n: 79,
        title: "Weekly market-update post",
        website: "Your MLS or local board inventory report",
        prompt: "Look at this inventory report and write a short, non-boring market-update post for this week. Lead with one clear takeaway, keep the numbers light, and end with what it means for buyers or sellers.",
      },
      {
        n: 80,
        title: "Cost-of-living snapshot",
        website: "Numbeo or the city / municipality website",
        prompt: "Based on this neighborhood page, build a relocation buyer's cost-of-living snapshot covering housing, the general vibe, and a few everyday costs. Keep it skimmable.",
      },
      {
        n: 81,
        title: "Compare two neighborhoods",
        website: "The two neighborhood pages (Realtor.com / Realtor.ca, Niche, municipality)",
        prompt: "Here are two neighborhood pages. Compare them for a family deciding between the two: feel, amenities, commute, and who each suits best. End with a simple summary.",
      },
      {
        n: 82,
        title: "Days-on-market talking points",
        website: "Your MLS market stats (or HouseSigma in Canada)",
        prompt: "Read this market stats page and give me 3 talking points about days-on-market I can use with sellers to set realistic expectations. Keep each short and conversational.",
      },
      {
        n: 83,
        title: "Spot a trend to post about",
        website: "Your MLS stats page or local board report",
        prompt: "Look at this data and find one trend worth turning into a post that shows I'm paying attention. Give me the takeaway plus a hook to open the post.",
      },
    ],
  },
  {
    id: "reviews",
    name: "Reviews & Reputation",
    covers: "Google review replies, requests, testimonials",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 84,
        title: "Reply to every Google review",
        website: "Google Business Profile — your reviews",
        prompt: "Read my Google reviews on this page and draft a warm, personal reply to each. Reference something specific they said, keep each reply short, and vary the wording so they don't feel templated.",
      },
      {
        n: 85,
        title: "Draft review-request emails",
        website: "Your CRM or Gmail — past clients",
        prompt: "Look at these past clients and draft a personal review request email for each that's easy to say yes to. Thank them first, make the ask specific and quick, and include a line on where to leave it.",
      },
      {
        n: 86,
        title: "Turn a review into a post",
        website: "A Google review (or Zillow in the US), then Instagram to post",
        prompt: "Take this 5-star review and turn it into a social post that highlights the client's experience, not my ego. Keep it warm, add a short reflection from me, and a soft closing line.",
      },
      {
        n: 87,
        title: "Respond to a critical review",
        website: "Google Business Profile (or Zillow in the US) — the review",
        prompt: "Read this less-than-great review and draft a gracious, professional reply that shows I listen. Acknowledge their experience, avoid defensiveness, and offer to make it right offline.",
      },
      {
        n: 88,
        title: "Testimonial page copy",
        website: "Your Google reviews (and Zillow in the US)",
        prompt: "From these reviews, write a short testimonials section for my website in a warm, human tone. Pull the best lines, group them if it helps, and keep it easy to scan.",
      },
      {
        n: 89,
        title: "Review request after a bumpy-but-good deal",
        website: "Your CRM or Gmail — the client's record",
        prompt: "This deal had some bumps but ended well. Draft a genuine review request that acknowledges the journey and makes it easy for them to say something honest.",
      },
    ],
  },
  {
    id: "admin",
    name: "Admin & Productivity",
    covers: "Weekly planning, inbox triage, reusable templates",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 90,
        title: "Plan the week from the calendar",
        website: "Google Calendar — your week",
        prompt: "Read my calendar for this week and draft a realistic daily plan that leaves room to breathe. Batch similar tasks, protect time for follow-up, and flag anything that looks overloaded.",
      },
      {
        n: 91,
        title: "Triage the inbox",
        website: "Gmail — your inbox",
        prompt: "Look at my inbox and sort these into 'reply today,' 'reply this week,' and 'ignore.' For the reply-today ones, give me a one-line draft so I can move fast.",
      },
      {
        n: 92,
        title: "Webinar page into action steps",
        website: "The training or webinar page (YouTube, course platform)",
        prompt: "I'm watching this training. Turn the key points into short notes and 3 things I can actually do this week, in order of easiest to hardest.",
      },
      {
        n: 93,
        title: "Draft a template I'll reuse",
        website: "Gmail or Google Docs — to save the template",
        prompt: "Help me build a reusable open house follow-up template I can tweak each time. Leave clear blanks for the details, keep the tone warm, and make it short enough that I'll actually use it.",
      },
      {
        n: 94,
        title: "Summarize a long article",
        website: "The article web page",
        prompt: "Read this article and give me the 5 things I actually need to know in under a minute, plus one sentence on why each matters to my business.",
      },
      {
        n: 95,
        title: "Prep for a listing appointment",
        website: "Your MLS listing + the neighborhood page",
        prompt: "Based on this listing and neighborhood, help me prep talking points for my listing appointment: pricing angle, marketing plan highlights, and two questions to ask the seller. Keep it to one page.",
      },
    ],
  },
  {
    id: "learning",
    name: "Learning & Confidence",
    covers: "Role-play, confidence, decoding jargon",
    tip: "any prompt gets better when you add two things of your own — a little context (“this buyer is nervous and on a budget”) and what you want back (“keep it to 100 words,” “give me three options”). #",
    scenarios: [
      {
        n: 96,
        title: "Role-play a pricing objection",
        website: "Your MLS comps (or HouseSigma in Canada) — the comparable sales",
        prompt: "Pull up my comparable sales for this listing, then play a seller who's convinced their home is worth more than the comps. Use the real numbers on the screen to push back like a real person, and afterward tell me what I did well and what to tighten.",
      },
      {
        n: 97,
        title: "Understand why content works",
        website: "Instagram — the top agent's post",
        prompt: "Look at this top agent's post and explain why it works: the hook, the structure, the emotion. Then give me a simple way to do my own version without copying it.",
      },
      {
        n: 98,
        title: "Decode industry jargon",
        website: "The page with the term (a contract PDF, MLS listing, or article)",
        prompt: "Explain this term on the page like I'm brand new to real estate, with a quick everyday example so it actually sticks.",
      },
      {
        n: 99,
        title: "Practice a hard conversation",
        website: "Your MLS — the listing's showing activity and days on market",
        prompt: "Look at this listing's showing activity and days on market, then play the seller while I practice recommending a price reduction using the real numbers here. React like a real person, and after, give me one tweak to sound more confident.",
      },
      {
        n: 100,
        title: "Build confidence before a call",
        website: "Your CRM — the buyer's record",
        prompt: "Open this buyer's record and, based on what's in their notes, give me 3 things to remember, a warm opening line, and one question that will put them at ease before I call them in the next hour.",
      },
    ],
  },
  {
    id: "bonus-advanced",
    name: "Bonus: Advanced Workflows",
    covers: "Multi-step workflows: research, build, and take action end-to-end",
    tip: "these chain several steps — research, writing, and doing — into one request. They shine when your tools are connected (CRM, email, messaging), and Claude will always show you everything to approve before it sends anything on your behalf. #",
    scenarios: [
      {
        n: 101,
        title: "Open house invite + top-agent outreach blast",
        website: "The listing page, then Realtor.com / Realtor.ca / Google to research agents",
        prompt: "Write an open house invite for the listing on this page. Then research the most active agents who sell in this neighborhood, build me a list of up to 50 with their name, brokerage, and public contact info, and draft a short, personalized invite to each. Show me the list and the messages to approve before anything sends.",
      },
      {
        n: 102,
        title: "Full new-listing launch kit",
        website: "The listing page + your MLS comps",
        prompt: "Take this new listing and build the whole launch: pull 3 to 5 comparable sales to support the price, then write the MLS description, a just-listed caption, an email to my sphere, and a 30-second Reel script, and lay it all out in a day-by-day posting schedule for the first week.",
      },
      {
        n: 103,
        title: "Buyer home-match shortlist",
        website: "Realtor.com / Realtor.ca, Zillow, or your MLS",
        prompt: "Here's my buyer's criteria (budget, area, must-haves). Search the listing portals, shortlist up to 10 homes that fit, and for each give me a quick pros-and-cons and why it matches. Then draft an email to my buyer with the shortlist and a suggested showing plan.",
      },
      {
        n: 104,
        title: "Neighborhood farm campaign",
        website: "Your MLS turnover data + the neighborhood on Realtor.com / Realtor.ca",
        prompt: "I want to farm this neighborhood. Research recent sales and turnover, build a picture of who's likely to sell, and create a 3-touch campaign: a market-update mailer, a follow-up postcard, and a short video script, all speaking directly to owners here.",
      },
      {
        n: 105,
        title: "Competitor teardown + positioning plan",
        website: "Competitors' websites + their Instagram profiles",
        prompt: "Research the top 5 agents who dominate my market. Look at their sites and socials and summarize how they position themselves, what they post and how often, and where the gaps are. Then give me a positioning angle and a 30-day content plan to stand apart.",
      },
      {
        n: 106,
        title: "Sphere reactivation campaign",
        website: "Your CRM — your contacts",
        prompt: "Go through my past clients and contacts, group them by how long it's been since we talked, and draft a tailored re-engagement message for each group. Then give me a schedule to send them over two weeks so I'm not blasting everyone at once.",
      },
      {
        n: 107,
        title: "Daily expired & FSBO hunt",
        website: "Your MLS expireds + Zillow / Facebook Marketplace / Kijiji FSBOs",
        prompt: "Each morning, scan the portals for new expired listings and for-sale-by-owners in my area. Compile them with address, price, and days on market, and draft a custom, respectful outreach message for each so I can start my calls with everything ready.",
      },
      {
        n: 108,
        title: "Relocation buyer guide + welcome",
        website: "The neighborhood pages (Realtor.com / Realtor.ca, Niche) + the city site",
        prompt: "A buyer is relocating to my area. Research the neighborhoods, schools, commute times, and cost of living, then build a branded relocation guide comparing the best-fit areas for their situation, plus a warm welcome email introducing myself and the guide.",
      },
      {
        n: 109,
        title: "Listing appointment dossier",
        website: "The property on your MLS + your assessment site + comps",
        prompt: "I have a listing appointment at this address. Research the property's sale history, current comparable sales, and the neighborhood trend, then build a one-page dossier with a pricing range, a marketing plan summary, likely seller objections with my responses, and three smart questions to ask them.",
      },
      {
        n: 110,
        title: "Reputation sweep + review engine",
        website: "Google Business Profile + Zillow (US) + your socials",
        prompt: "Find all my reviews across Google, Zillow, and my socials. Summarize the themes people mention, draft warm replies to any I haven't answered, and draft personal review requests to my recent clients who haven't left one yet.",
      },
      {
        n: 111,
        title: "Content repurposing engine",
        website: "YouTube or your podcast page — the episode",
        prompt: "Take my latest video or podcast episode on this page. Turn it into 5 Reel scripts, 5 captions, 3 short emails, and one blog post, all in my voice, then organize them into a two-week content calendar so I know what to post when.",
      },
      {
        n: 112,
        title: "Just-sold farming push",
        website: "The sold listing + your MLS neighborhood data",
        prompt: "I just closed this address. Research the nearby homeowners most likely to sell next, write a just-sold post that markets the result, and draft a personal note to those owners letting them know what their home might be worth now.",
      },
      {
        n: 113,
        title: "Open house follow-up automation",
        website: "Your open house sign-in list or CRM + public profiles",
        prompt: "Here's my open house sign-in sheet. For each attendee, pull what you can find publicly, sort them into hot, warm, and cold, then draft a tailored follow-up for each and give me a reminder schedule so nobody falls through the cracks.",
      },
      {
        n: 114,
        title: "Monthly market report + distribution",
        website: "Your MLS or local board stats",
        prompt: "Pull this month's key stats for my market, build a clean, branded one-page market report, then draft the email and two social posts to send it out, plus a short list of past clients who'd find it most useful.",
      },
    ],
  },
];

export const CHROME_SCENARIO_COUNT = CHROME_CATEGORIES.reduce(
  (n, c) => n + c.scenarios.length,
  0
);

