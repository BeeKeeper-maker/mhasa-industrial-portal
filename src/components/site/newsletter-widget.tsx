// ============================================================================
// Newsletter Widget — email subscription form for the footer.
// ============================================================================

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/hooks/use-locale";
import { toast } from "sonner";

export function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { locale } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null, locale, source: "footer" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDone(true);
      toast.success(json.message ?? "Subscribed!");
      setEmail("");
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 rounded-xl bg-white/5 p-4"
      >
        <CheckCircle2 className="h-6 w-6 text-gold flex-shrink-0" />
        <div>
          <div className="text-sm font-semibold text-white">
            {locale === "ar" ? "تم الاشتراك بنجاح!" : "Subscribed successfully!"}
          </div>
          <div className="text-xs text-white/60">
            {locale === "ar" ? "شكراً لانضمامك إلى قائمتنا البريدية." : "Thank you for joining our mailing list."}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex items-center gap-2 text-white/80 mb-1">
        <Mail className="h-4 w-4 text-gold" />
        <span className="text-sm font-semibold">
          {locale === "ar" ? "النشرة البريدية" : "Newsletter"}
        </span>
      </div>
      <p className="text-xs text-white/50 mb-2">
        {locale === "ar"
          ? "اشترك لتصلك آخر الأخبار والمقالات الصناعية."
          : "Subscribe for the latest industry news and insights."}
      </p>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email address"}
        required
        className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-gold"
      />
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={locale === "ar" ? "الاسم (اختياري)" : "Name (optional)"}
        className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-gold"
      />
      <Button
        type="submit"
        disabled={loading}
        size="sm"
        className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-9"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            {locale === "ar" ? "اشترك الآن" : "Subscribe"}
          </>
        )}
      </Button>
    </form>
  );
}
