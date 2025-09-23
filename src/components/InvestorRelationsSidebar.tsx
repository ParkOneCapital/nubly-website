'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileChartColumnIncreasing,
  FileText,
  Presentation,
  Scale,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const items = [
  {
    title: 'Pitch Deck',
    url: '/investor-relations/pitch-deck',
    icon: Presentation,
  },
  {
    title: 'Business Model',
    url: '/investor-relations/business-model',
    icon: FileChartColumnIncreasing,
  },
];

const legalItems = [
  {
    title: 'Terms of Service',
    url: '/investor-relations/legal/terms-of-service',
    icon: FileText,
  },
  {
    title: 'Privacy Policy',
    url: '/investor-relations/legal/privacy-policy',
    icon: FileText,
  },
];

export function InvestorRelationsSidebar() {
  const pathname = usePathname();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Investor Relations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Render main items */}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Collapsible Legal Section */}
              <SidebarMenuItem>
                <Collapsible
                  open={isLegalOpen}
                  onOpenChange={setIsLegalOpen}
                  className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <Scale className="h-4 w-4" />
                      <span>Legal</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${
                          isLegalOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 pt-1">
                    <SidebarMenuSub>
                      {legalItems.map((item) => (
                        <SidebarMenuSubItem key={item.title} className="mb-1">
                          <SidebarMenuSubButton
                            asChild
                            className="h-8 justify-start"
                            data-active={pathname === item.url}>
                            <Link href={item.url}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
