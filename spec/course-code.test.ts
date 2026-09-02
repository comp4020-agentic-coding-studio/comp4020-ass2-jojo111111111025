import { describe, expect, it } from "vitest";
import { courseMeta } from "../src/course-config";

// Assigned when this repo was provisioned (see git commit "course code: SLOP1561").
// The spec requires keeping these three digits even as the level digit changes.
const PROVISIONED_DIGITS = "561";

describe("course code", () => {
  it("keeps the three digits the repo was provisioned with", () => {
    expect(courseMeta.code.slice(-3)).toBe(PROVISIONED_DIGITS);
  });
});
