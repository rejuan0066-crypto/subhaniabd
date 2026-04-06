import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarSections, SidebarSection, DEFAULT_SIDEBAR_SECTIONS } from '@/hooks/useSidebarSections';
import { useMenuSettings } from '@/hooks/useMenuSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Save, RotateCcw, ArrowUp, ArrowDown, FolderOpen } from 'lucide-react';

const SidebarSectionEditor = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';
  const { sections, saveSections } = useSidebarSections();
  const { menuConfig } = useMenuSettings();
  const [draft, setDraft] = useState<SidebarSection[]>(sections);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sync draft when sections load
  useState(() => { setDraft(sections); });

  // All available menu paths from sidebar config
  const allMenuPaths = menuConfig.sidebar
    .filter(m => m.visible && !m.tab_of)
    .map(m => ({ path: m.path, label: bn ? m.label_bn : m.label_en }));

  // Paths already assigned to any section
  const assignedPaths = new Set(draft.flatMap(s => s.menuPaths));

  const addSection = () => {
    const newSection: SidebarSection = {
      id: `section_${Date.now()}`,
      labelBn: 'নতুন সেকশন',
      labelEn: 'New Section',
      color: '',
      bgColor: '',
      sort_order: draft.length,
      menuPaths: [],
    };
    setDraft([...draft, newSection]);
    setExpanded(newSection.id);
  };

  const removeSection = (id: string) => {
    setDraft(draft.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<SidebarSection>) => {
    setDraft(draft.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newDraft = [...draft];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newDraft.length) return;
    [newDraft[index], newDraft[target]] = [newDraft[target], newDraft[index]];
    setDraft(newDraft);
  };

  const addPathToSection = (sectionId: string, path: string) => {
    // Remove from other sections first
    const updated = draft.map(s => ({
      ...s,
      menuPaths: s.id === sectionId
        ? [...s.menuPaths, path]
        : s.menuPaths.filter(p => p !== path),
    }));
    setDraft(updated);
  };

  const removePathFromSection = (sectionId: string, path: string) => {
    updateSection(sectionId, {
      menuPaths: draft.find(s => s.id === sectionId)?.menuPaths.filter(p => p !== path) || [],
    });
  };

  const moveMenuInSection = (sectionId: string, pathIndex: number, direction: 'up' | 'down') => {
    const section = draft.find(s => s.id === sectionId);
    if (!section) return;
    const paths = [...section.menuPaths];
    const target = direction === 'up' ? pathIndex - 1 : pathIndex + 1;
    if (target < 0 || target >= paths.length) return;
    [paths[pathIndex], paths[target]] = [paths[target], paths[pathIndex]];
    updateSection(sectionId, { menuPaths: paths });
  };

  const handleSave = () => {
    saveSections.mutate(draft, {
      onSuccess: () => toast.success(bn ? 'সাইডবার সেকশন সেভ হয়েছে!' : 'Sidebar sections saved!'),
      onError: () => toast.error(bn ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save'),
    });
  };

  const handleReset = () => {
    setDraft(DEFAULT_SIDEBAR_SECTIONS);
    toast.info(bn ? 'ডিফল্টে রিসেট হয়েছে' : 'Reset to defaults');
  };

  const getMenuLabel = (path: string) => {
    const item = allMenuPaths.find(m => m.path === path);
    return item?.label || path;
  };

  // Unassigned menus
  const unassignedMenus = allMenuPaths.filter(m => !assignedPaths.has(m.path));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            {bn ? 'সাইডবার সেকশন এডিটর' : 'Sidebar Section Editor'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              {bn ? 'রিসেট' : 'Reset'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveSections.isPending}>
              <Save className="w-3.5 h-3.5 mr-1" />
              {saveSections.isPending ? (bn ? 'সেভ হচ্ছে...' : 'Saving...') : (bn ? 'সেভ' : 'Save')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.map((section, sIdx) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            {/* Section header */}
            <div
              className="flex items-center gap-2 px-3 py-2 bg-muted/50 cursor-pointer"
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              style={section.bgColor ? { backgroundColor: section.bgColor + '20' } : {}}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <div
                className="w-3 h-3 rounded-full border shrink-0"
                style={{ backgroundColor: section.color || 'hsl(var(--muted-foreground))' }}
              />
              <span className="text-sm font-medium flex-1" style={section.color ? { color: section.color } : {}}>
                {bn ? section.labelBn : section.labelEn}
              </span>
              <span className="text-xs text-muted-foreground">{section.menuPaths.length} {bn ? 'টি মেনু' : 'menus'}</span>
              <div className="flex gap-0.5">
                <button onClick={(e) => { e.stopPropagation(); moveSection(sIdx, 'up'); }} className="p-1 rounded hover:bg-muted" disabled={sIdx === 0}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); moveSection(sIdx, 'down'); }} className="p-1 rounded hover:bg-muted" disabled={sIdx === draft.length - 1}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1 rounded hover:bg-destructive/20 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {expanded === section.id && (
              <div className="p-3 space-y-3 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">{bn ? 'বাংলা নাম' : 'Bengali Name'}</Label>
                    <Input
                      value={section.labelBn}
                      onChange={e => updateSection(section.id, { labelBn: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{bn ? 'ইংরেজি নাম' : 'English Name'}</Label>
                    <Input
                      value={section.labelEn}
                      onChange={e => updateSection(section.id, { labelEn: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">{bn ? 'লেবেল কালার' : 'Label Color'}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={section.color || '#6b7280'}
                        onChange={e => updateSection(section.id, { color: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input
                        value={section.color}
                        onChange={e => updateSection(section.id, { color: e.target.value })}
                        placeholder={bn ? 'ডিফল্ট' : 'Default'}
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{bn ? 'ব্যাকগ্রাউন্ড কালার' : 'Background Color'}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={section.bgColor || '#f3f4f6'}
                        onChange={e => updateSection(section.id, { bgColor: e.target.value })}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <Input
                        value={section.bgColor}
                        onChange={e => updateSection(section.id, { bgColor: e.target.value })}
                        placeholder={bn ? 'ডিফল্ট' : 'Default'}
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned menus */}
                <div>
                  <Label className="text-xs mb-1 block">{bn ? 'এই সেকশনের মেনু' : 'Menus in this section'}</Label>
                  <div className="space-y-1">
                    {section.menuPaths.map((path, pIdx) => (
                      <div key={path} className="flex items-center gap-2 px-2 py-1.5 rounded bg-secondary/50 text-sm">
                        <span className="flex-1">{getMenuLabel(path)}</span>
                        <div className="flex gap-0.5">
                          <button onClick={() => moveMenuInSection(section.id, pIdx, 'up')} className="p-0.5 rounded hover:bg-muted" disabled={pIdx === 0}>
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button onClick={() => moveMenuInSection(section.id, pIdx, 'down')} className="p-0.5 rounded hover:bg-muted" disabled={pIdx === section.menuPaths.length - 1}>
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button onClick={() => removePathFromSection(section.id, path)} className="p-0.5 rounded hover:bg-destructive/20 text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {section.menuPaths.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1">{bn ? 'কোনো মেনু নেই' : 'No menus assigned'}</p>
                    )}
                  </div>
                </div>

                {/* Add menu to section */}
                <div>
                  <Label className="text-xs mb-1 block">{bn ? 'মেনু যোগ করুন' : 'Add Menu'}</Label>
                  <Select onValueChange={v => addPathToSection(section.id, v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={bn ? 'মেনু নির্বাচন করুন...' : 'Select a menu...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show all menus, grouped: unassigned first, then from other sections */}
                      {unassignedMenus.length > 0 && unassignedMenus.map(m => (
                        <SelectItem key={m.path} value={m.path}>{m.label}</SelectItem>
                      ))}
                      {allMenuPaths
                        .filter(m => assignedPaths.has(m.path) && !section.menuPaths.includes(m.path))
                        .map(m => {
                          const fromSection = draft.find(s => s.menuPaths.includes(m.path));
                          return (
                            <SelectItem key={m.path} value={m.path}>
                              {m.label} ({bn ? 'থেকে: ' : 'from: '}{bn ? fromSection?.labelBn : fromSection?.labelEn})
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" size="sm" className="w-full" onClick={addSection}>
          <Plus className="w-4 h-4 mr-1" />
          {bn ? 'নতুন সেকশন যোগ করুন' : 'Add New Section'}
        </Button>

        {/* Unassigned menus info */}
        {unassignedMenus.length > 0 && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-xs font-medium text-warning">{bn ? 'অনির্ধারিত মেনু:' : 'Unassigned menus:'}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {unassignedMenus.map(m => (
                <span key={m.path} className="text-xs px-2 py-0.5 rounded bg-warning/20">{m.label}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SidebarSectionEditor;
