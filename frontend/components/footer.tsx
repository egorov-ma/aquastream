export function Footer() {
  return (
    <footer className="border-t">
      <div
        className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground"
        data-test-id="footer"
      >
        © {new Date().getFullYear()} AquaStream
      </div>
    </footer>
  );
}


