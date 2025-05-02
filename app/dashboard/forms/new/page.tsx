"use client";

import { useEffect, useState } from "react";
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
import { Grip, Plus, Trash2 } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Question } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function NewForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      type: "text",
      required: false,
    },
  ]);
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
      if (title || description || questions.some((q) => q.text)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, description, questions]);

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
          title,
          description,
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
        throw new Error(data.error || "Failed to create form");
      }

      toast({
        title: "Form created",
        description: "Your form has been created successfully. Redirecting...",
      });

      const form = await response.json();
      router.push(`/dashboard/forms/${form.id}`);
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
                                          variant="ghost"
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
                                    className="mt-2"
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
            <CardFooter>
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
              <div className="space-y-2">
                <Label>Form Status</Label>
                <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                  This form will be automatically published after creation. You
                  can unpublish it later.
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
              <Button
                variant="outline"
                className="w-full md:w-fit"
                onClick={() => handleNavigation("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                className="w-full md:w-fit"
                onClick={handleCreateConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Form"}
              </Button>
            </CardFooter>
          </Card>
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
