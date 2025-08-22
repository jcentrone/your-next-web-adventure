import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CoverPagePreview } from "@/components/cover-pages/CoverPagePreview";
import {
  CoverPageForm,
  CoverPageFormFields,
} from "@/components/cover-pages/CoverPageFormFields";
import useCoverPages from "@/hooks/useCoverPages";

export default function CoverPageEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    coverPages,
    assignments,
    createCoverPage,
    updateCoverPage,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  } = useCoverPages();

  const editing = !!id;
  const coverPage = editing ? coverPages.find((cp) => cp.id === id) : undefined;

  const form = useForm<CoverPageForm>({
    defaultValues: {
      name: "",
      template: "default",
      color: "#000000",
      text: "",
      imageUrl: "",
      reportTypes: [],
    },
  });
  const { handleSubmit, watch, reset } = form;

  const name = watch("name");
  const color = watch("color");
  const text = watch("text");
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (coverPage) {
      const assigned = Object.entries(assignments)
        .filter(([_, id]) => id === coverPage.id)
        .map(([rt]) => rt);
      reset({
        name: coverPage.name || "",
        template: coverPage.template_slug || "default",
        color: coverPage.color_palette_key || "#000000",
        text: (coverPage.text_content as string) || "",
        imageUrl: coverPage.image_url || "",
        reportTypes: assigned,
      });
    }
  }, [coverPage, assignments, reset]);

  const handleSave = handleSubmit(async (data) => {
    if (editing && coverPage) {
      await updateCoverPage(coverPage.id, {
        name: data.name,
        template_slug: data.template,
        color_palette_key: data.color,
        text_content: data.text,
        image_url: data.imageUrl,
      });
      const current = Object.entries(assignments)
        .filter(([_, id]) => id === coverPage.id)
        .map(([rt]) => rt);
      for (const rt of current) {
        if (!data.reportTypes.includes(rt)) {
          await removeAssignmentFromReportType(rt);
        }
      }
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, coverPage.id);
      }
    } else {
      const newCp = await createCoverPage({
        name: data.name,
        template_slug: data.template,
        color_palette_key: data.color,
        text_content: data.text,
        image_url: data.imageUrl,
      });
      for (const rt of data.reportTypes) {
        await assignCoverPageToReportType(rt, newCp.id);
      }
    }
    navigate("/cover-page-manager");
  });

  return (
    <>
      <Seo
        title={editing ? "Edit Cover Page" : "New Cover Page"}
        description="Create and customize report cover pages"
      />
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/cover-page-manager")}
          className="mb-4"
        >
          Back to Cover Pages
        </Button>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate("/cover-page-manager")}
                className="cursor-pointer"
              >
                Cover Pages
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {editing ? "Edit" : "New"} Cover Page
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleSave} className="space-y-4">
            <CoverPageFormFields form={form} />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cover-page-manager")}
              >
                Back to Cover Pages
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
          <div className="flex justify-center">
            <CoverPagePreview
              title={name}
              text={text}
              color={color}
              imageUrl={imageUrl}
            />
          </div>
        </div>
      </div>
    </>
  );
}

