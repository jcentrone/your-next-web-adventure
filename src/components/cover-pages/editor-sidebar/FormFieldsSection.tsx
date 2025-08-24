import {Button} from "@/components/ui/button.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {contactFields, inspectorFields, organizationFields} from "@/constants/coverPageFields.ts";

export function FormFieldsSection({
                                      onAddPlaceholder,
                                  }: {
    onAddPlaceholder: (token: string) => void;
}) {
    return (
        <Accordion type="single" collapsible defaultValue="organization" className="w-full">
            <AccordionItem value="organization">
                <AccordionTrigger>Organization Details</AccordionTrigger>
                <AccordionContent className="data-[state=open]:animate-none data-[state=open]:h-auto">
                    <div className="flex flex-col space-y-2">
                        {organizationFields.map((field) => (
                            <Button
                                key={field.token}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => onAddPlaceholder(field.token)}
                            >
                                {field.label}
                            </Button>
                        ))}
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
                                onClick={() => onAddPlaceholder(field.token)}
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
                                onClick={() => onAddPlaceholder(field.token)}
                            >
                                {field.label}
                            </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
