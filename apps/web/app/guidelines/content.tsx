"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-3 text-foreground">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/85 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  )
}

function EnglishContent() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-5 py-4">
        <h2 className="!mt-0 text-amber-900 dark:text-amber-300 font-bold">Important Notice</h2>
        <p className="text-amber-800 dark:text-amber-400 text-sm">
          NewMarket.co.in is a publicly accessible digital platform. By accessing, submitting content to, or using this platform,
          you agree to comply fully with all platform rules, moderation decisions, and applicable laws of India.
          Violation of these rules may result in content removal, permanent account suspension, IP restrictions, reporting to
          relevant authorities, and legal action where applicable.
        </p>
      </div>

      <Section title="Zero Tolerance Policy">
        <p>The following are strictly prohibited and may result in immediate permanent removal without warning:</p>
        <ul>{[
          "Content promoting or inciting hatred based on caste, religion, gender, nationality, ethnicity, or disability",
          "Obscene, pornographic, or sexually explicit material of any kind",
          "Threats, intimidation, or targeted harassment of any individual or group",
          "Incitement to violence, communal unrest, or public disorder",
          "Any content involving harm to minors",
          "Promotion of terrorism, extremism, or unlawful activities",
          "Doxxing — publishing private personal information without consent",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="Content Rules">
        <p>All content submitted on this platform must adhere to the following standards:</p>
        <ul>{[
          "Information must be accurate and verifiable to the best of your knowledge",
          "Submissions must be original or properly attributed with permission from the rights holder",
          "Content must be relevant to the New Market area, Bhopal, or its community",
          "No unsolicited advertising, spam, or commercial promotions outside designated listing sections",
          "No duplicate or cross-posted submissions across multiple sections",
          "Language must be respectful and professional",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="Account & User Conduct">
        <ul>{[
          "Users may create a single account per person",
          "Sharing or transferring accounts is prohibited",
          "Impersonating another person, business, or official entity is strictly prohibited",
          "Users are responsible for all activity conducted through their account",
          "Accounts showing signs of automated or bot-like behaviour may be suspended without notice",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="Platform Security">
        <p>Any attempt to compromise platform integrity is strictly prohibited — including unauthorized access, scraping, bot activity, API abuse, spam automation, and phishing. NewMarket.co.in reserves the right to cooperate with cybersecurity investigators and law enforcement.</p>
      </Section>

      <Section title="Moderation Rights">
        <p>NewMarket.co.in maintains full discretionary moderation authority. Administrators may remove content, restrict visibility, suspend or terminate accounts, and block IP addresses. Moderation actions may occur without prior notice. Users do not possess an automatic right to publication, visibility, or reinstatement.</p>
      </Section>

      <Section title="Content Submission Agreement">
        <p>When submitting any content, you confirm that:</p>
        <ul>{[
          "The information is accurate to the best of your knowledge",
          "You own the content or have permission to publish it",
          "The submission does not violate any law or third-party right",
          "Submission does NOT guarantee publication",
          "NewMarket.co.in may review, edit, reject, remove, or permanently delete submitted content without prior notice",
          "You remain solely responsible for the accuracy and legality of what you submit",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="Disclaimer of Liability">
        <p>User-generated content reflects the views of individual users and not NewMarket.co.in. While moderation measures are in place, NewMarket.co.in does not guarantee the accuracy, legality, or reliability of user-submitted content.</p>
      </Section>

      <Section title="Legal Compliance">
        <p>Users must comply with all applicable laws and regulations of India. Illegal activities may be reported to relevant authorities. NewMarket.co.in reserves the right to cooperate fully with lawful investigations and legal requests.</p>
      </Section>

      <div className="rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground">
        <strong className="block mb-1 text-foreground">Final Statement</strong>
        NewMarket.co.in is intended to operate as a trusted and professionally moderated public platform for the community of Bhopal. Platform safety, credibility, and legal compliance take priority over unrestricted publishing access.
      </div>

      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Related policies</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

function HindiContent() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-5 py-4">
        <h2 className="!mt-0 text-amber-900 dark:text-amber-300 font-bold">महत्वपूर्ण सूचना</h2>
        <p className="text-amber-800 dark:text-amber-400 text-sm">
          NewMarket.co.in एक सार्वजनिक रूप से सुलभ डिजिटल मंच है। इस मंच का उपयोग करने, कोई भी सामग्री प्रस्तुत करने
          या किसी भी सेवा का लाभ उठाने पर आप इन सभी नियमों, प्रशासनिक निर्णयों तथा भारत के लागू कानूनों का पूर्ण रूप
          से पालन करने के लिए सहमत होते हैं। उल्लंघन की स्थिति में सामग्री हटाना, स्थायी खाता निलंबन, IP प्रतिबंध,
          संबंधित अधिकारियों को सूचना एवं आवश्यकतानुसार कानूनी कार्रवाई की जा सकती है।
        </p>
      </div>

      <Section title="ज़ीरो टॉलरेंस नीति">
        <p>निम्नलिखित सामग्री पूर्णतः प्रतिबंधित है तथा बिना किसी पूर्व सूचना के तत्काल स्थायी हटाने का कारण बन सकती है:</p>
        <ul>{[
          "जाति, धर्म, लिंग, राष्ट्रीयता, नस्ल या विकलांगता के आधार पर घृणा फैलाने या भड़काने वाली सामग्री",
          "अश्लील, पोर्नोग्राफिक या किसी भी प्रकार की यौन सामग्री",
          "किसी व्यक्ति या समूह को धमकाना, डराना या उत्पीड़न करना",
          "हिंसा, सांप्रदायिक अशांति या सार्वजनिक अव्यवस्था भड़काने वाली सामग्री",
          "बच्चों को किसी भी प्रकार से नुकसान पहुँचाने वाली सामग्री",
          "आतंकवाद, उग्रवाद या अवैध गतिविधियों को बढ़ावा देने वाली सामग्री",
          "बिना सहमति के किसी की व्यक्तिगत जानकारी प्रकाशित करना (Doxxing)",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="सामग्री नियम">
        <p>मंच पर प्रस्तुत की जाने वाली सभी सामग्री निम्नलिखित मानकों के अनुरूप होनी चाहिए:</p>
        <ul>{[
          "जानकारी आपकी सर्वोत्तम जानकारी के अनुसार सटीक और सत्यापन योग्य हो",
          "सामग्री मौलिक हो या अधिकार-धारक की अनुमति से उचित रूप से श्रेयांकित हो",
          "सामग्री न्यू मार्केट, भोपाल या उसकी समुदाय से संबंधित हो",
          "निर्धारित लिस्टिंग अनुभागों के बाहर कोई अनचाहा विज्ञापन या स्पैम न हो",
          "एक ही सामग्री को अनेक अनुभागों में दोहराकर प्रस्तुत न किया जाए",
          "भाषा सम्मानजनक और व्यावसायिक हो",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="खाता एवं उपयोगकर्ता आचरण">
        <ul>{[
          "प्रत्येक व्यक्ति केवल एक खाता बना सकता है",
          "खाते को किसी अन्य व्यक्ति के साथ साझा करना या स्थानांतरित करना प्रतिबंधित है",
          "किसी अन्य व्यक्ति, व्यवसाय या आधिकारिक संस्था की पहचान का अनुकरण करना सख्त मना है",
          "अपने खाते के माध्यम से की गई सभी गतिविधियों के लिए उपयोगकर्ता स्वयं उत्तरदायी है",
          "स्वचालित या बॉट जैसे व्यवहार के संकेत दिखाने वाले खातों को बिना सूचना के निलंबित किया जा सकता है",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="मंच सुरक्षा">
        <p>मंच की अखंडता से समझौता करने का कोई भी प्रयास पूर्णतः प्रतिबंधित है — जिसमें अनाधिकृत पहुँच, डेटा स्क्रैपिंग, बॉट गतिविधि, API दुरुपयोग, स्पैम स्वचालन और फ़िशिंग शामिल हैं। NewMarket.co.in साइबर सुरक्षा जाँचकर्ताओं और कानून प्रवर्तन एजेंसियों के साथ सहयोग करने का अधिकार सुरक्षित रखता है।</p>
      </Section>

      <Section title="प्रशासनिक अधिकार">
        <p>NewMarket.co.in के पास पूर्ण विवेकाधिकार से प्रशासन करने का अधिकार है। प्रशासक सामग्री हटा सकते हैं, दृश्यता प्रतिबंधित कर सकते हैं, खातों को निलंबित या समाप्त कर सकते हैं तथा IP पते ब्लॉक कर सकते हैं। ये कार्रवाइयाँ बिना पूर्व सूचना के हो सकती हैं। उपयोगकर्ताओं को प्रकाशन, दृश्यता या पुनर्स्थापना का स्वतः अधिकार प्राप्त नहीं है।</p>
      </Section>

      <Section title="सामग्री प्रस्तुति सहमति">
        <p>कोई भी सामग्री प्रस्तुत करते समय आप पुष्टि करते हैं कि:</p>
        <ul>{[
          "जानकारी आपकी सर्वोत्तम जानकारी के अनुसार सटीक है",
          "आप सामग्री के स्वामी हैं या उसे प्रकाशित करने की अनुमति आपके पास है",
          "प्रस्तुति किसी कानून या तृतीय पक्ष के अधिकार का उल्लंघन नहीं करती",
          "प्रस्तुति प्रकाशन की गारंटी नहीं है",
          "NewMarket.co.in बिना पूर्व सूचना के प्रस्तुत सामग्री की समीक्षा, संपादन, अस्वीकृति, हटाने या स्थायी विलोपन का अधिकार रखता है",
          "आप अपनी प्रस्तुति की सटीकता और वैधता के लिए स्वयं उत्तरदायी हैं",
        ].map(i => <li key={i}>{i}</li>)}</ul>
      </Section>

      <Section title="दायित्व का अस्वीकरण">
        <p>उपयोगकर्ता द्वारा उत्पन्न सामग्री संबंधित उपयोगकर्ता के विचारों को दर्शाती है, NewMarket.co.in के नहीं। प्रशासन उपाय लागू होने के बावजूद, NewMarket.co.in उपयोगकर्ता द्वारा प्रस्तुत सामग्री की सटीकता, वैधता या विश्वसनीयता की गारंटी नहीं देता।</p>
      </Section>

      <Section title="कानूनी अनुपालन">
        <p>उपयोगकर्ताओं को भारत के सभी लागू कानूनों और विनियमों का पालन करना अनिवार्य है। अवैध गतिविधियों की सूचना संबंधित अधिकारियों को दी जा सकती है। NewMarket.co.in सभी वैध जाँचों और कानूनी अनुरोधों में पूर्ण सहयोग करने का अधिकार सुरक्षित रखता है।</p>
      </Section>

      <div className="rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground">
        <strong className="block mb-1 text-foreground">अंतिम वक्तव्य</strong>
        NewMarket.co.in का उद्देश्य भोपाल की समुदाय के लिए एक विश्वसनीय और व्यावसायिक रूप से प्रशासित सार्वजनिक मंच के रूप में संचालित होना है। मंच की सुरक्षा, विश्वसनीयता और कानूनी अनुपालन, अप्रतिबंधित प्रकाशन पहुँच से अधिक प्राथमिकता रखते हैं।
      </div>

      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">संबंधित नीतियाँ</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export function GuidelinesContent() {
  const { lang } = useLanguage()
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {lang === "hi" ? "होम पर वापस" : "Back to Home"}
      </Link>
      <div className="mb-8 flex items-start gap-3">
        <ShieldCheck size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Community Guidelines &amp; Platform Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi" ? "प्रभावी तिथि: मई 2026 · NewMarket.co.in" : "Effective Date: May 2026 · NewMarket.co.in"}
          </p>
        </div>
      </div>
      {lang === "hi" ? <HindiContent /> : <EnglishContent />}
    </div>
  )
}
