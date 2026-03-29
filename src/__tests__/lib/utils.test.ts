import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it.each([
    [["foo", "bar"], "foo bar"],
    [[], ""],
    [["a", false, null, undefined, 0, "b"], "a b"],
    [[{ "text-red": true, "text-blue": false }], "text-red"],
    [[["p-2", "m-4"]], "p-2 m-4"],
    [["p-2", "p-4"], "p-4"],
    [["hover:bg-red-500", "hover:bg-blue-500"], "hover:bg-blue-500"],
    [["p-2", "m-4", "text-lg"], "p-2 m-4 text-lg"],
    [["bg-white", "bg-black"], "bg-black"],
    [["a", ["b", ["c"]]], "a b c"],
  ] as [unknown[], string][])(
      "cn(%j) → '%s'",
      (args, expected) => {
        expect(cn(...(args as Parameters<typeof cn>))).toBe(expected);
      },
  );
});