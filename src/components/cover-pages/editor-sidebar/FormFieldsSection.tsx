import {Button} from "@/components/ui/button.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {
    contactFields,
    inspectorFields,
    organizationFields,
    reportFields,
    IMAGE_FIELD_TOKENS,
} from "@/constants/coverPageFields.ts";

const IMAGE_FIELD_TOKENS = ["{{organizational_logo}}", "{{cover_image}}"];

export function FormFieldsSection({
                                      onAddPlaceholder,
                                      onAddImagePlaceholder,
                                  }: {
    onAddPlaceholder: (label: string, token: string) => void;
    onAddImagePlaceholder: (token: string) => void;
}) {
    return (
        <Accordion type="single" collapsible defaultValue="organization" className="w-full">
            <AccordionItem value="organization">
                <AccordionTrigger>Organization Details</AccordionTrigger>
                <AccordionContent className="data-[state=open]:animate-none data-[state=open]:h-auto">
                    <div className="flex flex-col space-y-2">
                        {organizationFields.map((field) => {
                            const isImage = IMAGE_FIELD_TOKENS.includes(field.token);
                            return (
                                <Button
                                    key={field.token}
                                    variant="outline"
                                    className="w-full justify-start"
                                    draggable
                                    onDragStart={(e) => {
                                        const payload = JSON.stringify({
                                            type: isImage ? "image-field" : "merge-field",
                                            data: isImage
                                                ? { token: field.token }
                                                : { label: field.label, token: field.token },
                                        });
                                        e.dataTransfer?.setData("application/x-cover-element", payload);
                                        e.dataTransfer!.effectAllowed = "copy";
                                    }}
                                    onClick={() =>
                                        isImage
                                            ? onAddImagePlaceholder(field.token)
                                            : onAddPlaceholder(field.label, field.token)
                                    }
                                >
                                    {field.label}
                                </Button>
                            );
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="inspector">
                <AccordionTrigger>Inspector Details</AccordionTrigger>
                <AccordionContent className="data-[state=open]:animate-none data-[state=open]:h-auto">
                    <div className="flex flex-col space-y-2">
                        {inspectorFields.map((field) => (
                            <Button
                                key={field.token}
                                variant="outline"
                                className="w-full justify-start"
                                draggable
                                onDragStart={(e) => {
                                    const payload = JSON.stringify({ type: "merge-field", data: { label: field.label, token: field.token } });
                                    e.dataTransfer?.setData("application/x-cover-element", payload);
                                    e.dataTransfer!.effectAllowed = "copy";
                                }}
                                onClick={() => onAddPlaceholder(field.label, field.token)}
                            >
                                {field.label}
                            </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact">
                <AccordionTrigger>Contact Details</AccordionTrigger>
                <AccordionContent className="data-[state=open]:animate-none data-[state=open]:h-auto">
                    <div className="flex flex-col space-y-2">
                        {contactFields.map((field) => (
                            <Button
                                key={field.token}
                                variant="outline"
                                className="w-full justify-start"
                                draggable
                                onDragStart={(e) => {
                                    const payload = JSON.stringify({ type: "merge-field", data: { label: field.label, token: field.token } });
                                    e.dataTransfer?.setData("application/x-cover-element", payload);
                                    e.dataTransfer!.effectAllowed = "copy";
                                }}
                                onClick={() => onAddPlaceholder(field.label, field.token)}
                            >
                                {field.label}
                            </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="report">
                <AccordionTrigger>Report Details</AccordionTrigger>
                <AccordionContent className="data-[state=open]:animate-none data-[state=open]:h-auto">
                    <div className="flex flex-col space-y-2">
                        {reportFields.map((field) => {
                            const isImage = IMAGE_FIELD_TOKENS.includes(field.token);
                            return (
                                <Button
                                    key={field.token}
                                    variant="outline"
                                    className="w-full justify-start"
                                    draggable
                                    onDragStart={(e) => {
                                        const payload = JSON.stringify({
                                            type: isImage ? "image-field" : "merge-field",
                                            data: isImage
                                                ? { token: field.token }
                                                : { label: field.label, token: field.token },
                                        });
                                        e.dataTransfer?.setData("application/x-cover-element", payload);
                                        e.dataTransfer!.effectAllowed = "copy";
                                    }}
                                    onClick={() =>
                                        isImage
                                            ? onAddImagePlaceholder(field.token)
                                            : onAddPlaceholder(field.label, field.token)
                                    }
                                >
                                    {field.label}
                                </Button>
                            );
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
