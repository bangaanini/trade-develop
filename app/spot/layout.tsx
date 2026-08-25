export default function SpotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background text-foreground min-h-screen">
      {children}
    </section>
  );
}
