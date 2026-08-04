export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface MailProvider {
  send(message: MailMessage): Promise<void>;
}

/** Console driver (dev). Implement a Resend/SendGrid driver for production
 *  and switch on MAIL_DRIVER. */
class ConsoleMail implements MailProvider {
  async send(message: MailMessage): Promise<void> {
    console.log(
      `\n[mail] to=${message.to}\n[mail] subject=${message.subject}\n[mail] ${message.html.replace(/<[^>]+>/g, " ").trim().slice(0, 300)}\n`
    );
  }
}

export function getMailer(): MailProvider {
  return new ConsoleMail();
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function shell(title: string, body: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#F7F8FC;color:#000B36">
    <h2 style="color:#2924FD">${title}</h2>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#666">Vaony — Online tutoring in exact sciences, engineering & math<br/><a href="${APP_URL}">${APP_URL}</a></p>
  </div>`;
}

export const templates = {
  welcome: (name: string) =>
    shell(
      `Welcome to Vaony, ${name}!`,
      `<p>Your account is ready. Browse our teachers and book your first class.</p>
       <p><a href="${APP_URL}/teachers" style="background:#2924FD;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Explore teachers</a></p>`
    ),
  passwordReset: (link: string) =>
    shell(
      "Reset your password",
      `<p>Use the link below to set a new password. It expires in 1 hour.</p>
       <p><a href="${link}">${link}</a></p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    ),
  bookingConfirmed: (courseName: string, when: string) =>
    shell(
      "Your class is booked",
      `<p><strong>${courseName}</strong></p><p>${when}</p>
       <p>You'll get reminders 24 hours and 1 hour before class.</p>`
    ),
  bookingReminder: (courseName: string, when: string, hours: number) =>
    shell(
      `Class reminder — in ${hours === 24 ? "24 hours" : "1 hour"}`,
      `<p><strong>${courseName}</strong></p><p>${when}</p>`
    ),
  bookingCancelled: (courseName: string, when: string) =>
    shell(
      "Class cancelled",
      `<p>Your class <strong>${courseName}</strong> scheduled for ${when} was cancelled. You can rebook from your calendar.</p>`
    ),
  paymentReceipt: (amount: string, description: string) =>
    shell(
      "Payment received",
      `<p>We received your payment of <strong>${amount}</strong> for ${description}.</p>
       <p>You can download your receipt from the Payments section of your portal.</p>`
    ),
  newMessage: (fromName: string) =>
    shell(
      "New message on Vaony",
      `<p><strong>${fromName}</strong> sent you a message while you were offline.</p>
       <p><a href="${APP_URL}">Open Vaony to reply</a></p>`
    ),
  contactAutoReply: (name: string) =>
    shell(
      `Thanks for reaching out, ${name}`,
      `<p>We received your message and will get back to you within 24 hours.</p>`
    ),
  contactAdminNotice: (name: string, email: string, subject: string, message: string) =>
    shell(
      "New contact form submission",
      `<p><strong>${name}</strong> (${email})</p><p><em>${subject}</em></p><p>${message}</p>`
    ),
};
