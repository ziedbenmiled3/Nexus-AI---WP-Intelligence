export interface EnglishSectionTranslation {
  title: string;
  category: string;
  shortDesc: string;
  components: {
    name: string;
    role: string;
    description: string;
  }[];
  steps: string[];
  tips: string;
}

export const USER_MANUAL_TRANS: Record<string, EnglishSectionTranslation> = {
  dashboard: {
    title: "Control Dashboard",
    category: "Overview",
    shortDesc: "The core control panel displaying live events, AI efficiency, and overall WordPress sync health.",
    components: [
      { name: "KPI Panels", role: "Key Performance Indicators", description: "Cards displaying total indexed pages, synced products, written AI posts, and active categories with percentage changes." },
      { name: "Global Sync Node", role: "Update Trigger", description: "Magnetic button to trigger a heavy bilateral sync between WordPress and the Nexus Cloud." },
      { name: "Performance Charts", role: "Data Visualization", description: "Interactive charts presenting daily sales growth, generated articles, and direct SEO traffic impact." },
      { name: "Active Tasks System", role: "Live Progress Monitor", description: "Continuous log tracking active AI operations such as blog drafts, tag optimization, and feeds updates." }
    ],
    steps: [
      "Verify system connection status via the green pulsating beacon in the top right corner.",
      "Consult the performance graphs to analyze traffic and transaction anomalies.",
      "Click 'Sync' to manually pull fresh catalog updates if you just changed your products inside WordPress."
    ],
    tips: "Keep this dashboard open on a secondary display; it updates automatically upon any major background event trigger."
  },
  social: {
    title: "NEXUS SOCIAL & VIDEO STUDIO",
    category: "Marketing & Sales",
    shortDesc: "Generate highly engaging social posts, edit vertical marketing video streams, customize AI voice-over narration profiles, and directly download MP4 files for distribution.",
    components: [
      { name: "A.I Hook Writer & Scripting", role: "Creative Generation", description: "Analyzes target catalog products to formulate up to 5 unique caption copies paired with professional oral sales scripts following high-converting AIDA rules." },
      { name: "Multi-Speaker Voice Configurator", role: "Realistic Narration Sync", description: "Swaps live voice-over profiles seamlessly (Antoni's corporate authority tone vs Bella's solar enthusiasm vs Rachel's business-oriented presentation pitch)." },
      { name: "Vertical Video Compiler", role: "Dynamic Media Render", description: "Renders smooth audio-backed video slideshows and direct MP4 streams for immediate visual dissemination." },
      { name: "Secure Direct Download Proxy", role: "IFrame Sandbox Bypass", description: "Circumvents strict iframe sandbox security limitations allowing one-click direct MP4 downloads to local drives without permission errors." }
    ],
    steps: [
      "Select a target product or category from the primary catalog dropdown selector.",
      "Click 'Generate Assets with Nexus AI' to synthesize your multi-angle captions and AIDA video scripts.",
      "Configure your desired dynamic vocal profile (Antoni, Rachel, or Bella) to align voice-over metrics.",
      "Click 'Generate Promo Video', review the generated video canvas, and use the 'Download MP4' button to trigger a secure file download."
    ],
    tips: "Match your voice profiles to the channel mood: Use Antoni for professional LinkedIn reels, Bella for energetic Instagram stories, and Rachel for conversion-focused Facebook campaigns."
  },
  'smart-feed': {
    title: "SMART SHOPPING FEED",
    category: "Marketing & Sales",
    shortDesc: "Automate and sync your XML inventory feeds for Google Merchant Center, Meta, and beyond.",
    components: [
      { name: "Smart Node XML Generator", role: "Data Extractor", description: "Converts complex WooCommerce JSON structures into highly structured XML files optimized for Google and Meta scrapers." },
      { name: "Export Filter Rules", role: "Inventory Optimizer", description: "Allows automatic exclusion of out-of-stock items so you do not waste active Google Ad budgets on unbuyable links." },
      { name: "Smart Tags Indexer", role: "Feed Taxonomy Mapper", description: "Maps custom local categories to official Google Shopping taxonomies (e.g., Apparel -> Outerwear) for maximum bidding relevance." }
    ],
    steps: [
      "Select the specific product group or collections you want to export.",
      "Toggle on the automated option to exclude out-of-stock references.",
      "Generate the XML Feed link (e.g., /api/feeds/google-shopping) and copy it into Google Merchant Center."
    ],
    tips: "Configure daily fetching rules inside Merchant Center; our background workers update the file live, ensuring your pricing transitions match midnight changes."
  },
  market: {
    title: "Market Intelligence",
    category: "Marketing & Sales",
    shortDesc: "Politely track competitors' retail pricing and organic copywriting strategies on autopilot.",
    components: [
      { name: "Competitor Add Node", role: "Target Management", description: "Lets you record URLs of opposing digital storefronts to add them to your automated monitoring radar." },
      { name: "Retail Pricing Scraper", role: "Asynchronous Crawler", description: "Crawls competitor collections safely, extracts stock statuses, and computes exact margin offsets with your own products." },
      { name: "AI Semantic Auditor", role: "Gap Discovery", description: "Compares competitor headings and titles to suggest untapped keyword niches your brand can rank for." }
    ],
    steps: [
      "Input the homepage URL of your direct competitor in the target input.",
      "Wait approximately 30 seconds for our crawler to map and structure their public catalog.",
      "Consult the pricing disparity table and adjust your margins accordingly."
    ],
    tips: "If an equivalent product is listed 15% higher elsewhere, raise your base price while offering a 5% instant discount tag to drive conversions."
  },
  'wp-crm': {
    title: "Customer & Live Radar",
    category: "Marketing & Sales",
    shortDesc: "Monitor your WooCommerce visitors in real-time and leverage conversion projections.",
    components: [
      { name: "Live Shopper Radar", role: "Telemetry Stream", description: "Displays client geographical locations, active carts, and viewing history as they navigate your live pages." },
      { name: "Matrix Conversion Simulator", role: "Growth Forecaster", description: "Interactive tool simulating what-if traffic variations to project the exact monetary value of an AI-optimized checkout rate." },
      { name: "Script Connector Node", role: "Integration Hub", description: "Provides the lightweight tracking JavaScript tag to insert into your WordPress layout for live telemetry." }
    ],
    steps: [
      "Copy the script tracking tag located in the Integration tab.",
      "Insert it into the global footer or script manager plugin of your origin WordPress install.",
      "Watch active visitor signals flow live onto the Radar dashboard."
    ],
    tips: "Combine the Live Radar with the Email Campaign rules to trigger an automated discount hook whenever a high-tier cart is abandoned."
  },
  stock: {
    title: "Assets & Logistics",
    category: "Stocks & Logistics",
    shortDesc: "Intelligently secure inventory health, calculate stock asset value, and prevent runouts.",
    components: [
      { name: "Dead Stock Tracer", role: "Asset Optimizer", description: "Isolates inactive references sitting over 90 days in storage with no recorded transactions." },
      { name: "Fast Stock Identifier", role: "Revenue Booster", description: "Pins high-velocity items in real-time to prevent delay errors in your core fulfillment line." },
      { name: "Asset Value Calculator", role: "Inventory Accounting", description: "Estimates total capital bound in your warehouse based on wholesale purchase cost structures." }
    ],
    steps: [
      "Inspect the live asset valuation breakdown to manage your cash-flow allocations.",
      "Consult the 'Immediate Stockout Warning' table for endangered items.",
      "Trigger automated draft orders to suppliers matching calculated replenishment counts in one click."
    ],
    tips: "Convert dead items into high-margin free-gifts-with-purchase bundles during flash sales to clear valuable shelf space."
  },
  forecast: {
    title: "Nexus Forecast",
    category: "Stocks & Logistics",
    shortDesc: "Graphically forecast transaction trends to mitigate seasonal inventory lockouts.",
    components: [
      { name: "Predictive Vector Curve", role: "Mathematical Forecast", description: "Charts sales velocity 3 months ahead with automated upper and lower confidence boundaries." },
      { name: "Seasonality Adjuster", role: "Contextual Coefficient", description: "Friction slider adjusting projections based on regional discount seasons (Christmas, July Sales, Black Friday)." },
      { name: "Procuration Calculator", role: "Restock Adviseur", description: "Suggests the precise replacement counts to order from wholesale networks to comfortably support forecast demand." }
    ],
    steps: [
      "Select your top-selling category or star product from the sidebar menu.",
      "Adjust the economic acceleration coefficients matching your future advertising scale plans.",
      "Witness the forecast curve warp instantly to project estimated sales levels."
    ],
    tips: "Over-order items slightly into the upper confidence boundary if you have active scale budgets; a stockout hurts organic SEO ranking."
  },
  audit: {
    title: "SEO Structural Audit",
    category: "SEO & Content",
    shortDesc: "Scan heading architecture and semantic health to ensure total search engine alignment.",
    components: [
      { name: "SEO Score Circular Gauge", role: "Consolidated Rating", description: "Radial index graded out of 100 representing overall Page Speed and indexability following Core Web Vitals criteria." },
      { name: "Metadata Health Reporter", role: "Issue Inspector", description: "Pinpoints truncation issues, empty descriptions, or missing Alt metrics across target product pages." },
      { name: "Keyword Density Array", role: "Semantic Analysis", description: "Tabulates term metrics to avoid search penalties associated with artificial keyword stuffing." }
    ],
    steps: [
      "Enter the target page URL you want to optimize.",
      "Click 'Launch Audit' to run a deep architectural sweep.",
      "Resolve critical problems displayed sequentially in the warning logs."
    ],
    tips: "Core page load times over 2 seconds alienate Google; always remove inactive WordPress plugins if your Page Speed rating is weak."
  },
  content: {
    title: "A.I Copywriter & Writer",
    category: "SEO & Content",
    shortDesc: "Draft fully structured, search-engine-optimized content directly from your admin panel.",
    components: [
      { name: "Autonome Document Writer", role: "Generative Copywriter", description: "Assembles fluent, structured content ranging from brief updates to 2000-word educational articles." },
      { name: "Keyword Targeting Registry", role: "Semantic Force", description: "Registers search phrases to feed into headings naturally, signaling maximum contextual authority." },
      { name: "Auto Featured Picture Generator", role: "Creative Midpoint", description: "Drafts beautiful visual themes as high-contrast illustrations for your post bannings from text ideas." }
    ],
    steps: [
      "Fill in the core theme or title idea of your blog post.",
      "Insert target keyword terms separated by standard commas.",
      "Determine your preferred brand identity tone (Professional, Conversational, Witty, Direct).",
      "Click 'Generate Outline'. Our engine drafts the skeletal headings before populating standard paragraphs."
    ],
    tips: "Refine first paragraphs manually with human storytelling context; authentic narratives increase user readability scores."
  },
  autopilot: {
    title: "Autopilot Scheduler",
    category: "SEO & Content",
    shortDesc: "Schedule automated content publication according to custom operational frequencies.",
    components: [
      { name: "Task Trigger Registry", role: "Automation Schedule", description: "Configures exact timing rules and recurrences for post updates (e.g., Every Monday at 08:00 AM)." },
      { name: "Niche Blog Crawler", role: "Trend Scouting", description: "Monitors custom RSS streams and keyword parameters across active markets to find blog ideas." },
      { name: "Semantic Safety Guard", role: "Safety Shield", description: "Reviews generated copy prior to publishing, checking and cleaning drafts for spam compliance." }
    ],
    steps: [
      "Declare your target niche (e.g., 'Wellness tech' or 'Fitness eCommerce').",
      "Choose your autonomous scheduling frequency.",
      "Confirm your topics list and shift the general Autopilot toggle to active."
    ],
    tips: "Audit negative filters regularly to add prohibited terms you want to prevent the model from generating."
  },
  'internal-links': {
    title: "Mesh Page Linking",
    category: "SEO & Content",
    shortDesc: "Map internal layout structures and automate semantic linking between pages.",
    components: [
      { name: "Anchor Target Selector", role: "Semantic Lexer", description: "Scans uploaded catalog entries to pinpoint keywords matching titles of other publications on your site." },
      { name: "Recommendation Node Panel", role: "Review Dashboard", description: "Presents structured inline linkage recommendations directly (e.g., term 'warehouse' links to stock article)." },
      { name: "Batch Link Injector", role: "Mass Action Button", description: "Injects approved linkages in a single click without requiring you to manually browse each article database entry." }
    ],
    steps: [
      "Trigger 'Scan Site' to parse articles and categorize layout proximity maps.",
      "Inspect linking opportunities suggested in the visual checklist.",
      "Confirm preferred options to push anchors into origin page templates instantly."
    ],
    tips: "Keep link clusters strictly separated inside parent categories to help index bots map your product silos clearly."
  },
  'comm-hub': {
    title: "Communication Hub",
    category: "SEO & Content",
    shortDesc: "Manage SMTP configurations, high-performance Resend API keys, construct custom templates, and trigger automated buyer notification emails.",
    components: [
      { name: "SMTP & Resend API Dual Gateways", role: "Mail Gateway Setup", description: "Enables secure transmission configurations (Host, SSL Port, Credentials) OR secondary high-performance direct Resend HTTP API token (resolves generic hosting IP blocks & port blocks on Cloud Run)." },
      { name: "HTML Template Customizer", role: "Visual Editor", description: "Let's you adjust primary and accent brand coloring dynamically, insert custom logos, and auto-fit your transactional headers." },
      { name: "Automation Rules Core", role: "Transactional Hub", description: "Binds user trigger rules (such as 'on payment complete') with direct custom placeholders (e.g., {{USER_NAME}}, {{TOTAL_AMOUNT}}) for automated mailings." }
    ],
    steps: [
      "Navigate to the 'Settings' or 'SMTP/IMAP Configuration' field under the Communication Hub tab.",
      "Select your preferred delivery provider: Secure classic SMTP Relay (Host, Port, SSL, User) OR the modern secondary Resend API gateway.",
      "If using Resend, simply select 'API HTTP Resend' and paste your Resend.com API key (e.g. re_xxxxxx). No port configurations are needed!",
      "Initiate a test message using the validator diagnostic tool to check connection status.",
      "Design transactional email models inside the live constructor view and link them to automatic WooCommerce purchase rules."
    ],
    tips: "Utilize the modern Resend API provider: because serverless platforms (like Cloud Run) naturally enforce strict egress firewall limits on standard mail ports, the secondary Resend HTTP API avoids port-blocking issues, improves deliverability by 45%, and runs 100% free of charge."
  },
  'woo-manager': {
    title: "Orders & Transaction Portal",
    category: "Catalog & Admin",
    shortDesc: "Verify transactions, view custom customer timelines, and draft immediate responses.",
    components: [
      { name: "Order Core Database Table", role: "Transaction Overview", description: "Displays crucial transaction entries: buyer name, status badge, net amounts, and shipping profiles." },
      { name: "Customer Interactions Timeline", role: "History Log", description: "Monitors outgoing and incoming customer communications associated with a specific record." },
      { name: "One-Click Quick Response", role: "Support Shortcut", description: "Instantly drafts contextual notification follow-ups, handles shipping delay apology letters, or resolves issues." }
    ],
    steps: [
      "Inspect overall WooCommerce transactions by filtering colored status elements (Paid, Processing, Failed).",
      "Click any invoice entry to slide open details and items selection details.",
      "Use custom quick message templates to message buyers instantly if delivery targets shift."
    ],
    tips: "Draft special coupons whenever cart transactions display status warnings; a small code helps recover lost baskets."
  },
  products: {
    title: "Catalog Product Editor",
    category: "Catalog & Admin",
    shortDesc: "Modify prices, track quantities, and update catalog metadata seamlessly.",
    components: [
      { name: "Direct Price Editor Fields", role: "Inline Updaters", description: "Input fields mapping directly back to original catalog files to alter pricing in a click." },
      { name: "Visual Asset Carousel Loader", role: "Gallery Integrator", description: "Links to active WordPress image storage to swap thumbnail listings without slow refreshes." },
      { name: "Quantity Altering Panel", role: "Inventory Modifier", description: "Saves precise warehouse updates directly to WooCommerce records." }
    ],
    steps: [
      "Locate the target item inside the product database view.",
      "Input a 'Regular Price' paired with a 'Sale Price' index.",
      "Save the modifications to write data back to your live server database immediately."
    ],
    tips: "Rely heavily on value formatting (ending pricing values with '.90' or '.95') to enhance buyer checkout decisions."
  },
  settings: {
    title: "WordPress Credentials Setup",
    category: "Catalog & Admin",
    shortDesc: "Configure API linkages, save access secure tokens, and link WooCommerce in clicks.",
    components: [
      { name: "WooCommerce REST Credentials Keys", role: "Secrets Storage", description: "Safeguards WordPress URLs, Consumer Keys (ck), Secret tokens (cs), and app-specific passphrases." },
      { name: "Active Diagnostics Beacon", role: "Connection Reporter", description: "Verifies token validity on-the-fly and switches to green (Healthy) or red (Failed) to indicate status." },
      { name: "WordPress Extensions Triad Check", role: "Pre-requisites Monitor", description: "Saves verification states for crucial plugin components (SEO Suite, WooCommerce engine, and CORS permission plugins)." }
    ],
    steps: [
      "Input your base WordPress URL path securely.",
      "Ensure WooCommerce, SEO extensions, and WP CORS are fully active on your host.",
      "Insert client consumer credentials and secure keys.",
      "Click Test connection to confirm active integration signals."
    ],
    tips: "Installing a lightweight CORS manager plugin is strictly required to authorize remote browser requests securely without errors."
  },
  maintenance: {
    title: "System Maintenance & Optimization",
    category: "Catalog & Admin",
    shortDesc: "Flush server cache objects, wipe old SQL transactions, and maintain high page speeds.",
    components: [
      { name: "Distant Cache Purge Gateway", role: "Speed Enhancer", description: "Signals remote caches on WooCommerce hosting systems to flush static pages." },
      { name: "SQL Transients Sweeper", role: "Database Cleanup", description: "Purges temporary database entries left as remnants by WooCommerce logs that degrade SQL queries.",
      },
      { name: "Task Health Logger", role: "Diagnostic Core", description: "Monitors operational errors, timing metrics, and timeout flags to help optimize background scripts." }
    ],
    steps: [
      "Click the specific flushing block to activate remotely.",
      "Let the backend server push cleaning commands to your target WordPress origin.",
      "Run another SEO sweep to confirm page speed gains."
    ],
    tips: "Flushing DB transient objects monthly maintains active database query speed parameters by up to 15%."
  },
  security: {
    title: "NEXUS CYBER SHIELD",
    category: "Catalog & Admin",
    shortDesc: "Secure your WordPress assets in real time from brute-force attempts, SQL injections, and vulnerability scouts.",
    components: [
      { name: "Emergency Lockdown", role: "Defensive Shield", description: "Magnetic toggles to completely freeze standard public entry points behind a clean static fallback panel." },
      { name: "Autonomous Mod-IP", role: "Autonomous Moderator", description: "Smart shield checking and blocking suspicious SQL injections and brute force attacks without manual administrative intervention." },
      { name: "Core Integrity Scanner", role: "Cryptographic Sweep", description: "Runs cryptographic signatures comparisons over core paths and compares security ratings and database state." },
      { name: "WordPress Webhook Connector", role: "Asynchronous Hook", description: "Copies ready-to-use PHP hooks to map local login failures back to the remote Nexus dashboard in microseconds." },
      { name: "Brute-Force Trend Chart", role: "Anomalies Visualization", description: "Exhibits a responsive 7-day area chart tracking blocked security alerts dynamically over time below the Total incidents." },
      { name: "Dynamic Threshold Alert", role: "Custom Alert Rules", description: "Configures alert thresholds via a range slider to trigger a pulsing protective red warning screen when daily brute-force intrusions exceed limits." }
    ],
    steps: [
      "Check overall defensive ratings and locked ranges in real time on the main shield console.",
      "Track the 7-day brute-force blocked pattern to detect ongoing automated dictionary attack networks.",
      "Interact with the Alert Threshold slider to establish a customized security notification limit.",
      "Copy the active connector PHP code snippet and insert it inside functions.php in your active WordPress theme.",
      "If you notice ongoing red threat banners or threshold breach indicators, toggle Emergency Lockdown or apply immediate Firewall IP Ban actions."
    ],
    tips: "Adjust the Threat Threshold filter dynamically according to active brute force alerts to stay notified without experiencing indicator fatigue."
  },
  finance: {
    title: "Financial Intelligence & Profit Analytics",
    category: "Overview",
    shortDesc: "Model, calculate, and visualize active sales revenue, gateway fees, COGS, and ads campaign budget structures in real time.",
    components: [
      { name: "Core Profit KPI Panels", role: "Key Accounting Tickers", description: "Displays real-time Gross Revenue, gateway provider fees, wholesale product COGS, customizable Ads spend, and net profits." },
      { name: "Evolution Curves & Profit Chart", role: "Interactive Trend Graphing", description: "Provides a responsive, filtered Recharts area graph modeling exact profit values across defined temporal windows." },
      { name: "Ad Budget Override Tool", role: "Direct Financial Override", description: "Manual configuration tools allowing swift edits to daily Meta and Google Campaign spends to update real-time net formulas." },
      { name: "Profit Reporting Webhook", role: "Integration Core", description: "Maintains structured JSON outputs to securely pipe profit performance records out to personal sheet analytics." }
    ],
    steps: [
      "Consult overall KPI meters in the financial section to inspect live net profitability and margin levels.",
      "Interact with selection filter buttons on the area chart to toggle between global (Gross + Net), Net Profit only, and Gross Sales only views.",
      "Hover across daily nodes to read active popups containing exact revenues, estimated COGS deductions, and gateway fees for that specific day.",
      "Open the active budget dialog inside the panel to save daily advertisement metrics, instantly updating overall reporting statistics."
    ],
    tips: "Always configure your estimated bulk COGS percentage accurately matching inventory invoices to secure realistic bottom-line forecasts."
  },
  pixels: {
    title: "Multi-Pixel Tracking & Analytics",
    category: "Marketing & Sales",
    shortDesc: "Manage and audit active tracking pixels (Meta Ads, Google Analytics GA4, TikTok, and Pinterest) from a centralized async pipeline.",
    components: [
      { name: "Platforms Configuration Workspace", role: "Interface Switch", description: "Bilingual horizontal tab controls to instantly swap configurations and telemetry graphs across major ad channels." },
      { name: "Active Tracker Toggle", role: "Script Controller", description: "One-click switch to immediately load or exclude target pixel tracking assets in WordPress templates." },
      { name: "Event Mapping Checkboxes", role: "Conversion Pipeline", description: "Granular controls mapping essential conversion funnels (PageView, InitiateCheckout, Purchase) to optimize campaign training." },
      { name: "G-AI Pixel Diagnostic Engine", role: "Security Sandbox", description: "Simulates security handshakes, GDPR consent states, server-browser deduplication, and matched Event Quality metrics." }
    ],
    steps: [
      "Select your active advertising tab (e.g. Meta Ads or GA4).",
      "Enter the respective Measurement ID or Pixel ID gathered from your ad console.",
      "Toggle 'Activate Pixel Tracking' to authorize the pixel header insertion.",
      "Check matching translation funnels (PageView, InitiateCheckout, or Purchase) to align conversion goals.",
      "Run the AI Sandbox Scan to perform a live diagnostic check over active telemetry handshakes."
    ],
    tips: "Copy the custom compressed PHP function directly from the top Export button if you prefer manual insertion without plugin APIs."
  },
  categories: {
    title: "Categories & Tags Taxonomy Optimizer",
    category: "Catalog & Admin",
    shortDesc: "Optimize blog layouts and e-commerce structural links to feed search crawlers maximum contextual signals.",
    components: [
      { name: "Direct Taxonomy Manager", role: "Architecture Editor", description: "Responsive grid layout to input and push name alterations, custom SEO slugs, and taxonomy descriptions directly into active engines." },
      { name: "Internal Content Density Analyzer", role: "Link Balance Engine", description: "Inspects category allocation metrics to report if content nodes contain too many generic tags or are overly shallow." },
      { name: "AI Semantic Tag Generator", role: "Contextual Synthesizer", description: "Scans product titles in seconds using Gemini to output relevant tags that raise search engine relevance organic signals." }
    ],
    steps: [
      "Access the 'Categories & Tags' management workspace inside your catalog dashboard.",
      "Input custom slugs and index annotations inside edit controls.",
      "Trigger the AI Tags suggestion engine to formulate highly accurate sub-categories, saving hours of manual tagging."
    ],
    tips: "Ensure tags possess a balanced ratio; a few well-allocated taxonomy silos provide significantly higher ranking index outcomes than hundreds of shallow ones."
  },
  collab: {
    title: "Invitations & Team Manager",
    category: "Catalog & Admin",
    shortDesc: "Securely delegate management access limits to content authors, marketing agencies, or moderators.",
    components: [
      { name: "Dynamic Invitation Portal", role: "Access Grantor", description: "Formulates single-use secure invites with custom expiration dates to onboard operators cleanly." },
      { name: "Structured Roles Allocator", role: "Access Scope Limiter", description: "Provides visual checkboxes mapping credentials directly to strict functional modules (Content Writer, Designer, Analyst, Admin)." },
      { name: "Emergency Token Revocator", role: "Session Terminal", description: "Instantly terminates third-party sessions, restoring strict proprietary sovereignty to database structures." }
    ],
    steps: [
      "Navigate to the 'Invitations & Team' section inside catalog management controls.",
      "Provide the operational email address of your specialist and assign their strict clearance boundaries.",
      "Send the cryptographic invitation and track connection timelines."
    ],
    tips: "Utilize the 'Least Privilege' paradigm; assign the Content Writer credential to copywriters to restrict billing dashboard sights."
  },
  affiliates: {
    title: "Partnership & Affiliation Hub",
    category: "Marketing & Sales",
    shortDesc: "Unleash cash flows by inviting partner stores, tracking real-time click pathways, and withdrawing payouts.",
    components: [
      { name: "Custom Referral Generator", role: "Cookie Link Encoder", description: "Renders personal tracking URLs configured with persistent referral parameters to claim commission credit instantly." },
      { name: "Balance Ledger Board", role: "Real-time Auditing Tracker", description: "Displays precise financial streams classifying current pending deposits, approved reserves, and payout historical receipts." },
      { name: "Express Payout Actuator", role: "Withdrawal Terminal", description: "Formulates PayPal and payment gateway request events to withdraw earnings in seconds." }
    ],
    steps: [
      "Check your unique affiliate URL link printed inside the Partners portal.",
      "Distribute the coupon link to entrepreneurial buddies, client directories, or blogs.",
      "Monitor incoming conversion flows and file direct withdrawal transfers as rewards accrue."
    ],
    tips: "Integrate your unique referral link within client footer guides or tutorials; the lifetime enrollment rate converts extremely well in business forums."
  }
};
