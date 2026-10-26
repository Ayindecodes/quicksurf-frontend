import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";

import { newClientReference, purchaseErrorMessage } from "./purchaseErrors";

const show = (error: unknown) => render(<p>{purchaseErrorMessage(error)}</p>);

describe("purchaseErrorMessage", () => {
  it("says how many PIN attempts are left", () => {
    show(new ApiError({ status: 403, code: "pin_invalid", message: "Wrong PIN.", extra: { attempts_left: 1 } }));
    expect(screen.getByText(/1 try left/)).toBeInTheDocument();
  });

  it("links to the top-up page when the balance is too low", () => {
    show(new ApiError({ status: 400, code: "insufficient_funds", message: "Insufficient funds." }));
    expect(screen.getByRole("link", { name: /top up/i })).toHaveAttribute("href", "/dashboard/topup");
  });

  it("links to the PIN setup when there is no PIN", () => {
    show(new ApiError({ status: 403, code: "pin_not_set", message: "Set a transaction PIN before buying." }));
    expect(screen.getByRole("link", { name: /set your pin/i })).toHaveAttribute("href", "/dashboard/account#pin");
  });

  it("shows the first field error for validation problems", () => {
    show(new ApiError({ status: 400, code: "invalid", message: "Fix the fields.", fields: { phone: ["Enter a valid NG number."] } }));
    expect(screen.getByText("Enter a valid NG number.")).toBeInTheDocument();
  });
});

describe("newClientReference", () => {
  it("is unique and accepted by the backend (letters, digits, - : . _ up to 64)", () => {
    const a = newClientReference();
    expect(a).toMatch(/^[A-Za-z0-9_\-:.]{1,64}$/);
    expect(a).not.toBe(newClientReference());
  });
});
