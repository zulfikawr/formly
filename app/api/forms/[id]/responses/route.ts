import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db";

type CreateAnswerInput = {
  questionId: string;
  value: string;
};

type Params = Promise<{ id: string }>

export async function GET(
  req: Request,
  { params }: { params: Params },
) {
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
    const form = await prisma.form.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.userId !== decoded.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get responses
    const responses = await prisma.response.findMany({
      where: {
        formId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json({
      ...form,
      responses,
    });
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { answers }: { answers: CreateAnswerInput[] } = body;

    // Check if the form exists and is published
    const form = await prisma.form.findUnique({
      where: {
        id,
        published: true,
      },
      include: {
        questions: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404 },
      );
    }

    // Validate required questions
    const requiredQuestions = form.questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      const answer = answers.find(
        (a: CreateAnswerInput) => a.questionId === question.id,
      );
      if (!answer || !answer.value.trim()) {
        return NextResponse.json(
          { error: `Question "${question.text}" is required` },
          { status: 400 },
        );
      }
    }

    // Create response
    const response = await prisma.response.create({
      data: {
        formId: id,
        answers: {
          create: answers.map((answer: CreateAnswerInput) => ({
            value: answer.value,
            questionId: answer.questionId,
          })),
        },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error submitting form response:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
