import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Table as TableIcon, Plus, Minus} from "lucide-react";

export function TablesSection({
    addTable,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    toggleHeader,
}: {
    addTable?: (rows: number, cols: number, borderColor: string, headerRow: boolean) => void;
    insertRow?: () => void;
    deleteRow?: () => void;
    insertColumn?: () => void;
    deleteColumn?: () => void;
    toggleHeader?: () => void;
}) {
    const [tableRows, setTableRows] = useState(2);
    const [tableCols, setTableCols] = useState(2);
    const [tableBorderColor, setTableBorderColor] = useState("#000000");
    const [headerRow, setHeaderRow] = useState(false);

    const handleAddRow = () => {
        setTableRows((r) => r + 1);
        insertRow?.();
    };
    const handleRemoveRow = () => {
        setTableRows((r) => Math.max(1, r - 1));
        deleteRow?.();
    };
    const handleAddCol = () => {
        setTableCols((c) => c + 1);
        insertColumn?.();
    };
    const handleRemoveCol = () => {
        setTableCols((c) => Math.max(1, c - 1));
        deleteColumn?.();
    };
    const handleToggleHeader = () => {
        setHeaderRow((h) => !h);
        toggleHeader?.();
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Rows</Label>
                <div className="flex items-center space-x-1">
                    <Button size="icon" variant="outline" onClick={handleRemoveRow}>
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm">{tableRows}</span>
                    <Button size="icon" variant="outline" onClick={handleAddRow}>
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Label>Columns</Label>
                <div className="flex items-center space-x-1">
                    <Button size="icon" variant="outline" onClick={handleRemoveCol}>
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm">{tableCols}</span>
                    <Button size="icon" variant="outline" onClick={handleAddCol}>
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="table-border-color">Border Color</Label>
                <Input
                    id="table-border-color"
                    type="color"
                    value={tableBorderColor}
                    onChange={(e) => setTableBorderColor(e.target.value)}
                    className="h-8 w-16 p-1"
                />
            </div>
            <div className="flex items-center justify-between">
                <Label>Header Row</Label>
                <Button
                    variant={headerRow ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleHeader}
                >
                    {headerRow ? "On" : "Off"}
                </Button>
            </div>
            <div className="border">
                <div
                    className="grid"
                    style={{gridTemplateColumns: `repeat(${tableCols}, 1fr)`}}
                >
                    {Array.from({length: tableRows * tableCols}).map((_, i) => {
                        const r = Math.floor(i / tableCols);
                        return (
                            <div
                                key={i}
                                className={`h-4 border ${
                                    headerRow && r === 0 ? "bg-gray-200" : "bg-white"
                                }`}
                            />
                        );
                    })}
                </div>
            </div>
            <Button
                onClick={() =>
                    addTable?.(tableRows, tableCols, tableBorderColor, headerRow)
                }
                className="w-full"
            >
                <TableIcon className="mr-2 h-4 w-4" /> Add Table
            </Button>
        </div>
    );
}
