'use client';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronsUpDown,
  LogOut,
  Repeat,
  Smartphone,
  Clock3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AiwasLogo, UniversityLogo } from './brand';
import { ThemeToggle } from './theme-toggle';
import { navigate } from '../_lib/router';
import { useDemo } from '../_lib/store';
import { personas, type Persona } from '../_data/personas';
import { DEMO_DATE_LABEL } from '../_data/um';

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};
export type NavGroup = { label: string; items: NavItem[] };

export const initials = (name: string) =>
  name
    .replace(/^(Prof\.|Dr\.|Supt\.|\(PB\)|Pn\.|Kpl\.|Mr\.)\s*/g, '')
    .replace(/^(Prof\.|Dr\.|Supt\.|\(PB\)|Pn\.|Kpl\.|Mr\.)\s*/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export function WorkspaceShell({
  org,
  base,
  groups,
  active,
  title,
  persona,
  children,
}: {
  org: { id: string; acronym: string; name: string; sub: string };
  base: string;
  groups: NavGroup[];
  active: string;
  title: string;
  persona: Persona;
  children: React.ReactNode;
}) {
  const { dispatch, now } = useDemo();
  const switchTo = (p: Persona) => {
    dispatch({ type: 'persona', persona: p.id });
    navigate(p.landing);
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="gap-3 p-3">
            <div className="flex items-center gap-2 px-1 pt-1 group-data-[collapsible=icon]:hidden">
              <AiwasLogo className="h-4 text-white" />
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/80 uppercase">
                EzVision
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/70 p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
              <UniversityLogo
                id={org.id}
                acronym={org.acronym}
                className="size-8"
              />
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="truncate text-sm font-semibold text-white">
                  {org.name}
                </div>
                <div className="truncate text-xs text-sidebar-foreground/70">
                  {org.sub}
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {groups.map((g) => (
              <SidebarGroup key={g.label}>
                <SidebarGroupLabel className="text-sidebar-foreground/50">
                  {g.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={item.id === active}
                          tooltip={item.label}
                          onClick={() => navigate(`${base}/${item.id}`)}
                          className="data-active:bg-sidebar-accent data-active:font-medium data-active:text-white data-active:shadow-[inset_2px_0_0_var(--sidebar-primary)]"
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge ? (
                          <SidebarMenuBadge className="bg-sidebar-primary/20 text-sidebar-primary">
                            {item.badge}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="data-popup-open:bg-sidebar-accent"
                      />
                    }
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                        {initials(persona.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-white">
                        {persona.name}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/70">
                        {persona.title}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="w-72"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
                      {personas.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => switchTo(p)}
                        >
                          {p.workspace === 'app' ? <Smartphone /> : <Repeat />}
                          <span className="min-w-0 flex-1 truncate">
                            {p.title}
                            <span className="text-muted-foreground">
                              {' '}
                              ·{' '}
                              {p.workspace === 'kpt'
                                ? 'KPT'
                                : p.workspace === 'app'
                                  ? 'App'
                                  : 'UM'}
                            </span>
                          </span>
                          {p.id === persona.id && (
                            <span className="text-xs text-primary">●</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        dispatch({ type: 'persona', persona: null });
                        navigate('/');
                      }}
                    >
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{title}</div>
              <div className="hidden truncate text-xs text-muted-foreground sm:block">
                {org.name} · {persona.title}
              </div>
            </div>
            <div className="hidden items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground md:flex">
              <Clock3 className="size-3.5" />
              <span className="tabular">
                {DEMO_DATE_LABEL} · {now}
              </span>
            </div>
            <span className="hidden rounded-md bg-warning-soft px-2 py-1 text-[11px] font-medium text-warning lg:inline">
              Demo data
            </span>
            <ThemeToggle />
          </header>
          <div className="mx-auto w-full max-w-[1500px] flex-1 p-3 sm:p-5 lg:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
