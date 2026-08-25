import { getSetting } from '@/lib/settings';

export default async function LeadingPlatform() {
  // Fetch content from database
  const title = await getSetting('section_leading_title') || "THE WORLD'S LEADING DIGITAL ASSET TRADING PLATFORM";
  const subtitle = await getSetting('section_leading_subtitle') || '';
  
  const card1Title = await getSetting('section_leading_card1_title') || '';
  const card1Text1 = await getSetting('section_leading_card1_text1') || '';
  const card1Text2 = await getSetting('section_leading_card1_text2') || '';
  
  const card2Title = await getSetting('section_leading_card2_title') || '';
  const card2Text1 = await getSetting('section_leading_card2_text1') || '';
  const card2Text2 = await getSetting('section_leading_card2_text2') || '';
  
  const card3Title = await getSetting('section_leading_card3_title') || '';
  const card3Text1 = await getSetting('section_leading_card3_text1') || '';
  const card3Text2 = await getSetting('section_leading_card3_text2') || '';

  const advantages = [
    {
      icon: "/leading1.png",
      title: card1Title,
      desc1: card1Text1,
      desc2: card1Text2
    },
    {
      icon: "/leading2.png",
      title: card2Title,
      desc1: card2Text1,
      desc2: card2Text2
    },
    {
      icon: "/leading3.png",
      title: card3Title,
      desc1: card3Text1,
      desc2: card3Text2
    }
  ];

  return (
    <section className="text-foreground py-24 px-6 bg-[#11224a]">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          {title}
        </h2>

        <p className="text-gray-300 text-lg">
          {subtitle}
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {advantages.map((a, i) => (
          <div
            key={i}
            className="text-center bg-[#1a2f5a] border border-blue-500/20 p-10 rounded-2xl shadow-lg hover:scale-[1.03] hover:border-blue-400/40 transition"
          >
            <img src={a.icon} className="w-20 mx-auto mb-6 opacity-80" />

            <h3 className="text-xl font-semibold mb-3 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {a.title}
            </h3>

            <p className="text-gray-300 text-sm mb-2">{a.desc1}</p>
            <p className="text-gray-300 text-sm">{a.desc2}</p>
          </div>
        ))}
      </div>
    </section>
  );
}



