"use client";

import type React from "react";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Form, Question } from "@/types";
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
import { useToast } from "@/hooks/use-toast";

export default function FormView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<
    { questionId: string; value: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) {
          throw new Error("Form not found or not published");
        }
        const data = await res.json();
        setForm(data);

        // Initialize answers
        const initialAnswers = data.questions.map((q: Question) => ({
          questionId: q.id,
          value: "",
        }));
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("Form not found or not published");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

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
      if (answers.some((a) => a.value)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers]);

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(
      answers.map((answer) =>
        answer.questionId === questionId ? { ...answer, value } : answer,
      ),
    );
  };

  const handleClearAll = () => {
    const clearedAnswers = answers.map((answer) => ({
      ...answer,
      value: "",
    }));
    setAnswers(clearedAnswers);
    setIsClearDialogOpen(false);
  };

  const isFormFilled = answers.some((answer) => answer.value.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form) return;

    // Validate required questions
    const requiredQuestions = form.questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer || !answer.value.trim()) {
        setError(`Question "${question.text}" is required`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/forms/${id}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto py-8 flex min-h-screen items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto py-8 flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Form Submitted</CardTitle>
            <CardDescription>Thank you for your response!</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your response has been recorded successfully.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{form?.title}</CardTitle>
              {form?.description && (
                <CardDescription>{form.description}</CardDescription>
              )}
            </CardHeader>
            <Separator />
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {form?.questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <Label>
                      {question.text}
                      {question.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </Label>

                    {question.type === "text" && (
                      <Input
                        value={
                          answers.find((a) => a.questionId === question.id)
                            ?.value || ""
                        }
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        placeholder="Your answer"
                      />
                    )}

                    {question.type === "multipleChoice" && (
                      <RadioGroup
                        value={
                          answers.find((a) => a.questionId === question.id)
                            ?.value || ""
                        }
                        onValueChange={(value) =>
                          updateAnswer(question.id, value)
                        }
                      >
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`q${index}-option${optionIndex}`}
                            />
                            <Label htmlFor={`q${index}-option${optionIndex}`}>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => {
                          const answer = answers.find(
                            (a) => a.questionId === question.id,
                          );
                          const values = answer?.value
                            ? answer.value.split(",")
                            : [];
                          const isChecked = values.includes(option);

                          return (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`q${index}-option${optionIndex}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValues = checked
                                    ? [...values, option]
                                    : values.filter((v) => v !== option);
                                  updateAnswer(
                                    question.id,
                                    newValues.join(","),
                                  );
                                }}
                              />
                              <Label htmlFor={`q${index}-option${optionIndex}`}>
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "dropdown" && (
                      <Select
                        value={
                          answers.find((a) => a.questionId === question.id)
                            ?.value || ""
                        }
                        onValueChange={(value) =>
                          updateAnswer(question.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option, optionIndex) => (
                            <SelectItem key={optionIndex} value={option}>
                              {option}
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
                <AlertDialog
                  open={isClearDialogOpen}
                  onOpenChange={setIsClearDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={!isFormFilled}>
                      Clear all
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all answers?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will reset all your answers in the form.
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        variant="destructive"
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <footer className="w-full pt-8 text-center text-xs text-muted-foreground">
        Made with Formly. Create your own forms{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          here
        </Link>
      </footer>
    </div>
  );
}
