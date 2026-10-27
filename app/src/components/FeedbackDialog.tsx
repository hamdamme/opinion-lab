import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send } from "lucide-react";

/**
 * Formspree endpoint for this site's feedback form.
 * Replace with your own form ID from formspree.io (free tier).
 * Until then the dialog explains that feedback is not wired up yet.
 */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnpjopno";

const TRUST_OPTIONS = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "A little" },
  { value: 3, label: "Somewhat" },
  { value: 4, label: "Mostly" },
  { value: 5, label: "Very much" },
];

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [trust, setTrust] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const configured = !FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID");

  const submit = async () => {
    if (!feedback.trim()) return;
    setState("sending");
    setError(null);
    try {
      const payload: Record<string, string> = {
        feedback,
        trustworthiness: trust != null ? `${trust} (${TRUST_OPTIONS[trust - 1].label})` : "not answered",
        _subject: "Opinion Lab feedback",
      };
      // Formspree rejects a missing or invalid email, so only include it when provided.
      if (email.trim()) payload.email = email.trim();
      const resp = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        if (resp.status === 422) {
          throw new Error(
            "The form asks for a valid email. Add one above, or ask the site owner to make email optional in Formspree."
          );
        }
        throw new Error(`Request failed (${resp.status})`);
      }
      setState("sent");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setState("error");
    }
  };

  const close = () => {
    onClose();
    // reset after the closing animation
    setTimeout(() => {
      setFeedback("");
      setTrust(null);
      setEmail("");
      setState("idle");
      setError(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave feedback</DialogTitle>
          <DialogDescription>
            Submitting this form sends your feedback, optional source-trust response, and optional
            email to the site owner through Formspree. Your saved statement ratings are not included.
          </DialogDescription>
        </DialogHeader>

        {state === "sent" ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold">Thanks, got it.</p>
            <p className="mt-1 text-sm text-muted-foreground">Your feedback is on its way.</p>
            <Button className="mt-5" variant="outline" onClick={close}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!configured && (
              <Alert>
                <AlertDescription>
                  The feedback form is not set up yet. Your words below would not be
                  sent anywhere.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fb-text">What confused you, or what felt off?</Label>
              <Textarea
                id="fb-text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Anything about the statements, the sources, or the app itself."
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>How trustworthy did the evidence sources feel? (optional)</Label>
              <div className="flex flex-wrap gap-1.5">
                {TRUST_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setTrust(trust === o.value ? null : o.value)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                      (trust === o.value
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "text-muted-foreground hover:border-emerald-600/50 hover:text-foreground")
                    }
                  >
                    {o.value} · {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-email">Email, if you want a reply (optional)</Label>
              <Input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {state === "error" && (
              <Alert variant="destructive">
                <AlertDescription>
                  Something went wrong while sending: {error}. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={submit}
              disabled={state === "sending" || !feedback.trim() || !configured}
              className="w-full sm:w-auto"
            >
              {state === "sending" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {state === "sending" ? "Sending…" : "Send feedback"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
