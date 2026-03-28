export default function Home() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-blue-500">Kapda Karobaar</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Manage your vendors, track purchases, register customers, and log sales from this unified dashboard.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Vendors" href="/vendors" description="Manage shop suppliers and their details." color="border-indigo-500/50" />
        <DashboardCard title="Purchases" href="/purchases" description="Log new inventory stock." color="border-blue-500/50" />
        <DashboardCard title="Customers" href="/customers" description="Register new clients." color="border-purple-500/50" />
        <DashboardCard title="Sales" href="/sales" description="Record dress sales & profits." color="border-emerald-500/50" />
      </div>
    </div>
  );
}

function DashboardCard({ title, href, description, color }: { title: string, href: string, description: string, color: string }) {
  return (
    <a href={href} className={`block p-6 rounded-2xl glass border-t-2 ${color} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group`}>
      <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{title} <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span></h2>
      <p className="text-slate-400 text-sm">{description}</p>
    </a>
  );
}
