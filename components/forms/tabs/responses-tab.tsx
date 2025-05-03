import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Form } from "@/types";

const COLORS = [
  "#1e40af", // Dark blue
  "#2563eb", // Blue
  "#3b82f6", // Light blue
  "#60a5fa", // Lighter blue
  "#93c5fd", // Very light blue
  "#bfdbfe", // Almost white blue
  "#dbeafe", // Very light blue
  "#eff6ff", // Almost white
];

interface ResponsesTabProps {
  form: Form | null;
}

export function ResponsesTab({ form }: ResponsesTabProps) {
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

  const getChartConfig = (questionId: string) => {
    const chartData = getChartData(questionId);
    return chartData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  };

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

  if (!form) return null;

  if (form.responses.length === 0) {
    return (
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
              }}
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <CardHeader>
          <CardTitle>Form Responses</CardTitle>
          <CardDescription>View and export all form responses</CardDescription>
        </CardHeader>
        <div className="p-6">
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden md:block">Export CSV</span>
          </Button>
        </div>
      </div>
      <CardContent className="space-y-4">
        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] whitespace-nowrap">
                      Timestamp
                    </TableHead>
                    {form.questions.map((question) => (
                      <TableHead key={question.id} className="min-w-[150px]">
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
          </TabsContent>
          <TabsContent value="charts">
            <div className="flex flex-col gap-6">
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
                      <CardContent className="pt-0">
                        <ChartContainer
                          config={getChartConfig(question.id)}
                          className="min-h-[300px] w-full"
                        >
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend
                              content={<ChartLegendContent />}
                              verticalAlign="bottom"
                              layout="horizontal"
                            />
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
