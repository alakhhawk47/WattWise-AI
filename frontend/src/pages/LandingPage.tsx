import { Link } from "react-router-dom";
import {
  Zap,
  Activity,
  Brain,
  Bell,
  TrendingDown,
  ArrowRight,
  Leaf,
  ExternalLink,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Smart Monitoring",
    description:
      "Real-time tracking of classroom occupancy, lighting, and fan usage across your campus with simulated IoT sensor data.",
  },
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description:
      "Hybrid anomaly scoring using Isolation Forest and rule-based analysis to identify energy waste patterns automatically.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified when classrooms show suspicious energy behaviour with clear explanations and recommended actions.",
  },
  {
    icon: TrendingDown,
    title: "Impact Tracking",
    description:
      "Estimate potential energy savings, cost reductions, and CO₂ emissions avoided with transparent methodology.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              WattWise AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-watt-green-950/20 via-background to-background" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" />
              Microsoft 1M1B Showcase Project
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Smart Energy Monitoring{" "}
              <span className="bg-gradient-to-r from-primary to-watt-lime bg-clip-text text-transparent">
                for Classrooms
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              WattWise AI uses occupancy and device-usage signals to detect
              potential electricity wastage, explain abnormal behaviour, and help
              campus facility teams respond faster.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "5", label: "Classrooms Monitored" },
              { value: "0–100", label: "Risk Score Range" },
              { value: "Real-time", label: "Monitoring Updates" },
              { value: "AI", label: "Powered Detection" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Intelligent Energy Management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform for monitoring, detecting, and reducing energy
              waste in campus classrooms.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-8 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From sensor data to actionable insights in real time.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Data Collection",
                description:
                  "Simulated IoT sensors generate occupancy, device state, and temperature data for five classrooms.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description:
                  "Hybrid anomaly scoring evaluates energy behaviour, calculates risk scores, and identifies waste patterns.",
              },
              {
                step: "03",
                title: "Alert & Action",
                description:
                  "Staff receive alerts with plain-language explanations and can acknowledge or resolve events.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-watt-forest to-watt-green-900 px-8 py-16 text-center shadow-2xl sm:px-16">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-watt-lime/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Save Energy?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Start monitoring your campus classrooms and discover potential
                energy savings with AI-powered insights.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-watt-forest shadow-lg hover:bg-white/90 transition-colors"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                WattWise AI
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Microsoft 1M1B Showcase</span>
              <span>•</span>
              <span>JSS Academy of Technical Education, Noida</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WattWise AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
