import Link from "next/link";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
  children?: React.ReactNode;
}

export function AuthFooter({ text, linkText, linkHref, children }: AuthFooterProps) {
  return (
    <>
      <div className="text-center text-sm text-slate-600">
        {text}{' '}
        <Link href={linkHref} className="font-medium text-indigo-600 hover:text-indigo-500">
          {linkText}
        </Link>
      </div>
      {children}
    </>
  );
} 