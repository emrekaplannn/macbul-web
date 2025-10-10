import HealthCheck from "@/components/health-check";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">MaçBul</h1>
      <p>Web altyapısı hazır. Aşağıda sağlık kontrolü var.</p>
      <HealthCheck />
    </main>
  );
}
