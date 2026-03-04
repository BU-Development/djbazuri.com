import Link from 'next/link';

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  const isNL = locale !== 'en';

  if (!isNL) {
    return <PrivacyEN locale={locale} />;
  }
  return <PrivacyNL locale={locale} />;
}

function PrivacyNL({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${locale}`} className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Terug naar home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Privacybeleid</h1>
        <p className="text-gray-400 mb-10 text-sm">Laatst bijgewerkt: maart 2026</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Wie zijn wij?</h2>
            <p>
              DJ Bazuri is een professionele DJ-dienst voor evenementen.
              Deze website (<strong className="text-white">djbazuri.com</strong>) is volledig open source en
              de broncode is openbaar beschikbaar op GitHub.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Welke gegevens verzamelen we?</h2>
            <p className="mb-3">We verzamelen alleen gegevens die strikt noodzakelijk zijn:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Naam en e-mailadres bij een boekingsaanvraag via het contactformulier</li>
              <li>Evenementsgegevens (naam, datum, pakketkeuze) voor de boeking</li>
              <li>Chatberichten uitgewisseld via het boekingsdashboard</li>
              <li>Playlistnummers die je toevoegt via jouw dashboard</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Hoe gebruiken we je gegevens?</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Om je boeking te beheren en contact te onderhouden</li>
              <li>Om je een toegangslink te sturen naar je persoonlijk dashboard</li>
              <li>Om je te informeren over statuswijzigingen van je boeking</li>
            </ul>
            <p className="mt-3">We verkopen, verhuren of delen je gegevens <strong className="text-white">nooit</strong> met derden voor commerciële doeleinden.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Cookies</h2>
            <p>
              We gebruiken alleen functionele cookies die noodzakelijk zijn voor het correct
              functioneren van de website (bijv. het opslaan van je cookievoorkeur). We gebruiken
              geen tracking-, marketing- of analytische cookies van derden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Privacy-vriendelijke tools</h2>
            <p className="mb-3">
              We hechten veel waarde aan privacy, ook achter de schermen. Daarom maken we gebruik van:
            </p>
            <ul className="space-y-3 ml-2">
              <li>
                <strong className="text-white">Proton Mail</strong> — Versleutelde e-mail voor zakelijke communicatie
              </li>
              <li>
                <strong className="text-white">Proton VPN</strong> — VPN voor veilig internetten
              </li>
              <li>
                <strong className="text-white">Proton Drive</strong> — Versleutelde cloudopslag voor bestanden
              </li>
              <li>
                <strong className="text-white">Proton Pass</strong> — Open source wachtwoordmanager
              </li>
              <li>
                <strong className="text-white">Signal</strong> — End-to-end versleuteld berichtenplatform
              </li>
              <li>
                <strong className="text-white">Zoho Mail</strong> — Privacyvriendelijke e-maildienst voor transactionele e-mails
              </li>
            </ul>
            <p className="mt-4">
              De volledige broncode van deze website is open source en te bekijken op{' '}
              <a
                href="https://github.com/BoazUri/djbazuri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Beveiliging</h2>
            <p>
              Alle gegevens worden opgeslagen in een beveiligde database (Supabase) met Row Level
              Security. Toegang tot boekingsgegevens verloopt via unieke, persoonlijke toegangslinks.
              We sturen nooit wachtwoorden via e-mail.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Jouw rechten</h2>
            <p>Je hebt het recht om:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>Inzage te vragen in je gegevens</li>
              <li>Je gegevens te laten verwijderen</li>
              <li>Bezwaar te maken tegen het gebruik van je gegevens</li>
            </ul>
            <p className="mt-3">
              Neem hiervoor contact op via{' '}
              <Link href={`/${locale}/contact`} className="text-purple-400 hover:text-purple-300 underline">
                het contactformulier
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              Vragen over dit privacybeleid? Stuur een bericht via{' '}
              <Link href={`/${locale}/contact`} className="text-purple-400 hover:text-purple-300 underline">
                het contactformulier
              </Link>{' '}
              of neem contact op via Instagram.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function PrivacyEN({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${locale}`} className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10 text-sm">Last updated: March 2026</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Who are we?</h2>
            <p>
              DJ Bazuri is a professional DJ service for events.
              This website (<strong className="text-white">djbazuri.com</strong>) is fully open source and
              the source code is publicly available on GitHub.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">2. What data do we collect?</h2>
            <p className="mb-3">We only collect data that is strictly necessary:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Name and email address when submitting a booking request via the contact form</li>
              <li>Event details (name, date, package type) for the booking</li>
              <li>Chat messages exchanged via the booking dashboard</li>
              <li>Playlist tracks you add through your dashboard</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">3. How do we use your data?</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To manage your booking and maintain communication</li>
              <li>To send you an access link to your personal dashboard</li>
              <li>To notify you of booking status changes</li>
            </ul>
            <p className="mt-3">We <strong className="text-white">never</strong> sell, rent, or share your data with third parties for commercial purposes.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Cookies</h2>
            <p>
              We only use functional cookies that are necessary for the website to work correctly
              (e.g. storing your cookie preference). We do not use third-party tracking, marketing,
              or analytics cookies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Privacy-friendly tools</h2>
            <p className="mb-3">
              We value privacy, including behind the scenes. That&apos;s why we use:
            </p>
            <ul className="space-y-3 ml-2">
              <li><strong className="text-white">Proton Mail</strong> — Encrypted email for business communication</li>
              <li><strong className="text-white">Proton VPN</strong> — VPN for secure browsing</li>
              <li><strong className="text-white">Proton Drive</strong> — Encrypted cloud storage for files</li>
              <li><strong className="text-white">Proton Pass</strong> — Open source password manager</li>
              <li><strong className="text-white">Signal</strong> — End-to-end encrypted messaging platform</li>
              <li><strong className="text-white">Zoho Mail</strong> — Privacy-friendly email service for transactional emails</li>
            </ul>
            <p className="mt-4">
              The full source code of this website is open source and available on{' '}
              <a
                href="https://github.com/BoazUri/djbazuri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Security</h2>
            <p>
              All data is stored in a secure database (Supabase) with Row Level Security. Access
              to booking data is via unique, personal access links. We never send passwords by email.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Your rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>Request access to your data</li>
              <li>Request deletion of your data</li>
              <li>Object to the use of your data</li>
            </ul>
            <p className="mt-3">
              Please contact us via{' '}
              <Link href={`/${locale}/contact`} className="text-purple-400 hover:text-purple-300 underline">
                the contact form
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              Questions about this privacy policy? Send a message via{' '}
              <Link href={`/${locale}/contact`} className="text-purple-400 hover:text-purple-300 underline">
                the contact form
              </Link>{' '}
              or reach out via Instagram.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
