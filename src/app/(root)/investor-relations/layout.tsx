import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InvestorRelationsSidebar } from '@/components/InvestorRelationsSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-screen">
        <InvestorRelationsSidebar />
        <main className="md:flex md:w-full md:h-screen">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
