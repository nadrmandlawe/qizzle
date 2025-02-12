import Link from "next/link";

const Footer = () => {
  return (
<footer className="fixed bottom-0 w-full flex justify-center items-center py-2 bg-background border-t">
  <p className="text-sm text-gray-500 dark:text-gray-400">
    Developed with ❤️ by <Link href="https://github.com/nadrmandlawe" className="text-primary hover:underline">Nader</Link>
  </p>
</footer>
  );
};

export default Footer; 