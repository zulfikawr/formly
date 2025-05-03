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
import { Switch } from "@/components/ui/switch";
import { Copy } from "lucide-react";
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
import { Form } from "@/types";
import { useState } from "react";

interface SettingsTabProps {
  form: Form;
  onFormChange: (form: Form) => void;
  onDelete: () => void;
}

export function SettingsTab({
  form,
  onFormChange,
  onDelete,
}: SettingsTabProps) {
  const [published, setPublished] = useState(form.published);

  const handlePublishedChange = (value: boolean) => {
    setPublished(value);
    onFormChange({ ...form, published: value });
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/forms/${form.id}`;
    navigator.clipboard.writeText(link);
  };

  return (
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
            onCheckedChange={handlePublishedChange}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <div className="space-y-2">
          <Label>Form Link</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/forms/${form.id}`}
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
      <CardFooter>
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
                This action cannot be undone. This will permanently delete the
                form and all its responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
