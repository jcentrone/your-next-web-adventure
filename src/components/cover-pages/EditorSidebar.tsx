import {
    Image as ImageIcon,
    List,
    Palette,
    Settings,
    Shapes,
    Square,
    Table as TableIcon,
    Type as TypeIcon
} from "lucide-react";
import {SidebarCard} from "./editor-sidebar/SidebarCard.tsx";
import {SettingsSection} from "./editor-sidebar/SettingsSection.tsx";
import {TextSection} from "./editor-sidebar/TextSection.tsx";
import {ImagesSection} from "./editor-sidebar/ImagesSection.tsx";
import {GraphicsSection} from "./editor-sidebar/GraphicsSection.tsx";
import {TablesSection} from "./editor-sidebar/TablesSection.tsx";
import {DesignSection} from "./editor-sidebar/DesignSection.tsx";
import {BackgroundSection} from "./editor-sidebar/BackgroundSection.tsx";
import {FormFieldsSection} from "./editor-sidebar/FormFieldsSection.tsx";
import {ShortcutsFooter} from "./editor-sidebar/ShortcutsFooter.tsx";
import type {ColorPalette} from "@/constants/colorPalettes";

type ImageLibItem = { path: string; url: string; name: string };

export interface EditorSidebarProps {
    activePanel: string | null;
    setActivePanel: (panel: string | null) => void;

    // SETTINGS
    onSettingsSubmit: React.FormEventHandler<HTMLFormElement>;
    register: any;
    reportTypes: string[];
    reportTypeOptions: { value: string; label: string }[];
    toggleReportType: (rt: string) => void;

    // TEXT
    addText: () => void;

    // IMAGES
    images: ImageLibItem[];
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteImage: (path: string) => void;
    onAddImageFromUrl: (url: string) => void;

    // GRAPHICS
    addRect: () => void;
    addCircle: () => void;
    addStar: () => void;
    addTriangle: () => void;
    addPolygonShape: () => void;
    addArrow: () => void;
    addBidirectionalArrow: () => void;
    addIcon: (name: string) => void;
    addClipart: (hex: string) => void;

    // TABLES
    addTable?: (rows: number, cols: number, borderColor: string) => void;

    // DESIGN
    templateOptions: string[];
    palette: ColorPalette;
    onApplyPalette: (p: ColorPalette) => void;

    // BACKGROUND
    bgColor: string;
    presetBgColors: string[];
    updateBgColor: (color: string) => void;

    // FORM FIELDS
    onAddPlaceholder: (token: string) => void;

    // SHORTCUTS
    onShowShortcuts?: () => void;
}

export function EditorSidebar(props: EditorSidebarProps) {
    const {
        activePanel, setActivePanel,
        onSettingsSubmit, register, reportTypes, reportTypeOptions, toggleReportType,
        addText,
        images, onImageUpload, onDeleteImage, onAddImageFromUrl,
        addRect, addCircle, addStar, addTriangle, addPolygonShape, addArrow, addBidirectionalArrow, addIcon, addClipart,
        addTable,
        templateOptions, palette, onApplyPalette,
        bgColor, presetBgColors, updateBgColor,
        onAddPlaceholder,
        onShowShortcuts,
    } = props;

    return (
        <div
            className="w-[14rem] h-full p-2 border-r space-y-2 overflow-y-auto overflow-x-visible relative pb-16 bg-[#FFFFFF]"
        >

            <div className="space-y-2">
                <SidebarCard
                    sectionKey="settings"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<Settings className="h-4 w-4"/>}
                    title="Settings"

                >
                    <SettingsSection
                        onSettingsSubmit={onSettingsSubmit}
                        register={register}
                        reportTypes={reportTypes}
                        reportTypeOptions={reportTypeOptions}
                        toggleReportType={toggleReportType}
                    />
                </SidebarCard>

                <SidebarCard
                    sectionKey="text"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<TypeIcon className="h-4 w-4"/>}
                    title="Text"
                >
                    <TextSection addText={addText}/>
                </SidebarCard>

                <SidebarCard
                    sectionKey="images"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<ImageIcon className="h-4 w-4"/>}
                    title="Images"
                >
                    <ImagesSection
                        images={images}
                        onImageUpload={onImageUpload}
                        onDeleteImage={onDeleteImage}
                        onAddImageFromUrl={onAddImageFromUrl}
                    />
                </SidebarCard>

                <SidebarCard
                    sectionKey="graphics"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<Shapes className="h-4 w-4"/>}
                    title="Graphics"
                >
                    <GraphicsSection
                        addRect={addRect}
                        addCircle={addCircle}
                        addStar={addStar}
                        addTriangle={addTriangle}
                        addPolygonShape={addPolygonShape}
                        addArrow={addArrow}
                        addBidirectionalArrow={addBidirectionalArrow}
                        addIcon={addIcon}
                        addClipart={addClipart}
                    />
                </SidebarCard>

                <SidebarCard
                    sectionKey="tables"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<TableIcon className="h-4 w-4"/>}
                    title="Tables"
                >
                    <TablesSection addTable={addTable}/>
                </SidebarCard>

                <SidebarCard
                    sectionKey="design"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<Palette className="h-4 w-4"/>}
                    title="Design Palette"
                >
                    <DesignSection
                        templateOptions={templateOptions}
                        register={register}
                        palette={palette}
                        onApplyPalette={onApplyPalette}
                    />
                </SidebarCard>

                <SidebarCard
                    sectionKey="background"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<Square className="h-4 w-4"/>}
                    title="Background"
                >
                    <BackgroundSection
                        bgColor={bgColor}
                        presetBgColors={presetBgColors}
                        updateBgColor={updateBgColor}
                    />
                </SidebarCard>

                <SidebarCard
                    sectionKey="formFields"
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    icon={<List className="h-4 w-4"/>}
                    title="Form Fields"
                >
                    <FormFieldsSection onAddPlaceholder={onAddPlaceholder}/>
                </SidebarCard>
            </div>

            {/* Footer link pinned to bottom */}
            <ShortcutsFooter onShowShortcuts={onShowShortcuts}/>
        </div>
    );
}
