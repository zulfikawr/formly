"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Form } from "@/types";
import { EditTab } from "@/components/forms/tabs/edit-tab";
import { PreviewTab } from "@/components/forms/tabs/preview-tab";
import { SettingsTab } from "@/components/forms/tabs/settings-tab";
import { ResponsesTab } from "@/components/forms/tabs/responses-tab";

export default function EditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        form?.title ||
        form?.description ||
        form?.questions.some((q) => q.text)
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch form");
        }
        const data = await res.json();
        setForm(data);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  useEffect(() => {
    const fetchFormWithResponses = async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/forms/${id}/responses`);
        if (!res.ok) {
          throw new Error("Failed to fetch form responses");
        }
        const data = await res.json();
        setForm(data);
      } catch (error) {
        console.error("Error fetching form responses:", error);
        setError("Failed to load form responses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormWithResponses();
  }, [params]);

  const validateForm = () => {
    if (!form) return false;

    if (!form.title.trim()) {
      setError("Form title is required");
      return false;
    }

    for (let i = 0; i < form.questions.length; i++) {
      const question = form.questions[i];
      if (!question.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (["multipleChoice", "checkbox", "dropdown"].includes(question.type)) {
        if (!question.options || question.options.length < 2) {
          setError(`Question ${i + 1} needs at least 2 options`);
          return false;
        }

        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].trim()) {
            setError(`Option ${j + 1} in Question ${i + 1} cannot be empty`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const isFormValid = () => {
    if (!form) return false;

    if (!form.title.trim()) {
      return false;
    }

    for (let i = 0; i < form.questions.length; i++) {
      const question = form.questions[i];
      if (!question.text.trim()) {
        return false;
      }

      if (["multipleChoice", "checkbox", "dropdown"].includes(question.type)) {
        if (!question.options || question.options.length < 2) {
          return false;
        }

        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].trim()) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!form) return;
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          published: form.published,
          questions: form.questions.map((q) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: ["multipleChoice", "checkbox", "dropdown"].includes(q.type)
              ? q.options
              : null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update form");
      }

      toast({
        title: "Form saved",
        description: "Your form has been saved successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update form");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete form");
      }
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const handleSaveConfirm = () => {
    if (validateForm()) {
      setIsSaveDialogOpen(true);
    } else {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (
      form?.title ||
      form?.description ||
      form?.questions.some((q) => q.text)
    ) {
      setPendingNavigation(path);
      setIsCancelDialogOpen(true);
    } else {
      router.push(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setIsCancelDialogOpen(false);
    setPendingNavigation(null);
  };

  // Truncate title if longer than 30 characters
  const truncatedTitle =
    form?.title && form.title.length > 30
      ? `${form.title.substring(0, 27)}...`
      : form?.title || "Untitled Form";

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/dashboard");
                }}
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {truncatedTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button onClick={handleSaveConfirm} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="max-w-3xl mx-auto"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview" disabled={!isFormValid()}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <EditTab form={form} onFormChange={setForm} />
        </TabsContent>
        <TabsContent value="preview">
          <PreviewTab form={form} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab
            form={form}
            onFormChange={setForm}
            onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent value="responses">
          <ResponsesTab form={form} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Form Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save the changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Form</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your form. Are you sure you want to
              cancel and discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
