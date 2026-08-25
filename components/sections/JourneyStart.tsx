import { getSetting } from '@/lib/settings';

export default async function JourneyStart() {
  // Fetch content from database
  const title = await getSetting('section_journey_title') || 'Start your journey of digital currency';
  const card1Title = await getSetting('section_journey_card1_title') || '';
  const card1Text = await getSetting('section_journey_card1_text') || '';
  const card2Title = await getSetting('section_journey_card2_title') || '';
  const card2Text = await getSetting('section_journey_card2_text') || '';
  const card3Title = await getSetting('section_journey_card3_title') || '';
  const card3Text = await getSetting('section_journey_card3_text') || '';

  const features = [
    {
      icon: "/journey1.png",
      title: card1Title,
      desc: card1Text
    },
    {
      icon: "/journey2.png",
      title: card2Title,
      desc: card2Text
    },
    {
      icon: "/journey3.png",
      title: card3Title,
      desc: card3Text
    }
  ];

  return (
    <section className="text-foreground py-20 px-6 bg-[#11224a]">
      <h2 className="text-center text-3xl font-bold mb-12 text-white">
        {title}
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-[#1a2f5a] border border-blue-500/20 p-10 rounded-2xl text-center shadow-lg hover:scale-[1.03] hover:border-blue-400/40 transition"
          >
            <img src={f.icon} className="w-20 mx-auto mb-6 opacity-80" />

            <h3 className="text-xl font-semibold mb-4 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {f.title}
            </h3>

            <p className="text-gray-300 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}



