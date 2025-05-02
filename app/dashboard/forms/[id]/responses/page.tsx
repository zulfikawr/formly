"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Input } from "@/components/ui/input";
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
];

export default function FormResponses({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const exportToCSV = () => {
    if (!form) return;

    const headers = [
      "Response ID",
      "Timestamp",
      ...form.questions.map((q) => q.text),
    ];

    const rows = form.responses.map((response) => {
      const row = [response.id, new Date(response.createdAt).toLocaleString()];
      form.questions.forEach((question) => {
        const answer = response.answers.find(
          (a) => a.questionId === question.id,
        );
        row.push(answer ? answer.value : "");
      });
      return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${form.title}-responses.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartData = (questionId: string) => {
    if (!form) return [];

    const question = form.questions.find((q) => q.id === questionId);
    if (
      !question ||
      !["multipleChoice", "checkbox", "dropdown"].includes(question.type)
    ) {
      return [];
    }

    const counts: Record<string, number> = {};

    form.responses.forEach((response) => {
      const answer = response.answers.find((a) => a.questionId === questionId);
      if (answer) {
        if (counts[answer.value]) {
          counts[answer.value]++;
        } else {
          counts[answer.value] = 1;
        }
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Truncate title for breadcrumb
  const truncatedTitle =
    form?.title && form.title.length > 30
      ? `${form.title.substring(0, 27)}...`
      : form?.title;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load form responses"}
          </AlertDescription>
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
      <div className="mb-8 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/forms/${form.id}`}
                className="max-w-[200px] truncate"
              >
                {truncatedTitle || "Untitled Form"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Responses</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden md:block">Export CSV</span>
        </Button>
      </div>

      {form.responses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Responses Yet</CardTitle>
            <CardDescription>
              Share your form to start collecting responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/forms/${form.id}`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const link = `${window.location.origin}/forms/${form.id}`;
                  navigator.clipboard.writeText(link);
                  toast({
                    title: "Link copied",
                    description: "Form link copied to clipboard.",
                  });
                }}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Response Data</CardTitle>
                <CardDescription>
                  View all responses in a table format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px] whitespace-nowrap">
                          Timestamp
                        </TableHead>
                        {form.questions.map((question) => (
                          <TableHead
                            key={question.id}
                            className="min-w-[150px]"
                          >
                            <div className="truncate max-w-[150px]">
                              {question.text}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.responses.map((response) => (
                        <TableRow key={response.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(response.createdAt).toLocaleString()}
                          </TableCell>
                          {form.questions.map((question) => {
                            const answer = response.answers.find(
                              (a) => a.questionId === question.id,
                            );
                            return (
                              <TableCell key={question.id}>
                                <div className="truncate max-w-[150px]">
                                  {answer ? answer.value : "-"}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="charts">
            <div className="grid gap-6 md:grid-cols-2">
              {form.questions
                .filter((q) =>
                  ["multipleChoice", "checkbox", "dropdown"].includes(q.type),
                )
                .map((question) => {
                  const chartData = getChartData(question.id);
                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle
                          className="text-base truncate"
                          title={question.text}
                        >
                          {question.text}
                        </CardTitle>
                        <CardDescription>
                          {question.options?.length || 0} options |{" "}
                          {
                            form.responses.filter((r) =>
                              r.answers.some(
                                (a) => a.questionId === question.id,
                              ),
                            ).length
                          }{" "}
                          responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend
                                layout="horizontal"
                                align="center"
                                verticalAlign="bottom"
                                wrapperStyle={{ paddingTop: "20px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
