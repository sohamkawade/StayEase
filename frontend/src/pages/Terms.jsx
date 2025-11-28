import { Link } from "react-router-dom";

const listItemClass = "text-sm sm:text-base text-gray-600 leading-relaxed";
const sectionClass = "bg-white rounded-2xl shadow p-4 sm:p-6";

const Terms = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 pt-26 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            StayEase Terms & Conditions
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Updated {currentYear}. These policies apply to all StayEase guests, managers and hotel partners.
          </p>
        </header>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Booking &amp; Payments</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={listItemClass}>All reservations are confirmed only after successful payment or hotel approval.</li>
            <li className={listItemClass}>Guests must provide accurate personal information and a valid ID during check-in.</li>
            <li className={listItemClass}>Any discrepancy in guest count or stay information should be updated at least 24 hours before arrival.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Cancellation &amp; Refunds</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={listItemClass}>Free cancellation is available up to 24 hours before the scheduled check-in. Hotels that opt-in for extended protection may allow cancellations up to 48 hours prior.</li>
            <li className={listItemClass}>Cancellations made after the allowed window may incur one night’s charge or be fully non-refundable depending on the hotel’s rule set.</li>
            <li className={listItemClass}>Refunds are processed automatically to the original payment source within 5-7 working days after approval.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Guest Conduct</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={listItemClass}>Guests agree to follow hotel-specific policies around check-in/out time, smoking, pets, noise and visitor access.</li>
            <li className={listItemClass}>Hotels may levy additional cleaning or damage charges if rooms are left in an unacceptable condition.</li>
            <li className={listItemClass}>Any misuse of the StayEase platform, including fraudulent bookings, can lead to account suspension.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data &amp; Communication</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li className={listItemClass}>By creating an account or booking, you consent to receive transactional emails, WhatsApp alerts and SMS updates.</li>
            <li className={listItemClass}>Marketing communication is always optional and can be disabled through your profile settings.</li>
            <li className={listItemClass}>Refer to our <Link to="/privacy" className="text-black underline font-medium">Privacy Policy</Link> to understand how we safeguard personal information.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact &amp; Escalations</h2>
          <p className={listItemClass}>
            For questions on cancellations, invoices or policy clarifications, write to{" "}
            <a href="mailto:steyease.team@gmail.com" className="text-black underline font-medium">
              steyease.team@gmail.com
            </a>{" "}
            or reach our support line at +91 9372463345.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;

