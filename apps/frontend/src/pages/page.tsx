/* eslint-disable max-lines */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Users,
    Briefcase,
    Globe,
    ChevronRight,
    BarChart2,
    PieChart,
    Users2,
    Package,
    Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import { UserNav } from '@/components/shared/user-nav';
import { GuestNav } from '@/components/shared/guest-nav';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

/**
 * ERP360 Landing Page
 *
 * This component renders the main marketing landing page for the ERP360 SaaS product.
 * It's structured into several sections:
 * 1. Header (Navigation) - Now with dynamic auth state
 * 2. Hero (Main CTA)
 * 3. LogoCloud (Social Proof)
 * 4. Features (Value Propositions)
 * 5. NEW: AI Copilot (Gemini Feature)
 * 6. HowItWorks (Process)
 * 7. Testimonials (Social Proof)
 * 8. CTA (Final Demo Request)
 * 9. FAQ (Objection Handling)
 * 10. Footer
 *
 * It uses shadcn/ui components for layout and styling.
 */
const LandingPage = () => {
    const [aiResponse, setAiResponse] = useState('');
    const [aiPrompt, setAiPrompt] = useState(
        'Draft a job description for a senior product manager'
    );

    const { isAuthenticated, authUser, handleLogout } = useAuth();

    const handleGenerateAiResponse = () => {
        setAiResponse(
            '**Job Description: Senior Product Manager**\n\n**About Us:**\nERP360 is building the future of business operations. We are looking for a passionate Senior Product Manager to lead the strategy and development of our core CRM and Finance modules...\n\n**Responsibilities:**\n- Define and execute the product roadmap.\n- Gather and prioritize customer requirements.\n- Work closely with engineering, design, and marketing...\n\n**Qualifications:**\n- 5+ years of B2B SaaS product management experience.\n- Deep understanding of agile methodologies.\n- Strong analytical and problem-solving skills...'
        );
    };

    return (
        <div className="bg-background text-foreground flex min-h-screen w-full flex-col">
            {/* 1. Header */}
            <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
                {/* ... existing header code ... */}
                <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
                    <div className="mr-4 flex items-center">
                        <Globe className="text-primary mr-2 h-6 w-6" />
                        <span className="text-lg font-bold">ERP360</span>
                    </div>
                    <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                        <a
                            href="#features"
                            className="text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#ai-copilot"
                            className="text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                            AI Copilot
                        </a>
                        <a
                            href="#testimonials"
                            className="text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                            Customers
                        </a>
                        <a
                            href="#faq"
                            className="text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                            FAQ
                        </a>
                    </nav>
                    {/* --- DYNAMIC AUTH SECTION --- */}
                    {isAuthenticated ? (
                        <UserNav user={authUser!} handleLogout={handleLogout} />
                    ) : (
                        <GuestNav />
                    )}
                    {/* --- END DYNAMIC AUTH SECTION --- */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {/* 2. Hero Section */}
                <section className="relative w-full overflow-hidden py-24 md:py-32 lg:py-40">
                    {/* ... existing hero code ... */}
                    <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-primary/10 h-[400px] w-[600px] rounded-full blur-[100px] md:h-[600px] md:w-[1000px]" />
                    </div>

                    <div className="container mx-auto max-w-screen-lg px-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                            The One Unified Platform for Smarter Business Operations
                        </h1>
                        <p className="text-muted-foreground mx-auto mt-6 max-w-[700px] text-lg md:text-xl">
                            Stop switching tabs. ERP360 centralizes your HR, Finance, CRM, and
                            Inventory into one powerful system. Automate workflows, boost
                            efficiency, and make data-driven decisions.
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="w-full shadow-lg sm:w-auto">
                                Request a Demo
                            </Button>
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                Explore Features
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 3. Logo Cloud (Social Proof) */}
                <section className="bg-muted/50 py-12">
                    {/* ... existing logo cloud code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <p className="text-muted-foreground mb-6 text-center text-sm font-semibold uppercase">
                            Trusted by 5,000+ growing enterprises
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-between">
                            <span className="text-muted-foreground/60 text-2xl font-semibold">
                                EnterpriseCo
                            </span>
                            <span className="text-muted-foreground/60 text-2xl font-semibold">
                                SaaS Inc.
                            </span>
                            <span className="text-muted-foreground/60 text-2xl font-semibold">
                                Quantum Ltd.
                            </span>
                            <span className="text-muted-foreground/60 text-2xl font-semibold">
                                GlobalCorp
                            </span>
                            <span className="text-muted-foreground/60 text-2xl font-semibold">
                                LogisticsCo
                            </span>
                        </div>
                    </div>
                </section>

                {/* 4. Features Section */}
                <section id="features" className="w-full py-24 md:py-32">
                    {/* ... existing features code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="mb-12 text-center">
                            <span className="text-primary text-sm font-semibold uppercase">
                                Why ERP360?
                            </span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                                One Platform. Endless Efficiency.
                            </h2>
                            <p className="text-muted-foreground mt-4 text-lg">
                                See how our core modules connect every part of your business.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<Users2 className="text-primary h-8 w-8" />}
                                title="HR Management"
                                description="From onboarding to payroll, manage your entire employee lifecycle, track time-off, and run performance reviews."
                            />
                            <FeatureCard
                                icon={<PieChart className="text-primary h-8 w-8" />}
                                title="Finance & Accounting"
                                description="General ledger, A/R, A/P, and financial reporting. Get a real-time view of your company's financial health."
                            />
                            <FeatureCard
                                icon={<Users className="text-primary h-8 w-8" />}
                                title="Customer Relationship (CRM)"
                                description="Track every lead, manage your sales pipeline, and provide world-class customer support from one hub."
                            />
                            <FeatureCard
                                icon={<Package className="text-primary h-8 w-8" />}
                                title="Inventory & Supply Chain"
                                description="Manage stock levels across multiple warehouses, track POs, and automate procurement workflows."
                            />
                            <FeatureCard
                                icon={<Briefcase className="text-primary h-8 w-8" />}
                                title="Project Management"
                                description="Plan projects, assign tasks, track billable hours, and ensure your projects are delivered on time and on budget."
                            />
                            <FeatureCard
                                icon={<BarChart2 className="text-primary h-8 w-8" />}
                                title="Analytics & BI"
                                description="Stop guessing. Get customizable dashboards and deep-dive analytics for every department."
                            />
                        </div>
                    </div>
                </section>

                {/* 5. NEW: AI Copilot Section (Gemini Feature) */}
                <section id="ai-copilot" className="bg-muted/50 w-full py-24 md:py-32">
                    {/* ... existing AI copilot code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="grid gap-12 md:grid-cols-2 md:items-center">
                            {/* Left Column: Marketing Copy */}
                            <div>
                                <span className="text-primary text-sm font-semibold uppercase">
                                    The Future of ERP
                                </span>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                                    Meet Your AI Copilot ✨
                                </h2>
                                <p className="text-muted-foreground mt-4 text-lg">
                                    Stop the busywork. Let ERP360's integrated Gemini AI assistant
                                    automate tasks, summarize complex data, and draft communications
                                    for you.
                                </p>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex items-start">
                                        <Sparkles className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            <b>Summarize financial reports</b> in seconds, not
                                            hours.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Sparkles className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            <b>Draft CRM emails</b> and follow-ups instantly.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Sparkles className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            <b>Generate project plans</b> and HR job descriptions
                                            from a simple prompt.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Right Column: Interactive Mock Demo */}
                            <div>
                                <Card className="shadow-xl">
                                    <CardHeader>
                                        <CardTitle>Try it Now</CardTitle>
                                        <CardDescription>
                                            See how the AI Copilot accelerates your HR tasks.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="ai-prompt"
                                                    className="text-sm font-medium"
                                                >
                                                    Enter a prompt:
                                                </label>
                                                <Input
                                                    id="ai-prompt"
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleGenerateAiResponse}
                                                className="w-full"
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Generate
                                            </Button>
                                            {aiResponse && (
                                                <div className="bg-background mt-4 rounded-md border p-4 text-sm">
                                                    <pre className="text-muted-foreground font-sans whitespace-pre-wrap">
                                                        {aiResponse}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. How It Works (Process) */}
                <section className="w-full py-24 md:py-32">
                    {/* ... existing how-it-works code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Go Live in 3 Simple Steps
                            </h2>
                            <p className="text-muted-foreground mt-4 text-lg">
                                Our guided process makes migration and onboarding seamless.
                            </p>
                        </div>
                        <div className="relative grid gap-10 md:grid-cols-3">
                            {/* Dotted Line */}
                            <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 md:block">
                                <svg
                                    width="100%"
                                    height="2"
                                    viewBox="0 0 100 2"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-border"
                                >
                                    <path d="M1 1H99" strokeWidth="2" strokeDasharray="8 8" />
                                </svg>
                            </div>

                            <ProcessStep
                                number="01"
                                title="Discover & Plan"
                                description="We map your current workflows and design a custom migration plan tailored to your business goals."
                            />
                            <ProcessStep
                                number="02"
                                title="Integrate & Configure"
                                description="Our team connects your existing tools and configures ERP360 modules to work exactly how you do."
                            />
                            <ProcessStep
                                number="03"
                                title="Launch & Support"
                                description="We train your team and provide 24/7 dedicated support to ensure a smooth launch and continuous success."
                            />
                        </div>
                    </div>
                </section>

                {/* 7. Testimonials Section */}
                <section id="testimonials" className="w-full py-24 md:py-32">
                    {/* ... existing testimonials code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Don't Just Take Our Word for It
                            </h2>
                            <p className="text-muted-foreground mt-4 text-lg">
                                See how leaders are centralizing operations with ERP360.
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2">
                            <TestimonialCard
                                quote="ERP360 replaced 5 different tools for us. Our financial close process is 40% faster, and for the first time, our sales and inventory data actually match."
                                author="Sarah Chen"
                                title="CFO, EnterpriseCo"
                            />
                            <TestimonialCard
                                quote="The ability to create custom automated workflows between HR and Payroll has saved our team at least 20 hours a week. It's a total game-changer."
                                author="Mark Johnson"
                                title="Head of Operations, LogisticsCo"
                            />
                        </div>
                    </div>
                </section>

                {/* 8. CTA Section */}
                <section className="bg-primary text-primary-foreground w-full py-24 md:py-32">
                    {/* ... existing cta code ... */}
                    <div className="container mx-auto max-w-screen-md px-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Ready to See ERP360 in Action?
                        </h2>
                        <p className="text-primary-foreground/80 mt-4 text-lg">
                            Stop managing spreadsheets and start managing your business. Our experts
                            will show you how ERP360 can be tailored to your exact needs. No
                            pressure, just solutions.
                        </p>
                        <div className="mt-8">
                            <Button size="lg" variant="secondary" className="shadow-lg">
                                Request a Free Demo
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 9. FAQ Section */}
                <section id="faq" className="w-full py-24 md:py-32">
                    {/* ... existing faq code ... */}
                    <div className="container mx-auto max-w-screen-md px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Frequently Asked Questions
                            </h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg">
                                    What kind of integrations do you support?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    ERP360 comes with over 100 built-in integrations for popular
                                    tools like Salesforce, Stripe, Shopify, Workday, and more. We
                                    also have a robust REST API for any custom integrations.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg">
                                    Is ERP360 suitable for my industry?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    Our platform is highly configurable and trusted by businesses in
                                    Manufacturing, Retail, SaaS, Logistics, and Professional
                                    Services. We can tailor the modules and workflows to fit your
                                    specific industry needs.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg">
                                    What does the implementation process look like?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    A typical implementation takes 4-8 weeks. Our 3-step process
                                    (Discover, Integrate, Launch) is managed by a dedicated
                                    onboarding specialist to ensure a seamless transition.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg">
                                    How is pricing determined?
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    Pricing is based on the modules you select and the number of
                                    active users. We offer flexible plans that can scale with your
                                    company. Contact our sales team for a custom quote.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                {/* 10. Footer */}
                <footer className="border-border/40 w-full border-t py-12">
                    {/* ... existing footer code ... */}
                    <div className="container mx-auto max-w-screen-lg px-4">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                            {/* Column 1: Brand */}
                            <div className="order-last col-span-2 md:order-first md:col-span-2">
                                <div className="flex items-center">
                                    <Globe className="text-primary mr-2 h-6 w-6" />
                                    <span className="text-lg font-bold">ERP360</span>
                                </div>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    The unified platform for smarter business operations.
                                </p>
                                <p className="text-muted-foreground/50 mt-4 text-xs">
                                    © {new Date().getFullYear()} ERP360, Inc. All rights reserved.
                                </p>
                            </div>

                            {/* Column 2: Product */}
                            <FooterLinks
                                title="Product"
                                links={[
                                    { name: 'Features', href: '#' },
                                    { name: 'HRMS', href: '#' },
                                    { name: 'Finance', href: '#' },
                                    { name: 'CRM', href: '#' },
                                    { name: 'Integrations', href: '#' },
                                ]}
                            />

                            {/* Column 3: Company */}
                            <FooterLinks
                                title="Company"
                                links={[
                                    { name: 'About Us', href: '#' },
                                    { name: 'Careers', href: '#' },
                                    { name: 'Blog', href: '#' },
                                    { name: 'Contact Us', href: '#' },
                                ]}
                            />

                            {/* Column 4: Resources */}
                            <FooterLinks
                                title="Resources"
                                links={[
                                    { name: 'Case Studies', href: '#' },
                                    { name: 'Documentation', href: '#' },
                                    { name: 'API Status', href: '#' },
                                    { name: 'Security', href: '#' },
                                ]}
                            />
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

/* --- Reusable Sub-Components --- */

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
        <CardHeader>
            <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                {icon}
            </div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const ProcessStep = ({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) => (
    <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
        <div className="border-primary bg-background text-primary flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold">
            {number}
        </div>
        <h3 className="mt-4 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
    </div>
);

const TestimonialCard = ({
    quote,
    author,
    title,
}: {
    quote: string;
    author: string;
    title: string;
}) => (
    <Card className="bg-muted/50">
        <CardContent className="pt-6">
            <blockquote className="text-lg leading-relaxed font-medium">"{quote}"</blockquote>
            <div className="mt-4 flex items-center">
                {/* Placeholder for author image */}
                <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full font-bold">
                    {author.charAt(0)}
                </div>
                <div className="ml-4">
                    <p className="font-semibold">{author}</p>
                    <p className="text-muted-foreground text-sm">{title}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const FooterLinks = ({
    title,
    links,
}: {
    title: string;
    links: { name: string; href: string }[];
}) => (
    <div>
        <h4 className="mb-4 text-sm font-semibold uppercase">{title}</h4>
        <ul className="space-y-3">
            {links.map((link) => (
                <li key={link.name}>
                    <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        {link.name}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

export default LandingPage;
