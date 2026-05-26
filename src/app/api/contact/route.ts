import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  inquiryType: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required fields with valid information.' },
        { status: 400 }
      );
    }

    const { name, email, inquiryType, subject, message } = parsed.data;

    const resend = new Resend(resendApiKey);
    const from =
      process.env.CONTACT_FROM_EMAIL ??
      'PrereqPilot Contact <onboarding@resend.dev>';

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Inquiry Type:</strong> ${escapeHtml(inquiryType)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
    `;

    await resend.emails.send({
      from,
      to: ['team@prereqpilot.com'],
      subject: `[Contact] ${subject}`,
      replyTo: email,
      html,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to send message right now. Please try again later.' },
      { status: 500 }
    );
  }
}
