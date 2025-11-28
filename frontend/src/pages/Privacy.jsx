const sectionClass = "bg-white rounded-2xl shadow p-4 sm:p-6";
const textClass = "text-sm sm:text-base text-gray-600 leading-relaxed";

const Privacy = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen py-10 px-4 pt-26 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            StayEase Policies
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Privacy Policy
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Updated {currentYear}. We are committed to protecting every guest, manager and partner who uses StayEase.
          </p>
        </header>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Data We Collect</h2>
          <p className={textClass}>
            We collect essential data when you browse, book or manage hotels on StayEase: profile details, identification numbers shared during KYC, booking history, device or browser metadata, and optional marketing preferences.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Why We Use Your Data</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={textClass}>To create secure accounts, process bookings and send confirmations.</li>
            <li className={textClass}>To detect fraud, manage cancellations, refunds and loyalty perks.</li>
            <li className={textClass}>To share essential booking information with hotels so they can host you smoothly.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Your Controls</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={textClass}>You can edit personal information or marketing consent from your profile.</li>
            <li className={textClass}>Request data export or deletion by emailing <a className="text-black underline font-medium" href="mailto:steyease.team@gmail.com">steyease.team@gmail.com</a>.</li>
            <li className={textClass}>Opt-out links are available in every promotional email.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Security</h2>
          <p className={textClass}>
            StayEase uses TLS encryption, secure credential storage, and role-based data access inside the platform. Payment information is handled by verified gateways that comply with PCI-DSS guidelines.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Retention &amp; Updates</h2>
          <p className={textClass}>
            Booking and invoice data is retained for regulatory timelines (generally 5 years) and then deleted or anonymised. This privacy statement may change as new compliance requirements evolve; updates will always be posted here.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

