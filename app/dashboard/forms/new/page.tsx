"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/types";
import { EditTab } from "@/components/forms/tabs/edit-tab";
import { PreviewTab } from "@/components/forms/tabs/preview-tab";

export default function NewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>({
    id: "",
    title: "",
    description: "",
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responseCount: 0,
    questions: [
      {
        id: "1",
        text: "",
        type: "text",
        required: false,
      },
    ],
    responses: [],
  });
  const [activeTab, setActiveTab] = useState("edit");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
        form.title ||
        form.description ||
        form.questions.some((q) => q.text)
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  const validateForm = () => {
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

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
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
        throw new Error(data.error || "Failed to create form");
      }

      toast({
        title: "Form created",
        description: "Your form has been created successfully. Redirecting...",
      });

      const newForm = await response.json();
      router.push(`/dashboard/forms/${newForm.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfirm = () => {
    if (validateForm()) {
      setIsCreateDialogOpen(true);
    } else {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (form.title || form.description || form.questions.some((q) => q.text)) {
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
    form.title.length > 30 ? `${form.title.substring(0, 27)}...` : form.title;

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
                {truncatedTitle || "Create New Form"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button onClick={handleCreateConfirm} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Form"}
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
        </TabsList>
        <TabsContent value="edit">
          <EditTab form={form} onFormChange={setForm} />
        </TabsContent>
        <TabsContent value="preview">
          <PreviewTab form={form} />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Form Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure everything in your form is correct? You will be
              redirected to the form page after creation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Form</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Create Form
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
