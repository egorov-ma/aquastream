import test from "node:test";
import assert from "node:assert/strict";

import { cn } from "../../lib/utils";

test("cn merges standard tailwind utilities", () => {
  assert.equal(cn("px-2", "px-4", "text-sm"), "px-4 text-sm");
});

test("cn preserves size-* utilities without merging", () => {
  const value = cn("size-9", "size-[var(--cell-size)]");
  assert.equal(value, "size-9 size-[var(--cell-size)]");
});

test("cn keeps data attribute selectors intact and in order", () => {
  const value = cn(
    "data-[state=open]:bg-accent",
    "px-2",
    "data-[state=closed]:opacity-50",
    "px-4",
  );
  assert.equal(
    value,
    "data-[state=open]:bg-accent data-[state=closed]:opacity-50 px-4",
  );
});

test("cn keeps group-data selectors intact", () => {
  const value = cn(
    "group-data-[viewport=false]/navigation-menu:bg-popover",
    "text-sm",
  );
  assert.equal(
    value,
    "group-data-[viewport=false]/navigation-menu:bg-popover text-sm",
  );
});
