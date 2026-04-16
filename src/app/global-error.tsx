"use client";

import ErrorComponent from "next/error";

export default function GlobalError() {
  return (
    <html>
      <body>
        <ErrorComponent statusCode={0} />
      </body>
    </html>
  );
}
