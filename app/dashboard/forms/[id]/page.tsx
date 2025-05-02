"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Copy, Grip, Plus, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Form, Question } from "@/types";

export default function EditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
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
      if (title || description || questions.some((q) => q.text)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, description, questions]);

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
        setTitle(data.title);
        setDescription(data.description || "");
        setPublished(data.published);
        setQuestions(
          data.questions.map((q: Question) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options,
          })),
        );
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      return;
    }
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | boolean | string[] | null,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    const options = question.options || [];
    newQuestions[questionIndex] = {
      ...question,
      options: [...options, ""],
    };
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    const options = [...(question.options || [])];
    options[optionIndex] = value;
    newQuestions[questionIndex] = {
      ...question,
      options,
    };
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    const options = [...(question.options || [])];
    options.splice(optionIndex, 1);
    newQuestions[questionIndex] = {
      ...question,
      options,
    };
    setQuestions(newQuestions);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Form title is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
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

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          published,
          questions: questions.map((q) => ({
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

  const copyFormLink = () => {
    const link = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Form link copied to clipboard.",
    });
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
    if (title || description || questions.some((q) => q.text)) {
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
    title.length > 30 ? `${title.substring(0, 27)}...` : title;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="container mx-auto py-8">
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
                {truncatedTitle || "Untitled Form"}
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
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>
                Set the title and description for your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {questions.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={question.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative"
                        >
                          <CardHeader>
                            <CardTitle className="text-base flex gap-2 items-center">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-muted-foreground"
                              >
                                <Grip className="h-5 w-5" />
                              </div>
                              Question {index + 1}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`question-${index}`}>
                                Question Text
                              </Label>
                              <Input
                                id={`question-${index}`}
                                value={question.text}
                                onChange={(e) =>
                                  updateQuestion(index, "text", e.target.value)
                                }
                                placeholder="Enter question text"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`question-type-${index}`}>
                                Question Type
                              </Label>
                              <Select
                                value={question.type}
                                onValueChange={(value) =>
                                  updateQuestion(index, "type", value)
                                }
                              >
                                <SelectTrigger id={`question-type-${index}`}>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="multipleChoice">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="checkbox">
                                    Checkbox
                                  </SelectItem>
                                  <SelectItem value="dropdown">
                                    Dropdown
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {[
                              "multipleChoice",
                              "checkbox",
                              "dropdown",
                            ].includes(question.type) && (
                              <div className="space-y-2">
                                <Label>Options</Label>
                                <div className="space-y-2">
                                  {(question.options || []).map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <Input
                                          value={option}
                                          onChange={(e) =>
                                            updateOption(
                                              index,
                                              optionIndex,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`Option ${optionIndex + 1}`}
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          onClick={() =>
                                            removeOption(index, optionIndex)
                                          }
                                          disabled={
                                            (question.options || []).length <= 2
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ),
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full md:w-fit mt-2"
                                    onClick={() => addOption(index)}
                                  >
                                    <Plus className="mr-1 h-4 w-4" /> Add Option
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`required-${index}`}
                                checked={question.required}
                                onCheckedChange={(checked) =>
                                  updateQuestion(index, "required", checked)
                                }
                              />
                              <Label htmlFor={`required-${index}`}>
                                Required
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeQuestion(index)}
                              disabled={questions.length === 1}
                            >
                              Remove
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addQuestion}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Question
          </Button>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>{title || "Untitled Form"}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label>
                    {question.text || `Question ${index + 1}`}
                    {question.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </Label>
                  {question.type === "text" && (
                    <Input placeholder="Your answer" disabled />
                  )}
                  {question.type === "multipleChoice" && (
                    <div className="space-y-2">
                      {(question.options || []).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`preview-${index}-${optionIndex}`}
                            name={`preview-${index}`}
                            disabled
                          />
                          <Label htmlFor={`preview-${index}-${optionIndex}`}>
                            {option || `Option ${optionIndex + 1}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "checkbox" && (
                    <div className="space-y-2">
                      {(question.options || []).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`preview-${index}-${optionIndex}`}
                            disabled
                          />
                          <Label htmlFor={`preview-${index}-${optionIndex}`}>
                            {option || `Option ${optionIndex + 1}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "dropdown" && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(question.options || []).map((option, optionIndex) => (
                          <SelectItem
                            key={optionIndex}
                            value={`option-${optionIndex}`}
                          >
                            {option || `Option ${optionIndex + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between items-center py-4">
              <Button disabled variant="outline">
                Clear all
              </Button>
              <Button disabled>Submit</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
              <CardDescription>Configure your form settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="space-y-2">
                <Label>Form Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/forms/${id}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyFormLink}
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/forms/${id}/responses`)}
              >
                View Responses
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Form
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the form and all its responses.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
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
