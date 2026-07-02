import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  ShoppingBag, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Users, 
  Copy, 
  Check, 
  AlertTriangle,
  Award,
  DollarSign,
  Zap,
  TrendingUp,
  Flame,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  Video,
  Coins,
  Mail,
  Radio,
  Settings,
  LayoutDashboard,
  Link,
  Tag,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import InteractiveMarketingSimulation from './InteractiveMarketingSimulation';

interface BattleCard {
  painPoint: string;
  technicalEdge: string;
  competitors: string;
  competitorCost: string;
  nexusSetup: string;
  nexusCost: string;
  roiAdvantage: string;
}

interface ScriptStep {
  time: string;
  direction: string;
  audio: string;
}

interface ModuleMarketingData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  badge: string;
  battlecard: BattleCard;
  script: {
    hook: string;
    steps: ScriptStep[];
    cta: string;
  };
}

const englishTranslations: Record<string, {
  title?: string;
  subtitle?: string;
  badge?: string;
  battlecard?: {
    painPoint?: string;
    technicalEdge?: string;
    competitors?: string;
    competitorCost?: string;
    nexusSetup?: string;
    nexusCost?: string;
    roiAdvantage?: string;
  };
  script?: {
    hook?: string;
    steps?: Array<{
      time?: string;
      direction?: string;
      audio?: string;
    }>;
    cta?: string;
  };
}> = {
  security: {
    title: 'Security Shield',
    subtitle: 'Ultra-high fidelity asynchronous security without server overhead.',
    badge: 'Zero Overhead',
    battlecard: {
      painPoint: 'Traditional WordPress security plugins (Wordfence, Sucuri) run heavy scans directly on your hosting server, crushing mobile page speed (TTFB) and consuming up to 80% CPU.',
      technicalEdge: 'Asynchronous filtering offloaded to the Nexus AI Cloud. Sensitive brute-force and SQL protection logs are written to a remote SQLite database to keep WooCommerce databases clean.',
      competitors: 'Wordfence Premium, Sucuri Cloud, iThemes Security Pro',
      competitorCost: '€40 to €99 per month per website',
      nexusSetup: 'Zero heavy local plugins. 1-click setup via our lightweight WPCode proxy that bans malicious IPs on the cloud border.',
      nexusCost: 'Included in the Nexus Lifetime Deal (€199 lifetime)',
      roiAdvantage: 'Save €480+ annually, experience +15-20% immediate mobile speed improvement, and enjoy real-time protection against scrapers.'
    },
    script: {
      hook: '“Stop killing your WooCommerce speed with Wordfence!” 🛑',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a sluggish WooCommerce mobile screen with a red Google PageSpeed score (e.g., 34/100) and look frustrated.', audio: 'If your WooCommerce store takes more than 3 seconds to load, you lose half your sales. And the culprit? Often your heavy security plugin draining server resources.' },
        { time: '00:05 - 00:15', direction: 'Zoom into the sleek dark Security Shield dashboard showing waves of blocked IPs in real-time.', audio: 'Wordfence or Sucuri run locally and kill your CPU. With Nexus, filtering is offloaded to our ultra-fast Cloud. Zero slowdowns, 100% protection.' },
        { time: '00:15 - 00:25', direction: 'Show the comparison table: Wordfence vs Nexus Shield.', audio: 'Bots and brute force attacks are blocked at the border before touching your server, with logs sent to a secure SQLite database.' }
      ],
      cta: 'Click the link in bio to ditch obsolete security fees and secure your store for life!'
    }
  },
  social: {
    title: 'Nexus Social Studio',
    subtitle: 'High-converting AIDA video creator for social proof and promotions.',
    badge: '1-Click Video Studio',
    battlecard: {
      painPoint: 'Creating promotional videos, writing scripts, hiring voice-over professionals, and editing on Premiere Pro takes hours for every product, costing hundreds daily.',
      technicalEdge: '1-click generation of vertical videos using the proven AIDA marketing framework. Realistic AI voices (Antoni, Rachel, Bella) and direct MP4 export with no external dependencies.',
      competitors: 'Hootsuite, Metricool, Canva Premium + ElevenLabs',
      competitorCost: '€30 to €90 per month subscription',
      nexusSetup: 'No API keys required. Analyzes product descriptions and images to render transitions and generate lifelike voice-overs.',
      nexusCost: 'Included with zero per-word or per-video fees',
      roiAdvantage: 'Eliminate Canva and ElevenLabs subscriptions. Save €850+/yr and publish up to 10 product videos daily to TikTok/Reels.'
    },
    script: {
      hook: '“Generate professional sales videos in 1-click straight from WooCommerce!” 🎥',
      steps: [
        { time: '00:00 - 00:05', direction: 'Scroll through viral product videos on TikTok with glowing animated text overlays.', audio: 'Want to separate the stores making €500 a day from those stuck at zero? It is the sheer volume of vertical videos they post on TikTok and Reels.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus Social Studio workspace. Select a product, click "Generate AIDA Video", and choose voice "Bella".', audio: 'Instead of spending hours on Premiere Pro or paying for ElevenLabs, select your product in Nexus Social. In one click, our AI drafts the copywriting, times images, and speaks with a human voice.' },
        { time: '00:15 - 00:25', direction: 'Click download to save the MP4 video, showing animated subtitles matching the audio.', audio: 'Choose between Antoni for professional authority, Rachel for high energy, or Bella for warmth. All rendered in the cloud to convert traffic immediately.' }
      ],
      cta: 'Do not miss the autonomous commerce wave. Claim your lifetime access to Nexus Social today!'
    }
  },
  'smart-feed': {
    title: 'Smart Feed & Market Intelligence',
    subtitle: 'Offloaded Google Shopping feed generator and competitor monitoring radar.',
    badge: 'Network Target',
    battlecard: {
      painPoint: 'Generating massive XML feeds for Google Shopping or Facebook Ads slows down WordPress. Additionally, active competitor price monitoring is extremely expensive.',
      technicalEdge: 'Asynchronous XML feed creation offloaded from WordPress to bypass PHP lag. Built-in silent background scrapers monitor competitor catalogs to map price differences.',
      competitors: 'Heavy local XML Feed plugins + SEMRush, SpyFu, Sniffie',
      competitorCost: '€120 to €250 per month',
      nexusSetup: 'Input competitor target URLs in the dashboard and sync Google Merchant Center directly without slow SQL queries.',
      nexusCost: 'Included with no additional subscription fees',
      roiAdvantage: 'Increase Google Shopping CTR by +34% with dynamic price-matching to your competition. Save over €1,400/yr in SEO/Scraping suites.'
    },
    script: {
      hook: '“Stop sending sales to your competitors on Google Shopping!” 🛒',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show search results with adjacent products showing different prices. Highlight the cheaper option.', audio: 'In Google Shopping, a price gap of just €2 is enough for buyers to ignore your store completely and click on your competitor.' },
        { time: '00:05 - 00:15', direction: 'Show Nexus Market Intelligence table with live updates and red/green indicators for price matches.', audio: 'Our built-in async competitive web scraper solves this. Set your competitors URL and let Nexus explore their catalogs in under 30 seconds to decode their pricing.' },
        { time: '00:15 - 00:25', direction: 'Show the XML feed generating with the click of a button, scrolling fluently through product ranges.', audio: 'Generate fully-compliant Google Shopping & Facebook Ads feeds, and use automatic rules to apply psychological price adjustments.' }
      ],
      cta: 'Outsmart your competitors. Join the Nexus AI ecosystem and dominate Google Shopping today!'
    }
  },
  forecast: {
    title: 'Stock Analysis & Forecast',
    subtitle: 'Predictive machine learning to prevent stock-outs and optimize cash flow.',
    badge: 'Cash Flow Pilot',
    battlecard: {
      painPoint: 'Stock-outs interrupt revenue and harm hard-earned Google organic search rankings, while overstocking ties down invaluable business capital.',
      technicalEdge: 'Custom predictive algorithms analyze local WooCommerce sales cycles alongside seasonal trends to determine exact reorder points at T-45 days.',
      competitors: 'Inventory Planner, StockTrim, high-end custom ERPs',
      competitorCost: '€150 to €400 per month',
      nexusSetup: 'Instant sync with WooCommerce catalog to generate automated purchase guides and accurate capital estimations.',
      nexusCost: 'Included for life in your package',
      roiAdvantage: 'Reduce unsold stock by 50% while recovering lost sales from depleted inventory.'
    },
    script: {
      hook: '“Never lose your top Google rankings to a silly stock-out again!” 📦',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a red "Out of Stock" product page with disappointed customer support emails.', audio: 'Nothing hurts e-merchants more than running out of stock. You lose immediate revenue, and Google downgrades your SEO rankings instantly.' },
        { time: '00:05 - 00:15', direction: 'Show the interactive Nexus Forecast trendline prediction charts projecting forward 45 days.', audio: 'Nexus Forecast processes your historical WooCommerce trends. With our custom machine learning, it predicts sales velocity for the next 45 days.' },
        { time: '00:15 - 00:25', direction: 'Zoom into the automated supplier Purchase Order generated by the system.', audio: 'It tells you exactly what to order, when, and how much cash-flow you need. No more guessing, just data-driven precision.' }
      ],
      cta: 'Protect your margins and run a perfect inventory model. Lock in your lifetime access to Nexus today!'
    }
  },
  content: {
    title: 'SEO Content Machine & Auto-Pilot',
    subtitle: 'Autopilot SEO engine that drives Google indexation and traffic organically.',
    badge: 'SEO Autopilot',
    battlecard: {
      painPoint: 'Writing SEO articles and optimizing product copy takes massive effort, and interlinking pages semantically is a nightmare to manage.',
      technicalEdge: 'AI-powered autopilot indexing engine. Generates high-quality blog posts formatted with beautiful heading structures and binds them with contextual internal links.',
      competitors: 'Yoast Premium, Jasper AI, Surfer SEO, SEMRush Assistant',
      competitorCost: '€90 to €180 per month',
      nexusSetup: 'Connect your store and set your target keywords. Configure publication frequency and let the autopilot work.',
      nexusCost: 'Included with unlimited generation',
      roiAdvantage: 'Boost Google rankings by +120% in 90 days with dozens of uniquely targeted posts interlinked automatically.'
    },
    script: {
      hook: '“Dominate Google search results without writing a single line of text!” ✍️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show an organic traffic chart with a bright green arrow pointing straight up.', audio: 'Ad costs on Facebook and Google are skyrocketing and eating your net profits. The only way to survive is to build a reliable stream of free organic search traffic.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus Content Machine draft interface showing articles complete with H1-H3 title structures.', audio: 'Skip expensive marketing agencies. Turn on Nexus SEO Autopilot, set your keywords, and watch the AI write, structure, and mesh articles together with perfect sementic logic.' },
        { time: '00:15 - 00:25', direction: 'Toggle the visual 3D spider-web interlinking diagram in the dashboard.', audio: 'The system builds the perfect internal linking web to ensure Google Crawlers index your catalog with absolute priority.' }
      ],
      cta: 'Convert web traffic into pure profit. Claim your lifetime VIP Nexus license before our countdown finishes!'
    }
  },
  moderator: {
    title: 'AI Comment Moderator',
    subtitle: 'Turn social media comments into sales using pre-filled baskets and discount links.',
    badge: 'Live Commerce',
    battlecard: {
      painPoint: 'Modrating comments on viral social posts manually is slow, causing you to lose high-intent leads who expect immediate responses.',
      technicalEdge: 'Automated 24/7 social sentiment analysis. Translates comments, checks active WooCommerce product stock, and responds with checkout links.',
      competitors: 'ManyChat custom setups, dedicated social media managers',
      competitorCost: '€49 to €150 per month suite subscriptions',
      nexusSetup: 'Connect your social media profile in the hub, map trigger keywords, and match them directly with your products.',
      nexusCost: 'Included with zero per-lead fees',
      roiAdvantage: 'Convert up to 3x more customers under viral posts without wasting hours typing manual replies.'
    },
    script: {
      hook: '“Stop losing customers in your social media comments!” 💬',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show video comments on a viral video asking "Where can I buy?", "Is this in stock?", "What is the price?"', audio: 'When your video goes viral, that is your Golden Hour. But if you reply manually to comments, you are always too late.' },
        { time: '00:05 - 00:15', direction: 'Show the AI Comment Moderator dashboard, scanning comments and automatically generating personalized answers.', audio: 'Nexus AI Comment Moderator tracks your social comments 24/7. It understands customer intent and matches it instantly with stock levels.' },
        { time: '00:15 - 00:25', direction: 'Show a customer receiving an automatic DM from the account containing a pre-filled cart link.', audio: 'Best of all, it replies with an exclusive discount code and a direct cart link so they can buy in seconds. An automated conversion machine.' }
      ],
      cta: 'Turn every social comment into cold hard cash. Claim your lifetime license today!'
    }
  },
  collab: {
    title: 'Invitations & Team (Collab Hub)',
    subtitle: 'Secure role delegation without risking server credentials or database safety.',
    badge: 'Built-In Privacy',
    battlecard: {
      painPoint: 'Sharing admin logins with freelancers or assistants is highly risky (possible server configuration errors, database leaks, or data loss).',
      technicalEdge: 'Role-based access isolated from the local server. Assistants collaborate on a secure offloaded interface with limited access rights.',
      competitors: 'WP User Role plugins, manual password sharing',
      competitorCost: '€20 to €50 per plugin license',
      nexusSetup: 'Send a secure invite email from the team panel. Assign roles like "SEO Writer" or "Stock Manager" in seconds.',
      nexusCost: 'Included with unlimited team seats',
      roiAdvantage: 'Safely delegate catalog management and content generation, preventing any technical mishaps or data leaks.'
    },
    script: {
      hook: '“Stop giving master credentials to freelancers!” 🔑',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show typing on a keyboard with a bold red padlock graphic indicating lockouts.', audio: 'Handing absolute admin credentials to write articles or update stocks is a security disaster. One wrong click can corrupt your database.' },
        { time: '00:05 - 00:15', direction: 'Show the Team panel sending a limited role invitation to a freelance writer.', audio: 'Nexus isolates worker logins on our cloud. You delegate tasks like SEO writing safely, without allowing them to touch master WordPress configurations.' },
        { time: '00:15 - 00:25', direction: 'Show real-time logging of updates made by team members in the activity history.', audio: 'The team gets things done, and you keep absolute control. Secure, isolated, and completely risk-free.' }
      ],
      cta: 'Assemble your dream team safely. Activate unlimited team workspaces on Nexus lifetime now!'
    }
  },
  finance: {
    title: 'Finance Profit Analyzer',
    subtitle: 'Real-time financial analytics connecting COGS, processor fees, and ad cost.',
    badge: 'Net Margin Tracker',
    battlecard: {
      painPoint: 'Manually calculating net margins across Stripe fees, shipping, taxes, and ad spend is a nightmare. Many sellers sell at a loss without knowing.',
      technicalEdge: 'Instant off-server margin aggregation at each transaction, pooling actual cost of goods (COGS) and dynamic marketing expenses.',
      competitors: 'BeProfit, Lifetimely, Profitario',
      competitorCost: '€49 to €149 per month',
      nexusSetup: 'No complex APIs. Enter your COGS under the product list, and let Nexus solve your real-time net profits.',
      nexusCost: 'Included under your lifetime plan',
      roiAdvantage: 'Stop unprofitable ads within hours. Ensure consistent net margin health across your catalog.'
    },
    script: {
      hook: '“Stop selling products at a loss on WooCommerce!” 💸',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a high revenue dashboard compared to an empty bank account.', audio: 'Revenue is a vanity metric. Do you know how much net cash you actually pocket after subtracting taxes, COGS, Stripe fees, and ads?' },
        { time: '00:05 - 00:15', direction: 'Show the interactive Profit Analyzer chart showing green net income after expenses.', audio: 'Nexus Finance solves this by calculating your exact net profits in real-time. No more spreadsheets or quarterly surprises.' },
        { time: '00:15 - 00:25', direction: 'Show a warning alert next to an active ad campaign showing low net profitability.', audio: 'It flags low-margin items instantly, helping you cut off draining ad campaigns before they burn through your cash.' }
      ],
      cta: 'Gain complete financial control of your business. Purchase your lifetime Nexus deal today!'
    }
  },
  'comm-hub': {
    title: 'Communication Hub',
    subtitle: 'High-deliverability newsletters and email automations with a port-free HTTP proxy.',
    badge: 'Max Deliverability',
    battlecard: {
      painPoint: 'Sending bulk newsletters direct from your server triggers spam filters, and cloud hosting hosts often block SMTP TCP ports completely.',
      technicalEdge: 'Dual email gateway: Standard secure SMTP as well as a robust HTTPS-based Resend API proxy to bypass all cloud port blockages.',
      competitors: 'Mailchimp, Klaviyo, Brevo Premium',
      competitorCost: '€80 to €250 per month',
      nexusSetup: 'Enter your custom SMTP keys or paste your Resend API token to start sending without complex network tuning.',
      nexusCost: 'Included for life with unlimited sends',
      roiAdvantage: 'Ditch monthly CRM costs. Enjoy direct inbox placement with high-speed asynchronous processing.'
    },
    script: {
      hook: '“Stop letting Mailchimp eat your e-commerce margins!” 📧',
      steps: [
        { time: '00:00 - 00:05', direction: 'Point aggressively to an expensive Mailchimp bill showing a €150/mo charging tier.', audio: 'Why pay Mailchimp or Klaviyo hundreds of dollars a month just to send simple newsletters to your own customer base?' },
        { time: '00:05 - 00:15', direction: 'Show the dual gateway switch toggling to Resend API inside the Communications board.', audio: 'Nexus Communication Hub gives you full autonomy, letting you connect standard SMTP or Resend API to bypass all hosting restrictions.' },
        { time: '00:15 - 00:25', direction: 'Show email queues dispatching and deliverability logs showing 99% placement.', audio: 'Our email pipeline routes messages quickly, hitting main folders and bypassing promotions grids with zero recurring monthly platform fees.' }
      ],
      cta: 'Escape monthly email fees for good. Access the uncompromised Nexus AI suite today!'
    }
  },
  'wp-crm': {
    title: 'Live Visitor Radar',
    subtitle: 'Zero-overhead passive visitor telemetry to recover checkout abandonments.',
    badge: 'Live Radar',
    battlecard: {
      painPoint: 'Understanding bounce rates requires heavy tracking pixels like Hotjar, which slow down mobile performance and degrade Core Web Vitals.',
      technicalEdge: 'Ultra-lightweight under-1KB asynchronous tracking script. Records carts and actions into a cloud SQLite cache with zero CPU lag.',
      competitors: 'Hotjar Corporate, CrazyEgg, LiveChat Enterprise',
      competitorCost: '€59 to €120 per month',
      nexusSetup: 'Embed our single async snippet inside your store wrapper, completely isolated from main layout resources.',
      nexusCost: 'Free under your lifetime access',
      roiAdvantage: 'Ditch slow scripts to recover cart dropouts instantly with automated contextual triggers.'
    },
    script: {
      hook: '“Watch your cart abandonments happen live and recover them!” 👁️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show an anonymous user abandoning their shipping form at checkout.', audio: 'Your store gets visitors every day, but how many leave right before checkout due to a last-minute distraction?' },
        { time: '00:05 - 00:15', direction: 'Show the Live Visitor Radar map with glowing nodes representing active shoppers.', audio: 'Nexus Live Visitor Radar maps real-time shopper behavior passively, keeping your PageSpeed score fully green.' },
        { time: '00:15 - 00:25', direction: 'Show a triggered notification prompting an instant discount offer to the checkout abandoner.', audio: 'The system spots checkout friction and gives you the tools to offer real-time incentives, recovering up to 18% of lost sales.' }
      ],
      cta: 'Turn lost carts into loyal customers. Activate the Live Visitor Radar on Nexus AI now!'
    }
  },
  maintenance: {
    title: 'Maintenance & Optimisation',
    subtitle: 'Automated background SQL tuning and database cleaning for maximum WooCommerce speed.',
    badge: 'Lag-Free SQL',
    battlecard: {
      painPoint: 'Bulk catalog edits or large inventory changes slow down databases, bloating configurations and hurting overall checkout speed.',
      technicalEdge: 'Offloaded async transaction queue. Modifies and optimizes database entries in batches without slowing down your live store.',
      competitors: 'WP Sheet Editor, WP-Optimize, WP-Sweep Premium',
      competitorCost: '€29 to €59 for standalone plugins',
      nexusSetup: 'No configuration needed. Runs safely through the secure, background-level Nexus API connector.',
      nexusCost: 'Included in your lifetime plan',
      roiAdvantage: 'Cut server backup sizes by 40%, improve average TTFB, and speed up overall admin tasks.'
    },
    script: {
      hook: '“Stop freezing your store whenever you update database prices!” ⚙️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a spinning wheel icon with an admin screen frozen at a bulk-update loading screen.', audio: 'If you have tried updating 500 product listings at once on WooCommerce, you know the pain of server crashes.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus Bulk Editor modifying dozens of price fields instantly in a spreadsheet table.', audio: 'With Nexus, database operations are managed in batches on our cloud first, avoiding any active CPU load on your store.' },
        { time: '00:15 - 00:25', direction: 'Show the SQL optimizer tool cleaning junk transients with a broom visual icon.', audio: 'It cleans up bloated databases to keep your loading speed fast and checkout flows razor-sharp for visitors.' }
      ],
      cta: 'Accelerate your store operations. Secure your lifetime VIP Nexus license before our deal closes!'
    }
  },
  affiliation: {
    title: 'Affiliation & Ambassadeurs',
    subtitle: 'Set up an affiliate structure to scale sales with zero recurring fees or heavy cookies.',
    badge: 'Viral Growth',
    battlecard: {
      painPoint: 'Commercial affiliate plugins are expensive and slow down websites with heavy cookies and third-party tracking redirections.',
      technicalEdge: 'Coupon-based local-cache attribution. Syncs custom referral keys directly to the store for faster, lightweight tracking.',
      competitors: 'GoAffPro Premium, UpPromote, Shopify Collabs',
      competitorCost: '€39 to €149 per month',
      nexusSetup: 'Set up influencer commissions and coupon keys in the dashboard, and manage payout requests easily.',
      nexusCost: 'Fully included with unlimited partners',
      roiAdvantage: 'Build an organic acquisition channel with zero ad risk, driving referral sales while avoiding monthly plugin bills.'
    },
    script: {
      hook: '“Launch your own WooCommerce affiliate network in one click!” 👥',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show an organic sales graph rising with referral link notifications.', audio: 'The best e-commerce sales come from pure word-of-mouth. But building a partner team manually is a logistical nightmare.' },
        { time: '00:05 - 00:15', direction: 'Show the Affiliate dashboard displaying a list of partners and customize a link.', audio: 'Nexus Affiliate manages coupons easily. No tracking cookies or redirection scripts that slow down page speeds.' },
        { time: '00:15 - 00:25', direction: 'Show the auto-calculating commission ledger updating as commissions are earned.', audio: 'Our dashboard handles payouts and maps ROI on auto-pilot, letting partners promote and grow your brand risk-free.' }
      ],
      cta: 'Turn customers into real salespeople. Get your lifetime license to Nexus Affiliate today!'
    }
  },
  dashboard: {
    title: 'Cockpit & Hub Central',
    subtitle: 'Asynchronous analytics dashboard to track operations without slow SQL logs.',
    badge: 'Real-Time Insights',
    battlecard: {
      painPoint: 'Default WordPress stats tools execute slow, heavy DB queries on load, locking server threads and slowing down page views.',
      technicalEdge: 'Off-site telemetry processing. Pre-aggregates sales and metrics on the cloud, rendering dashboards instantly.',
      competitors: 'MonsterInsights Pro, default WooCommerce stats, GA4 heavy reports',
      competitorCost: '€99 to €199 per year',
      nexusSetup: 'Fully configured out of the box. Opens in under 0.1s without running slow queries on your host.',
      nexusCost: 'Included in your license',
      roiAdvantage: 'Get clear net margin oversight and visitor flows, saving admin time and managing with pure data.'
    },
    script: {
      hook: '“Track your sales data live without slowing down your site speed!” ⚡',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a slow admin panel loader while customer pages remain unresponsive.', audio: 'Opening your admin statistics shouldn’t crash your live customer experience. Heavy tools slow down servers to draw graphs.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus Cockpit dashboard displaying elegant charts in real-time.', audio: 'Enjoy the speed of the Nexus Cockpit. Metrics are built off-site so your store can focus entirely on completing sales.' },
        { time: '00:15 - 00:25', direction: 'Show a clean layout of profit margins and security states.', audio: 'Monitor margins, active shoppers, and site safety simultaneously, with clear data-driven clarity.' }
      ],
      cta: 'Enjoy fast analytics without the server lag. Claim your lifetime access to the Nexus suite today!'
    }
  },
  'seo-interlinks': {
    title: 'Semantic Interlinking',
    subtitle: 'Automated semantic interlinks to speed up Google crawl depths and rankings.',
    badge: 'Deep SEO Tuning',
    battlecard: {
      painPoint: 'Manually building internal links across massive catalogs is painful and easily leads to orphaned, unindexed products.',
      technicalEdge: 'Contextual semantic anchor algorithm. Builds contextual link structures asynchronously without touching DB configurations.',
      competitors: 'Link Whisper, Yoast internal linking engine',
      competitorCost: '€49 to €129 per year per site',
      nexusSetup: 'Scans your articles and categories on activation to link relevant topics automatically.',
      nexusCost: 'Included for life with unlimited links',
      roiAdvantage: 'Speed up indexing times on Google Search Console by 2.5x, especially on deep-target collection pages.'
    },
    script: {
      hook: '“Skyrocket your SEO rankings with automatic internal linking!” 🕷️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show a screenshot from Search Console showing "discovered - currently not indexed".', audio: 'Why does Google ignore half your active WooCommerce products? Because they lack deep internal links.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus link network graph mapping connections between product pages.', audio: 'Our semantic backend matches themes and adds natural, contextual internal links to keep Google crawlers active.' },
        { time: '00:15 - 00:25', direction: 'Show a search rankings trendline tracking upwards with link indicators.', audio: 'No sluggish databases or messy link edits. Safe, automated, and powerful enough to lift your entire catalog.' }
      ],
      cta: 'Speed up your indexing and win top positions. Download Nexus AI with lifetime rights today!'
    }
  },
  'woo-orders-mgr': {
    title: 'Rapid WooCommerce Orders',
    subtitle: 'Instant order manager with custom categories and integrated AliExpress fulfillment.',
    badge: 'Fulfillment Engine',
    battlecard: {
      painPoint: 'Fulfilling orders manually through default WordPress panels is slow and prone to painful shipping typos.',
      technicalEdge: 'Dynamic catalog search tool combined with automated AliExpress order automation.',
      competitors: 'WooCommerce default backend, manual data entry platforms',
      competitorCost: 'Dozens of lost admin hours and costly shipping errors',
      nexusSetup: 'Direct secure API link. Turn on automatic catalog synchronization to fulfill orders instantly.',
      nexusCost: 'Completely included, no surcharges',
      roiAdvantage: 'Fulfill hundreds of orders in seconds, with automated syncs for customer details and tracking codes.'
    },
    script: {
      hook: '“Fulfill AliExpress orders and sync categories instantly!” 📦',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show an admin copying customer shipping details manually in multiple windows.', audio: 'Manually typing addresses or catalog variations is tedious and leads to shipping errors.' },
        { time: '00:05 - 00:15', direction: 'Show the Nexus order table, searching products and category fields instantly.', audio: 'Access catalog contents instantly. Choose a category, select a product, and pricing and stock sync up.' },
        { time: '00:15 - 00:25', direction: 'Click "Fulfill on AliExpress" and watch the order details fill out automatically.', audio: 'Save time on shipping. One click passes order data to AliExpress, retrieves tracking codes, and updates WooCommerce.' }
      ],
      cta: 'Automate your shipping tasks. Empower your store with Nexus logistics today!'
    }
  },
  'product-manager': {
    title: 'Products & Catalogue Manager',
    subtitle: 'Instant bulk product updates from a responsive table dashboard.',
    badge: 'Blazing Fast Edits',
    battlecard: {
      painPoint: 'Modifying product attributes, variations, or pricing manually causes endless loading times.',
      technicalEdge: 'Client-side cached fast editing interface, pushing batch mutations directly via server APIs.',
      competitors: 'WP All Import, sheet editors, default product lists',
      competitorCost: '€59 to €149 per year',
      nexusSetup: 'Instant REST API hook. Edit specifications and price targets from a fast, structured spreadsheet grid.',
      nexusCost: 'Fully included under your lifetime license',
      roiAdvantage: 'Manage pricing and catalog counts up to 10x faster, with no database lags.'
    },
    script: {
      hook: '“Bulk edit your WooCommerce configurations in 2 minutes flat!” 🛍️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show an admin waiting for individual product page edits to load.', audio: 'Modifying multiple product Listings on WooCommerce requires navigating endless pages.' },
        { time: '00:05 - 00:15', direction: 'Show the bulk grid table updating multiple price targets at once.', audio: 'Modify inventory levels, attributes, or pricing in real-time layout grids with Nexus.' },
        { time: '00:15 - 00:25', direction: 'Show the sync bar completing and product pages updating.', audio: 'Changes sync up smoothly to WooCommerce in the background, keeping customer checkouts perfectly active.' }
      ],
      cta: 'Edit your product catalogs at light speed. Activate your lifetime access to Nexus today!'
    }
  },
  'nexus-link-importer': {
    title: 'Nexus Link Chrome Extension',
    subtitle: 'Scrape and import products directly from AliExpress with a solid browser pipeline.',
    badge: 'Bulk Sourcing Tool',
    battlecard: {
      painPoint: 'Manual product syncing occupies hours, while standard importing tools charge recurring monthly fees.',
      technicalEdge: 'Extracted directly from AliExpress pages, writing items directly via secure server API pipelines.',
      competitors: 'DSers, AliDropship, Importify',
      competitorCost: '€29 to €59 per month',
      nexusSetup: 'Launch the browser extension, highlight targeted items, and export them into your store with one click.',
      nexusCost: 'Included in your lifetime subscription',
      roiAdvantage: 'Ditch import tool subscriptions, source items fast, and rewrite details with AI to ensure uniqueness.'
    },
    script: {
      hook: '“Import full AliExpress product lists in 60 seconds flat!” 🚀',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show import tool bills and manual listing workflows.', audio: 'Stop wasting hours copying product descriptions or paying for monthly third-party import tools.' },
        { time: '00:05 - 00:15', direction: 'Highlight items and launch the Nexus Link browser tool.', audio: 'Select and export AliExpress listings in real-time, grabbing HD visuals and pricing specs.' },
        { time: '00:15 - 00:25', direction: 'Set the profit markup scale and watch AI write unique content.', audio: 'Adjust prices automatically, and rewrite product features into rich text with Gemini.' }
      ],
      cta: 'Unlock automated dropshipping. Get your lifetime license to Nexus Lifetime today!'
    }
  },
  'categories-tags': {
    title: 'Categories & Tags manager',
    subtitle: 'AI-driven taxonomy cleaning to organize catalogs for better search rankings.',
    badge: 'Product Taxonomy',
    battlecard: {
      painPoint: 'Bloated tags or empty categories confuse shoppers and harm search rankings.',
      technicalEdge: 'Built-in crawler crawls and merges duplicate tag listings automatically.',
      competitors: 'Manual SQL tag scripts, sluggish default structures',
      competitorCost: 'Hours of tedious database editing',
      nexusSetup: 'Run the taxonomy report from the console to clean up item structures.',
      nexusCost: 'Fully included',
      roiAdvantage: 'Speed up index crawlers and boost Search rankings with logical product structures.'
    },
    script: {
      hook: '“Organize your category configurations to rank higher on Google!” 🏷️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show duplicate tags causing search console issues.', audio: 'Bloated, empty, or duplicate tags are hurting your search page indexing.' },
        { time: '00:05 - 00:15', direction: 'Filter and merge tags easily inside the database console.', audio: 'Let Nexus clean duplicate tag configurations and cluster related keywords.' },
        { time: '00:15 - 00:25', direction: 'Show a clean category listing map.', audio: 'Our clean taxonomy allows search indexes to navigate your site easily, lifting search visibility.' }
      ],
      cta: 'Get absolute database organization. Get your lifetime access to Nexus today!'
    }
  },
  pixels: {
    title: 'Multi-Pixel Analytics',
    subtitle: 'Recover conversion loss across channels with deduplicated tracking APIs.',
    badge: '100% Async Tracking',
    battlecard: {
      painPoint: 'Browser policies block cookies, making ads lose about 35% of tracking conversions.',
      technicalEdge: 'Correlates browser events with server APIs using server-side event tracking.',
      competitors: 'PixelYourSite Pro, manual pixel setups',
      competitorCost: '€80 to €180 per year per site',
      nexusSetup: 'Enter pixel keys in the dashboard to initiate conversion tracking on auto-pilot.',
      nexusCost: 'Fully included in your plan',
      roiAdvantage: 'Recover lost ad attribution, lower ad costs, and keep site speed fast.'
    },
    script: {
      hook: '“Stop losing 35% of your WooCommerce ad attribution!” 🛑',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show declining ad metrics on pixel dashboards.', audio: 'Are you running advertising without receiving accurate conversion numbers?' },
        { time: '00:05 - 00:15', direction: 'Show pixel switches toggling on inside the Nexus suite.', audio: 'Connect ad platforms to tracking servers in seconds with Nexus.' },
        { time: '00:15 - 00:25', direction: 'Show precise conversion event counts updating in the logs.', audio: 'Our dual tracking syncs conversions, boosting ad efficiency and site velocity.' }
      ],
      cta: 'Verify your store metrics and scale ad budgets. Get your lifetime ticket to Nexus today!'
    }
  },
  market: {
    title: 'Market Intelligence',
    subtitle: 'Scrape and compare competitor pricing in real-time to adjust campaigns.',
    badge: 'Price Monitoring',
    battlecard: {
      painPoint: 'Tracking competitor sales pricing manually consumes massive time.',
      technicalEdge: 'Off-site scrapers watch and index target websites asynchronously.',
      competitors: 'Prisync, Price2Spy, SEMrush competitor suites',
      competitorCost: '€99 to €299 per month',
      nexusSetup: 'Paste the target competitor address straight into the tracking board to monitor pricing.',
      nexusCost: 'Fully included for life',
      roiAdvantage: 'Increase conversions by staying competitive and matching pricing dynamically.'
    },
    script: {
      hook: '“Do not let competitors steal your sales with lower pricing!” 🕵️‍♂️',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show buyers leaving to select cheaper matching items.', audio: 'With buyers looking for the lowest price, missing the market mark hurts sales.' },
        { time: '00:05 - 00:15', direction: 'Identify price configurations on competitor panels inside the hub.', audio: 'Our web tools watch target stores passively without loading your local host.' },
        { time: '00:15 - 00:25', direction: 'Show alerts with pricing recommendations dynamically updating.', audio: 'Track pricing updates and adapt offers in real-time to keep converting buyers.' }
      ],
      cta: 'Gain a clear advantage over competition. Download Nexus AI with lifetime rights now!'
    }
  },
  stock: {
    title: 'Stock velocity Analysis',
    subtitle: 'Analyze sales velocity to identify slow-moving items and free up capital.',
    badge: 'Stock KPI tracking',
    battlecard: {
      painPoint: 'Unsold stock ties up business capital and wastes space in warehouses.',
      technicalEdge: 'Off-load processing records catalog rotation velocity without slow server loads.',
      competitors: 'Inventory Planner, Katana',
      competitorCost: '€79 to €199 per month',
      nexusSetup: 'Automatic connector indexes store sales history quickly on activation.',
      nexusCost: 'Included in your license',
      roiAdvantage: 'Free up cash flow by moving slow stock and expanding fast-selling products.'
    },
    script: {
      hook: '“Free up valuable capital caught in unsold warehouse stock!” 📦',
      steps: [
        { time: '00:00 - 00:05', direction: 'Show boxes of unsold stock gathering dust in warehouse corners.', audio: 'Did you know that third of your store capital might be stuck in slow items?' },
        { time: '00:05 - 00:15', direction: 'Show stock velocity graphs inside the product list manager.', audio: 'Identify slow and fast-moving items instantly in the Nexus dashboard.' },
        { time: '00:15 - 00:25', direction: 'Show cash balances increasing after moving inventory.', audio: 'Free up capital to focus budgets on expanding top sources of margin instead.' }
      ],
      cta: 'Empower your inventory management. Upgrade to the Nexus lifetime deal today!'
    }
  },
  audit: {
    title: 'SEO Audit & Diagnosis',
    subtitle: 'Scan titles, meta tags, and speeds to diagnose search hurdles.',
    badge: 'Crawling Analysis',
    battlecard: {
      painPoint: 'Structural SEO errors block search robots, killing natural traffic opportunities.',
      technicalEdge: 'Asynchronous crawler spots broken tags and short write-ups off-server.',
      competitors: 'Screaming Frog, Sitebulb, Semrush audit tools',
      competitorCost: '€49 to €150 per year',
      nexusSetup: 'Click "Start Audit" to crawling pages passively without server speed penalties.',
      nexusCost: 'Fully included',
      roiAdvantage: 'Find and repair index blockages to double organic search impressions.'
    },
    script: {
      hook: '“Identify hidden indexing tags causing Google to ignore your site!” 🩺',
      steps: [
        { time: '00:05 - 00:15', direction: 'Show search crawler issues highlighted on audit boards.', audio: 'Struggling to find items on Google? Hidden code errors may be the culprit.' },
        { time: '00:15 - 00:25', direction: 'Display clean health scores on the auditing panel.', audio: 'Nexus crawls structures and checks headings, speed levels, and links.' },
        { time: '00:25 - 00:35', direction: 'Check off resolved SEO tasks to boost rankings.', audio: 'Follow our actionable checklist to fix issues and climb search rankings.' }
      ],
      cta: 'Ensure perfect technical SEO health. Claim your lifetime VIP Nexus license now!'
    }
  }
};

