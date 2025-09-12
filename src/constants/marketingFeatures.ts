import type { LucideIcon } from "lucide-react";
import {
  Smartphone,
  Wind,
  Camera,
  Users,
  FileText,
  Layers,
  Navigation,
  TrendingUp,
  DollarSign,
  Cloud,
  Calendar,
  BarChart3,
  Shield,
  Settings
} from "lucide-react";

export type MarketingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
};

export const marketingFeatures: MarketingFeature[] = [
  {
    title: "Progressive Web App",
    description:
      "Install as native app on any device. Works offline with automatic sync when connected.",
    icon: Smartphone,
    bullets: [
      "One-click installation",
      "Full offline functionality",
      "Cross-platform compatibility"
    ]
  },
  {
    title: "Wind Mitigation Specialist",
    description:
      "Florida Form 1802 compliant inspections. Help clients save thousands on insurance premiums.",
    icon: Wind,
    bullets: [
      "OIR-B1-1802 form compliance",
      "All 7 inspection questions",
      "Insurance discount calculations"
    ]
  },
  {
    title: "Photo & Media Management",
    description:
      "Capture, annotate, and organize photos directly within your reports with advanced media tools.",
    icon: Camera,
    bullets: ["Photo annotation", "Video recording", "Audio notes"]
  },
  {
    title: "Contact & Account Management",
    description:
      "Organize your clients and business relationships with comprehensive CRM features.",
    icon: Users,
    bullets: ["Contact database", "Relationship tracking", "Communication history"]
  },
  {
    title: "Professional Templates",
    description:
      "Attorney-vetted narrative templates for each SOP section with custom branding options.",
    icon: FileText,
    bullets: [
      "Pre-written defect narratives",
      "Custom logos, colors, signatures",
      "Professional PDF generation"
    ]
  },
  {
    title: "Seamless Integrations",
    description:
      "Works with your existing tools and services to keep data flowing effortlessly.",
    icon: Layers,
    bullets: [
      "Supabase backend",
      "Email & SMS notifications",
      "Flexible API architecture"
    ]
  },
  {
    title: "Route Optimization",
    description: "Plan efficient inspection routes to save time and fuel.",
    icon: Navigation,
    bullets: [
      "Smart directions",
      "Multi-stop planning",
      "Time-saving navigation"
    ]
  },
  {
    title: "Mileage Tracking",
    description:
      "Automatically log mileage to simplify reimbursements and tax deductions.",
    icon: TrendingUp,
    bullets: ["Automatic logs", "GPS-based tracking", "Tax-ready records"]
  },
  {
    title: "Expense Reporting",
    description:
      "Track expenses and generate accountant-ready exports for seamless bookkeeping.",
    icon: DollarSign,
    bullets: ["Receipt capture", "Categorized expenses", "CSV exports"]
  },
  {
    title: "Professional Reports",
    description:
      "Create comprehensive inspection reports with customizable templates that follow InterNACHI standards.",
    icon: FileText,
    bullets: ["Multiple report types", "Custom templates", "Digital signatures"]
  },
  {
    title: "Mobile-First Design",
    description:
      "Work seamlessly across devices with our responsive web app and PWA capabilities.",
    icon: Smartphone,
    bullets: ["Offline functionality", "Cross-platform", "Touch-optimized"]
  },
  {
    title: "Cloud Synchronization",
    description:
      "Your data is always backed up and synchronized across all your devices automatically.",
    icon: Cloud,
    bullets: ["Real-time sync", "Data backup", "Multi-device access"]
  },
  {
    title: "Scheduling & Tasks",
    description:
      "Manage appointments, deadlines, and follow-ups with integrated calendar and task management.",
    icon: Calendar,
    bullets: ["Calendar integration", "Task reminders", "Appointment booking"]
  },
  {
    title: "Analytics & Insights",
    description:
      "Track your business performance with detailed analytics and reporting dashboards.",
    icon: BarChart3,
    bullets: ["Revenue tracking", "Performance metrics", "Business insights"]
  },
  {
    title: "Security & Compliance",
    description:
      "Enterprise-grade security with data encryption and compliance with industry standards.",
    icon: Shield,
    bullets: ["Data encryption", "Secure sharing", "Compliance ready"]
  },
  {
    title: "Customization Options",
    description:
      "Tailor the platform to your business needs with extensive customization capabilities.",
    icon: Settings,
    bullets: ["Custom branding", "Report templates", "Workflow settings"]
  }
];

export default marketingFeatures;
