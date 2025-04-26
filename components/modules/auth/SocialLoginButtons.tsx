import { Button } from "@/components/ui/button";
import { GoogleIcon, FacebookIcon } from "@/components/icons";

export function SocialLoginButtons() {
  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
        </div>
      </div>
      
      <div className="flex w-full gap-3">
        <Button variant="outline" className="flex-1" type="button">
          <GoogleIcon />
          Google
        </Button>
        <Button variant="outline" className="flex-1" type="button">
          <FacebookIcon />
          Facebook
        </Button>
      </div>
    </div>
  );
} 