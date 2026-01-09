import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { APIKeysTable } from "@/components/dashboard/APIKeysTable";
import { CreateKeyModal } from "@/components/dashboard/CreateKeyModal";
import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";

const APIKeys = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-16'}`}>
        <DashboardHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                API Keys
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage API keys for your applications
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Key
            </Button>
          </div>

          {/* Keys Table */}
          <APIKeysTable />

          {/* Create Key Modal */}
          <CreateKeyModal 
            open={isCreateModalOpen} 
            onOpenChange={setIsCreateModalOpen} 
          />
        </main>
      </div>
    </div>
  );
};

export default APIKeys;