export default function MarketingHubView() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language && i18n.language.startsWith('fr') ? 'fr' : 'en';
  
  const [activeModule, setActiveModule] = useState<string>('security');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedBattle, setCopiedBattle] = useState<boolean>(false);
  const [activeScriptFormat, setActiveScriptFormat] = useState<'tiktok' | 'linkedin'>('tiktok');

  const marketingModules: ModuleMarketingData[] = [
    {
      id: 'security',
      title: 'Security Shield',
      subtitle: 'Sécurité asynchrone ultra-haute fidélité sans surcharge serveur.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-green-600 border-emerald-500/30',
      badge: 'Zéro Overhead',
      battlecard: {
        painPoint: 'Les plugins de sécurité WordPress classiques (Wordfence, Sucuri) exécutent des scans lourds directement sur le serveur d\'hébergement. Cela détruit le Score de Vitesse mobile, augmente le temps de charge (TTFB) et consomme jusqu\'à 80% des ressources CPU d\'un hébergement mutualisé, provoquant des crashs sous trafic.',
        technicalEdge: 'Filtrage asynchrone déporté sur le réseau Cloud de Nexus AI. Les tentatives d\'injection SQL, d\'attaques brute-force ou de scans de fichiers robots sont détectés instantanément. Les logs de sécurité sensibles sont écrits dans une base SQLite distante chiffrée, évitant d\'engorger la base MySQL locale de WooCommerce.',
        competitors: 'Wordfence Premium, Sucuri Cloud, iThemes Security Pro',
        competitorCost: '40€ à 99€ par mois par site web',
        nexusSetup: 'Zéro plugin local lourd. Intégration en 1 clic grâce à notre module proxy asynchrone léger WPCode qui bannit instantanément les IPs nuisibles sur le Cloud avant de toucher le site.',
        nexusCost: 'Inclus dans le Nexus Lifetime Deal (199€ à vie)',
        roiAdvantage: 'Économie annuelle brute de 480€+, amélioration immédiate de +15-20% de vitesse mobile et protection en temps réel contre les crashs provoqués par des robots scrapers concurrents.'
      },
      script: {
        hook: '« Arrête de détruire la vitesse de ton WooCommerce avec Wordfence ! » 🛑',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer l\'écran mobile WooCommerce qui rame en affichant un score Google PageSpeed rouge (ex. 34/100). Faire mine de s\'arracher les cheveux.', audio: 'Si votre boutique WooCommerce met plus de 3 secondes à se lancer, vous perdez la moitié de vos ventes. Et le coupable ? C’est souvent votre plugin de sécurité qui s’accapare toute la puissance de votre serveur.' },
          { time: '00:05 - 00:15', direction: 'Transition de zoom rapide vers le tableau de bord Security Shield de Nexus AI montrant une interface sombre haut de gamme épurée avec des vagues d\'IPs bloquées en vert.', audio: 'Regardez ça. Wordfence ou Sucuri tournent localement sur votre boutique et drainent votre CPU en continu. Avec Nexus Security Shield, le filtrage est asynchrone et déporté sur notre Cloud ultra-rapide. Zéro ralentissement, 100% de protection.' },
          { time: '00:15 - 00:25', direction: 'Afficher à l\'écran le tableau de comparaison : Wordfence (40€/mois + site lent) vs Nexus Shield (Inclus à vie + vitesse optimale). Faire glisser l\'interrupteur de ban cloud en direct.', audio: 'Les robots sémantiques ou attaques brute force sont interceptés instantanément à la frontière, avant même de toucher votre site. Le tout consigné dans un journal SQLite cloud sécurisé.' }
        ],
        cta: 'Cliquez sur le lien en bio et débarrassez-vous des abonnements de sécurité obsolètes pour sécuriser votre empire e-commerce à vie.'
      }
    },
    {
      id: 'social',
      title: 'Nexus Social Studio',
      subtitle: 'Créateur de vidéos AIDA d\'une efficacité commerciale redoutable.',
      icon: Share2,
      color: 'from-violet-500 to-indigo-600 border-violet-500/30',
      badge: 'Vidéo Studio 1-Clic',
      battlecard: {
        painPoint: 'Créer des vidéos de promotion, écrire des scripts stimulants, engager des doubleurs de voix professionnels et faire du montage vidéo sur Premiere Pro prend des heures pour chaque nouveau produit, coûtant des centaines de dollars par mois de marketing social actif.',
        technicalEdge: 'Génération instantanée en un clic de vidéos verticales sous le framework logique AIDA (Attention, Intérêt, Désir, Action) directement imbriquée dans le catalogue WooCommerce. Voix off réalistes interchangeables (Antoni, Rachel, Bella) configurables et export direct MP4 sans aucune dépendance logicielle externe fastidieuse.',
        competitors: 'Hootsuite, Metricool, Canva Premium + ElevenLabs',
        competitorCost: '30€ à 90€ par mois d\'abonnement récurrent',
        nexusSetup: 'Aucune clé d\'API externe requise. Analyse directe des images et de la description de votre produit pour concevoir les transitions, synthétiser la voix off humaine et livrer la vidéo MP4 finale.',
        nexusCost: 'Inclus sans coût par mot ou par vidéo générée',
        roiAdvantage: 'Suppression totale des abonnements Canva/ElevenLabs. Économie de 850€/an de frais de conception graphique et capacité de lancer 10 vidéos promotionnelles par jour sur TikTok/Reels en totale autonomie.'
      },
      script: {
        hook: '« Génère des vidéos de vente professionnelles en 1-clic direct depuis ton WooCommerce ! » 🎥',
        steps: [
          { time: '00:00 - 00:05', direction: 'Afficher l\'application TikTok avec un scroll de vidéos e-commerce virales. Superposer un texte dynamique et coloré vibrat.', audio: 'Vous savez ce qui sépare les boutiques qui font 500€ par jour de celles qui stagnent ? Le volume de vidéos verticales publiées sur TikTok et Instagram Reels.' },
          { time: '00:05 - 00:15', direction: 'Filmer l\'écran de Nexus Social Studio. Sélectionner un produit (ex. Baskets de sport), cliquer sur "Générer Vidéo AIDA", et choisir la voix ultra-réaliste "Bella".', audio: 'Mais au lieu de passer 4 heures sur Premiere Pro ou de dépenser 30€ sur ElevenLabs, vous sélectionnez simplement votre produit e-commerce sur Nexus Social. En 1-clic, notre intelligence prépare le texte de vente, cale les images, et produit une vidéo avec voix humaine.' },
          { time: '00:15 - 00:25', direction: 'Cliquer sur le bouton de téléchargement direct. Le fichier MP4 se télécharge instantanément. Montrer le rendu avec sous-titres animés captivants.', audio: 'Vous avez le choix entre Rachel (voix corporate dynamique), Antoni (voix masculine rassurante) ou Bella (voix solaire stimulante). Tout est calculé asynchroniquement pour convertir immédiatement.' }
        ],
        cta: 'Ne loupez pas le train du commerce autonome. Réclamez votre accès instantané à vie à Nexus Social dès aujourd\'hui.'
      }
    },
    {
      id: 'smart-feed',
      title: 'Smart Feed & Market Intelligence',
      subtitle: 'Espionnage asynchrone des concurrents et synchronisation publicitaire surpuissante.',
      icon: ShoppingBag,
      color: 'from-blue-500 to-sky-600 border-blue-500/30',
      badge: 'Ciblage Réseau',
      battlecard: {
        painPoint: 'La génération de flux XML volumineux pour Google Shopping ou Facebook Publicités écrase régulièrement les performances de la base de données WordPress lors de la mise à jour des stocks. À cela s\'ajoute l\'incapacité de surveiller les prix des concurrents sans payer des licences logicielles mensuelles exorbitantes.',
        technicalEdge: 'Génération de flux XML haute vitesse déportée hors du site, évitant le lag PHP. En parallèle, notre robot scraper asynchrone scanne les URLs des boutiques concurrentes pour cartographier leurs prix réels, calculer les écarts et adapter votre stratégie d\'acquisition en temps réel.',
        competitors: 'Heavy local XML Feed plugins + SEMRush, SpyFu, Sniffie',
        competitorCost: '120€ à 250€ par mois',
        nexusSetup: 'Indiquez simplement les sites concurrents clés dans le radar et débloquez la synchronisation instantanée du flux XML sur Google Merchant Center sans générer de requêtes SQL lentes.',
        nexusCost: 'Inclus sans abonnement additionnel',
        roiAdvantage: 'Augmentation moyenne du taux de clic Google Shopping de +34% en ajustant dynamiquement vos prix face à la concurrence directe. Économie importante de plus de 1 400€/an de licences SEO/tarifs.'
      },
      script: {
        hook: '« Arrête d\'envoyer des clients à tes concurrents sur Google Shopping ! » 🛒',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer une recherche Google Shopping montrant le même produit à deux prix différents de deux boutiques distinctes. Pointer le prix le plus bas.', audio: 'Sur les moteurs de recherche et Google Shopping, un écart de seulement 2€ suffit pour que l\'acheteur ignore complètement votre boutique pour aller acheter chez votre concurrent direct.' },
          { time: '00:05 - 00:15', direction: 'Capture d\'écran de la vue Intelligence Marché de Nexus AI. Les prix des concurrents se mettent à jour en direct avec un indicateur lumineux rouge/vert d\'écart.', audio: 'Pour résoudre cela, Nexus intègre un robot scraper asynchrone. Entrez l\'URL racine de vos concurrents et laissez le système explorer leur catalogue en arrière-plan en moins de 30 secondes pour décrypter leur pricing.' },
          { time: '00:15 - 00:25', direction: 'Faire dérouler le flux XML Google Shopping produit en 1 clic. Souligner la fluidité absolue de l\'interface sans aucun temps d\'arrêt.', audio: 'Générez des flux de produits XML parfaits pour Facebook Ads et Google Merchant Center sans aucun ralentissement de votre serveur, tout en appliquant des règles d\'ajustement psychologique automatiques.' }
        ],
        cta: 'Prenez le dessus sur votre marché. Rejoignez l\'écosystème Nexus AI et commencez à dominer Google Shopping maintenant.'
      }
    },
    {
      id: 'forecast',
      title: 'Stock Analysis & Forecast',
      subtitle: 'Anticipation chirurgicale des besoins de trésorerie et d\'achats.',
      icon: BarChart3,
      color: 'from-orange-500 to-amber-600 border-orange-500/30',
      badge: 'Trésorerie Assistée',
      battlecard: {
        painPoint: 'Les ruptures de stock interrompent brutalement les revenus récurrents et dégradent les positions SEO durement acquises sur Google. De l\'autre côté, le surstockage inutile détruit la trésorerie nette des marques et génère des coûts de stockage superflus.',
        technicalEdge: 'Modèles prédictifs entraînés calculant la vitesse de défilement des ventes WooCommerce en tenant compte des pics de saisonnalité d\'après vos propres cycles de données historiques. Le système calcule automatiquement la quantité précise de réapprovisionnement à commander à J-45.',
        competitors: 'Inventory Planner, expensive Custom ERPs, StockTrim',
        competitorCost: '150€ à 400€ par mois',
        nexusSetup: 'Connexion instantanée au catalogue WooCommerce. Génère une carte de prédiction d\'achats et une estimation exacte de la trésorerie requise pour vos prochains approvisionnements.',
        nexusCost: 'Inclus à vie dans l\'offre d\'acquisition',
        roiAdvantage: 'Diminution par deux du volume d\'invendus et élimination complète des coûts liés aux opportunités de vente manquées pour cause d\'inventaire épuisé.'
      },
      script: {
        hook: '« Ne perds plus jamais tes positions Google à cause d\'une rupture de stock stupide ! » 📦',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un produit WooCommerce affiché "Rupture de Stock" sur fond bariolé de rouge avec des captures d\'avis de clients frustrés.', audio: 'Rien n\'est pire pour un e-commerçant qu\'une rupture de stock. Non seulement vous perdez du chiffre d\'affaires immédiat, mais Google rétrograde instantanément votre référencement naturel.' },
          { time: '00:05 - 00:15', direction: 'Faire défiler l\'écran des prévisions de Nexus Forecast avec des lignes graphiques interactives de tendance s\'étalant sur 45 jours.', audio: 'Le module Nexus Forecast analyse les variations saisonnières de vos anciennes ventes WooCommerce. Grâce au machine learning cloud de Nexus AI, il anticipe votre rythme d\'écoulement pour les 45 prochains jours.' },
          { time: '00:15 - 00:25', direction: 'Montrer la carte d\'alerte de trésorerie et d\'inventaire avec un tableau récapitulatif format "Bon de commande fournisseur" généré automatiquement.', audio: 'Il vous dit précisément quoi commander, quand, et combien de trésorerie anticiper pour vos fiches d\'achats. Plus de suppositions bancales, tout est piloté scientifiquement au millimètre près.' }
        ],
        cta: 'Optimisez votre trésorerie et devenez un e-commerçant aguerri avec Nexus AI. Cliquez sur s\'enregistrer.'
      }
    },
    {
      id: 'content',
      title: 'SEO Content Machine & Auto-Pilot',
      subtitle: 'La machine marketing autonome pour forcer l\'indexation de Google.',
      icon: FileText,
      color: 'from-pink-500 to-rose-600 border-pink-500/30',
      badge: 'Auto-Pilot SEO',
      battlecard: {
        painPoint: 'Rédiger des fiches produits ou des articles de blog optimisés prend un temps colossal ou requiert des agences de rédaction de contenu payées à la ligne. Et la configuration manuelle du maillage interne sémantique entre les articles s\'avère être un véritable enfer à maintenir.',
        technicalEdge: 'Module propriétaire "Auto-Pilot" d\'indexation sémantique surpuissant. Il s\'occupe d\'injecter des Lexiques complets, de planifier et générer des articles de blog structurés en SEO (balises Hx parfaites) et de tramer des liens sémantiques intelligents entre les pages sans altérer la base WordPress.',
        competitors: 'Yoast Premium, Jasper AI, Surfer SEO, SEMRush Writing Assistant',
        competitorCost: '90€ à 180€ par mois',
        nexusSetup: 'Connectez simplement votre base en 2 minutes. Choisissez les types de mots-clés cibles, déterminez le calendrier d\'autopilote de vos contenus et laissez faire.',
        nexusCost: 'Inclus, génération autonome illimitée',
        roiAdvantage: 'Positionnement organique Google accru de +120% en 90 jours avec plus de 30 articles de blog thématisés insérés automatiquement de façon robotique. Remplacement total de vos outils d\'aide à l\'écriture.'
      },
      script: {
        hook: '« Domine le classement Google sans écrire une seule ligne de texte de toute ta vie ! » ✍️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Aperçu d\'un outil d\'analytics de trafic SEO avec une flèche qui pointe tout droit vers le haut. Ambiance dynamique inspirante.', audio: 'Le trafic payant sur Facebook et Google Ads devient invivable et détruit vos bénéfices nets. La clé pour durer, c’est de récupérer du trafic organique 100% gratuit de Google.' },
          { time: '00:05 - 00:15', direction: 'Faire glisser le curseur d\'auto-publication de la machine de contenu Nexus. On voit la liste d\'articles rédigés de façon ultra-structurée avec maillage hypertexte.', audio: 'Ne recrutez pas d\'agence SEO. Activez la machine à contenu autonome de Nexus AI. Définissez vos mots-clés, définissez vos thèmes, et débloquez la fonction Auto-Pilot : l\'IA écrit, structure avec la hiérarchie Hx et interconnecte les articles.' },
          { time: '00:15 - 00:25', direction: 'Changer vers l\'aperçu du maillage interne en forme de toile d\'araignée sémantique connectant les URL WordPress.', audio: 'Le système tisse des ponts de maillage interne parfaits et pousse la recherche Google Bot à indexer votre catalogue WooCommerce en priorité absolue.' }
        ],
        cta: 'Générez des milliers de visites qualifiées gratuitement. Prenez votre licence Nexus AI à vie avant la fin du décompte de notre offre VIP.'
      }
    },
    {
      id: 'moderator',
      title: 'AI Comment Moderator',
      subtitle: 'Transformateur automatique de messages sociaux en ventes de produits.',
      icon: MessageSquare,
      color: 'from-amber-400 to-orange-500 border-amber-400/30',
      badge: 'Conversion Live',
      battlecard: {
        painPoint: 'La modération manuelle des messages de vos vidéos promotionnelles TikTok/Reels consomme un temps fou. Plus critique encore : vous ratez l\'intérêt brûlant au moment exact du buzz, car répondre 5 heures après est trop tard pour capturer le prospect.',
        technicalEdge: 'Modération asynchrone ultra-rapide agissant 24h/24. Notre IA analyse le sentiment du commentaire social, vérifie la disponibilité exacte et la quantité en stock du produit et formule instantanément une réponse chaleureuse assortie d\'un lien de paiement exclusif personnalisé.',
        competitors: 'ManyChat integrations, manual Social Community Managers',
        competitorCost: '49€ à 150€ par mois d\'abonnement logiciel',
        nexusSetup: 'Liez votre profil social à notre interface et activez la détection de mots clés déclencheurs avec synchronisation instantanée du catalogue produit.',
        nexusCost: 'Inclus, sans frais variables par interaction sociale',
        roiAdvantage: 'Multiplications des conversions sous les posts viraux par 3x. Vos vidéos de divertissement se transforment en canaux directs de prise de commande autonome sans perte de temps.'
      },
      script: {
        hook: '« Arrête de louper des ventes sous tes vidéos virales ! » 💬',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer une vidéo TikTok avec des dizaines d\'utilisateurs qui écrivent en commentaires "Je veux le lien !", "Dispo où ?", "Quel prix ?"', audio: 'Quand l\'une de vos vidéos fait un buzz sur TikTok ou Instagram, c’est le moment d\'en tirer profit. Mais si vous répondez manuellement à vos commentaires, vous arrivez toujours après la bataille.' },
          { time: '00:05 - 00:15', direction: 'Passer sur l\'interface de AI Comment Moderator de Nexus. On y voit un log d\'analyse sémantique automatique du message d\'un client ciblé.', audio: 'C’est là que le modérateur d’IA exclusif de Nexus de combat entre en scène. Il scrute vos publications sociales 24h/24. Dès qu\'une personne marque de l\'intérêt, l\'IA analyse le sentiment, s\'assure du stock de l\'objet et formule une réponse précise.' },
          { time: '00:15 - 00:25', direction: 'Montrer le flux de génération d\'un lien de panier pré-rempli et son insertion automatique dans la réponse au prospect.', audio: 'Mieux encore : elle formule un code promotionnel temporaire et intègre un lien direct WooCommerce de redirection automatique vers la page de commande. Une machine de vente infatigable.' }
        ],
        cta: 'Transformez chaque commentaire en argent liquide. Cliquez dès maintenant sur le bouton pour sécuriser Nexus à vie.'
      }
    },
    {
      id: 'collab',
      title: 'Invitations & Team (Collab Hub)',
      subtitle: 'La délégation de votre espace de travail sans risque technologique.',
      icon: Users,
      color: 'from-purple-500 to-pink-600 border-purple-500/30',
      badge: 'Sécurité d\'Accompagnement',
      battlecard: {
        painPoint: 'Partager l\'administration de votre WooCommerce à des sous-traitants ou prestataires de service s\'avère dangereux pour la pérennité de votre empire (accès complet aux fichiers PHP de WordPress, accès total aux coordonnées bancaires ou bases clients sensibles).',
        technicalEdge: 'Système de délégation décentralisé et asynchrone de scope visuel. Vos collaborateurs ont des rôles strictement bornés (Content Writer, Stock Manager, Designer) s\'exécutant directement sur le Cloud d\'administration de Nexus sans ralentir ni menacer localement vos fichiers serveur.',
        competitors: 'Heavy Custom WP User Roles plugins, manual credential files',
        competitorCost: '20€ à 50€ d\'extension logicielle WordPress',
        nexusSetup: 'Envoyez simplement une invitation par mail depuis l\'onglet de collaboration Nexus. Votre invité rejoint un espace isolé sécurisé d\'après le profil de tâches attribué.',
        nexusCost: 'Inclus avec un nombre de collaborateurs illimité',
        roiAdvantage: 'Délégation sereine de l\'écriture des blogs ou de la logistique à distance, évitant les sabotages internes ou fausses manipulations de base de données fatales.'
      },
      script: {
        hook: '« Arrête de donner les clés complètes de ton business à tes prestataires ! » 🔑',
        steps: [
          { time: '00:00 - 00:05', direction: 'Cadrage serré d\'une personne tapant sur un clavier avec un gros verrou rouge en arrière-plan numérique.', audio: 'Donner l\'accès administrateur de votre boutique WooCommerce à un sous-traitant pour qu\'il rédige vos articles de blog ou gère vos stocks est la pire idée du monde. Un mauvais clic, et votre boutique crash indéfiniment.' },
          { time: '00:05 - 00:15', direction: 'Déroulement de l\'onglet Collaborateurs et Invitations de Nexus. Envoi d\'une invitation restreinte au rôle "SEO Rédacteur" en 1 clic.', audio: 'Nexus résout cela grâce à sa plateforme d\'équipe délocalisée au niveau du Cloud. Vous invitez vos experts via un email sécurisé. Ils accèdent uniquement à un espace de travail isolé, sans jamais pouvoir renommer ou saboter votre WordPress principal.' },
          { time: '00:15 - 00:25', direction: 'Montrer la fluidité de l\'interface avec des indicateurs d\'activité asynchrone en temps réel.', audio: 'Le rédacteur écrit, le logisticien met à jour l\'inventaire, et vous, vous gardez l\'esprit serein avec un contrôle absolu de l\'écosystème. Zéro ralentissement, protection ultime.' }
        ],
        cta: 'Constituez une équipe de choc en toute sécurité. Activez les accès Collaborations de Nexus AI à vie dès maintenant.'
      }
    },
    {
      id: 'finance',
      title: 'Finance Profit Analyzer',
      subtitle: 'Intelligence financière temps réel & rentabilité nette déportée.',
      icon: Coins,
      color: 'from-emerald-400 to-teal-500 border-teal-500/30',
      badge: 'Marge Nette de Combat',
      battlecard: {
        painPoint: 'Calculer manuellement le bénéfice net exact de WooCommerce en déduisant les frais Stripe/PayPal, les coûts d\'achat réels (COGS) et les dépenses publicitaires est fastidieux. Les gérants découvrent souvent trop tard que leurs produits phares se vendent à perte permanente.',
        technicalEdge: 'Recalcul instantané asynchrone des indicateurs financiers à chaque vente directe. Intégration automatique en temps réel des charges publicitaires injectées et des frais de processeur de paiement pour éditer un bilan comptable net instantané chiffré hors ligne.',
        competitors: 'BeProfit, Lifetimely, Profitario',
        competitorCost: '49€ à 149€ par mois par boutique',
        nexusSetup: 'Aucune clé de licence coûteuse additionnelle. Rentrez simplement le coût d\'acquisition d\'achat de vos produits (COGS) et Nexus calcule automatiquement vos bénéfices à la seconde près.',
        nexusCost: 'Inclus dans votre licence d\'accès à vie',
        roiAdvantage: 'Suppression immédiate des abonnements d\'analyse financière récurrents. Élimination garantie des ventes à perte en identifiant sous 2 heures les campagnes publicitaires non rentables.'
      },
      script: {
        hook: '« Arrête de vendre à perte sans même le savoir sur WooCommerce ! » 💸',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer l\'écran d\'un compte bancaire vide puis un tableau de bord e-commerce affichant un gros chiffre d\'affaires trompeur. Ambiance sceptique.', audio: 'Faire du chiffre d\'affaires, c\'est rassurant. Mais savez-vous combien il vous reste réellement dans la poche après avoir déduit les taxes, Stripe, Facebook Ads et le coût fournisseur d\'origine ?' },
          { time: '00:05 - 00:15', direction: 'Passer à l\'écran interactif de Finance Profit Analyzer de Nexus montrant les marges nettes réelles s\'ajuster en graphique vert fluo sous un clic.', audio: 'Le module Finance de Nexus calcule votre bénéfice net exact à la seconde près. Finis les calculs Excel interminables ou les mauvaises surprises comptables en fin de trimestre.' },
          { time: '00:15 - 00:25', direction: 'Zoomer sur la ligne d\'indicateur de rentabilité au clic qui met en évidence les produits défaillants. Montrer le bouton d\'arrêt.', audio: 'Il isole immédiatement les produits non rentables de votre catalogue et vous alerte instantanément si un canal publicitaire d\'acquisition de trafic commence à vous faire perdre de l\'argent.' }
        ],
        cta: 'Prenez enfin le contrôle absolu de votre rentabilité nette. Réclamez votre accès Nexus à vie.'
      }
    },
    {
      id: 'comm-hub',
      title: 'Communication Hub',
      subtitle: 'Moteur d\'automatisation de fiches, emails & newsletters de masse.',
      icon: Mail,
      color: 'from-blue-600 to-indigo-700 border-indigo-500/30',
      badge: 'Délivrabilité Max',
      battlecard: {
        painPoint: 'Envoyer des newsletters ou des relances de paniers abandonnés directement via votre WordPress surcharge lourdement votre serveur local et détruit votre réputation d\'IP. De plus, les hébergeurs et serveurs cloud bloquent fréquemment les ports SMTP classiques (25, 465, 587) par sécurité.',
        technicalEdge: 'Moteur asynchrone double passerelle : SMTP classique sécurisé d\'un côté, et configuration secondaire via l\'API HTTP directe Resend de l\'autre. En transitant par l\'API HTTP de Resend en HTTPS, vous contournez 100% de tous les blocages de ports de serveurs cloud.',
        competitors: 'Mailchimp, Klaviyo, Brevo Premium',
        competitorCost: '80€ à 250€ par mois d\'abonnement logiciel',
        nexusSetup: 'Reliez vos identifiants SMTP en 1 min ou activez la configuration secondaire ultra-rapide Resend API en collant simplement votre clé (sans configuration complexe de ports).',
        nexusCost: 'Inclus à vie avec envois illimités gratuits',
        roiAdvantage: 'Économie annuelle garantie de 1 200€+ sur vos abonnements d\'emails. Amélioration exponentielle de +45% d\'ouverture grâce au protocole d\'expédition asynchrone.'
      },
      script: {
        hook: '« Ne laisse plus jamais Mailchimp te voler tes marges e-commerce ! » 📧',
        steps: [
          { time: '00:00 - 00:05', direction: 'Faire glisser à l\'écran une facture Mailchimp salée à 150$/mois de façon agacée pour susciter une réaction immédiate.', audio: 'Pourquoi continuer de payer des centaines de dollars à Mailchimp ou Klaviyo chaque mois pour le simple privilège d\'envoyer des messages ou Newsletters à vos propres clients ?' },
          { time: '00:05 - 00:15', direction: 'Montrer l\'émetteur double mode de Nexus basculant en un clic entre SMTP et l\'API HTTP Resend ultra-rapide.', audio: 'Le module Communication Hub de Nexus prend le relais à vie. Il intègre un double moteur robuste : vos serveurs SMTP réguliers ou la configuration secondaire par clé API Resend pour contourner les blocages de ports ordinaires.' },
          { time: '00:15 - 00:25', direction: 'Cliquer sur Envoyer et à l\'écran une jauge de délivrabilité s\'élevant à 99% de succès avec logs.', audio: 'Grâce à notre protocole direct asynchrone déporté, vos campagnes d\'emails atterrissent directement dans la boîte principale à la vitesse de l\'éclair, sans frais de plateforme récurrent.' }
        ],
        cta: 'Libérez-vous définitivement des abonnements d\'envois mensuels. Téléchargez la suite Nexus AI maintenant !'
      }
    },
    {
      id: 'wp-crm',
      title: 'Live Visitor Radar',
      subtitle: 'Télémétrie passive de vos acheteurs en temps réel sans code lourd.',
      icon: Radio,
      color: 'from-cyan-500 to-blue-600 border-cyan-500/30',
      badge: 'Interception Live',
      battlecard: {
        painPoint: 'Analyser pourquoi vos clients n\'achètent pas requiert l\'ajout de scripts de heatmap volumineux comme Hotjar. Ces outils tiers externes bloquent le fil principal du navigateur sur mobile, écrasent l\'interactivité et nuisent gravement au SEO.',
        technicalEdge: 'Suivi asynchrone passif de télémétrie encapsulé sous un micro-script optimisé de moins de 1 kiloctet. Les vagues de clics, ajouts au panier et départs du processus d\'achat de WooCommerce sont stockés sur notre base Cloud sans ralentir l\'expérience utilisateur.',
        competitors: 'Hotjar Corporate, LiveChat Enterprise, CrazyEgg',
        competitorCost: '59€ à 120€ par mois',
        nexusSetup: 'Une seule ligne de code asynchrone injectée nativement et déconnectée de vos ressources d\'hébergement standards.',
        nexusCost: 'Fourni gratuitement avec la licence à vie',
        roiAdvantage: 'Suppression globale des scripts JS externes lents. Possibilité technique d\'intercepter et d\'offrir un coupon flash en moins de 10 secondes aux acheteurs hésitants (recouvrement de panier +18%).'
      },
      script: {
        hook: '« Regarde tes paniers WooCommerce se faire abandonner en temps réel et sauve-les ! » 👁️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un écran de smartphone simulant un internaute qui hésite longuement devant le formulaire d\'adresse puis s\'en va.', audio: 'Chaque jour, votre boutique enregistre de précieux ajouts au panier. Mais combien s\'en vont sans payer à cause d\'une friction de dernière minute ?' },
          { time: '00:05 - 00:15', direction: 'Zoomer en grand angle sur la map active de Live Visitor Radar où les visiteurs apparaissent sous forme de signaux luminescents.', audio: 'Grâce au Live Visitor Radar de Nexus, vous analysez le comportement sémantique de vos clients en direct sans dégrader vos scores SEO avec un tracker lourd.' },
          { time: '00:15 - 00:25', direction: 'Montrer l\'activation d\'un coupon de relance automatique WhatsApp ou SMS envoyé asynchroniquement.', audio: 'Le module identifie l\'hésitation et vous donne le contrôle pour relancer l\'acheteur avec un code adapté, récupérant jusqu\'à 18% de commandes abandonnées.' }
        ],
        cta: 'Convertissez vos paniers délaissés en clients comblés. Activez la puissance du radar client Nexus AI à vie !'
      }
    },
    {
      id: 'maintenance',
      title: 'Maintenance & Optimisation',
      subtitle: 'Nettoyage MySQL automatique en arrière-plan cloud pour un WooCommerce ultra-rapide.',
      icon: Settings,
      color: 'from-slate-600 to-slate-800 border-slate-600/30',
      badge: 'Zéro Lag SQL',
      battlecard: {
        painPoint: 'Mettre à jour de gros volumes de prix, de catégories ou de fiches produits sur WooCommerce fait régulièrement ramer le site ou crasher la base MySQL locale en raison de requêtes lourdes. De même, accumuler des révisions inutiles ralentit l\'ensemble de l\'expérience client.',
        technicalEdge: 'Moteur d\'édition global asynchrone. Vos requêtes massives s\'exécutent par blocs asynchrones ordonnés en arrière-plan cloud, sans saturer les capacités de calcul PHP ou SQL de WordPress.',
        competitors: 'WP Sheet Editor, WP-Optimize Pro, WP-Sweep Premium',
        competitorCost: '29€ à 59€ de licences cumulées',
        nexusSetup: 'Aucun plugin local fragile. Vos instructions de masse transitent proprement par l\'API Nexus asynchrone sécurisée d\'administration.',
        nexusCost: 'Inclus d\'office à vie dans le kit de commande',
        roiAdvantage: 'Temps administratif d\'édition divisé par 10. Nettoyage régulier de la base MySQL réduisant de -40% le poids des backups et améliorant le temps de réponse sémantique.'
      },
      script: {
        hook: '« Arrête de faire ramer ton WooCommerce à chaque fois que tu lances un changement de prix ! » ⚙️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un e-commerçant agacé fixant une barre de chargement d\'un outil d\'édition par lot bloquée à 15%.', audio: 'Si vous avez déjà essayé de changer les tarifs ou les tags de 500 fiches produits d\'un coup sur WooCommerce, vous connaissez la douleur du chargement infini ou du serveur saturé.' },
          { time: '00:05 - 00:15', direction: 'Prendre une capture de l\'interface du Bulk Editor de Nexus. Taper +10% en pourcentage global pour toute une gamme et valider.', audio: 'Avec Nexus AI, le traitement lourd est déporté asynchroniquement sur notre Cloud. Des milliers de références révisées en moins de 3 secondes, sans la moindre seconde de lag sur votre boutique.' },
          { time: '00:15 - 00:25', direction: 'Montrer la jauge de nettoyage de table MySQL "Auto-Clean" s\'exécuter instantanément avec une petite icône aspirateur.', audio: 'Le module purge en même temps toutes les vieilles données fantômes de votre base pour rendre l\'affichage de votre catalogue fluide comme l\'éclair.' }
        ],
        cta: 'Prenez le contrôle technique absolu de votre gestion e-commerce. Rejoignez Nexus et profitez du deal à vie VIP avant sa fermeture !'
      }
    },
    {
      id: 'affiliation',
      title: 'Affiliation & Ambassadeurs',
      subtitle: 'Réseau d\'ambassadeurs décentralisé sans frais récurrents pour surmultiplier vos ventes.',
      icon: Percent,
      color: 'from-amber-400 to-yellow-500 border-amber-400/30',
      badge: 'Croissance Virale',
      battlecard: {
        painPoint: 'Les outils classiques d\'affiliation (Shopify Collabs, GoAffPro) imposent des taux de commission élevés ou des abonnements mensuels lourds. De plus, ils ralentissent la vitesse mobile du site avec des redirections de tracking pesantes et des cookies tiers instables.',
        technicalEdge: 'Système d\'affiliation sémantique asynchrone directement intégré. Génération dynamique de coupons de recommandation uniques synchronisés en cache locale, sans cookies tiers ralentissants et avec attribution ultra-rapide.',
        competitors: 'GoAffPro Premium, UpPromote, Shopify Collabs Enterprise',
        competitorCost: '39€ à 149€ par mois d\'abonnement',
        nexusSetup: 'Zéro configuration technique. Activez l\'attribution automatique par coupons personnalisables d\'influenceurs et suivez les conversions depuis la console cloud.',
        nexusCost: 'Totalement inclus et sans frais de transaction récurrents',
        roiAdvantage: 'Génération d\'un canal d\'acquisition organique ultra-performant géré par vos clients fidèles (+25% de ventes par recommandation), économisant des milliers d\'euros de publicités payantes.'
      },
      script: {
        hook: '« Crée ton propre réseau d’affiliés de combat pour WooCommerce en 1 clic ! » 👥',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un graphique de ventes organiques qui décolle avec un badge d\'invitations d\'influenceurs dans un flux dynamique.', audio: 'Le meilleur trafic e-commerce, c\'est celui qui vient de la recommandation humaine. Mais monter son propre réseau d\'ambassadeurs et d\'affiliés est un calvaire administratif et technologique avec de simples extensions WordPress.' },
          { time: '00:05 - 00:15', direction: 'Afficher le panneau de gestion de l\'Affiliation de Nexus montrant la création instantanée d\'un lien et d\'un coupon d\'affilié.', audio: 'Nexus Affiliation génère des codes de réduction asynchrones ultra-légers pour vos partenaires. Pas de cookies intrusifs, pas de ralentissements de chargement, pas de bugs de tracking. Vos affiliés publient leur lien sémantique, et vous encaissez.' },
          { time: '00:15 - 00:25', direction: 'Montrer le tableau de récompenses et la répartition automatique des commissions sur une superbe interface financière.', audio: 'L\'intelligence de Nexus calcule la marge nette de chaque parrainage et automatise l\'attribution des gains. C\'est une armée de commerciaux qui travaillent pour vous à la performance pure sans aucun risque !' }
        ],
        cta: 'Faites de vos clients vos meilleurs ambassadeurs de ventes. Activez l\'affiliation asynchrone Nexus AI dès aujourd\'hui !'
      }
    },
    {
      id: 'dashboard',
      title: 'Cockpit & Hub Central',
      subtitle: 'Aperçu analytique asynchrone ultra-fluide pour piloter votre activité sans lag.',
      icon: LayoutDashboard,
      color: 'from-indigo-500 to-purple-600 border-indigo-500/30',
      badge: 'Visualisations Temps Réel',
      battlecard: {
        painPoint: 'Les dashboards analytiques WordPress natifs ou plugins tiers (MonsterInsights) exécutent des requêtes SQL lourdes à chaque ouverture, provoquant de gros lags d\'administration, augmentant le TTFB et ralentissant l\'expérience client en direct en surchargeant la base.',
        technicalEdge: 'Moteur de télémétrie asynchrone assemblé sur le cloud Nexus. Les données de visites, ventes, paniers et performances de sécurité sont pré-agrégées dans un cache compressé hyper-rapide, assurant un affichage instantané fluide.',
        competitors: 'MonsterInsights Pro, GA4 Dashboards lourds, WooCommerce Analytics natifs',
        competitorCost: '99€ à 199€ par mois de licence et de serveurs',
        nexusSetup: 'Entièrement pré-configuré nativement. Le cockpit centralisé s\'ouvre en 0.1s sans charger une seule requête lourde SQL sur votre hébergement.',
        nexusCost: 'Inclus par défaut dans la suite à vie',
        roiAdvantage: 'Gain de précieuses heures d\'analyse par semaine et pilotage chirurgical des coûts de trafic et des marges nettes pour prendre des décisions rentables instantanées.'
      },
      script: {
        hook: '« Suis tes performances e-commerce en temps réel sans jamais ralentir ton serveur ! » ⚡',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un chargement WordPress interminable avec un spinner qui tourne lentement sur fond d\'administration figée.', audio: 'Vous ouvrez votre panneau d\'administration WooCommerce pour suivre vos chiffres de la journée, et là... écran blanc, chargement sans fin, site client qui rame. Les systèmes analytiques standards surchargent votre base de données.' },
          { time: '00:05 - 00:15', direction: 'Afficher le Cockpit Dashboard Nexus qui s\'ouvre instantanément en dévoilant de superbes widgets interactifs de statistiques.', audio: 'Regardez la fluidité de Nexus Cockpit. Nos analytiques se chargent asynchroniquement depuis les serveurs d\'administration de Nexus, dissociant complètement la télémétrie passive du serveur d\'hébergement de votre boutique.' },
          { time: '00:15 - 00:25', direction: 'Montrer l\'analyse de marge nette et de paniers actifs se mettre à jour sous un clic fluide sans aucune latence.', audio: 'Vous visualisez vos ventes brutes, votre marge nette exacte calculée à la seconde près, les anomalies réseau et les opportunités d\'optimisation en une seule vue haute fidélité.' }
        ],
        cta: 'Prenez le contrôle technique de votre administration sans subir le moindre lag. Rejoignez l\'univers Nexus AI maintenant.'
      }
    },
    {
      id: 'seo-interlinks',
      title: 'Maillage Interne Sémantique',
      subtitle: 'Liaison robotique intelligente et automatique entre vos fiches produits & articles.',
      icon: Link,
      color: 'from-rose-500 to-pink-600 border-rose-500/30',
      badge: 'Optimisation SEO Pro',
      battlecard: {
        painPoint: 'Tisser manuellement des liaisons logiques entre des centaines de fiches produits et des articles de blog prend un temps colossal, et le moindre oubli empêche les robots de Google d\'explorer efficacement l\'ensemble de votre catalogue.',
        technicalEdge: 'Algorithme d\'analyse sémantique automatique Nexus. Détecte les concordances de mots-clés et tisse des ancres de liens internes hypertextes ultra-pertinents. S\'exécute et s\'affiche au chargement de manière asynchrone, sans injecter de code lourd en base de données.',
        competitors: 'Link Whisper Premium, Yoast SEO Interlinks Engine',
        competitorCost: '49€ à 129€ par an par site web',
        nexusSetup: 'Analyse intégrale de la structure de vos fiches et articles en 1 minute et mise en place de liaisons sémantiques sécurisées inter-pages.',
        nexusCost: 'Inclus, génération de liens internes illimitée',
        roiAdvantage: 'Vitesse d\'indexation organique sur Google Search Console multipliée par 2.5 sur l\'intégralité des variations de fiches produits profondes.'
      },
      script: {
        hook: '« Propulsez votre référencement naturel avec un maillage interne automatisé par l’IA ! » 🕷️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Afficher un écran de Google Search Console avec de nombreuses fiches produits marquées "Découvertes - actuellement non indexées".', audio: 'Pourquoi vos beaux articles de blog et fiches produits WooCommerce n\'apparaissent pas sur Google ? C\'est simple : si vous n\'avez pas un maillage sémantique d\'interconnexion parfait, Google Bot s\'en va sans rien indexer.' },
          { time: '00:05 - 00:15', direction: 'Passer sur le panneau Maillage Sémantique de Nexus. On y voit un graphe réseau sémantique dynamique reliant instantanément les fiches.', audio: 'Notre système sémantique asynchrone analyse le vocabulaire de votre site. En un éclair, il repère les mots clés complémentaires et insère de parfaits maillages d\'ancres logiques de l\'un à l\'autre sans ralentir le serveur local.' },
          { time: '00:15 - 00:25', direction: 'Montrer la courbe de positions Google s\'envoler vers le haut avec des indicateurs de liens profonds actifs.', audio: 'Pas de plugin lourd qui réécrit de manière instable vos bases de données WordPress. Les robots naviguent en boucle sur votre site, indexent tout votre catalogue WooCommerce et vous font monter dans les résultats.' }
        ],
        cta: 'Dominez les classements de Google grâce à un maillage sémantique irréprochable. Téléchargez Nexus AI aujourd\'hui.'
      }
    },
    {
      id: 'woo-orders-mgr',
      title: 'Commandes WooCommerce Rapid',
      subtitle: 'Gestion de panier par catalogue catégorisé et synchronisation AliExpress automatisée.',
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-600 border-amber-500/30',
      badge: 'Efficacité Logistique',
      battlecard: {
        painPoint: 'Traiter, expédier et éditer des bordereaux de commandes sur WooCommerce nécessite des allers-retours fastidieux dans l\'admin WordPress. Saisir de nouveaux produits manuellement prend du temps et augmente le risque d\'erreur, tout comme copier-coller manuellement les adresses des clients sur AliExpress.',
        technicalEdge: 'Sélecteur de catalogue interne intégré au gestionnaire de commande avec filtrage par catégorie et champ de recherche directe. Intégration AliExpress en production réelle : transmission automatique sécurisée des adresses clients, connexion directe vendeur et passation de commandes automatisée avec récupération de code tracking et mise à jour WordPress.',
        competitors: 'WooCommerce native slow actions, expensive third-party manual dropship extensions',
        competitorCost: 'Perte de temps logistique conséquente ($30-$80/mois pour des abonnements d\'outils externes)',
        nexusSetup: 'Connexion directe API asynchrone sécurisée. Activez instantanément le filtrage de catalogue de stock et l\'expédition directe API AliExpress.',
        nexusCost: 'Totalement inclus et sans surcoût',
        roiAdvantage: 'Traitement logistique réduit à quelques secondes, élimination totale des erreurs d\'adresse d\'expédition, et synchronisation sémantique automatique du catalogue.'
      },
      script: {
        hook: '« Gère ton catalogue interne et tes commandes AliExpress en un clic sur WooCommerce ! » 📦',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un e-commerçant recherchant manuellement les produits pour les insérer dans une commande et faire des copier-coller interminables de l\'adresse client vers AliExpress.', audio: 'Saisir manuellement des nouveaux produits dans les commandes ou recopier les adresses de livraison sur AliExpress une par une est une perte de temps monumentale avec de gros risques d\'erreurs.' },
          { time: '00:05 - 00:15', direction: 'Afficher l\'outil d\'Édition de Commande Nexus, activant le sélecteur avec liste déroulante filtrée par catégorie et recherche instantanée.', audio: 'Regardez ça ! Nexus intègre directement votre catalogue WooCommerce. Choisissez une catégorie, trouvez votre produit d\'un clic, et le prix et le stock se mettent à jour instantanément sans écrire une seule ligne.' },
          { time: '00:15 - 00:25', direction: 'Lancer l\'action de commande AliExpress réelle, voir les étapes asynchrones défiler et se valider d\'un coup avec le numéro de tracking de livraison réel final.', audio: 'Et pour expédier ? Cliquez sur "Passer la commande AliExpress". Notre script s\'occupe de tout : connexion sécurisée au vendeur, envoi automatique des coordonnées réelles du client en tâche de fond, et validation. Vous obtenez directement le code de suivi international, synchronisé sur votre WordPress !' }
        ],
        cta: 'Éliminez les tâches manuelles de votre e-commerce. Adoptez la puissance logistique de la suite Nexus AI.'
      }
    },
    {
      id: 'product-manager',
      title: 'Manager Produits & Catalogue',
      subtitle: 'Modification de fiches produits globale instantanée sans recharger de pages WordPress.',
      icon: Settings,
      color: 'from-blue-500 to-indigo-600 border-blue-500/30',
      badge: 'Édition Éclair',
      battlecard: {
        painPoint: 'Ajouter des variations de tailles ou de couleurs, modifier des fiches produits ou mettre à jour des tarifs sur WooCommerce exige d\'interminables chargements de pages WordPress et sature les ressources d\'hébergement sur de grands catalogues.',
        technicalEdge: 'Moteur d\'édition asynchrone hors-site. Vos modifications s\'effectuent dans une grille hyper-rapide gérée en cache d\'administration déporté, puis sont insérées par paquets optimisés via l\'API sans aucun impact sur l\'hébergement.',
        competitors: 'WP All Import/Export Premium, WP Sheet Editor, manual settings pages',
        competitorCost: '59€ à 149€ d\'abonnements annuels cumulés',
        nexusSetup: 'Accès API asynchrone instantané. Permet d\'ajouter, modifier ou synchroniser des variations de produits depuis une table de contrôle épurée.',
        nexusCost: 'Totalement intégré à vie',
        roiAdvantage: 'Temps de mise à jour du catalogue divisé par 10. Permet de piloter d\'un seul coup des milliers de fiches de produits sans ralentir le parcours des clients actifs.'
      },
      script: {
        hook: '« Modifie tout ton catalogue produit WooCommerce en 2 minutes chrono ! » 🛍️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un administrateur WooCommerce frustré devant son écran WordPress natif, obligé de rafraîchir chaque produit individuellement.', audio: 'Éditer les tarifs, descriptions ou images d\'une trentaine de produits sur WooCommerce est une épreuve d\'endurance ennuyeuse. Chaque validation demande un rafraîchissement qui met une éternité.' },
          { time: '00:05 - 00:15', direction: 'Afficher le Manager Produit de Nexus avec sa grille instantanée modifiant en direct des dizaines de prix sous un glissement d\'interrupteur.', audio: 'Découvrez le puissant Manager de Produits déporté de Nexus AI. Vous travaillez en temps réel sur une interface sémantique moderne. Entrez des variations de stock, de tarifs ou ajustez vos images de catalogue en un clin d’œil.' },
          { time: '00:15 - 00:25', direction: 'Cliquer sur Sauvegarder et montrer la barre de progression asynchrone "Nexus Sync" se terminer instantanément en tâche de fond.', audio: 'Toutes les données se synchronisent de manière asynchrone sur votre site WooCommerce, sans interrompre une seule seconde la navigation ou les paiements de vos visiteurs actifs.' }
        ],
        cta: 'Administrez votre boutique à la vitesse de l\'éclair. Activez vos accès Nexus AI à vie dès à présent.'
      }
    },
    {
      id: 'nexus-link-importer',
      title: "Pont d'Importation Unifié & Bulk Extension Chrome",
      subtitle: "Importation multiple AliExpress via l'extension Chrome Nexus Link avec scraping temps réel et coefficients de prix.",
      icon: Link,
      color: "from-indigo-600 to-emerald-600 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
      badge: "Sourcing & Import de Masse IA",
      battlecard: {
        painPoint: "Importer des catalogues entiers AliExpress prend des heures de copier-coller. De plus, les extensions classiques (Dsers, AliDropship) facturent des abonnements mensuels records, imposent des captchas frustrants, ralentissent WooCommerce et créent du contenu dupliqué pénalisé par Google SEO.",
        technicalEdge: "Scraping temps réel déporté sur l'extension Chrome 'Nexus Link Pro'. L'extension capture le contenu directement depuis le DOM du navigateur de l'utilisateur (prix d'origine, titres, images HD) contournant 100% des blocages anti-bot, puis le diffuse via un pont de communication sécurisé. Le moteur applique un multiplicateur de marge dynamique réglable, enrichit la description avec l'IA Gemini et synchronise en tâche de fond avec WooCommerce, avec sauvegarde en simulation locale s'il y a déconnexion.",
        competitors: "DSers, AliDropship, Importify, Dropified",
        competitorCost: "29€ à 59€/mois d'abonnement + frais de service à la transaction",
        nexusSetup: "Activez l'extension Nexus Link Pro, faites vos recherches sur AliExpress, cochez les produits voulus et validez ! Le module de masse dans Nexus prend le relais pour tout automatiser.",
        nexusCost: "Inclus à vie dans l'offre Nexus Lifetime",
        roiAdvantage: "Économie de plus de 450€ d'abonnements par an, temps de sourcing divisé par 50 et fiches produits automatiquement réécrites par l'IA pour être 100% uniques et indexées par Google."
      },
      script: {
        hook: "« Importe TOUT un catalogue AliExpress sur ton WooCommerce en 60 secondes chrono ! » 🚀",
        steps: [
          { time: '00:00 - 00:05', direction: "Montrer un e-commerçant découragé devant des copier-coller manuels sans fin, ou payant des abonnements mensuels pour importer des fiches produits.", audio: "Arrêtez de gaspiller des heures à copier des images et des textes d'AliExpress, et stoppez immédiatement vos abonnements DSers ou Importify exorbitants !" },
          { time: '00:05 - 00:15', direction: "Filmer l'écran sur AliExpress. Lancer l'extension Chrome intégrée : elle liste instantanément tous les vélos ou vêtements de la page active. Cocher 10 articles, cliquer sur 'Importer dans Nexus'.", audio: "Regardez ça. Vous naviguez tranquillement sur AliExpress, vous lancez notre extension Chrome Nexus Link Pro, elle aspire en temps réel les miniatures, titres et prix originaux directement depuis votre session. Cliquez, et la liste se charge instantanément dans votre console Nexus !" },
          { time: '00:15 - 00:25', direction: "Ajuster le coefficient de prix à '1.5', cliquer sur 'Lancer l'importation multiple'. Voir la jauge d'import verdir à toute vitesse au fur et à mesure que Gemini réécrit les descriptions.", audio: "Ajustez d'un clic votre coefficient multiplicateur de prix (ex: 1.5x le prix d'origine), lancez la file et l'IA Gemini réécrit des fiches de vente élégantes et 100% uniques en français. WooCommerce valide instantanément et asynchroniquement vos créations !" }
        ],
        cta: "Libérez la puissance du dropshipping et du sourcing automatique. Prenez votre licence Nexus Lifetime à vie dès aujourd'hui !"
      }
    },
    {
      id: 'categories-tags',
      title: 'Catégories & Tags IA',
      subtitle: 'Nettoyage taxinomique autonome et balisage de votre boutique optimisé pour Google.',
      icon: Tag,
      color: 'from-violet-500 to-purple-600 border-violet-500/30',
      badge: 'Balisage Sémantique',
      battlecard: {
        painPoint: 'Accumuler des centaines de tags orphelins, vides ou dupliqués dilue irrémédiablement le référencement naturel (SEO Juice) de votre WooCommerce et crée des incohérences qui pénalisent votre indexation Google.',
        technicalEdge: 'Analyseur sémantique taxinomique. Analyse la taxonomie de votre catalogue WooCommerce, propose la fusion intelligente des étiquettes doublons et réorganise les hiérarchies de catégories de manière asynchrone.',
        competitors: 'Manual SQL tag cleaners, slow WordPress category editors',
        competitorCost: 'Dizaines d\'heures de travail technique laborieux',
        nexusSetup: 'Activez l\'auditeur fiscal IA de Nexus pour scanner et baliser de manière propre l\'ensemble des fiches produits de votre commerce.',
        nexusCost: 'Inclus sans frais de licence de nettoyage additionnels',
        roiAdvantage: 'Nettoyage instantané des contenus dupliqués pour maximiser l\'exploration des robots (crawl budget) et remonter de +22% dans les pages de résultats.'
      },
      script: {
        hook: '« Nettoie et structure tes catégories et étiquettes WooCommerce pour plaire à Google ! » 🏷️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer une liste WordPress encombrée de centaines de tags obsolètes ou doublons (ex: basket, baskets, basket-sport) provoquant des erreurs.', audio: 'Est-ce que votre boutique WooCommerce accumule des centaines d\'étiquettes vides, mal écrites ou en double ? C\'est une anomalie invisible qui détruit votre référencement auprès de Google.' },
          { time: '00:05 - 00:15', direction: 'Afficher le gestionnaire de Catégories & Tags IA de Nexus avec des regroupements sémantiques intelligents fusionnant les étiquettes en direct.', audio: 'Le module Catégories et Tags IA de Nexus analyse l\'arbre taxinomique de votre site. En un clic, l\'IA fusionne les synonymes, élimine les tags inutilisés et structure de superbes catégories ultra-propres.' },
          { time: '00:15 - 00:25', direction: 'Afficher le plan d\'exploration de Google Search Console redevenir parfaitement propre et vert sous un graphique d\'indexation.', audio: 'Toutes les erreurs de taxonomie s\'effacent, optimisant immédiatement le parcours des robots de Google pour de meilleures positions organiques gratuites !' }
        ],
        cta: 'Offrez une architecture irréprochable et optimisée à votre boutique pour dominer votre marché. Activez Nexus à vie !'
      }
    },
    {
      id: 'pixels',
      title: 'Multi-Pixel Analytics',
      subtitle: 'Centralisez, dédoublonnez et auditez vos conversions asynchrones sans lourdeur WordPress.',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600 border-blue-500/30',
      badge: '100% Asynchrone',
      battlecard: {
        painPoint: 'Les e-commerçants accumulent plusieurs extensions lourdes pour injecter leurs pixels d\'acquisition (Meta, GA4, TikTok, Pinterest), augmentant drastiquement le temps de charge mobile. De plus, les bloqueurs de cookies du navigateur font perdre environ 30% à 40% des événements d\'achat réels, faussant les campagnes publicitaires.',
        technicalEdge: 'Intégration asynchrone déportée sur notre canal d\'API Cloud. Nexus corrèle à la volée les flux navigateur et serveur en transmettant des clés uniques (event_id) de dédoublonnage. Un diagnostic Sandbox G-AI simule et valide instantanément la santé d\'injection, le bypass de pare-feu et les indicateurs GDPR.',
        competitors: 'PixelYourSite Pro, GTM (Google Tag Manager) plugin custom templates, PixelCat Pro',
        competitorCost: '80€ à 180€ par an par site',
        nexusSetup: 'Un script unique asynchrone de moins de 1.5Ko gérant toutes les régies principales par bouton interrupteur.',
        nexusCost: 'Inclus gratuitement à vie dans l\'offre globale Nexus SaaS',
        roiAdvantage: 'Restauration immédiate d\'environ 35% d\'événements d\'achats non suivis, optimisant l\'attribution de vos régies publicitaires pour un meilleur ROAS, tout en économisant les abonnements concurrents et en maintenant un Core Web Vitals vert.'
      },
      script: {
        hook: '« Arrêtez de jeter 35% de vos budgets publicitaires WooCommerce par la fenêtre ! » 🛑',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un e-commerçant déçu devant son dashboard publicitaire affichant un ROAS en baisse brutale avec icônes de pertes en rouge.', audio: 'Vous dépensez de l\'argent en publicités sur Facebook, TikTok ou Google, mais vos ventes ne remontent pas correctement dans vos tableaux de bord ? C\'est normal, les bloqueurs de navigateurs récents bloquent près de 35% des pixels.' },
          { time: '00:05 - 00:15', direction: 'Zoom sur la console Multi-Pixel de Nexus en allumant au vert un switch GA4 et en mettant en branle l\'asynchrone.', audio: 'Nexus règle ça en 10 secondes. Vous renseignez vos Pixel IDs de régie sur notre cockpit, vous activez l\'interrupteur d\'injection asynchrone, et notre passerelle Cloud s\'occupe du traitement.' },
          { time: '00:15 - 00:25', direction: 'Afficher le graphe Recharts d\'événements suivis s\'accordant au pixel près avec des signaux d\'achats.', audio: 'Grâce à la déduplication asynchrone navigateur-serveur, 100% de vos événements de conversion réels sont livrés à vos régies de pub. Votre ROAS remonte et votre vitesse de site mobile reste au maximum.' }
        ],
        cta: 'Configurez dès maintenant vos pixels publicitaires asynchrones sur Nexus et dominez vos campagnes d\'acquisition ! Activez votre licence à vie !'
      }
    },
    {
      id: 'market',
      title: 'Intelligence Marché',
      subtitle: 'Scraping et veille tarifaire passive pour adapter vos stratégies d’acquisition.',
      icon: Zap,
      color: 'from-indigo-500 to-indigo-600 border-indigo-500/30',
      badge: 'Veille Tarifaire',
      battlecard: {
        painPoint: 'Surveiller manuellement les variations de prix et les nouveautés des boutiques concurrentes prend un temps infini et mène souvent à vendre avec des prix hors marché qui font fuir les clients.',
        technicalEdge: 'Moteur de scraping asynchrone non-intrusif s\'exécutant en arrière-plan cloud pour extraire et analyser sans ralentir l\'hôte les tarifs, balises et changements de catalogues de vos concurrents.',
        competitors: 'SEMrush, Sniffie, Price2Spy, Prisync',
        competitorCost: '99€ à 299€ par mois d’abonnement récurrent',
        nexusSetup: 'Saisissez simplement l\'URL de la boutique ou de la catégorie concurrente sous votre onglet Intelligence Marché de Nexus.',
        nexusCost: 'Inclus à vie avec rafraîchissement programmé automatique',
        roiAdvantage: 'Ajustement automatique des prix face à vos concurrents pour augmenter le taux de conversion global de +24% et d\'acquérir un avantage concurrentiel décisif.'
      },
      script: {
        hook: '« Ne laisse plus jamais la concurrence te voler tes ventes sous le nez ! » 🕵️‍♂️',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer un comparateur de prix où notre produit est plus cher d’un euro et le panier abandonné qui en découle.', audio: 'Un client est prêt à acheter chez vous, mais il fait une recherche rapide et trouve exactement le même produit un euro moins cher ailleurs. Boom, vous venez de perdre une vente.' },
          { time: '00:05 - 00:15', direction: 'Filmer l\'onglet Intelligence Marché de Nexus montrant le relevé des prix concurrents mis à jour de manière asynchrone.', audio: 'Grâce au module exclusive Intelligence Marché de Nexus, notre robot cloud analyse poliment les sites concurrents en tâche de fond pour répertorier leurs prix réels sans jamais impacter la vitesse de votre boutique.' },
          { time: '00:15 - 00:25', direction: 'Faire clignoter l\'alerte de tarification intelligente suggérant un coupon temporaire personnalisé sur le produit ciblé.', audio: 'Le cockpit vous signale instantanément les écarts et calcule pour vous le tarif idéal pour rester compétitif tout en préservant vos marges nettes.' }
        ],
        cta: 'Prenez une longueur d\'avance décisive sur vos concurrents et maximisez vos marges. Téléchargez Nexus AI dès maintenant !'
      }
    },
    {
      id: 'stock',
      title: 'Analyse Stocks & Logistique',
      subtitle: 'Cartographie intelligente de la vélocité de vos produits et détection des surstocks.',
      icon: TrendingUp,
      color: 'from-teal-500 to-emerald-600 border-teal-500/30',
      badge: 'KPI Logistique',
      battlecard: {
        painPoint: 'Les gérants WooCommerce manquent d’outils clairs pour repérer les best-sellers au rendement maximal et identifier les produits à rotation lente qui étouffent la trésorerie au fond de l’entrepôt.',
        technicalEdge: 'Calculs analytiques de vélocité de rotation des marchandises et mesure des KPIs de performance de stocks sans charger la base de données WordPress de WooCommerce grâce à notre asynchronisme pré-agrégé.',
        competitors: 'Inventory Planner, Katana MRP, Stocky',
        competitorCost: '79€ à 199€ par mois d’abonnement logiciel',
        nexusSetup: 'Connexion native à votre entrepôt de données de ventes WooCommerce par notre proxy asynchrone sécurisé, zéro configuration manuelle.',
        nexusCost: 'Inclus de manière permanente avec vos options d\'équipe',
        roiAdvantage: 'Élimination des coûts liés au surstockage des produits à rotation lente et réemploi stratégique de 100% de la trésorerie vers l\'acquisition de vos best-sellers.'
      },
      script: {
        hook: '« Libère la trésorerie bloquée dans tes stocks invendus et finance ta croissance ! » 📦',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer des piles de colis poussiéreux dans un recoin sombre symbolisant l\'argent mort dormant au fond du stock.', audio: 'Saviez-vous que près de 30% de votre capital de marque est englué dans du stock inutile qui ne se vend pas ? C\'est de l\'argent qui dort alors qu\'il devrait financer votre pub.' },
          { time: '00:05 - 00:15', direction: 'Pointer l\'écran Analyse de Stocks de Nexus montrant le diagramme circulaire de rotation des produits en violet et émeraude.', audio: 'Le module de performance Logistique de Nexus de combat cartographie la vélocité réelle de votre catalogue. Il isole instantanément les articles à rotation rapide de vos poids morts à écouler de toute urgence.' },
          { time: '00:15 - 00:25', direction: 'Faire glisser un graphique d\'évaluation financière de l\'inventaire se rationalisant et augmentant la trésorerie sur un volet fluide.', audio: 'En moins d\'une minute, vous ajustez votre stratégie fournisseur pour commander uniquement ce qui part et libérer des milliers d\'euros de cash-flow net !' }
        ],
        cta: 'Pilotez vos stocks comme les géants du e-commerce et redonnez du souffle à votre trésorerie. Activez votre licence Nexus à vie aujourd\'hui.'
      }
    },
    {
      id: 'audit',
      title: 'Audit & Analyse SEO',
      subtitle: 'Diagnostic sémantique et technique complet pour valider vos balises et votre vitesse Google.',
      icon: ShieldCheck,
      color: 'from-sky-500 to-indigo-600 border-sky-500/20',
      badge: 'Diagnostic Sémantique',
      battlecard: {
        painPoint: 'Les erreurs de structure technique (balises Hx absentes, redirections rompues, méta-descriptions trop courtes) sont invisibles à l\'œil nu mais lourdement pénalisées par l\'algorithme de Google, bloquant à tout jamais votre trafic organique.',
        technicalEdge: 'Scanner sémantique asynchrone de bas niveau. Examine intelligemment votre structure HTML, vérifie le balisage des fiches de produits et fournit un score de conformité SEO instantané sans consommer la moindre ressource d\'hébergement.',
        competitors: 'Screaming Frog, Sitebulb, WooRank, Semrush Site Audit',
        competitorCost: '49€ à 150€ par an de licence de crawling',
        nexusSetup: 'Un clic sur "Lancer l\'audit" depuis la console Nexus et l\'IA explore de manière asynchronique les URLs de votre boutique.',
        nexusCost: 'Inclus à vie avec audits automatiques illimités',
        roiAdvantage: 'Détection et correction immédiate de 100% des barrières d\'indexation Google, multipliant par 3 vos chances de vous positionner en première page du moteur de recherche.'
      },
      script: {
        hook: '« Guéris les erreurs invisibles qui empêchent ton site WooCommerce de monter sur Google ! » 🩺',
        steps: [
          { time: '00:00 - 00:05', direction: 'Montrer une loupe glissant sur du code HTML flou avec un gros triangle d’avertissement rouge SEO.', audio: 'Vous avez rédigé des descriptions magnifiques, mais votre site reste invisible sur Google ? C’est qu’il regorge de bugs techniques invisibles de balisage ou de vitesse d’affichage.' },
          { time: '00:05 - 00:15', direction: 'Passer sur le rapport d\'Audit Sémantique de Nexus. Un score de santé global s\'affiche fièrement à 98% en vert.', audio: 'Le module d’Audit SEO de Nexus scrute vos pages et vos fiches de haut en bas depuis l’infrastructure de notre Cloud. Il pointe du doigt les balises Hx dupliquées, les métas absentes et les ralentissements réels.' },
          { time: '00:15 - 00:25', direction: 'Cliquer sur une checklist résolvant une anomalie technique et montrant un score Google s\'élever vers des sommets.', audio: 'Plus besoin d\'outils d\'audit complexes et chers. Vous suivez notre roadmap interactive pour corriger les failles techniques et propulser vos fiches produits devant l\'œil de Google.' }
        ],
        cta: 'Offrez le meilleur passeport technique pour la première page de Google à votre boutique. Cliquez et réclamez votre accès Nexus !'
      }
    }
  ];

  const localizedModules: ModuleMarketingData[] = marketingModules.map(mod => {
    if (currentLang === 'en' && englishTranslations[mod.id]) {
      const en = englishTranslations[mod.id];
      return {
        ...mod,
        title: en.title || mod.title,
        subtitle: en.subtitle || mod.subtitle,
        badge: en.badge || mod.badge,
        battlecard: {
          painPoint: en.battlecard?.painPoint || mod.battlecard.painPoint,
          technicalEdge: en.battlecard?.technicalEdge || mod.battlecard.technicalEdge,
          competitors: en.battlecard?.competitors || mod.battlecard.competitors,
          competitorCost: en.battlecard?.competitorCost || mod.battlecard.competitorCost,
          nexusSetup: en.battlecard?.nexusSetup || mod.battlecard.nexusSetup,
          nexusCost: en.battlecard?.nexusCost || mod.battlecard.nexusCost,
          roiAdvantage: en.battlecard?.roiAdvantage || mod.battlecard.roiAdvantage,
        },
        script: {
          hook: en.script?.hook || mod.script.hook,
          steps: (en.script?.steps || mod.script.steps).map((step, idx) => ({
            time: step.time || mod.script.steps[idx]?.time || '',
            direction: step.direction || mod.script.steps[idx]?.direction || '',
            audio: step.audio || mod.script.steps[idx]?.audio || ''
          })),
          cta: en.script?.cta || mod.script.cta
        }
      };
    }
    return mod;
  });

  const currentModuleData = localizedModules.find(m => m.id === activeModule) || localizedModules[0];

  const copyToClipboard = (text: string, type: 'script' | 'battle') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedBattle(true);
      setTimeout(() => setCopiedBattle(false), 2000);
    }
  };

  const getFullBattlecardText = (module: ModuleMarketingData) => {
    const isEn = currentLang === 'en';
    return isEn 
      ? `MARKETING BATTLECARD: ${module.title}\n` +
        `-----------------------------------------\n` +
        `1. CLIENT PROBLEM & PAIN POINT:\n${module.battlecard.painPoint}\n\n` +
        `2. NEXUS AI TECHNICAL ADVANTAGE:\n${module.battlecard.technicalEdge}\n\n` +
        `3. COMPETITORS:\n${module.battlecard.competitors} (${module.battlecard.competitorCost})\n\n` +
        `4. NEXUS SETUP & COST:\n${module.battlecard.nexusSetup} (${module.battlecard.nexusCost})\n\n` +
        `5. ROI & ECONOMIC LEVERAGE:\n${module.battlecard.roiAdvantage}`
      : `BATTLECARD MARKETING : ${module.title}\n` +
        `-----------------------------------------\n` +
        `1. PROBLÈME & PAIN POINT :\n${module.battlecard.painPoint}\n\n` +
        `2. AVANTAGE TECHNIQUE NEXUS AI :\n${module.battlecard.technicalEdge}\n\n` +
        `3. CONCURRENTS :\n${module.battlecard.competitors} (${module.battlecard.competitorCost})\n\n` +
        `4. CONFIGURATION & COÛT NEXUS :\n${module.battlecard.nexusSetup} (${module.battlecard.nexusCost})\n\n` +
        `5. ROI & AVANTAGE ÉCONOMIQUE :\n${module.battlecard.roiAdvantage}`;
  };

  const getFullScriptText = (module: ModuleMarketingData) => {
    const isEn = currentLang === 'en';
    let text = isEn 
      ? `VOICEOVER SCRIPT (AIDA TikTok/Reels): ${module.title}\n`
      : `VOICEOVER SCRIPT (AIDA TikTok/Reels) : ${module.title}\n`;
    text += `========================================================\n\n`;
    text += isEn ? `🔥 ACCROCHE (HOOK):\n${module.script.hook}\n\n` : `🔥 ACCROCHE (HOOK) :\n${module.script.hook}\n\n`;
    text += isEn ? `🎬 SCRIPT STEPS WITH VISUAL INSTRUCTIONS:\n\n` : `🎬 DÉROULEMENT SCRIPT AVEC CONSIGNES VISUELLES :\n\n`;
    module.script.steps.forEach(step => {
      text += `⏱️ ${step.time}\n`;
      text += isEn ? `🎥 [DIRECTION]: ${step.direction}\n` : `🎥 [CONSIGNE] : ${step.direction}\n`;
      text += isEn ? `🗣️ [VOICEOVER]: "${step.audio}"\n\n` : `🗣️ [VOIX OFF] : "${step.audio}"\n\n`;
    });
    text += isEn ? `🚀 CTA (RECOMMENDED ACTION):\n"${module.script.cta}"` : `🚀 CTA (ACTION RECOMMANDÉE) :\n"${module.script.cta}"`;
    return text;
  };

  return (
    <div id="marketing-hub-root" className="p-6 space-y-8 bg-[#02050e] min-h-screen text-slate-100 font-sans relative overflow-hidden">
      {/* Background radial glows for premium sci-fi design */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border border-violet-500/10">
              Nexus AI Core Command
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border border-emerald-500/10">
              Admin Exclusive
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Marketing Presentation & Script Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {currentLang === 'en' 
              ? "Acquisition matrix and library of elite asynchronous sales scripts (AIDA Framework) for social media and flash campaigns." 
              : "Matrice d'acquisition et bibliothèque de scripts de vente asynchrones de haut niveau (AIDA Framework) pour réseaux sociaux et flash campagnes."}
          </p>
        </div>
        
        {/* Visual telemetry block */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-[2rem]">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {currentLang === 'en' ? "ACQUISITION ENGINE" : "MOTEUR D'ACQUISITION"}
            </div>
            <div className="text-xs font-mono font-bold text-slate-300">NEXUS_CAMP_ENGINE_OK</div>
          </div>
        </div>
      </div>

      {/* Modules Horizontal Tab Panel */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-white/5">
        {localizedModules.map((modulo) => {
          const IconComponent = modulo.icon;
          const isActive = modulo.id === activeModule;
          return (
            <button
              key={modulo.id}
              onClick={() => {
                setActiveModule(modulo.id);
                setCopiedScript(false);
                setCopiedBattle(false);
              }}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-sans text-xs font-black uppercase tracking-wider whitespace-nowrap border cursor-pointer ${
                isActive 
                  ? `bg-slate-900 border-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.1)]` 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-950 text-slate-500'}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <p className="leading-none text-left">{modulo.title}</p>
                <p className="text-[9px] text-slate-500 font-normal lowercase tracking-normal mt-1 block">
                  {modulo.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Detail Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE FLASH BATTLECARD */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {currentLang === 'en' ? "Flash Marketing Battlecard" : "Flash Marketing Battlecard"}
            </h2>
            <button
              onClick={() => copyToClipboard(getFullBattlecardText(currentModuleData), 'battle')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900/100 transition-all text-[10px] uppercase font-black text-slate-300 hover:text-white"
            >
              {copiedBattle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedBattle ? (currentLang === 'en' ? "Copied!" : "Copié !") : (currentLang === 'en' ? "Copy Card" : "Copier Fiche")}
            </button>
          </div>

          <motion.div
            key={`battlecard-${activeModule}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#070b18]/80 border ${currentModuleData.color} rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden`}
          >
            {/* Header block with glowing icon */}
            <div className="flex gap-4 items-start relative z-10">
              <div className="bg-slate-950/80 p-4 rounded-3xl border border-white/5 flex items-center justify-center text-emerald-400">
                <currentModuleData.icon className="w-8 h-8" />
              </div>
              <div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {currentModuleData.badge}
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1.5 leading-tight">
                  {currentModuleData.title}
                </h3>
                <p className="text-xs text-slate-400 font-sans font-medium mt-1">
                  {currentModuleData.subtitle}
                </p>
              </div>
            </div>

            {/* Battlecard Grid */}
            <div className="space-y-5 pt-4 border-t border-white/5 relative z-10">
              {/* Pain points */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  {currentLang === 'en' ? "Client Problem & Pain Point (Wasted Budget)" : "Problème Client & Pain Point (Perte d'argent)"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                  {currentModuleData.battlecard.painPoint}
                </p>
              </div>

              {/* Technical Advantage */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {currentLang === 'en' ? "Technical Advantage (Nexus Cloud Engine)" : "Avantage Technologique (Moteur Cloud Nexus)"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                  {currentModuleData.battlecard.technicalEdge}
                </p>
              </div>

              {/* Comparison Section */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/60 p-4 rounded-3xl border border-white/5">
                  <div className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                    {currentLang === 'en' ? "Heavy competitor plugins" : "Plugins concurrents lourds"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-tight font-sans font-semibold">
                    {currentModuleData.battlecard.competitors}
                  </p>
                  <p className="text-lg font-black text-red-400 leading-none mt-2 font-mono">
                    {currentModuleData.battlecard.competitorCost}
                  </p>
                </div>

                <div className="bg-emerald-950/30 p-4 rounded-3xl border border-emerald-500/20">
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    {currentLang === 'en' ? "Nexus AI Solution" : "Solution Nexus AI"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-tight font-sans font-semibold">
                    {currentModuleData.battlecard.nexusSetup}
                  </p>
                  <p className="text-lg font-black text-emerald-400 leading-none mt-2 font-mono">
                    {currentModuleData.battlecard.nexusCost}
                  </p>
                </div>
              </div>

              {/* Economic ROI */}
              <div className="bg-violet-950/20 p-4 rounded-3xl border border-violet-500/20">
                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                  {currentLang === 'en' ? "ROI Economic Leverage" : "Effet Levier ROI Économique"}
                </div>
                <p className="text-xs text-violet-200 mt-1.5 leading-relaxed font-sans font-medium">
                  {currentModuleData.battlecard.roiAdvantage}
                </p>
              </div>
            </div>

            {/* Decorative background logo */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] text-white pointer-events-none">
              <currentModuleData.icon className="w-64 h-64" />
            </div>
          </motion.div>

          {/* Interactive live demo simulation component */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400 animate-pulse" />
              {currentLang === 'en' ? "Nexus Live Simulator & Action Demo" : "Nexus Live Simulator & Démo Interactive"}
            </h2>
            <InteractiveMarketingSimulation moduleId={activeModule} />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: THE SOCIAL SCRIPT BOX */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-400" />
              {currentLang === 'en' ? "Social Media Script Box (Ready-to-Shoot)" : "Social Media Script Box (Prêt-à-Tourner)"}
            </h2>
            
            {/* Format Swapper & Copy Script */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-900/60 p-1 rounded-xl border border-white/5 flex">
                <button
                  onClick={() => setActiveScriptFormat('tiktok')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeScriptFormat === 'tiktok' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {currentLang === 'en' ? "Short Formats (TikTok/Reels)" : "Formats Courts (TikTok/Reels)"}
                </button>
                <button
                  onClick={() => setActiveScriptFormat('linkedin')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeScriptFormat === 'linkedin' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {currentLang === 'en' ? "Written Copywriting" : "Copywriting Écrit"}
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(
                  activeScriptFormat === 'tiktok' 
                    ? getFullScriptText(currentModuleData)
                    : currentLang === 'en'
                      ? `📌 CLIENT PROBLEM:\n${currentModuleData.battlecard.painPoint}\n\n💡 KEY TO SUCCESS:\n${currentModuleData.battlecard.technicalEdge}\n\n🚀 CLINICAL ROI BENEFIT:\n${currentModuleData.battlecard.roiAdvantage}\n\n${currentModuleData.script.cta}`
                      : `📌 PROBLÈME :\n${currentModuleData.battlecard.painPoint}\n\n💡 CLÉ DU SUCCÈS :\n${currentModuleData.battlecard.technicalEdge}\n\n🚀 BÉNÉFICE ROI CLINIQUE :\n${currentModuleData.battlecard.roiAdvantage}\n\n${currentModuleData.script.cta}`, 
                  'script'
                )}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 transition-all text-[10px] uppercase font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-[1.02]"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? (currentLang === 'en' ? "Script Copied!" : "Script copié !") : (currentLang === 'en' ? "Copy Script" : "Copier Script")}
              </button>
            </div>
          </div>

          <motion.div
            key={`script-${activeModule}-${activeScriptFormat}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6"
          >
            {activeScriptFormat === 'tiktok' ? (
              <>
                {/* Visual script layout block */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 mb-2 text-violet-400">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {currentLang === 'en' ? "High-Impact Hook (AIDA Hook)" : "Accroche Impact Fulgurante (AIDA Hook)"}
                    </span>
                  </div>
                  <p className="text-sm font-black text-white italic leading-relaxed">
                    {currentModuleData.script.hook}
                  </p>
                </div>

                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  {currentLang === 'en' ? "TikTok / Instagram Reels Script Details" : "Détail du Script TikTok / Instagram Reels"}
                </div>

                {/* Staggered steps timeline */}
                <div className="space-y-4">
                  {currentModuleData.script.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className="group bg-[#04060c] border border-white/5 hover:border-violet-500/20 p-5 rounded-3xl transition-all flex flex-col md:flex-row gap-4 items-start"
                    >
                      {/* Left: Timing badge */}
                      <div className="flex items-center gap-2 md:block md:w-32 bg-violet-500/10 text-violet-400 text-[10px] font-mono font-bold text-center py-1 px-3 md:py-2 md:px-0.5 rounded-xl border border-violet-500/15">
                        <Volume2 className="w-3.5 h-3.5 inline md:block mx-auto mb-0 md:mb-1" />
                        {step.time}
                      </div>

                      {/* Right: Steps contents */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            {currentLang === 'en' ? "🎬 On-Screen Video Cue" : "🎬 Consigne Vidéo à l'Écran"}
                          </span>
                          <p className="text-[11px] text-slate-400 leading-normal font-sans font-semibold">
                            {step.direction}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                            {currentLang === 'en' ? "🗣️ Voiceover Script (Snappy & Dynamic)" : "🗣️ Texte de Voix Off (Dynamique & Saccadé)"}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans font-bold italic">
                            {currentLang === 'en' ? `"${step.audio}"` : `« ${step.audio} »`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Script ending & CTA */}
                <div className="bg-emerald-950/20 border border-emerald-500/10 p-5 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                      {currentLang === 'en' ? "Ultimate Call to Action (CTA)" : "Appel à l'Action Ultime (CTA)"}
                    </span>
                    <p className="text-xs text-slate-300 font-sans font-semibold leading-relaxed">
                      {currentModuleData.script.cta}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // LINKEDIN WRITTEN POST COPYWRITING FORMAT
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-sky-400">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {currentLang === 'en' ? "Written LinkedIn Post / Twitter Thread Format" : "Format Post LinkedIn / Thread Twitter Écrit"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-200 space-y-4 font-mono leading-relaxed bg-[#050811] p-5 rounded-2xl border border-white/5 select-all whitespace-pre-wrap">
                    {currentLang === 'en' ? (
`🚀 WooCommerce is incredible, but its extensions are killing your store speed.

The number one mistake of 95% of e-merchants? Overloading their store with heavy third-party plugins. Yoast, Wordfence, ManyChat... Each adds heavy PHP code, increases TTFB lag, and destroys mobile checkouts.

At Nexus AI, we engineered the ultimate solution: the ${currentModuleData.title} module.

💡 Why is it a technical revolution?
- ${currentModuleData.battlecard.technicalEdge.replace(/\n/g, '\n- ')}

📊 Clinical comparison:
- Traditional extension plugins: ${currentModuleData.battlecard.competitorCost} (Site slowed down by heavy database overhead)
- Nexus ${currentModuleData.title}: ${currentModuleData.battlecard.nexusCost} (Asynchronously offloaded to our external lightning-speed network)

📉 ROI Analysis:
${currentModuleData.battlecard.roiAdvantage}

👇 ${currentModuleData.script.cta}`
                    ) : (
`🚀 WooCommerce est incroyable, mais ses extensions sont en train de tuer votre site.

L'erreur numéro un de 95% des e-commerçants ? Surcharger leur boutique de plugins de tiers. Yoast, Wordfence, ManyChat... Chacun d'eux ajoute du code PHP lourd, augmente votre la latence et détruit vos ventes mobiles.

Chez Nexus AI, nous avons conçu la solution ultime : le module ${currentModuleData.title}.

💡 Pourquoi c'est une révolution technique ?
- ${currentModuleData.battlecard.technicalEdge.replace(/\n/g, '\n- ')}

📊 Comparaison clinique :
- Plugins d'extensions classiques : ${currentModuleData.battlecard.competitorCost} (Site ralenti par des requêtes MySQL internes lourdes)
- Nexus ${currentModuleData.title} : ${currentModuleData.battlecard.nexusCost} (Déporté asynchroniquement sur notre réseau externe à vitesse lumière)

📉 Analyse ROI :
${currentModuleData.battlecard.roiAdvantage}

👇 ${currentModuleData.script.cta}`
                    )}
                  </div>
                </div>

                <div className="bg-[#0c0d15] p-5 rounded-2xl border border-white/5 flex gap-3 items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-sans font-semibold leading-relaxed">
                    {currentLang === 'en' 
                      ? "PMM Tip: Copy this written draft to power your email newsletters or your B2B social feeds directly!" 
                      : "Conseil du PMM : Copiez ce texte rédigé pour alimenter vos newsletters ou vos publications B2B sur LinkedIn directement !"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

      </div>

      {/* FOOTER SECTION: SYSTEM INTEGRITY MANUAL & STATS */}
      <div className="border-t border-white/5 pt-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#050811]/60 p-6 rounded-[2rem] border border-white/5 flex gap-4 items-center">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-white leading-none">0.41s Latence</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Railway Cloud Cluster</div>
            </div>
          </div>

          <div className="bg-[#050811]/60 p-6 rounded-[2rem] border border-white/5 flex gap-4 items-center">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-white leading-none">0.2s Chargement</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Vitesse mobile Nexus</div>
            </div>
          </div>

          <div className="bg-[#050811]/60 p-6 rounded-[2rem] border border-white/5 flex gap-4 items-center">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black font-mono text-white leading-none">AIDA Framework v3</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Matrice Optimisée</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
