"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/75 leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:ml-2">{children}</div>
    </section>
  )
}

function EnglishContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
        Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
      </div>
      <Section title="1. Information We Collect">
        <p><strong>Account information:</strong> When you create an account, we collect your name and email address.</p>
        <p><strong>Submission data:</strong> Content you submit along with your contact details (name, email, phone) as provided.</p>
        <p><strong>Usage data:</strong> Basic analytics such as page views, browser type, and approximate city-level location. We do not sell this data.</p>
        <p><strong>Technical data:</strong> IP address, device type, and browser data collected automatically, used for security and abuse prevention.</p>
      </Section>
      <Section title="2. How We Use Your Information">
        <ul>
          <li>To display your submitted content on the platform (unless submitted anonymously)</li>
          <li>To contact you regarding your submissions or account</li>
          <li>To moderate content and enforce community guidelines</li>
          <li>To improve platform performance and user experience</li>
          <li>To comply with legal obligations under Indian law</li>
        </ul>
        <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
      </Section>
      <Section title="3. Anonymous Submissions">
        <p>News submissions may be made anonymously. Your name will not be displayed publicly. However, your email address is still collected for moderation purposes and kept private. Anonymous submissions are still traceable to an IP address for legal compliance.</p>
      </Section>
      <Section title="4. Data Storage">
        <p>Your data is stored securely using Supabase (PostgreSQL on AWS infrastructure). We retain account and submission data for as long as the account is active or as required for legal compliance. Deleted content may remain in backups for up to 30 days.</p>
      </Section>
      <Section title="5. Cookies">
        <p>We use essential cookies to keep you logged in and remember your preferences (language and theme settings). We do not use advertising cookies or cross-site tracking cookies.</p>
      </Section>
      <Section title="6. Third-Party Services">
        <p>The platform uses:</p>
        <ul>
          <li><strong>Supabase</strong> — database and authentication</li>
          <li><strong>Vercel</strong> — hosting and deployment</li>
          <li><strong>Google / YouTube embeds</strong> — subject to Google's privacy policy</li>
        </ul>
      </Section>
      <Section title="7. Your Rights">
        <p>You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us through the platform.</p>
      </Section>
      <Section title="8. Children's Privacy">
        <p>NewMarket.co.in is not directed at children under 13. We do not knowingly collect personal information from minors.</p>
      </Section>
      <Section title="9. Changes to This Policy">
        <p>We may update this Privacy Policy periodically. Continued use after changes constitutes acceptance of the updated policy.</p>
      </Section>
      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Related policies</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}

function HindiContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
        आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह नीति स्पष्ट करती है कि हम कौन सा डेटा एकत्र करते हैं, उसका उपयोग कैसे करते हैं, और आपकी व्यक्तिगत जानकारी के संबंध में आपके क्या अधिकार हैं।
      </div>
      <Section title="1. हम कौन सी जानकारी एकत्र करते हैं">
        <p><strong>खाता जानकारी:</strong> खाता बनाते समय हम आपका नाम और ईमेल पता एकत्र करते हैं।</p>
        <p><strong>प्रस्तुति डेटा:</strong> आपके द्वारा प्रस्तुत सामग्री के साथ-साथ प्रस्तुति फ़ॉर्म में दी गई संपर्क जानकारी (नाम, ईमेल, फ़ोन)।</p>
        <p><strong>उपयोग डेटा:</strong> पेज व्यू, ब्राउज़र प्रकार और अनुमानित शहर-स्तरीय स्थान जैसे बुनियादी विश्लेषण। हम यह डेटा बेचते नहीं हैं।</p>
        <p><strong>तकनीकी डेटा:</strong> IP पता, डिवाइस प्रकार और ब्राउज़र डेटा जो स्वचालित रूप से एकत्र होता है और सुरक्षा एवं दुरुपयोग रोकथाम के लिए उपयोग किया जाता है।</p>
      </Section>
      <Section title="2. हम आपकी जानकारी का उपयोग कैसे करते हैं">
        <ul>
          <li>मंच पर आपकी प्रस्तुत सामग्री प्रदर्शित करने के लिए (जब तक गुमनाम रूप से प्रस्तुत न की गई हो)</li>
          <li>आपकी प्रस्तुतियों या खाते के संबंध में आपसे संपर्क करने के लिए</li>
          <li>सामग्री का प्रशासन करने और सामुदायिक दिशा-निर्देशों को लागू करने के लिए</li>
          <li>मंच के प्रदर्शन और उपयोगकर्ता अनुभव को बेहतर बनाने के लिए</li>
          <li>भारतीय कानून के तहत कानूनी दायित्वों का पालन करने के लिए</li>
        </ul>
        <p>हम आपकी व्यक्तिगत जानकारी को विपणन उद्देश्यों के लिए किसी तृतीय पक्ष को नहीं बेचते, किराये पर नहीं देते या साझा नहीं करते।</p>
      </Section>
      <Section title="3. गुमनाम प्रस्तुतियाँ">
        <p>समाचार प्रस्तुतियाँ गुमनाम रूप से की जा सकती हैं। इस स्थिति में आपका नाम सार्वजनिक रूप से प्रदर्शित नहीं होगा। हालाँकि, प्रशासन उद्देश्यों के लिए आपका ईमेल पता एकत्र किया जाता है और निजी रखा जाता है। कानूनी अनुपालन के लिए गुमनाम प्रस्तुतियाँ भी IP पते से पता लगाई जा सकती हैं।</p>
      </Section>
      <Section title="4. डेटा संग्रहण">
        <p>आपका डेटा Supabase (AWS इंफ्रास्ट्रक्चर पर PostgreSQL) का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है। हम खाते और प्रस्तुति डेटा तब तक रखते हैं जब तक खाता सक्रिय है या कानूनी अनुपालन के लिए आवश्यक है। हटाई गई सामग्री 30 दिनों तक बैकअप में रह सकती है।</p>
      </Section>
      <Section title="5. कुकीज़">
        <p>हम आपको लॉग इन रखने और आपकी प्राथमिकताओं (भाषा और थीम सेटिंग) को याद रखने के लिए आवश्यक कुकीज़ का उपयोग करते हैं। हम विज्ञापन कुकीज़ या क्रॉस-साइट ट्रैकिंग कुकीज़ का उपयोग नहीं करते।</p>
      </Section>
      <Section title="6. तृतीय-पक्ष सेवाएँ">
        <p>मंच निम्नलिखित सेवाओं का उपयोग करता है:</p>
        <ul>
          <li><strong>Supabase</strong> — डेटाबेस और प्रमाणीकरण</li>
          <li><strong>Vercel</strong> — होस्टिंग और डिप्लॉयमेंट</li>
          <li><strong>Google / YouTube embeds</strong> — Google की गोपनीयता नीति के अधीन</li>
        </ul>
      </Section>
      <Section title="7. आपके अधिकार">
        <p>आपके पास अपनी व्यक्तिगत जानकारी तक पहुँचने, उसे सुधारने या उसे हटाने का अनुरोध करने का अधिकार है। इन अधिकारों का उपयोग करने के लिए मंच के माध्यम से हमसे संपर्क करें।</p>
      </Section>
      <Section title="8. बच्चों की गोपनीयता">
        <p>NewMarket.co.in 13 वर्ष से कम आयु के बच्चों के लिए नहीं है। हम जानबूझकर नाबालिगों से व्यक्तिगत जानकारी एकत्र नहीं करते।</p>
      </Section>
      <Section title="9. इस नीति में परिवर्तन">
        <p>हम समय-समय पर इस गोपनीयता नीति को अद्यतन कर सकते हैं। परिवर्तनों के बाद मंच का उपयोग जारी रखना अद्यतन नीति की स्वीकृति मानी जाएगी।</p>
      </Section>
      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">संबंधित नीतियाँ</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}

export function PrivacyContent() {
  const { lang } = useLanguage()
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {lang === "hi" ? "होम पर वापस" : "Back to Home"}
      </Link>
      <div className="mb-8 flex items-start gap-3">
        <Lock size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Privacy Policy</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi" ? "प्रभावी तिथि: मई 2026 · NewMarket.co.in" : "Effective Date: May 2026 · NewMarket.co.in"}
          </p>
        </div>
      </div>
      {lang === "hi" ? <HindiContent /> : <EnglishContent />}
    </div>
  )
}
