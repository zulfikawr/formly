"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  MoreVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const { toast } = useToast();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/forms");
        const data = await res.json();
        setForms(data);
      } catch (error) {
        console.error("Failed to fetch forms", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleDelete = async (formId: string) => {
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setForms(forms.filter((form) => form.id !== formId));
        toast({
          title: "Form deleted",
          description: "The form has been successfully deleted.",
        });
      } else {
        console.error("Failed to delete form");
        toast({
          title: "Error",
          description: "Failed to delete the form.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the form.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = (formId: string) => {
    const formUrl = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(formUrl);
    toast({
      title: "Link copied",
      description: "Form link copied to clipboard.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: "card" | "table") =>
              value && setViewMode(value)
            }
          >
            <ToggleGroupItem value="card" aria-label="Card view">
              <LayoutGrid className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Link href="/dashboard/forms/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden md:block">New Form</span>
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-1/2" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-1/3" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-1/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-1/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : forms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium truncate max-w-[150px]">
                      {form.title}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {form.description || "No description"}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {form.questions ? form.questions.length : 0}
                    </TableCell>
                    <TableCell>{form.responseCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/forms/${form.id}`}>
                              Manage
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopyLink(form.id)}
                          >
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full text-left justify-start px-2 py-1.5 h-8 rounded-sm cursor-default hover:text-destructive-foreground hover:bg-destructive/80"
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the form and all its
                                    responses.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => handleDelete(form.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No forms yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first form to start collecting responses.
              </p>
              <Link href="/dashboard/forms/new">
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> Create Form
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      <Skeleton className="h-9 w-40" />
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    <Skeleton className="h-4 w-full" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </CardFooter>
              </Card>
            ))
          ) : forms.length > 0 ? (
            forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      <Link
                        href={`/forms/${form.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        <CardTitle>{form.title}</CardTitle>
                      </Link>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>
                            Manage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyLink(form.id)}
                        >
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full text-left justify-start px-2 py-1.5 h-8 rounded-sm cursor-default hover:text-destructive-foreground hover:bg-destructive/80"
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the form and all its
                                  responses.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => handleDelete(form.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    {form.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {form.questions ? form.questions.length : 0} questions |
                      </span>
                      <span>{form.responseCount} responses</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the form and all its responses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(form.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <Button>Manage</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No forms yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first form to start collecting responses.
              </p>
              <Link href="/dashboard/forms/new">
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> Create Form
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
