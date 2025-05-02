import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db";
import { Question } from "@/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as { id: string };

    const forms = await prisma.form.findMany({
      where: {
        userId: decoded.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            required: true,
            options: true,
          },
        },
      },
    });

    const formsWithResponseCount = forms.map((form) => ({
      id: form.id,
      title: form.title,
      description: form.description,
      published: form.published,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      responseCount: form._count.responses,
      questions: form.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        required: question.required,
        options: question.options,
      })),
    }));

    return NextResponse.json(formsWithResponseCount);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as { id: string };

    const body = await req.json();
    const { title, description, questions } = body;

    const form = await prisma.form.create({
      data: {
        title,
        description,
        userId: decoded.id,
        questions: {
          create: questions.map((question: Question, index: number) => ({
            text: question.text,
            type: question.type,
            required: question.required || false,
            order: index,
            options: question.options || null,
          })),
        },
        published: true,
      },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            required: true,
            options: true,
          },
        },
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
