import { getSetting } from '@/lib/settings';

export default async function CompanyIntro() {
  // Fetch content from database
  const title = await getSetting('section_company_title') || 'Company introduction';
  const text1 = await getSetting('section_company_text1') || '';
  const text2 = await getSetting('section_company_text2') || '';

  return (
    <section className="text-foreground py-16 px-6 bg-[#11224a]">
      <div className="max-w-5xl mx-auto text-center">

        <h2 className="text-3xl font-bold mb-8 bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          {title}
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          {text1}
        </p>

        <p className="text-gray-300 text-lg leading-relaxed">
          {text2}
        </p>

      </div>
    </section>
  );
}



