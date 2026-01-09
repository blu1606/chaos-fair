import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KPICards from '@/components/dashboard/KPICards';
import UsageChart from '@/components/dashboard/UsageChart';
import RecentRequests from '@/components/dashboard/RecentRequests';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-16'
        }`}
      >
        <DashboardHeader 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">Alex</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your API activity snapshot
            </p>
          </div>

          {/* KPI Cards */}
          <KPICards />

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* Usage Chart - Takes 2 columns */}
            <div className="xl:col-span-2">
              <UsageChart />
            </div>

            {/* Recent Requests - Takes 1 column */}
            <div className="xl:col-span-1">
              <RecentRequests compact />
            </div>
          </div>

          {/* Full Recent Requests Table */}
          <div className="mt-6">
            <RecentRequests />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
