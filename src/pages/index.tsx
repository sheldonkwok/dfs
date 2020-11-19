import React, { ContextType, useRef } from "react";
import { useRouter } from "next/router";

const DEFAULT_CONTEST_ID = 7676043;

export default function ContestInput(): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/yahoo/${ref.current.value}`);
      }}
    >
      <label>
        Contest ID:
        <input ref={ref} type="text" defaultValue={DEFAULT_CONTEST_ID} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
