import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, company, subject, message }: ContactEmailRequest = await req.json();

    console.log("Received contact form submission:", { firstName, lastName, email, subject });

    // Get all admin users
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    if (adminError) {
      console.error("Error fetching admin profiles:", adminError);
      throw new Error("Failed to fetch admin recipients");
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.error("No admin users found");
      throw new Error("No admin recipients found");
    }

    const adminEmails = adminProfiles
      .map(profile => profile.email)
      .filter(email => email); // Filter out null/undefined emails

    if (adminEmails.length === 0) {
      console.error("No valid admin email addresses found");
      throw new Error("No valid admin email addresses found");
    }

    console.log(`Sending contact form to ${adminEmails.length} admin(s):`, adminEmails);

    const emailResponse = await resend.emails.send({
      from: "Phelan Manufacturing Contact Form <onboarding@resend.dev>",
      to: adminEmails,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This message was sent from the Phelan Manufacturing website contact form.</em></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);