"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
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
        By accessing or using NewMarket.co.in, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please stop using the platform immediately.
      </div>
      <Section title="1. About the Platform">
        <p>NewMarket.co.in is a community-driven digital platform serving the New Market area of Bhopal, Madhya Pradesh, India. It provides local news, job listings, shop directories, property listings, and election information.</p>
        <p>The platform is operated independently and is not affiliated with any government body, municipal corporation, or official trade association.</p>
      </Section>
      <Section title="2. User Accounts">
        <p>You may create a free account to submit content and participate in community features. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p>You must not create accounts for others without permission, use another person's account, or create multiple accounts for the same person. We reserve the right to suspend or terminate accounts that violate these terms.</p>
      </Section>
      <Section title="3. Content Submission">
        <p>When you submit content, you grant NewMarket.co.in a non-exclusive, royalty-free, worldwide licence to use, display, distribute, modify, and promote that content on the platform.</p>
        <p>You represent that you own or have the necessary rights to the content you submit and that it does not infringe any third-party intellectual property rights. All submissions are subject to review. Submission does not guarantee publication.</p>
      </Section>
      <Section title="4. Editorial Rights">
        <p>NewMarket.co.in and its editorial team reserve the right to:</p>
        <ul>
          <li>Review, edit, reformat, shorten, or correct any submitted content before or after publication</li>
          <li>Reject any content without providing a reason</li>
          <li>Remove or unpublish content at any time</li>
          <li>Add or change labels, categories, and metadata</li>
          <li>Feature or promote content at our discretion</li>
        </ul>
        <p>These actions may be taken without prior notice.</p>
      </Section>
      <Section title="5. Prohibited Content & Conduct">
        <p>You agree not to submit or engage in:</p>
        <ul>
          <li>False, misleading, or fabricated information</li>
          <li>Content that harasses, threatens, or defames individuals or groups</li>
          <li>Hate speech or discrimination based on caste, religion, gender, nationality, or disability</li>
          <li>Spam, unsolicited commercial messages, or duplicate submissions</li>
          <li>Content that violates any Indian law (IT Act 2000, IPC, and applicable state laws)</li>
          <li>Copyright-infringing material without authorisation</li>
          <li>Attempts to compromise platform security or manipulate rankings/views</li>
        </ul>
      </Section>
      <Section title="6. Intellectual Property">
        <p>All original content created by NewMarket.co.in — including editorial articles, design elements, logos, and platform code — is the exclusive property of NewMarket.co.in and may not be reproduced without written permission.</p>
        <p>User-submitted content remains the property of the submitter, subject to the licence granted above.</p>
      </Section>
      <Section title="7. Disclaimer of Warranties">
        <p>NewMarket.co.in is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any content. Job listings, shop details, and property information are user-submitted — NewMarket.co.in accepts no liability for disputes arising from user-submitted listings.</p>
      </Section>
      <Section title="8. Limitation of Liability">
        <p>To the maximum extent permitted by law, NewMarket.co.in shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
      </Section>
      <Section title="9. Changes to Terms">
        <p>We may update these Terms from time to time. Continued use after changes constitutes your acceptance of the revised Terms.</p>
      </Section>
      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bhopal, Madhya Pradesh.</p>
      </Section>
      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Related policies</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

function HindiContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
        NewMarket.co.in का उपयोग करके या उस तक पहुँचकर, आप इन सेवा की शर्तों और सभी लागू कानूनों का पालन करने के लिए सहमत होते हैं। यदि आप सहमत नहीं हैं, तो कृपया तुरंत मंच का उपयोग बंद करें।
      </div>
      <Section title="1. मंच के बारे में">
        <p>NewMarket.co.in भोपाल, मध्य प्रदेश के न्यू मार्केट क्षेत्र की सेवा करने वाला एक समुदाय-आधारित डिजिटल मंच है। यह स्थानीय समाचार, रोज़गार सूचियाँ, दुकान निर्देशिका, संपत्ति लिस्टिंग और चुनाव संबंधी जानकारी प्रदान करता है।</p>
        <p>यह मंच स्वतंत्र रूप से संचालित है और किसी भी सरकारी निकाय, नगर निगम या आधिकारिक व्यापार संघ से संबद्ध नहीं है।</p>
      </Section>
      <Section title="2. उपयोगकर्ता खाते">
        <p>आप सामग्री प्रस्तुत करने और समुदाय सुविधाओं में भाग लेने के लिए निःशुल्क खाता बना सकते हैं। अपने खाते की गोपनीयता बनाए रखना आपकी जिम्मेदारी है।</p>
        <p>आप किसी अन्य व्यक्ति के लिए खाता नहीं बना सकते, किसी अन्य के खाते का उपयोग नहीं कर सकते, और एक व्यक्ति के लिए एकाधिक खाते नहीं बना सकते। नियमों का उल्लंघन करने वाले खातों को निलंबित या समाप्त करने का अधिकार हमें प्राप्त है।</p>
      </Section>
      <Section title="3. सामग्री प्रस्तुति">
        <p>सामग्री प्रस्तुत करने पर आप NewMarket.co.in को उस सामग्री को मंच पर उपयोग, प्रदर्शित, वितरित, संशोधित और प्रचारित करने का गैर-अनन्य, रॉयल्टी-मुक्त, विश्वव्यापी लाइसेंस प्रदान करते हैं।</p>
        <p>आप पुष्टि करते हैं कि आप प्रस्तुत सामग्री के स्वामी हैं या उसके लिए आवश्यक अधिकार आपके पास हैं। सभी प्रस्तुतियाँ समीक्षाधीन हैं। प्रस्तुति प्रकाशन की गारंटी नहीं है।</p>
      </Section>
      <Section title="4. संपादकीय अधिकार">
        <p>NewMarket.co.in और उसकी संपादकीय टीम को निम्नलिखित अधिकार प्राप्त हैं:</p>
        <ul>
          <li>प्रकाशन से पहले या बाद में किसी भी प्रस्तुत सामग्री की समीक्षा, संपादन, पुनर्स्वरूपण, संक्षेपण या सुधार</li>
          <li>बिना कारण बताए किसी भी सामग्री को अस्वीकार करना</li>
          <li>किसी भी समय सामग्री को हटाना या प्रकाशन वापस लेना</li>
          <li>लेबल, श्रेणियाँ और मेटाडेटा जोड़ना या बदलना</li>
          <li>अपने विवेकानुसार सामग्री को विशेष रूप से प्रस्तुत करना या प्रचारित करना</li>
        </ul>
        <p>ये कार्रवाइयाँ बिना पूर्व सूचना के की जा सकती हैं।</p>
      </Section>
      <Section title="5. प्रतिबंधित सामग्री एवं आचरण">
        <p>आप निम्नलिखित सामग्री प्रस्तुत करने या इनमें शामिल होने से सहमत नहीं हैं:</p>
        <ul>
          <li>असत्य, भ्रामक या मनगढ़ंत जानकारी</li>
          <li>किसी व्यक्ति या समूह को परेशान करने, धमकाने या मानहानि करने वाली सामग्री</li>
          <li>जाति, धर्म, लिंग, राष्ट्रीयता या विकलांगता के आधार पर घृणा फैलाने वाली सामग्री</li>
          <li>स्पैम, अनचाहे व्यावसायिक संदेश या दोहरी प्रस्तुतियाँ</li>
          <li>भारत के किसी कानून (IT अधिनियम 2000, IPC एवं लागू राज्य कानूनों) का उल्लंघन करने वाली सामग्री</li>
          <li>बिना अनुमति के कॉपीराइट सामग्री</li>
          <li>मंच सुरक्षा से समझौता करने या रैंकिंग/व्यूज़ में हेरफेर करने के प्रयास</li>
        </ul>
      </Section>
      <Section title="6. बौद्धिक संपदा">
        <p>NewMarket.co.in द्वारा निर्मित सभी मौलिक सामग्री — संपादकीय लेख, डिज़ाइन तत्व, लोगो और प्लेटफ़ॉर्म कोड — NewMarket.co.in की अनन्य संपत्ति है और लिखित अनुमति के बिना इसे पुनः प्रस्तुत नहीं किया जा सकता।</p>
        <p>उपयोगकर्ता द्वारा प्रस्तुत सामग्री ऊपर दिए गए लाइसेंस के अधीन प्रस्तुतकर्ता की संपत्ति रहती है।</p>
      </Section>
      <Section title="7. वारंटी का अस्वीकरण">
        <p>NewMarket.co.in "जैसा है" के आधार पर प्रदान किया जाता है, बिना किसी प्रकार की वारंटी के। हम किसी भी सामग्री की सटीकता, पूर्णता या समयबद्धता की गारंटी नहीं देते। रोज़गार सूचियाँ, दुकान की जानकारी और संपत्ति की जानकारी उपयोगकर्ताओं द्वारा प्रस्तुत की जाती है — NewMarket.co.in उपयोगकर्ता द्वारा प्रस्तुत लिस्टिंग से उत्पन्न विवादों के लिए कोई दायित्व नहीं लेता।</p>
      </Section>
      <Section title="8. दायित्व की सीमा">
        <p>कानून द्वारा अनुमत अधिकतम सीमा तक, NewMarket.co.in मंच के आपके उपयोग से उत्पन्न किसी भी अप्रत्यक्ष, आकस्मिक, विशेष या परिणामी नुकसान के लिए उत्तरदायी नहीं होगा।</p>
      </Section>
      <Section title="9. शर्तों में परिवर्तन">
        <p>हम समय-समय पर इन शर्तों को अद्यतन कर सकते हैं। परिवर्तनों के बाद मंच का उपयोग जारी रखने पर आप संशोधित शर्तों को स्वीकार करते हैं।</p>
      </Section>
      <Section title="10. शासी कानून">
        <p>ये शर्तें भारत के कानूनों द्वारा शासित हैं। किसी भी विवाद का निपटारा भोपाल, मध्य प्रदेश के न्यायालयों के अनन्य अधिकार क्षेत्र में किया जाएगा।</p>
      </Section>
      <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">संबंधित नीतियाँ</p>
        <div className="flex justify-center gap-4 text-sm font-medium">
          <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export function TermsContent() {
  const { lang } = useLanguage()
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {lang === "hi" ? "होम पर वापस" : "Back to Home"}
      </Link>
      <div className="mb-8 flex items-start gap-3">
        <FileText size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Terms of Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi" ? "प्रभावी तिथि: मई 2026 · NewMarket.co.in" : "Effective Date: May 2026 · NewMarket.co.in"}
          </p>
        </div>
      </div>
      {lang === "hi" ? <HindiContent /> : <EnglishContent />}
    </div>
  )
}
