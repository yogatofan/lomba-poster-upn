import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lomba Poster — Dies Natalis 67 UPN \"Veteran\" Jawa Timur",
    template: "%s | Lomba Poster UPN \"Veteran\" Jawa Timur",
  },
  description:
    "Aplikasi pendaftaran dan penilaian Lomba Poster Pencegahan Kekerasan Seksual — Dies Natalis 67 UPN \"Veteran\" Jawa Timur, target Rekor MURI.",
  keywords: [
    "lomba poster",
    "UPN Veteran Jawa Timur",
    "pencegahan kekerasan seksual",
    "Dies Natalis",
    "Rekor MURI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
