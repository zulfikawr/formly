import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db";
import { Question } from "@/types";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const { id } = await params;

    // For public forms, we don't need authentication
    const form = await prisma.form.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            text: true,
            type: true,
            required: true,
            options: true,
          },
        },
        responses: {
          select: {
            id: true,
            createdAt: true,
            answers: {
              select: {
                id: true,
                value: true,
                questionId: true,
              },
            },
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // If the form is not published, check if the user is the owner
    if (!form.published) {
      if (!token) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as { id: string };

      if (form.userId !== decoded.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: form.id,
      title: form.title,
      description: form.description,
      published: form.published,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      responseCount: form.responses.length,
      questions: form.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type as
          | "text"
          | "multipleChoice"
          | "checkbox"
          | "dropdown",
        required: question.required,
        options: question.options ? (question.options as string[]) : null,
      })),
      responses: form.responses.map((response) => ({
        id: response.id,
        createdAt: response.createdAt.toISOString(),
        answers: response.answers.map((answer) => ({
          id: answer.id,
          value: answer.value,
          questionId: answer.questionId,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as { id: string };

    const { id } = await params;
    const body = await req.json();
    const { title, description, published, questions } = body;

    // Check if the form exists and belongs to the user
    const existingForm = await prisma.form.findUnique({
      where: {
        id,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existingForm.userId !== decoded.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete existing questions
    await prisma.question.deleteMany({
      where: {
        formId: id,
      },
    });

    // Update the form and create new questions in a transaction
    const form = await prisma.$transaction(async (prisma) => {
      // Update form details
      await prisma.form.update({
        where: {
          id,
        },
        data: {
          title,
          description,
          published,
        },
      });

      // Create new questions
      await prisma.question.createMany({
        data: questions.map((question: Question, index: number) => ({
          text: question.text,
          type: question.type,
          required: question.required || false,
          order: index,
          options: question.options || null,
          formId: id,
        })),
      });

      // Fetch the updated form with questions and responses
      return prisma.form.findUnique({
        where: {
          id,
        },
        include: {
          questions: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              text: true,
              type: true,
              required: true,
              options: true,
            },
          },
          responses: {
            select: {
              id: true,
              createdAt: true,
              answers: {
                select: {
                  id: true,
                  value: true,
                  questionId: true,
                },
              },
            },
          },
        },
      });
    });

    if (!form) {
      throw new Error("Failed to fetch updated form");
    }

    return NextResponse.json({
      id: form.id,
      title: form.title,
      description: form.description,
      published: form.published,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      responseCount: form.responses.length,
      questions: form.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type as
          | "text"
          | "multipleChoice"
          | "checkbox"
          | "dropdown",
        required: question.required,
        options: question.options ? (question.options as string[]) : null,
      })),
      responses: form.responses.map((response) => ({
        id: response.id,
        createdAt: response.createdAt.toISOString(),
        answers: response.answers.map((answer) => ({
          id: answer.id,
          value: answer.value,
          questionId: answer.questionId,
        })),
      })),
    });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as { id: string };

    const { id } = await params;

    // Check if the form exists and belongs to the user
    const existingForm = await prisma.form.findUnique({
      where: {
        id,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existingForm.userId !== decoded.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete the form (cascades to questions and responses)
    await prisma.form.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
