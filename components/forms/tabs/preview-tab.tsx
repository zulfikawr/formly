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
import { Separator } from "@/components/ui/separator";
import { Form } from "@/types";

interface PreviewTabProps {
  form: Form;
}

export function PreviewTab({ form }: PreviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Preview</CardTitle>
        <CardDescription>
          Preview of what your form would look like
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{form.title || "Untitled Form"}</CardTitle>
            {form.description && (
              <CardDescription>{form.description}</CardDescription>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6">
            {form.questions.map((question, index) => (
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
      </CardContent>
    </Card>
  );
}
