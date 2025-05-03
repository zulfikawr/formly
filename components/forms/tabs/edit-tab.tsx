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
import { Form, Question } from "@/types";
import { useState } from "react";

interface EditTabProps {
  form: Form;
  onFormChange: (form: Form) => void;
}

export function EditTab({ form, onFormChange }: EditTabProps) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [questions, setQuestions] = useState<Question[]>(form.questions);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "text",
      required: false,
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    onFormChange({ ...form, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    onFormChange({ ...form, questions: newQuestions });
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
    onFormChange({ ...form, questions: newQuestions });
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
    onFormChange({ ...form, questions: newQuestions });
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
    onFormChange({ ...form, questions: newQuestions });
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
    onFormChange({ ...form, questions: newQuestions });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
    onFormChange({ ...form, questions: items });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onFormChange({ ...form, title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onFormChange({ ...form, description: value });
  };

  return (
    <div className="space-y-4">
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter form title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
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
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="dropdown">Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {["multipleChoice", "checkbox", "dropdown"].includes(
                          question.type,
                        ) && (
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
                          <Label htmlFor={`required-${index}`}>Required</Label>
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
    </div>
  );
}
