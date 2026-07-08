"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

export const Toast: React.FC = () => {
  return <SonnerToaster position="top-right" richColors closeButton />;
};
